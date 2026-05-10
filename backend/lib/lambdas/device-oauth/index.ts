/**
 * Device OAuth token exchange — keeps client secrets server-side
 *
 * GET  /users/{userId}/device-oauth/auth-url/whoop  → return Whoop OAuth authorization URL
 * GET  /users/{userId}/device-oauth/auth-url/oura   → return Oura OAuth authorization URL
 * GET  /users/{userId}/device-oauth/status          → which devices are connected
 * POST /users/{userId}/device-oauth/whoop           → exchange Whoop auth code for tokens
 * POST /users/{userId}/device-oauth/oura            → exchange Oura auth code for tokens
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { getDb } from '../_shared/db';
import { ok, err, parseBody } from '../_shared/response';
import { requireSelf } from '../_shared/auth';
import { encrypt } from '../_shared/crypto';

const sm = new SecretsManagerClient({});

async function getSecret(arn: string): Promise<Record<string, string>> {
  const r = await sm.send(new GetSecretValueCommand({ SecretId: arn }));
  return JSON.parse(r.SecretString!);
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auth = requireSelf(event);
  if ('statusCode' in auth) return auth;
  const { userId } = auth;

  const db = await getDb();
  const method = event.httpMethod;
  const path: string = event.path ?? '';

  // GET /auth-url/whoop or /auth-url/oura — return OAuth authorization URL
  if (method === 'GET' && path.includes('/auth-url/')) {
    try {
      const isWhoop = path.includes('/whoop');
      const arnEnv = isWhoop ? process.env.WHOOP_SECRET_ARN! : process.env.OURA_SECRET_ARN!;
      const secrets = await getSecret(arnEnv);
      const redirectUri = process.env.OAUTH_REDIRECT_URI || 'corehealth://oauth';

      let authUrl: string;
      if (isWhoop) {
        const params = new URLSearchParams({
          client_id: secrets.clientId,
          redirect_uri: redirectUri,
          scope: 'read:recovery read:sleep read:profile read:workout read:body_measurement',
          response_type: 'code',
        });
        authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?${params.toString()}`;
      } else {
        const params = new URLSearchParams({
          client_id: secrets.clientId,
          redirect_uri: redirectUri,
          scope: 'daily readiness personal',
          response_type: 'code',
        });
        authUrl = `https://cloud.ouraring.com/oauth/authorize?${params.toString()}`;
      }

      return ok({ authUrl, redirectUri });
    } catch (e: any) {
      return err(500, e.message);
    }
  }

  // GET /status — which devices are connected
  if (method === 'GET' && path.endsWith('/status')) {
    const result = await db.query(
      `SELECT device_type, device_name, MAX(timestamp) as last_sync
       FROM device_data WHERE user_id = $1
       GROUP BY device_type, device_name`,
      [userId],
    );
    return ok(result.rows);
  }

  const body = parseBody(event.body);
  if (!body) return err(400, 'Invalid request body');
  const { code } = body;

  if (!code) {
    return err(400, 'code is required');
  }

  // Server-side constant — never accept redirectUri from the client.
  // Accepting it from the body would allow an attacker to redirect the auth code
  // exchange to a server they control.
  const redirectUri = process.env.OAUTH_REDIRECT_URI || 'corehealth://oauth';

  // WHOOP token exchange
  if (path.includes('/whoop')) {
    try {
      const secrets = await getSecret(process.env.WHOOP_SECRET_ARN!);
      const response = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: secrets.clientId,
          client_secret: secrets.clientSecret,
        }).toString(),
      });
      if (!response.ok) {
        console.error('Whoop token exchange failed — status:', response.status);
        return err(400, 'Whoop token exchange failed — check that the code is valid and has not expired');
      }
      const tokens = await response.json() as any;

      // Encrypt tokens before storing — plaintext OAuth tokens in DB = full wearable account exposure on breach
      const whoopExpiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000);
      const [encryptedAccess, encryptedRefresh] = await Promise.all([
        encrypt(tokens.access_token),
        tokens.refresh_token ? encrypt(tokens.refresh_token) : Promise.resolve(null),
      ]);
      await db.query(
        `INSERT INTO device_tokens (user_id, device_type, access_token, refresh_token, expires_at)
         VALUES ($1, 'whoop', $2, $3, $4)
         ON CONFLICT (user_id, device_type) DO UPDATE SET
           access_token=$2, refresh_token=$3, expires_at=$4, updated_at=NOW()`,
        [userId, encryptedAccess, encryptedRefresh, whoopExpiresAt],
      );

      // Fetch latest recovery + sleep from Whoop
      const recoveryRes = await fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (recoveryRes.ok) {
        const recovery = await recoveryRes.json() as any;
        const latest = recovery.records?.[0];
        if (latest) {
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
      }

      return ok({ connected: true, deviceType: 'whoop' });
    } catch (e: any) {
      return err(500, e.message);
    }
  }

  // OURA token exchange
  if (path.includes('/oura')) {
    try {
      const secrets = await getSecret(process.env.OURA_SECRET_ARN!);
      const response = await fetch('https://api.ouraring.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${secrets.clientId}:${secrets.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }).toString(),
      });
      if (!response.ok) {
        console.error('Oura token exchange failed — status:', response.status);
        return err(400, 'Oura token exchange failed — check that the code is valid and has not expired');
      }
      const tokens = await response.json() as any;

      // Encrypt tokens before storing
      const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 86400) * 1000);
      const [encryptedOuraAccess, encryptedOuraRefresh] = await Promise.all([
        encrypt(tokens.access_token),
        tokens.refresh_token ? encrypt(tokens.refresh_token) : Promise.resolve(null),
      ]);
      await db.query(
        `INSERT INTO device_tokens (user_id, device_type, access_token, refresh_token, expires_at)
         VALUES ($1, 'oura', $2, $3, $4)
         ON CONFLICT (user_id, device_type) DO UPDATE SET
           access_token=$2, refresh_token=$3, expires_at=$4, updated_at=NOW()`,
        [userId, encryptedOuraAccess, encryptedOuraRefresh, expiresAt],
      );

      // Fetch latest daily readiness from Oura
      const today = new Date().toISOString().split('T')[0];
      const readinessRes = await fetch(
        `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${today}&end_date=${today}`,
        { headers: { Authorization: `Bearer ${tokens.access_token}` } },
      );
      if (readinessRes.ok) {
        const readiness = await readinessRes.json() as any;
        const latest = readiness.data?.[0];
        if (latest) {
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
      }

      return ok({ connected: true, deviceType: 'oura' });
    } catch (e: any) {
      return err(500, e.message);
    }
  }

  return err(404, 'Unknown device');
};
