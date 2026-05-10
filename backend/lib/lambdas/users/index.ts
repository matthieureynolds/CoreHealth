/**
 * User profile
 *
 * POST   /users/{userId}              → create user on first sign-in (idempotent)
 * GET    /users/{userId}              → get profile
 * PUT    /users/{userId}              → update profile fields
 * DELETE /users/{userId}              → full account deletion (GDPR / App Store)
 *
 * GET|PUT /users/{userId}/preferences → notification preferences
 * GET|PUT /users/{userId}/settings    → full app settings blob
 * GET|PUT /users/{userId}/profile-data → rich profile blob (doctors, health IDs, emergency contacts…)
 * PUT     /users/{userId}/location-health → sync live location health data
 * PUT     /users/{userId}/joined-leagues  → sync community league membership
 *
 * Symptoms: /users/{userId}/symptoms    → symptoms/index.ts
 * Trips:    /users/{userId}/trips       → trips/index.ts
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { getDb } from '../_shared/db';
import { ok, err, parseBody, isPlainObject } from '../_shared/response';
import { requireSelf } from '../_shared/auth';

const s3 = new S3Client({});
const cognito = new CognitoIdentityProviderClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auth = requireSelf(event);
  if ('statusCode' in auth) return auth;
  const { userId } = auth;

  const db = await getDb();
  const method = event.httpMethod;
  const path = event.path;

  // POST — create user on first sign-in (idempotent upsert)
  if (method === 'POST') {
    // Email comes from the verified Cognito JWT claim, not the request body —
    // trusting body.email would let any authenticated user register with someone else's email.
    const email = event.requestContext.authorizer?.claims?.email as string | undefined;
    if (!email) return err(400, 'No email claim in token');

    const body = parseBody(event.body);
    const { firstName, surname, preferredName } = body ?? {};

    const result = await db.query(
      `INSERT INTO users (id, email, first_name, surname, preferred_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         updated_at = NOW()
       RETURNING *`,
      [userId, email, firstName ?? null, surname ?? null, preferredName ?? null],
    );
    return ok(result.rows[0], 201);
  }

  // PUT /users/{userId}/location-health
  if (path.includes('/location-health') && method === 'PUT') {
    const body = parseBody(event.body);
    if (!body || !isPlainObject(body)) return err(400, 'location_health must be a JSON object');
    if (JSON.stringify(body).length > 65_536) return err(400, 'location_health too large (max 64 KB)');
    await db.query(
      `UPDATE users SET location_health = $2, updated_at = NOW() WHERE id = $1`,
      [userId, JSON.stringify(body)],
    );
    return ok({ saved: true });
  }

  // PUT /users/{userId}/joined-leagues
  if (path.includes('/joined-leagues') && method === 'PUT') {
    const body = parseBody(event.body);
    if (!body || !isPlainObject(body)) return err(400, 'joined_leagues must be a JSON object');
    if (Object.values(body).some(v => typeof v !== 'boolean')) return err(400, 'joined_leagues values must be booleans');
    if (JSON.stringify(body).length > 16_384) return err(400, 'joined_leagues too large (max 16 KB)');
    await db.query(
      `UPDATE users SET joined_leagues = $2, updated_at = NOW() WHERE id = $1`,
      [userId, JSON.stringify(body)],
    );
    return ok({ saved: true });
  }

  // GET|PUT /users/{userId}/profile-data
  if (path.includes('/profile-data')) {
    if (method === 'GET') {
      const result = await db.query(`SELECT profile_data FROM users WHERE id = $1`, [userId]);
      return ok(result.rows[0]?.profile_data ?? null);
    }
    if (method === 'PUT') {
      const body = parseBody(event.body);
      if (!body || !isPlainObject(body)) return err(400, 'profile_data must be a JSON object');
      if (JSON.stringify(body).length > 131_072) return err(400, 'profile_data too large (max 128 KB)');
      await db.query(
        `UPDATE users SET profile_data = $2, updated_at = NOW() WHERE id = $1`,
        [userId, JSON.stringify(body)],
      );
      return ok({ saved: true });
    }
  }

  // GET|PUT /users/{userId}/settings
  if (path.includes('/settings')) {
    if (method === 'GET') {
      const result = await db.query(`SELECT user_settings FROM users WHERE id = $1`, [userId]);
      return ok(result.rows[0]?.user_settings ?? null);
    }
    if (method === 'PUT') {
      const body = parseBody(event.body);
      if (!body || !isPlainObject(body)) return err(400, 'user_settings must be a JSON object');
      if (JSON.stringify(body).length > 32_768) return err(400, 'user_settings too large (max 32 KB)');
      await db.query(
        `UPDATE users SET user_settings = $2, updated_at = NOW() WHERE id = $1`,
        [userId, JSON.stringify(body)],
      );
      return ok({ saved: true });
    }
  }

  // GET|PUT /users/{userId}/preferences
  if (path.includes('/preferences')) {
    if (method === 'GET') {
      const result = await db.query(
        `SELECT COALESCE(notification_prefs, '{"alerts": true, "trends": true}'::jsonb) AS notification_prefs
         FROM users WHERE id = $1`,
        [userId],
      );
      return ok(result.rows[0]?.notification_prefs ?? { alerts: true, trends: true });
    }
    if (method === 'PUT') {
      const body = parseBody(event.body);
      if (!body) return err(400, 'Invalid request body');
      const result = await db.query(
        `UPDATE users SET notification_prefs = $2, updated_at = NOW() WHERE id = $1 RETURNING notification_prefs`,
        [userId, JSON.stringify(body)],
      );
      return ok(result.rows[0]?.notification_prefs);
    }
  }

  // GET /users/{userId}
  if (method === 'GET') {
    const result = await db.query(
      `SELECT id, email, first_name, surname, preferred_name, username,
              photo_url, date_of_birth, gender, height_cm, weight_kg,
              ethnicity, notification_prefs, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId],
    );
    if (result.rows.length === 0) return err(404, 'User not found');
    return ok(result.rows[0]);
  }

  // PUT /users/{userId}
  if (method === 'PUT') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const {
      firstName, surname, preferredName, username,
      photoUrl, dateOfBirth, gender, heightCm, weightKg, ethnicity, expoPushToken,
    } = body;
    const result = await db.query(
      `UPDATE users SET
         first_name     = COALESCE($2, first_name),
         surname        = COALESCE($3, surname),
         preferred_name = COALESCE($4, preferred_name),
         username       = COALESCE($5, username),
         photo_url      = COALESCE($6, photo_url),
         date_of_birth  = COALESCE($7, date_of_birth),
         gender         = COALESCE($8, gender),
         height_cm      = COALESCE($9, height_cm),
         weight_kg      = COALESCE($10, weight_kg),
         ethnicity      = COALESCE($11, ethnicity),
         expo_push_token = COALESCE($12, expo_push_token),
         updated_at     = NOW()
       WHERE id = $1
       RETURNING id, email, first_name, surname, preferred_name, username,
                 photo_url, date_of_birth, gender, height_cm, weight_kg,
                 ethnicity, notification_prefs, created_at, updated_at`,
      [userId, firstName, surname, preferredName, username, photoUrl,
       dateOfBirth, gender, heightCm, weightKg, ethnicity, expoPushToken ?? null],
    );
    return ok(result.rows[0]);
  }

  // DELETE /users/{userId} — full account + data deletion (GDPR / App Store requirement)
  if (method === 'DELETE') {
    const bucket = process.env.DOCUMENTS_BUCKET;

    // Delete all S3 objects for this user (lab result PDFs / images)
    if (bucket) {
      try {
        let continuationToken: string | undefined;
        do {
          const listed = await s3.send(new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: `${userId}/`,
            ContinuationToken: continuationToken,
          }));
          if (listed.Contents && listed.Contents.length > 0) {
            await s3.send(new DeleteObjectsCommand({
              Bucket: bucket,
              Delete: {
                Objects: listed.Contents.map(o => ({ Key: o.Key! })),
                Quiet: true,
              },
            }));
          }
          continuationToken = listed.NextContinuationToken;
        } while (continuationToken);
      } catch (e) {
        console.error('S3 cleanup error (non-fatal):', e);
      }
    }

    // ON DELETE CASCADE removes all related rows across every table
    await db.query(`DELETE FROM users WHERE id = $1`, [userId]);

    // Delete Cognito account — GDPR Art. 17 right to erasure (C9)
    const userPoolId = process.env.USER_POOL_ID;
    if (userPoolId) {
      try {
        await cognito.send(new AdminDeleteUserCommand({
          UserPoolId: userPoolId,
          Username: userId,
        }));
      } catch (e: any) {
        // UserNotFoundException means already deleted — not fatal
        if (e.name !== 'UserNotFoundException') {
          console.error('Cognito deletion error:', e);
        }
      }
    }

    return ok({ deleted: true });
  }

  // GET|DELETE /users/{userId}/health-memory — GDPR Article 22 right to inspect + erase AI memory
  if (path.includes('/health-memory')) {
    if (method === 'GET') {
      const result = await db.query(
        `SELECT health_memory, updated_at FROM users WHERE id = $1`,
        [userId],
      );
      return ok({ memory: result.rows[0]?.health_memory ?? null, updatedAt: result.rows[0]?.updated_at ?? null });
    }
    if (method === 'DELETE') {
      await db.query(
        `UPDATE users SET health_memory = NULL, updated_at = NOW() WHERE id = $1`,
        [userId],
      );
      return ok({ cleared: true });
    }
  }

  // GET /users/{userId}/data-export — GDPR Article 20 right to data portability
  if (path.includes('/data-export') && method === 'GET') {
    const [
      profileResult, biomarkersResult, labResultsResult, allergiesResult,
      medicationsResult, conditionsResult, vaccinationsResult, appointmentsResult,
      symptomsResult, deviceDataResult, chatResult, consentResult,
      imagingResult, tripsResult, alertsResult, hereditaryResult,
    ] = await Promise.all([
      db.query(
        `SELECT id, email, first_name, surname, preferred_name, username,
                date_of_birth, gender, height_cm, weight_kg, ethnicity,
                location_health, created_at, updated_at
         FROM users WHERE id = $1`,
        [userId],
      ),
      db.query(`SELECT name, value, unit, category, risk_level, reference_min, reference_max, recorded_at FROM biomarkers WHERE user_id = $1 ORDER BY recorded_at DESC`, [userId]),
      db.query(`SELECT file_name, lab_name, report_date, processing_status, created_at FROM lab_results WHERE user_id = $1 ORDER BY report_date DESC`, [userId]),
      db.query(`SELECT name, severity, reaction, status, start_date, end_date, notes FROM allergies WHERE user_id = $1`, [userId]),
      db.query(`SELECT name, dosage, frequency, start_date, end_date, notes FROM medications WHERE user_id = $1`, [userId]),
      db.query(`SELECT name, severity, status, diagnosed_date, resolved_date, notes FROM medical_conditions WHERE user_id = $1`, [userId]),
      db.query(`SELECT name, date, next_due, location, notes FROM vaccinations WHERE user_id = $1`, [userId]),
      db.query(`SELECT title, subtitle, event_date, doctor, location, notes FROM appointments WHERE user_id = $1`, [userId]),
      db.query(`SELECT type, category, severity, duration, location, notes, logged_at FROM symptoms WHERE user_id = $1 ORDER BY logged_at DESC`, [userId]),
      db.query(`SELECT device_type, device_name, timestamp FROM device_data WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 500`, [userId]),
      db.query(`SELECT role, content, created_at FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC`, [userId]),
      db.query(`SELECT version, purposes, given_at FROM consent_records WHERE user_id = $1 ORDER BY given_at ASC`, [userId]),
      db.query(`SELECT modality, body_part, study_date, facility, radiologist, findings, impression, measurements, notes FROM imaging_results WHERE user_id = $1 ORDER BY study_date DESC`, [userId]).catch(() => ({ rows: [] })),
      db.query(`SELECT origin, destination, departure_date, return_date, purpose, notes FROM trips WHERE user_id = $1 ORDER BY departure_date DESC`, [userId]).catch(() => ({ rows: [] })),
      db.query(`SELECT type, severity, title, body, biomarkers, created_at, dismissed_at FROM health_alerts WHERE user_id = $1 ORDER BY created_at DESC`, [userId]).catch(() => ({ rows: [] })),
      db.query(`SELECT shared_by_user_id, trait_name, trait_value, confidence, notes, shared_at FROM hereditary_signals WHERE shared_with_user_id = $1 ORDER BY shared_at DESC`, [userId]).catch(() => ({ rows: [] })),
    ]);

    return ok({
      exportedAt: new Date().toISOString(),
      gdprNote: 'This is a complete export of all personal data held by CoreHealth for this user, pursuant to GDPR Article 20.',
      profile: profileResult.rows[0] ?? null,
      biomarkers: biomarkersResult.rows,
      labResults: labResultsResult.rows,
      allergies: allergiesResult.rows,
      medications: medicationsResult.rows,
      conditions: conditionsResult.rows,
      vaccinations: vaccinationsResult.rows,
      appointments: appointmentsResult.rows,
      symptoms: symptomsResult.rows,
      deviceData: deviceDataResult.rows,
      chatHistory: chatResult.rows,
      consentHistory: consentResult.rows,
      imagingResults: imagingResult.rows,
      trips: tripsResult.rows,
      healthAlerts: alertsResult.rows,
      hereditarySignals: hereditaryResult.rows,
    });
  }

  // DELETE /users/{userId}/consent — withdraw consent (GDPR Art. 7(3) — must be as easy as giving consent)
  if (path.includes('/consent') && method === 'DELETE') {
    const body = parseBody(event.body);
    const purposes: string[] = body?.purposes ?? ['all'];
    // Record withdrawal event (audit trail — do not delete prior consent records)
    await db.query(
      `INSERT INTO consent_records (user_id, version, purposes)
       VALUES ($1, 'withdrawal', $2)`,
      [userId, purposes],
    );
    return ok({ withdrawn: true, purposes, withdrawnAt: new Date().toISOString() });
  }

  // POST /users/{userId}/consent — record explicit GDPR consent (Article 9(2)(a))
  if (path.includes('/consent') && method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { version, purposes } = body;
    if (!version || typeof version !== 'string') return err(400, 'version is required');
    if (!Array.isArray(purposes) || purposes.length === 0) return err(400, 'purposes must be a non-empty array');

    const result = await db.query(
      `INSERT INTO consent_records (user_id, version, purposes)
       VALUES ($1, $2, $3)
       RETURNING id, given_at`,
      [userId, version, purposes],
    );
    return ok({ consentId: result.rows[0].id, givenAt: result.rows[0].given_at }, 201);
  }

  return err(405, 'Method not allowed');
};
