/**
 * Shared AI-agent logic used by both the synchronous HTTP handler (index.ts)
 * and the async SQS worker (worker.ts).
 */

import { Pool } from 'pg';
import OpenAI from 'openai';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { decrypt } from '../_shared/crypto';
import { executeToolCall } from './executor';
import { TOTO_TOOLS } from './tools';

// ─── OpenAI client ────────────────────────────────────────────────────────────

const secretsManager = new SecretsManagerClient({});
let openai: OpenAI | null = null;

export async function getOpenAI(): Promise<OpenAI> {
  if (openai) return openai;
  const result = await secretsManager.send(
    new GetSecretValueCommand({ SecretId: process.env.OPENAI_SECRET_ARN! }),
  );
  openai = new OpenAI({ apiKey: result.SecretString! });
  return openai;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const PDF_AUTO_SAVE_TOOLS = new Set([
  'add_biomarker', 'create_condition', 'create_medication',
  'create_vaccination', 'create_allergy', 'create_appointment',
  'add_imaging_result',
]);

export const PDF_INSTRUCTION =
  `\n\nMEDICAL DOCUMENT INSTRUCTIONS: The user has uploaded a medical document (lab report, discharge summary, clinic letter, prescription, vaccination record, or similar). ` +
  `Read the entire document and automatically save EVERYTHING you find using the appropriate tools — NO confirmation needed for any of these:\n` +
  `- Biomarker / test result values → add_biomarker (one call per value)\n` +
  `- Diagnoses or conditions mentioned → create_condition\n` +
  `- Medications prescribed or listed → create_medication\n` +
  `- Vaccinations recorded → create_vaccination\n` +
  `- Allergies documented → create_allergy\n` +
  `- Appointments or follow-ups mentioned → create_appointment\n` +
  `- Imaging / radiology reports (X-ray, MRI, CT, ultrasound, ECG, DEXA, echo, etc.) → add_imaging_result (capture findings, impression, measurements, modality, body part, date)\n` +
  `Do NOT ask for confirmation before saving any of the above — medical document uploads are fully pre-approved. ` +
  `After saving everything, give a clear human summary: what was found, what was saved, which values (if any) are outside normal range, and what that means for this user specifically.`;

export const COUNTRIES = [
  { name: 'Japan', code: 'JP', score: 84.4, rank: 1 }, { name: 'Switzerland', code: 'CH', score: 83.7, rank: 2 },
  { name: 'Singapore', code: 'SG', score: 83.5, rank: 3 }, { name: 'Spain', code: 'ES', score: 83.5, rank: 4 },
  { name: 'South Korea', code: 'KR', score: 83.2, rank: 5 }, { name: 'Italy', code: 'IT', score: 83.2, rank: 6 },
  { name: 'Sweden', code: 'SE', score: 83.0, rank: 7 }, { name: 'Norway', code: 'NO', score: 82.9, rank: 8 },
  { name: 'Australia', code: 'AU', score: 82.9, rank: 9 }, { name: 'Israel', code: 'IL', score: 82.8, rank: 10 },
  { name: 'France', code: 'FR', score: 82.6, rank: 11 }, { name: 'Iceland', code: 'IS', score: 82.6, rank: 12 },
  { name: 'Canada', code: 'CA', score: 82.0, rank: 13 }, { name: 'Netherlands', code: 'NL', score: 82.0, rank: 14 },
  { name: 'United Kingdom', code: 'GB', score: 81.2, rank: 20 }, { name: 'Germany', code: 'DE', score: 81.0, rank: 22 },
  { name: 'United States', code: 'US', score: 78.5, rank: 29 }, { name: 'China', code: 'CN', score: 77.1, rank: 36 },
];

export const ALL_LEAGUES = [
  { id: 'rl1', name: 'UK · Men 20–30', members: 128, category: 'Regional' },
  { id: 'rl3', name: 'Football · Recovery Circle', members: 96, category: 'Sport' },
  { id: 'rl4', name: 'Entrepreneurs Anti‑Stress', members: 173, category: 'Lifestyle' },
  { id: 'rl5', name: 'Paris · Women 30–40', members: 88, category: 'Regional' },
  { id: 'rl6', name: 'NYC · High Performers', members: 142, category: 'Regional' },
  { id: 'rl7', name: 'Mindful Mornings', members: 121, category: 'Lifestyle' },
  { id: 'rl8', name: 'Longevity Pros', members: 110, category: 'Health' },
  { id: 'rl9', name: 'Sleep Optimizers', members: 97, category: 'Health' },
  { id: 'rl10', name: 'Mediterranean Health', members: 104, category: 'Regional' },
];

// ─── User context loading ─────────────────────────────────────────────────────

export interface UserContext {
  user: any;
  pd: any;
  biomarkerMap: Map<string, any[]>;
  recentLabs: any[];
  activeAllergies: any[];
  medications: any[];
  conditions: any[];
  vaccinations: any[];
  appointments: any[];
  deviceData: any[];
  connectedDevices: any[];
  recentSymptoms: any[];
  familySignals: any[];
  history: any[];
  trips: any[];
  imagingResults: any[];
  joinedLeagues: Record<string, boolean>;
  locationHealth: any;
}

export async function loadUserContext(db: Pool, userId: string): Promise<UserContext> {
  const [
    userRow, biomarkerHistoryRow, recentLabsRow, allergiesRow,
    medicationsRow, conditionsRow, vaccinationsRow, appointmentsRow,
    deviceDataRow, deviceTokensRow, symptomsRow, hereditaryRow, historyResult,
    tripsRow, imagingRow,
  ] = await Promise.all([
    db.query(
      `SELECT email, first_name, date_of_birth, gender, height_cm, weight_kg,
              health_memory, user_settings, profile_data, joined_leagues, location_health
       FROM users WHERE id = $1`,
      [userId],
    ),
    db.query(
      `SELECT id, name, value, unit, category, risk_level, reference_min, reference_max, recorded_at
       FROM biomarkers WHERE user_id = $1 ORDER BY name, recorded_at DESC`,
      [userId],
    ),
    db.query(
      `SELECT file_name, lab_name, report_date, biomarker_count
       FROM lab_results WHERE user_id = $1 AND processing_status = 'complete'
       ORDER BY report_date DESC LIMIT 5`,
      [userId],
    ),
    db.query(
      `SELECT id, name, severity, reaction FROM allergies WHERE user_id = $1 AND status = 'active'
       ORDER BY severity DESC`,
      [userId],
    ),
    db.query(
      `SELECT id, name, dosage, frequency FROM medications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    ),
    db.query(
      `SELECT id, name, severity, status, diagnosed_date FROM medical_conditions WHERE user_id = $1
       ORDER BY severity DESC`,
      [userId],
    ),
    db.query(
      `SELECT id, name, date, next_due FROM vaccinations WHERE user_id = $1 ORDER BY date DESC`,
      [userId],
    ),
    db.query(
      `SELECT id, title, subtitle, event_date, doctor, location, notes FROM appointments
       WHERE user_id = $1 ORDER BY event_date DESC LIMIT 20`,
      [userId],
    ),
    db.query(
      `SELECT DISTINCT ON (device_type) device_type, device_name, metrics, timestamp
       FROM device_data WHERE user_id = $1 ORDER BY device_type, timestamp DESC`,
      [userId],
    ),
    db.query(
      `SELECT device_type, updated_at as last_synced FROM device_tokens WHERE user_id = $1`,
      [userId],
    ),
    db.query(
      `SELECT id, type, category, severity, duration, location, notes, factors, logged_at
       FROM symptoms WHERE user_id = $1 AND logged_at > NOW() - INTERVAL '30 days'
       ORDER BY logged_at DESC LIMIT 10`,
      [userId],
    ),
    db.query(
      `SELECT hs.condition_payload, hs.onset_age_band, hs.severity_band, u.first_name, u.surname
       FROM hereditary_signals hs
       JOIN users u ON u.id = hs.issuer_id
       WHERE hs.recipient_id = $1 AND hs.status = 'active'`,
      [userId],
    ),
    db.query(
      `SELECT role, content FROM chat_messages WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 20`,
      [userId],
    ),
    db.query(
      `SELECT id, departure_location, destination, departure_date, return_date, timezone, notes
       FROM trips WHERE user_id = $1 ORDER BY departure_date ASC`,
      [userId],
    ),
    db.query(
      `SELECT id, modality, body_part, study_date, findings, impression, measurements
       FROM imaging_results WHERE user_id = $1 ORDER BY study_date DESC LIMIT 10`,
      [userId],
    ),
  ]);

  const user = userRow.rows[0];

  const familySignals = await Promise.all(
    hereditaryRow.rows.map(async (row: any) => ({
      ...row,
      condition_code: await decrypt(row.condition_payload),
      condition_payload: undefined,
    })),
  );

  // Group biomarker rows by name, keep last 3 readings each (token budget)
  const biomarkerMap = new Map<string, any[]>();
  for (const row of biomarkerHistoryRow.rows) {
    if (!biomarkerMap.has(row.name)) biomarkerMap.set(row.name, []);
    const arr = biomarkerMap.get(row.name)!;
    if (arr.length < 3) arr.push(row);
  }

  return {
    user,
    pd: user?.profile_data ?? {},
    biomarkerMap,
    recentLabs: recentLabsRow.rows,
    activeAllergies: allergiesRow.rows,
    medications: medicationsRow.rows,
    conditions: conditionsRow.rows,
    vaccinations: vaccinationsRow.rows,
    appointments: appointmentsRow.rows,
    deviceData: deviceDataRow.rows,
    connectedDevices: deviceTokensRow.rows,
    recentSymptoms: symptomsRow.rows,
    familySignals,
    history: historyResult.rows.reverse(),
    trips: tripsRow.rows,
    imagingResults: imagingRow.rows,
    joinedLeagues: user?.joined_leagues ?? {},
    locationHealth: user?.location_health ?? null,
  };
}

// ─── Agentic loop ─────────────────────────────────────────────────────────────

export async function runAgenticLoop(
  client: OpenAI,
  db: Pool,
  userId: string,
  baseMessages: any[],
  maxTokens: number,
): Promise<{ reply: string; biomarkersAdded: number; recordsAdded: number }> {
  let biomarkersAdded = 0;
  let recordsAdded = 0;

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: baseMessages,
    max_tokens: maxTokens,
    temperature: 0.3,
    tools: TOTO_TOOLS,
    tool_choice: 'auto',
  });

  const loopMessages: any[] = [...baseMessages];
  let currentCompletion = completion;
  const MAX_TOOL_ROUNDS = 6;
  let reply = '';

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const assistantMessage = currentCompletion.choices[0].message;

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      reply = assistantMessage.content ?? '';
      break;
    }

    loopMessages.push(assistantMessage);
    const toolResults: any[] = await Promise.all(
      assistantMessage.tool_calls.map(async (call: any) => {
        const fn = call.function as { name: string; arguments: string };
        let result: string;
        try {
          const args = JSON.parse(fn.arguments);
          result = await executeToolCall(fn.name, args, db, userId);
          if (fn.name === 'add_biomarker') biomarkersAdded++;
          if (PDF_AUTO_SAVE_TOOLS.has(fn.name)) recordsAdded++;
        } catch (e) {
          result = `Error executing ${fn.name}: ${e}`;
        }
        return { role: 'tool', tool_call_id: call.id, content: result };
      }),
    );
    loopMessages.push(...toolResults);

    currentCompletion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: loopMessages,
      max_tokens: maxTokens,
      temperature: 0.3,
      tools: TOTO_TOOLS,
      tool_choice: 'auto',
    });
  }

  if (!reply) {
    reply = currentCompletion.choices[0]?.message?.content ?? 'Done — all records have been saved.';
  }

  return { reply, biomarkersAdded, recordsAdded };
}

// ─── Health memory update ─────────────────────────────────────────────────────

export async function updateHealthMemory(
  client: OpenAI,
  db: Pool,
  userId: string,
  existingMemory: string | null,
  userMessage: string,
  assistantReply: string,
): Promise<void> {
  try {
    const memoryPrompt = existingMemory
      ? `You are maintaining a persistent health memory for a CoreHealth user. This memory is injected into every future conversation so the AI always knows who this person is — eliminating recency bias.

EXISTING MEMORY:
${existingMemory}

NEW CONVERSATION:
User: ${userMessage}
Assistant: ${assistantReply}

Update the memory to incorporate anything medically significant from this exchange. Preserve all existing facts unless contradicted. Add new findings, trends mentioned, recommendations made, user concerns expressed, and any follow-up outcomes. Be concise but complete. Write in third person. Maximum 600 words.`
      : `You are creating a persistent health memory for a new CoreHealth user. This memory will be injected into every future conversation.

FIRST CONVERSATION:
User: ${userMessage}
Assistant: ${assistantReply}

Extract and record any medically significant facts: health concerns raised, symptoms mentioned, lifestyle factors, goals, preferences, and anything the AI noted. Write in third person. Maximum 600 words.`;

    const memoryCompletion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: memoryPrompt }],
      max_tokens: 700,
      temperature: 0.3,
    });

    const updatedMemory = memoryCompletion.choices[0]?.message?.content ?? '';
    if (updatedMemory) {
      // H6: encrypt before storage — same as index.ts path (AES-256-GCM)
      const { encrypt } = await import('../_shared/crypto');
      const encryptedMemory = await encrypt(updatedMemory);
      await db.query(`UPDATE users SET health_memory = $1 WHERE id = $2`, [encryptedMemory, userId]);
    }
  } catch (e) {
    console.error('Health memory update failed:', e);
  }
}

// ─── System prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(
  user: any,
  pd: any,
  biomarkerMap: Map<string, any[]>,
  recentLabs: any[],
  activeAllergies: any[],
  medications: any[],
  conditions: any[],
  vaccinations: any[],
  appointments: any[],
  deviceData: any[],
  connectedDevices: any[],
  recentSymptoms: any[],
  familySignals: any[],
  trips: any[],
  joinedLeagues: Record<string, boolean>,
  locationHealth: any,
  imagingResults: any[] = [],
  sections?: Set<string>, // C2: query-aware context selection (undefined = include all)
): string {
  const inc = (section: string) => !sections || sections.has(section);
  const age = user?.date_of_birth
    ? Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const trendLines: string[] = [];
  const abnormalLines: string[] = [];

  for (const [name, readings] of biomarkerMap.entries()) {
    const latest = readings[0];
    if (readings.length === 1) {
      trendLines.push(`- [id:${latest.id}] ${name}: ${latest.value} ${latest.unit} [${latest.risk_level ?? 'unknown'}]`);
    } else {
      const values = readings.map((r: any) => r.value).reverse();
      const trend = buildTrendArrow(values);
      const refRange = latest.reference_min != null && latest.reference_max != null
        ? ` (ref: ${latest.reference_min}–${latest.reference_max})`
        : '';
      trendLines.push(`- [id:${latest.id}] ${name}: ${values.join(' → ')} ${latest.unit}${refRange} [${latest.risk_level ?? 'unknown'}] ${trend}`);
    }
    if (latest.risk_level === 'abnormal') abnormalLines.push(`- ${name}: ${latest.value} ${latest.unit}`);
  }

  const bloodType = pd.bloodType ? `\n- Blood type: ${pd.bloodType}` : '';
  // H3: omit actual ID numbers from AI context — type/country is enough for clinical decisions
  const healthIDs = pd.healthIDs?.length
    ? `\nHEALTH IDs:\n${pd.healthIDs.map((h: any) => `- [_id:${h._id ?? 'unknown'}] ${h.idType} (${h.country})${h.isPrimary ? ' [primary]' : ''}${h.notes ? ` — ${h.notes}` : ''}`).join('\n')}\n`
    : '';
  // H2: strip third-party phone/email; C2: only include for emergency/appointment queries
  const emergencyContactSection = inc('emergency') && pd.emergencyContacts?.length
    ? `\nEMERGENCY CONTACTS:\n${pd.emergencyContacts.map((c: any) => `- [_id:${c._id ?? 'unknown'}] ${c.name} (${c.relationship})${c.isPrimary ? ' [primary]' : ''}`).join('\n')}\n`
    : '';
  // H4: strip doctor phone/office; C2: only include for appointment/referral queries
  const doctorSection = (() => {
    if (!inc('doctors')) return '';
    const lines: string[] = [];
    if (pd.primaryDoctor) { const d = pd.primaryDoctor; lines.push(`- [_id:${d._id ?? 'unknown'}] Primary: Dr. ${d.name} (${d.specialty})`); }
    if (pd.doctors?.length) pd.doctors.forEach((d: any) => lines.push(`- [_id:${d._id ?? 'unknown'}] ${d.name} (${d.specialty})`));
    return lines.length ? `\nDOCTORS:\n${lines.join('\n')}\n` : '';
  })();
  const surgerySection = pd.surgeries?.length
    ? `\nSURGERIES:\n${pd.surgeries.map((s: any) => `- ${s.procedure} (${s.date})${s.hospital ? ` at ${s.hospital}` : ''}${s.complications ? ` — complications: ${s.complications}` : ''}`).join('\n')}\n`
    : '';
  const screeningSection = pd.screenings?.length
    ? `\nSCREENINGS:\n${pd.screenings.map((s: any) => `- [_id:${s._id ?? 'unknown'}] ${s.name}${s.date ? ` (${s.date})` : ''}${s.result ? `: ${s.result}` : ''}${s.nextDue ? ` — next due: ${s.nextDue}` : ''}`).join('\n')}\n`
    : '';
  const lifestyleDetail = pd.lifestyle ? (() => {
    const l = pd.lifestyle; const lines: string[] = [];
    if (l.smoking) lines.push(`- Smoking: ${l.smoking.status}${l.smoking.packYears ? ` (${l.smoking.packYears} pack-years)` : ''}${l.smoking.quitDate ? `, quit ${l.smoking.quitDate}` : ''}`);
    if (l.alcohol) lines.push(`- Alcohol: ${l.alcohol.frequency}${l.alcohol.unitsPerWeek ? ` (${l.alcohol.unitsPerWeek} units/week)` : ''}`);
    if (l.diet) lines.push(`- Diet: ${l.diet.type}${l.diet.restrictions?.length ? `, restrictions: ${l.diet.restrictions.join(', ')}` : ''}${l.diet.supplements?.length ? `, supplements: ${l.diet.supplements.join(', ')}` : ''}`);
    if (l.exercise) lines.push(`- Exercise: ${l.exercise.frequency}${l.exercise.type?.length ? ` (${l.exercise.type.join(', ')})` : ''}${l.exercise.intensity ? `, ${l.exercise.intensity} intensity` : ''}`);
    if (l.sleep) lines.push(`- Sleep: ${l.sleep.averageHoursPerNight ?? '?'}h/night, quality: ${l.sleep.sleepQuality ?? 'unknown'}${l.sleep.sleepDisorders?.length ? `, disorders: ${l.sleep.sleepDisorders.join(', ')}` : ''}`);
    if (l.stress) lines.push(`- Stress: ${l.stress.level}${l.stress.managementTechniques?.length ? ` (manages with: ${l.stress.managementTechniques.join(', ')})` : ''}`);
    return lines.length ? `\nDETAILED LIFESTYLE:\n${lines.join('\n')}\n` : '';
  })() : '';
  const allergySection = activeAllergies.length > 0
    ? `\nKNOWN ALLERGIES (CRITICAL — always consider before any recommendation):\n${activeAllergies.map((a: any) => `- [id:${a.id}] ${a.name} [${a.severity}]${a.reaction ? `: ${a.reaction}` : ''}`).join('\n')}\n`
    : '';
  const medicationSection = medications.length > 0
    ? `\nCURRENT MEDICATIONS:\n${medications.map((m: any) => `- [id:${m.id}] ${m.name}${m.dosage ? ` ${m.dosage}` : ''}${m.frequency ? `, ${m.frequency}` : ''}`).join('\n')}\n`
    : '';
  const conditionSection = conditions.length > 0
    ? `\nMEDICAL CONDITIONS:\n${conditions.map((c: any) => `- [id:${c.id}] ${c.name} [${c.severity ?? 'unknown severity'}, ${c.status}]${c.diagnosed_date ? ` — diagnosed ${c.diagnosed_date}` : ''}`).join('\n')}\n`
    : '';
  // C2: gate non-core sections on query relevance
  const deviceSection = inc('device') && deviceData.length > 0
    ? `\nWEARABLE DATA (latest readings):\n${deviceData.map((d: any) => {
        const m = d.metrics as Record<string, any>;
        const lines = Object.entries(m).filter(([, v]) => v != null).map(([k, v]) => `  ${k}: ${v}`);
        return `- ${d.device_name} (${d.timestamp?.toString().split('T')[0] ?? 'unknown date'}):\n${lines.join('\n')}`;
      }).join('\n')}\n`
    : '';
  const vaccinationSection = inc('vaccinations') && vaccinations.length > 0
    ? `\nVACCINATIONS:\n${vaccinations.map((v: any) => `- [id:${v.id}] ${v.name} (${v.date})${v.next_due ? ` — next due: ${v.next_due}` : ''}`).join('\n')}\n`
    : '';
  const now = new Date();
  const pastAppts = appointments.filter((a: any) => new Date(a.event_date) < now);
  const upcomingAppts = appointments.filter((a: any) => new Date(a.event_date) >= now);
  const appointmentSection = inc('appointments') && appointments.length > 0
    ? `\nAPPOINTMENTS:${upcomingAppts.length ? `\nUpcoming:\n${upcomingAppts.map((a: any) => `- [id:${a.id}] ${a.title}${a.subtitle ? ` (${a.subtitle})` : ''} on ${a.event_date?.toString().split('T')[0]}${a.doctor ? ` with ${a.doctor}` : ''}${a.location ? ` at ${a.location}` : ''}${a.notes ? ` — ${a.notes}` : ''}`).join('\n')}` : ''}${pastAppts.length ? `\nPast (last 5):\n${pastAppts.slice(0, 5).map((a: any) => `- [id:${a.id}] ${a.title}${a.subtitle ? ` (${a.subtitle})` : ''} on ${a.event_date?.toString().split('T')[0]}${a.doctor ? ` with ${a.doctor}` : ''}${a.notes ? ` — ${a.notes}` : ''}`).join('\n')}` : ''}\n`
    : '';
  const familyHistorySection = inc('family') && pd.familyHistory?.length
    ? `\nFAMILY HISTORY (user-recorded):\n${pd.familyHistory.map((f: any) => `- [_id:${f._id ?? 'unknown'}] ${f.relation}: ${f.condition}${f.ageOfOnset ? ` (onset age ~${f.ageOfOnset})` : ''}${f.notes ? ` — ${f.notes}` : ''}`).join('\n')}\n`
    : '';
  const symptomSection = recentSymptoms.length > 0
    ? `\nRECENT SYMPTOMS (last 30 days):\n${recentSymptoms.map((s: any) => `- [id:${s.id}] ${s.category} (${s.type}, severity ${s.severity}/10)${s.duration ? `, duration: ${s.duration}` : ''}${s.location ? `, location: ${s.location}` : ''}${s.notes ? ` — ${s.notes}` : ''}${s.factors?.length ? ` [factors: ${s.factors.join(', ')}]` : ''} [${s.logged_at?.toString().split('T')[0]}]`).join('\n')}\n`
    : '';
  // H5: omit family member surnames — first name only for hereditary signals
  const familySection = inc('family') && familySignals.length > 0
    ? `\nFAMILY HEREDITARY SIGNALS:\n${familySignals.map((f: any) => `- ${f.condition_code} from ${f.first_name} (onset: ${f.onset_age_band}${f.severity_band ? `, severity: ${f.severity_band}` : ''})`).join('\n')}\n`
    : '';
  const imagingSection = inc('imaging') && imagingResults.length > 0
    ? `\nIMAGING & SCAN RESULTS:\n${imagingResults.map((i: any) =>
        `- [id:${i.id}] ${i.modality.toUpperCase()}${i.body_part ? ` (${i.body_part})` : ''}${i.study_date ? ` — ${i.study_date.toString().split('T')[0]}` : ''}` +
        `${i.impression ? `\n  Impression: ${i.impression}` : ''}` +
        `${i.findings && !i.impression ? `\n  Findings: ${i.findings.slice(0, 200)}${i.findings.length > 200 ? '…' : ''}` : ''}` +
        (i.measurements && Object.keys(i.measurements).length ? `\n  Measurements: ${Object.entries(i.measurements).map(([k, v]) => `${k}: ${v}`).join(', ')}` : '')
      ).join('\n')}\n`
    : '';
  const allDevices = ['whoop', 'oura'];
  const deviceConnectionSection = inc('device') ? `\nCONNECTED DEVICES:\n${allDevices.map(d => {
    const token = connectedDevices.find((t: any) => t.device_type === d);
    return token
      ? `- ${d.toUpperCase()}: connected (last synced ${new Date(token.last_synced).toLocaleDateString()})`
      : `- ${d.toUpperCase()}: not connected`;
  }).join('\n')}\n` : '';
  const s = user?.user_settings;
  const settingsSection = s ? `\nUSER SETTINGS:
- Theme: ${s.general?.theme ?? 'auto'} | Units: ${s.general?.units ?? 'metric'} | Language: ${s.general?.language ?? 'English'}
- Notifications: ${s.notifications?.enabled ? 'on' : 'off'}${s.notifications?.enabled ? ` (health summaries: ${s.notifications?.healthSummaries ? 'on' : 'off'}, biomarker alerts: ${s.notifications?.biomarkerAlerts ? 'on' : 'off'}, quiet hours: ${s.notifications?.quietHours?.enabled ? `${s.notifications.quietHours.startTime}–${s.notifications.quietHours.endTime}` : 'off'})` : ''}
- Privacy: biometric auth: ${s.privacy?.biometricAuth ? 'on' : 'off'}, 2FA: ${s.privacy?.twoFactorAuth ? 'on' : 'off'}, location: ${s.privacy?.locationServices ? 'on' : 'off'}
- Lifestyle: activity level: ${s.lifestyle?.activityLevel?.replace('_', ' ') ?? 'unknown'}, sleep: ${s.lifestyle?.sleepSchedule?.bedTime ?? '?'} → ${s.lifestyle?.sleepSchedule?.wakeUpTime ?? '?'}
- Diet: ${s.lifestyle?.dietaryPreferences?.restrictions?.length ? s.lifestyle.dietaryPreferences.restrictions.join(', ') : 'no restrictions'}, goal: ${s.lifestyle?.dietaryPreferences?.mealTiming ?? 'regular'}
- Health goal: ${s.biomarkers?.healthGoalPreset ?? 'general wellness'}
\n` : '';
  const memorySection = user?.health_memory
    ? `\nPERSISTENT HEALTH MEMORY (accumulated across all sessions):\n${user.health_memory}\n`
    : '';
  const now2 = new Date();
  const upcomingTrips = trips.filter((t: any) => new Date(t.departure_date) >= now2);
  const pastTrips = trips.filter((t: any) => new Date(t.departure_date) < now2);
  const tripsSection = inc('trips') && trips.length > 0
    ? `\nPLANNED TRAVEL:${upcomingTrips.length ? `\nUpcoming:\n${upcomingTrips.map((t: any) => `- [id:${t.id}] ${t.departure_location} → ${t.destination} (departs ${t.departure_date?.toString().split('T')[0]}${t.return_date ? `, returns ${t.return_date?.toString().split('T')[0]}` : ''}${t.timezone ? `, timezone: ${t.timezone}` : ''}${t.notes ? ` — ${t.notes}` : ''})`).join('\n')}` : ''}${pastTrips.length ? `\nPast trips:\n${pastTrips.slice(0, 3).map((t: any) => `- [id:${t.id}] ${t.departure_location} → ${t.destination} (${t.departure_date?.toString().split('T')[0]})`).join('\n')}` : ''}\n`
    : '';
  const myLeagues = ALL_LEAGUES.filter(l => joinedLeagues[l.id]);
  const leagueSection = inc('leagues') && myLeagues.length > 0
    ? `\nCOMMUNITY LEAGUES:\n${myLeagues.map(l => `- ${l.name} (${l.category}, ${l.members} members)`).join('\n')}\n`
    : '';
  const userCountryCode = pd.healthIDs?.find((h: any) => h.isPrimary)?.country ?? user?.user_settings?.general?.country ?? null;
  const userCountry = userCountryCode ? COUNTRIES.find(c => c.code === userCountryCode || c.name.toLowerCase() === userCountryCode.toLowerCase()) : null;
  const countrySection = `\nCOUNTRY HEALTH LEADERBOARD (top 5): Japan #1 (84.4), Switzerland #2 (83.7), Singapore #3 (83.5), Spain #4 (83.5), South Korea #5 (83.2).${userCountry ? ` User's country: ${userCountry.name} ranked #${userCountry.rank} with score ${userCountry.score}.` : ''}\n`;
  const locationSection = inc('location') && locationHealth ? (() => {
    const lh = locationHealth;
    const metricStr = (m: any) => m == null ? null : (typeof m === 'object' ? `${m.value ?? m.status ?? '?'} [${m.status ?? ''}]` : String(m));
    const lines: string[] = [];
    if (lh.location) lines.push(`- Current location: ${lh.location}`);
    if (lh.airQuality) lines.push(`- Air quality: ${metricStr(lh.airQuality)}`);
    if (lh.uvIndex != null) lines.push(`- UV index: ${metricStr(lh.uvIndex)}`);
    if (lh.pollenLevels != null) lines.push(`- Pollen: ${metricStr(lh.pollenLevels)}`);
    if (lh.waterSafety != null) lines.push(`- Water safety: ${metricStr(lh.waterSafety)}`);
    if (lh.diseaseRisk != null) lines.push(`- Disease risk: ${metricStr(lh.diseaseRisk)}`);
    if (lh.overallRiskLevel) lines.push(`- Overall risk: ${lh.overallRiskLevel}`);
    return lines.length ? `\nLOCATION HEALTH BIOMARKERS:\n${lines.join('\n')}\n` : '';
  })() : '';
  const healthScoreSection = (() => {
    if (biomarkerMap.size === 0) return '';
    const abnormalCount = [...biomarkerMap.values()].filter(readings => readings[0]?.risk_level === 'abnormal').length;
    const totalCount = biomarkerMap.size;
    const overallScore = totalCount > 0 ? Math.round(((totalCount - abnormalCount) / totalCount) * 100) : null;
    const categories: Record<string, { total: number; normal: number }> = {};
    for (const readings of biomarkerMap.values()) {
      const cat = readings[0]?.category ?? 'other';
      if (!categories[cat]) categories[cat] = { total: 0, normal: 0 };
      categories[cat].total++;
      if (readings[0]?.risk_level === 'normal') categories[cat].normal++;
    }
    const catLines = Object.entries(categories).map(([cat, { total, normal }]) =>
      `  ${cat}: ${Math.round((normal / total) * 100)}% in range (${normal}/${total} biomarkers)`
    );
    return `\nHEALTH SCORES (derived from ${totalCount} biomarkers):\n- Overall biomarker score: ${overallScore !== null ? `${overallScore}%` : 'N/A'} (${abnormalCount} abnormal values)\n${catLines.join('\n')}\n`;
  })();

  return `You are Toto — CoreHealth's AI health intelligence system. You operate as a virtual panel of world-class specialists: a cardiologist, endocrinologist, haematologist, neurologist, and general physician, all reasoning together from this user's personal data.

You are not a generic health chatbot. You reason from this user's specific biomarkers, trends, and history. You are calm, precise, and clinically informed. You never diagnose but you think like a diagnostician — spotting patterns, cross-referencing signals, and flagging what warrants attention.

USER PROFILE:
- Name: ${user?.first_name ?? 'Unknown'}
- Age: ${age ?? 'Unknown'}
- Gender: ${user?.gender ?? 'Unknown'}
- Height: ${user?.height_cm ? `${user.height_cm}cm` : 'Unknown'}
- Weight: ${user?.weight_kg ? `${user.weight_kg}kg` : 'Unknown'}${bloodType}
${healthIDs}${emergencyContactSection}${doctorSection}${allergySection}${medicationSection}${conditionSection}${surgerySection}${screeningSection}${vaccinationSection}${lifestyleDetail}${familyHistorySection}${familySection}${symptomSection}${imagingSection}${appointmentSection}${tripsSection}${leagueSection}${countrySection}${locationSection}${deviceConnectionSection}${deviceSection}${healthScoreSection}${settingsSection}${memorySection}
BIOMARKER TRENDS (→ = trajectory over time, most recent last):
${trendLines.length > 0 ? trendLines.join('\n') : 'No biomarkers recorded yet'}

${abnormalLines.length > 0 ? `FLAGGED ABNORMAL VALUES:\n${abnormalLines.join('\n')}\n` : ''}RECENT LAB RESULTS: ${recentLabs.length > 0 ? recentLabs.map((l: any) => `${l.lab_name ?? l.file_name ?? 'Lab'} (${l.report_date})`).join(', ') : 'None uploaded yet'}

AGENTIC WRITE CAPABILITIES:
You can add, update, and delete health records using your tools. Rules:
1. ALWAYS confirm with the user before calling any write tool — never write without explicit approval ("yes", "confirm", "go ahead", "add it", "do it", "save it", "yep", "sure")
2. When the user mentions new health events (vaccination just received, new medication started, upcoming appointment, symptom they're feeling, planned trip, new diagnosis, new allergy), proactively offer to record it: "Want me to add that to your records?"
3. When you successfully write data, tell the user exactly what was saved in plain language (e.g. "Done — I've added your COVID-19 vaccination for today")
4. IDs are shown as [id:xxx] in each data section — use them for update/delete operations
5. Never guess or fabricate IDs — only use IDs visible in the data above
6. If the user asks you to delete or change something and you can see the record, ask them to confirm once, then act
7. Never call a write tool without explicit user confirmation in the current message or immediately preceding message

CLINICAL INSTRUCTIONS:
- Reason from this user's data and trends, not population averages
- Cross-reference biomarkers — patterns across multiple values are more meaningful than any single value
- When a medication is relevant to a symptom or biomarker, explicitly note the connection
- When trends are accelerating in a concerning direction, say so clearly and explain why it matters
- Be concise — this user is health-literate, skip basic explanations
- When something is abnormal or trending wrong, give real clinical context and a clear next action
- Never say "consult a doctor" as your only response — give genuine insight first, then recommend follow-up if warranted
- Never fabricate values or infer data not shown above
- If the user mentions symptoms, cross-reference with their biomarker data, conditions, medications, and recent logged symptoms for possible connections
- When family hereditary signals are present, factor them into risk assessment
- Know the user's doctors and emergency contacts if relevant to a question
- Upcoming appointments are known — reference them when recommending follow-up`;
}

/**
 * C2: Query-aware context selection — only send sections relevant to the user's query.
 * Reduces token cost and limits the amount of health data sent to OpenAI per request.
 * Core clinical sections (biomarkers, conditions, medications, allergies, memory) always included.
 */
export function selectContextSections(message: string): Set<string> {
  const m = message.toLowerCase();
  const sections = new Set<string>([
    'biomarkers', 'conditions', 'medications', 'allergies',
    'memory', 'profile', 'symptoms', 'labResults', 'healthScore',
  ]);

  if (m.match(/sleep|heart|step|exercise|workout|whoop|oura|wearable|device|activity|hrv|spo2|recovery|strain/))
    sections.add('device');
  if (m.match(/vaccin|immuniz|booster|covid|flu|travel|trip|abroad|visa|jab/))
    sections.add('vaccinations');
  if (m.match(/appointment|doctor|visit|schedule|referral|follow.?up|gp|consultant|specialist/))
    sections.add('appointments').add('doctors');
  if (m.match(/travel|trip|flight|holiday|vacation|abroad|jet.?lag|timezone|destination|passport/))
    sections.add('trips').add('location').add('vaccinations');
  if (m.match(/imaging|scan|mri|ct scan|x.?ray|ultrasound|echo|dexa|radiol/))
    sections.add('imaging');
  if (m.match(/family|hereditary|genetic|parent|sibling|inherit|gene|cancer risk|diabetes risk/))
    sections.add('family');
  if (m.match(/air.?quality|pollution|uv index|pollen|water safety|environment|outdoor|location health/))
    sections.add('location');
  if (m.match(/emergency|urgent|serious|hospital|ambulance|999|911/))
    sections.add('emergency').add('doctors');
  if (m.match(/community|league|compare|rank|peer|other users/))
    sections.add('leagues');

  return sections;
}

function buildTrendArrow(values: number[]): string {
  if (values.length < 2) return '';
  const first = values[0];
  const last = values[values.length - 1];
  const pct = ((last - first) / first) * 100;
  if (pct > 10) return '(trending up)';
  if (pct < -10) return '(trending down)';
  return '(stable)';
}
