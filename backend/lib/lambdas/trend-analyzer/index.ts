/**
 * Nightly trend analyzer — CoreHealth's proactive intelligence layer.
 *
 * Runs every night via EventBridge. For each user:
 * 1. Pull biomarker history (last 5 readings per biomarker)
 * 2. Rule-based detection: accelerating trends, newly abnormal values
 * 3. GPT cross-pattern analysis when ≥2 signals are concerning
 * 4. Deduplicate (skip if same alert sent in last 7 days)
 * 5. Store in health_alerts + send Expo push notification
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import OpenAI from 'openai';
import { Pool } from 'pg';
import { getDb } from '../_shared/db';

interface UserRow {
  id: string;
  first_name: string | null;
  expo_push_token: string | null;
  health_memory: string | null;
  notification_prefs: { alerts?: boolean; trends?: boolean } | null;
}

const secretsManager = new SecretsManagerClient({});
let openai: OpenAI | null = null;

async function getOpenAI(): Promise<OpenAI> {
  if (openai) return openai;
  const result = await secretsManager.send(
    new GetSecretValueCommand({ SecretId: process.env.OPENAI_SECRET_ARN! }),
  );
  openai = new OpenAI({ apiKey: result.SecretString! });
  return openai;
}

interface BiomarkerReading {
  name: string;
  value: number;
  unit: string;
  risk_level: string | null;
  reference_min: number | null;
  reference_max: number | null;
  recorded_at: Date;
}

interface Alert {
  type: 'trend' | 'abnormal' | 'pattern';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  body: string;
  biomarkers: string[];
}

export const handler = async (): Promise<void> => {
  const db = await getDb();
  console.log('Trend analyzer started');

  // Get all users who have biomarkers (notification prefs checked per-user before sending push)
  const usersResult = await db.query(
    `SELECT DISTINCT u.id, u.first_name, u.expo_push_token, u.health_memory,
            COALESCE(u.notification_prefs, '{"alerts": true, "trends": true}'::jsonb) AS notification_prefs
     FROM users u
     INNER JOIN biomarkers b ON b.user_id = u.id`,
  );

  const users: UserRow[] = usersResult.rows;
  console.log(`Analyzing ${users.length} users`);

  // Batch: fetch last 5 readings per biomarker for ALL users in one query
  const userIds = users.map(u => u.id);
  const allBiomarkersResult = await db.query(
    `SELECT user_id, name, value, unit, risk_level, reference_min, reference_max, recorded_at
     FROM (
       SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id, name ORDER BY recorded_at DESC) AS rn
       FROM biomarkers WHERE user_id = ANY($1::uuid[])
     ) ranked WHERE rn <= 5
     ORDER BY user_id, name, recorded_at ASC`,
    [userIds],
  );

  // Group into Map<userId, Map<biomarkerName, readings[]>>
  const biomarkersByUser = new Map<string, Map<string, BiomarkerReading[]>>();
  for (const row of allBiomarkersResult.rows) {
    if (!biomarkersByUser.has(row.user_id)) biomarkersByUser.set(row.user_id, new Map());
    const byName = biomarkersByUser.get(row.user_id)!;
    if (!byName.has(row.name)) byName.set(row.name, []);
    byName.get(row.name)!.push(row);
  }

  const client = await getOpenAI();

  // Process users concurrently, 10 at a time.
  // Each user may hit GPT + Expo push — unlimited concurrency would exhaust
  // OpenAI rate limits and Expo's push API at scale.
  const CONCURRENCY = 10;
  for (let i = 0; i < users.length; i += CONCURRENCY) {
    const batch = users.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(user => {
        const byName = biomarkersByUser.get(user.id) ?? new Map();
        return analyzeUser(db, client, user, byName).catch(e =>
          console.error(`Failed to analyze user ${user.id}:`, e),
        );
      }),
    );
  }

  console.log('Trend analyzer complete');
};

async function analyzeUser(
  db: Pool, client: OpenAI, user: UserRow,
  byName: Map<string, BiomarkerReading[]>,
): Promise<void> {
  if (!byName.size) return;

  const newAlerts: Alert[] = [];
  const concerningBiomarkers: string[] = [];

  // ── Rule-based detection ──────────────────────────────────────────────────

  for (const [name, readings] of byName.entries()) {
    const latest = readings[readings.length - 1];

    // 1. Newly abnormal — latest is abnormal, previous reading was not
    if (latest.risk_level === 'abnormal' && readings.length >= 2) {
      const prev = readings[readings.length - 2];
      if (prev.risk_level !== 'abnormal') {
        newAlerts.push({
          type: 'abnormal',
          severity: 'warning',
          title: `${name} moved out of range`,
          body: `Your ${name} is now ${latest.value} ${latest.unit}${latest.reference_min != null ? ` (normal: ${latest.reference_min}–${latest.reference_max})` : ''}. It was within range at your last reading.`,
          biomarkers: [name],
        });
        concerningBiomarkers.push(name);
      } else {
        concerningBiomarkers.push(name);
      }
    }

    // 2. Accelerating trend — 3+ consecutive moves in same direction, each >5%
    if (readings.length >= 3) {
      const values = readings.map(r => Number(r.value));
      const moves = values.slice(1).map((v, i) => v - values[i]);
      const last3 = moves.slice(-3);
      const allUp = last3.every(m => m > 0);
      const allDown = last3.every(m => m < 0);

      const totalChange = Math.abs((values[values.length - 1] - values[0]) / values[0]) * 100;

      if ((allUp || allDown) && totalChange > 15) {
        const direction = allUp ? 'rising' : 'falling';
        const isWorrying = latest.risk_level === 'abnormal' || totalChange > 25;

        newAlerts.push({
          type: 'trend',
          severity: isWorrying ? 'warning' : 'info',
          title: `${name} consistently ${direction}`,
          body: `${name} has moved ${direction} across ${readings.length} readings — a ${totalChange.toFixed(0)}% change overall. Current: ${latest.value} ${latest.unit}.`,
          biomarkers: [name],
        });
        if (isWorrying) concerningBiomarkers.push(name);
      }
    }
  }

  // ── GPT cross-pattern analysis (only when ≥2 concerning biomarkers) ───────

  if (concerningBiomarkers.length >= 2) {
    const biomarkerSummary = Array.from(byName.entries())
      .filter(([name]) => concerningBiomarkers.includes(name))
      .map(([name, readings]) => {
        const values = readings.map(r => `${r.value}`).join(' → ');
        const latest = readings[readings.length - 1];
        return `- ${name}: ${values} ${latest.unit} [${latest.risk_level ?? 'unknown'}]`;
      })
      .join('\n');

    const prompt = `You are a clinical pattern recognition system for CoreHealth. A user has multiple biomarkers flagged as concerning. Identify if there is a meaningful cross-biomarker pattern (e.g., iron deficiency, cardiovascular risk cluster, thyroid dysfunction, metabolic syndrome).

Concerning biomarkers:
${biomarkerSummary}

${user.health_memory ? `User health memory:\n${user.health_memory}\n` : ''}

If you identify a clinically significant pattern, respond with exactly this JSON:
{"found": true, "title": "short title", "body": "1-2 sentence clinical explanation for a health-literate user", "severity": "warning|critical"}

If no clear pattern, respond: {"found": false}

Respond only with the JSON object.`;

    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.2,
      });

      const raw = completion.choices[0]?.message?.content?.trim() ?? '';
      const parsed = JSON.parse(raw);

      if (parsed.found) {
        newAlerts.push({
          type: 'pattern',
          severity: parsed.severity === 'critical' ? 'critical' : 'warning',
          title: parsed.title,
          body: parsed.body,
          biomarkers: concerningBiomarkers,
        });
      }
    } catch (e) {
      console.warn(`GPT pattern analysis failed for user ${user.id}:`, e);
    }
  }

  if (!newAlerts.length) return;

  // ── Deduplicate: skip alerts for the same biomarkers within 7 days ─────────

  const recentResult = await db.query(
    `SELECT biomarkers FROM health_alerts
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
    [user.id],
  );
  const recentBiomarkerSets = recentResult.rows.map((r: { biomarkers: string[] }) => new Set<string>(r.biomarkers));

  const dedupedAlerts = newAlerts.filter(alert => {
    return !recentBiomarkerSets.some((recent: Set<string>) =>
      alert.biomarkers.every(b => recent.has(b)),
    );
  });

  if (!dedupedAlerts.length) return;

  // ── Store alerts in DB ─────────────────────────────────────────────────────

  for (const alert of dedupedAlerts) {
    await db.query(
      `INSERT INTO health_alerts (user_id, type, severity, title, body, biomarkers)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, alert.type, alert.severity, alert.title, alert.body, alert.biomarkers],
    );
  }

  // ── Send Expo push notification (if user has not opted out) ───────────────

  const prefs = user.notification_prefs ?? {};
  const pushEnabled = prefs.alerts !== false && prefs.trends !== false;

  if (user.expo_push_token && pushEnabled) {
    const topAlert = dedupedAlerts.find(a => a.severity === 'critical')
      ?? dedupedAlerts.find(a => a.severity === 'warning')
      ?? dedupedAlerts[0];

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          to: user.expo_push_token,
          title: topAlert.title,
          body: topAlert.body,
          data: { type: 'health_alert', alertCount: dedupedAlerts.length },
          sound: 'default',
          priority: topAlert.severity === 'critical' ? 'high' : 'normal',
        }),
      });
    } catch (e) {
      console.warn(`Push notification failed for user ${user.id}:`, e);
    }
  }

  console.log(`User ${user.id}: ${dedupedAlerts.length} new alerts`);
}
