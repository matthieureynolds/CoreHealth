import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb } from '../_shared/db';
import { ok, err, parseBody } from '../_shared/response';
import { requireSelf } from '../_shared/auth';

const VALID_SEVERITIES = new Set(['mild', 'moderate', 'severe']);
const VALID_STATUSES = new Set(['active', 'resolved']);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auth = requireSelf(event);
  if ('statusCode' in auth) return auth;
  const { userId } = auth;

  const db = await getDb();
  const method = event.httpMethod;
  const { allergyId } = event.pathParameters ?? {};

  // GET /users/{userId}/allergies
  if (method === 'GET' && !allergyId) {
    const result = await db.query(
      `SELECT id, name, severity, reaction, status, start_date, end_date, notes, created_at, updated_at
       FROM allergies WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return ok(result.rows);
  }

  // POST /users/{userId}/allergies
  if (method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { name, severity, reaction, status, startDate, endDate, notes } = body;
    if (!name) return err(400, 'name is required');
    if (!severity) return err(400, 'severity is required');
    if (!VALID_SEVERITIES.has(severity)) return err(400, `Invalid severity. Must be one of: ${[...VALID_SEVERITIES].join(', ')}`);
    if (status && !VALID_STATUSES.has(status)) return err(400, `Invalid status. Must be one of: ${[...VALID_STATUSES].join(', ')}`);
    const result = await db.query(
      `INSERT INTO allergies (user_id, name, severity, reaction, status, start_date, end_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, name, severity, reaction ?? null, status ?? 'active', startDate ?? null, endDate ?? null, notes ?? null],
    );
    return ok(result.rows[0], 201);
  }

  // PUT /users/{userId}/allergies/{allergyId}
  if (method === 'PUT' && allergyId) {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { name, severity, reaction, status, startDate, endDate, notes } = body;
    if (severity && !VALID_SEVERITIES.has(severity)) return err(400, `Invalid severity. Must be one of: ${[...VALID_SEVERITIES].join(', ')}`);
    if (status && !VALID_STATUSES.has(status)) return err(400, `Invalid status. Must be one of: ${[...VALID_STATUSES].join(', ')}`);
    const result = await db.query(
      `UPDATE allergies SET
         name       = COALESCE($2, name),
         severity   = COALESCE($3, severity),
         reaction   = COALESCE($4, reaction),
         status     = COALESCE($5, status),
         start_date = COALESCE($6, start_date),
         end_date   = COALESCE($7, end_date),
         notes      = COALESCE($8, notes),
         updated_at = NOW()
       WHERE id = $1 AND user_id = $9
       RETURNING *`,
      [allergyId, name, severity, reaction, status, startDate, endDate, notes, userId],
    );
    if (result.rows.length === 0) return err(404, 'Allergy not found');
    return ok(result.rows[0]);
  }

  // DELETE /users/{userId}/allergies/{allergyId}
  if (method === 'DELETE' && allergyId) {
    await db.query(`DELETE FROM allergies WHERE id = $1 AND user_id = $2`, [allergyId, userId]);
    return ok({ deleted: true });
  }

  return err(405, 'Method not allowed');
};
