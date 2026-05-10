/**
 * Device sync cron — runs nightly via EventBridge.
 * For each user with stored device tokens:
 * 1. Refresh access token if expiring within 1 hour
 * 2. Pull latest data from Whoop / Oura APIs
 * 3. Store in device_data table
 */

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Pool } from 'pg';
import { getDb } from '../_shared/db';
import { encrypt, decrypt } from '../_shared/crypto';

interface DeviceToken {
  id: string;
  user_id: string;
  device_type: 'whoop' | 'oura';
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

const sm = new SecretsManagerClient({});
let whoopCreds: { clientId: string; clientSecret: string } | null = null;
let ouraCreds: { clientId: string; clientSecret: string } | null = null;

async function getWhoop() {
  if (!whoopCreds) {
    const r = await sm.send(new GetSecretValueCommand({ SecretId: process.env.WHOOP_SECRET_ARN! }));
    whoopCreds = JSON.parse(r.SecretString!);
  }
  return whoopCreds!;
}

async function getOura() {
  if (!ouraCreds) {
    const r = await sm.send(new GetSecretValueCommand({ SecretId: process.env.OURA_SECRET_ARN! }));
    ouraCreds = JSON.parse(r.SecretString!);
  }
  return ouraCreds!;
}

async function refreshWhoopToken(db: Pool, token: DeviceToken): Promise<string | null> {
  const creds = await getWhoop();
  const decryptedRefresh = await decrypt(token.refresh_token);
  if (!decryptedRefresh) { console.error('Failed to decrypt Whoop refresh token'); return null; }
  const res = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decryptedRefresh,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
    }).toString(),
  });
  if (!res.ok) { console.error('Whoop token refresh failed — status:', res.status); return null; }
  const data = await res.json() as any;
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);
  const newRefreshRaw = data.refresh_token ?? decryptedRefresh;
  const [encAccess, encRefresh] = await Promise.all([encrypt(data.access_token), encrypt(newRefreshRaw)]);
  await db.query(
    `UPDATE device_tokens SET access_token=$1, refresh_token=$2, expires_at=$3, updated_at=NOW()
     WHERE id=$4`,
    [encAccess, encRefresh, expiresAt, token.id],
  );
  return data.access_token; // return plaintext for immediate use in this invocation
}

async function refreshOuraToken(db: Pool, token: DeviceToken): Promise<string | null> {
  const creds = await getOura();
  const decryptedRefresh = await decrypt(token.refresh_token);
  if (!decryptedRefresh) { console.error('Failed to decrypt Oura refresh token'); return null; }
  const res = await fetch('https://api.ouraring.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: decryptedRefresh }).toString(),
  });
  if (!res.ok) { console.error('Oura token refresh failed — status:', res.status); return null; }
  const data = await res.json() as any;
  const expiresAt = new Date(Date.now() + (data.expires_in ?? 86400) * 1000);
  const newRefreshRaw = data.refresh_token ?? decryptedRefresh;
  const [encAccess, encRefresh] = await Promise.all([encrypt(data.access_token), encrypt(newRefreshRaw)]);
  await db.query(
    `UPDATE device_tokens SET access_token=$1, refresh_token=$2, expires_at=$3, updated_at=NOW()
     WHERE id=$4`,
    [encAccess, encRefresh, expiresAt, token.id],
  );
  return data.access_token; // return plaintext for immediate use in this invocation
}

async function syncWhoop(db: Pool, userId: string, accessToken: string): Promise<void> {
  const res = await fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return;
  const data = await res.json() as any;
  const latest = data.records?.[0];
  if (!latest) return;
  await db.query(
    `INSERT INTO device_data (user_id, device_type, device_name, metrics, timestamp)
     VALUES ($1, 'whoop', 'WHOOP', $2, $3)
     ON CONFLICT DO NOTHING`,
    [userId, JSON.stringify({
      recoveryScore: latest.score?.recovery_score,
      hrv: latest.score?.hrv_rmssd_milli,
      restingHr: latest.score?.resting_heart_rate,
      sleepPerformance: latest.score?.sleep_performance_percentage,
    }), latest.created_at],
  );
}

async function syncOura(db: Pool, userId: string, accessToken: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(
    `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${today}&end_date=${today}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) return;
  const data = await res.json() as any;
  const latest = data.data?.[0];
  if (!latest) return;
  await db.query(
    `INSERT INTO device_data (user_id, device_type, device_name, metrics, timestamp)
     VALUES ($1, 'oura', 'Oura Ring', $2, $3)
     ON CONFLICT DO NOTHING`,
    [userId, JSON.stringify({
      readinessScore: latest.score,
      hrvBalance: latest.contributors?.hrv_balance,
      bodyTemperatureDeviation: latest.contributors?.body_temperature,
      recoveryIndex: latest.contributors?.recovery_index,
    }), `${today}T00:00:00Z`],
  );
}

export const handler = async (): Promise<void> => {
  const db = await getDb();
  console.log('Device sync started');

  // Get all tokens expiring in the next hour or already expired
  const { rows: tokens } = await db.query(
    `SELECT id, user_id, device_type, access_token, refresh_token, expires_at
     FROM device_tokens
     WHERE refresh_token IS NOT NULL`,
  );

  console.log(`Syncing ${tokens.length} device connections`);

  let failureCount = 0;

  for (const token of tokens) {
    try {
      const expiresAt = new Date(token.expires_at).getTime();
      const needsRefresh = expiresAt - Date.now() < 3600_000; // within 1 hour

      let accessToken: string;

      if (needsRefresh) {
        // refresh functions return the new plaintext token
        const refreshed = token.device_type === 'whoop'
          ? await refreshWhoopToken(db, token)
          : await refreshOuraToken(db, token);
        if (!refreshed) { failureCount++; continue; }
        accessToken = refreshed;
      } else {
        // token is still valid but stored encrypted — decrypt before use
        const decrypted = await decrypt(token.access_token);
        if (!decrypted) { console.error(`Failed to decrypt access token for ${token.id}`); failureCount++; continue; }
        accessToken = decrypted;
      }

      if (token.device_type === 'whoop') {
        await syncWhoop(db, token.user_id, accessToken);
      } else if (token.device_type === 'oura') {
        await syncOura(db, token.user_id, accessToken);
      }
    } catch (e) {
      console.error(`Sync failed for token ${token.id}:`, e);
      failureCount++;
    }
  }

  // Emit structured summary — CloudWatch Logs can metric-filter on this
  console.log(JSON.stringify({
    event: 'device_sync_complete',
    total: tokens.length,
    failures: failureCount,
    successes: tokens.length - failureCount,
  }));

  // Systemic failure: every token failed — likely an API outage or config problem.
  // Throw so the Lambda error metric fires and the CloudWatch alarm triggers.
  // Partial failures (some tokens) are logged above but don't throw — individual
  // OAuth tokens can expire legitimately and don't warrant a wake-up alert.
  if (tokens.length > 0 && failureCount === tokens.length) {
    throw new Error(`Device sync: all ${tokens.length} tokens failed — possible API outage`);
  }
};
