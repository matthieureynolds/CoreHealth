/**
 * Family health — relationship links + hereditary signals
 *
 * GET  /users/{userId}/family/links                     → list family connections
 * POST /users/{userId}/family/links                     → add a family connection
 * DELETE /users/{userId}/family/links/{linkId}          → remove connection
 *
 * GET  /users/{userId}/family/signals                   → list signals received
 * POST /users/{userId}/family/signals                   → send a hereditary signal
 * DELETE /users/{userId}/family/signals/{signalId}      → revoke a signal
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createHash } from 'crypto';
import { getDb } from '../_shared/db';
import { ok, err, parseBody } from '../_shared/response';
import { requireSelf } from '../_shared/auth';
import { encrypt, decrypt } from '../_shared/crypto';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auth = requireSelf(event);
  if ('statusCode' in auth) return auth;
  const { userId } = auth;

  const db = await getDb();
  const method = event.httpMethod;
  const { linkId, signalId } = event.pathParameters ?? {};
  const path: string = event.path ?? '';

  // ── Relationship links ────────────────────────────────────────────────────

  if (path.includes('/links')) {
    if (method === 'GET') {
      const result = await db.query(
        `SELECT rl.id, rl.owner_id, rl.relative_id, rl.degree, rl.direction, rl.status, rl.created_at,
                u.first_name, u.surname, u.email
         FROM relationship_links rl
         LEFT JOIN users u ON u.id = rl.relative_id
         WHERE rl.owner_id = $1 AND rl.status = 'active'
         ORDER BY rl.created_at DESC`,
        [userId],
      );
      return ok(result.rows);
    }

    if (method === 'POST') {
      const body = parseBody(event.body);
      if (!body) return err(400, 'Invalid request body');
      const { relativeEmail, degree, direction } = body;
      if (!relativeEmail || !degree) return err(400, 'relativeEmail and degree required');

      // Look up relative by email
      const relativeRow = await db.query(`SELECT id FROM users WHERE email = $1`, [relativeEmail]);
      const relativeId = relativeRow.rows[0]?.id ?? null;
      // SHA-256 hash — not reversible, unlike the previous base64 encoding
      const relativeIdHash = createHash('sha256').update(relativeEmail).digest('hex');

      const result = await db.query(
        `INSERT INTO relationship_links (owner_id, relative_id, relative_id_hash, degree, direction, status)
         VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
        [userId, relativeId, relativeIdHash, degree, direction ?? 'one_way'],
      );
      return ok(result.rows[0], 201);
    }

    if (method === 'DELETE' && linkId) {
      await db.query(`UPDATE relationship_links SET status = 'revoked' WHERE id = $1 AND owner_id = $2`, [linkId, userId]);
      return ok({ revoked: true });
    }
  }

  // ── Hereditary signals ────────────────────────────────────────────────────

  if (path.includes('/signals')) {
    if (method === 'GET') {
      // Signals I received — decrypt condition_payload before returning
      const received = await db.query(
        `SELECT hs.id, hs.issuer_id, hs.condition_payload, hs.onset_age_band, hs.severity_band,
                hs.status, hs.expires_at, hs.created_at,
                u.first_name, u.surname
         FROM hereditary_signals hs
         JOIN users u ON u.id = hs.issuer_id
         WHERE hs.recipient_id = $1 AND hs.status = 'active'
         ORDER BY hs.created_at DESC`,
        [userId],
      );
      const decryptedReceived = await Promise.all(
        received.rows.map(async (row: any) => ({
          ...row,
          condition_code: await decrypt(row.condition_payload),
          condition_payload: undefined,
        })),
      );

      // Signals I sent — decrypt for the sender too (their own data)
      const sent = await db.query(
        `SELECT hs.id, hs.recipient_id, hs.condition_payload, hs.onset_age_band, hs.severity_band,
                hs.status, hs.expires_at, hs.created_at,
                u.first_name, u.surname
         FROM hereditary_signals hs
         JOIN users u ON u.id = hs.recipient_id
         WHERE hs.issuer_id = $1 AND hs.status = 'active'
         ORDER BY hs.created_at DESC`,
        [userId],
      );
      const decryptedSent = await Promise.all(
        sent.rows.map(async (row: any) => ({
          ...row,
          condition_code: await decrypt(row.condition_payload),
          condition_payload: undefined,
        })),
      );

      return ok({ received: decryptedReceived, sent: decryptedSent });
    }

    if (method === 'POST') {
      const body = parseBody(event.body);
      if (!body) return err(400, 'Invalid request body');
      const { recipientId, conditionCode, onsetAgeBand, severityBand, expiresAt } = body;
      if (!recipientId || !conditionCode || !onsetAgeBand) {
        return err(400, 'recipientId, conditionCode, onsetAgeBand required');
      }
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(recipientId)) {
        return err(400, 'Invalid recipientId — must be a valid UUID');
      }

      // Encrypt the condition code before storing — condition_code column stores a
      // non-reversible hash so the column is non-null but doesn't expose the condition.
      const encryptedPayload = await encrypt(conditionCode);
      const conditionHash = createHash('sha256').update(conditionCode).digest('hex');

      const result = await db.query(
        `INSERT INTO hereditary_signals (issuer_id, recipient_id, condition_code, onset_age_band, severity_band, condition_payload, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [userId, recipientId, conditionHash, onsetAgeBand, severityBand ?? null, encryptedPayload, expiresAt ?? null],
      );
      return ok(result.rows[0], 201);
    }

    if (method === 'DELETE' && signalId) {
      await db.query(`UPDATE hereditary_signals SET status = 'revoked' WHERE id = $1 AND issuer_id = $2`, [signalId, userId]);
      return ok({ revoked: true });
    }
  }

  return err(405, 'Method not allowed');
};
