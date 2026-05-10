import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb } from '../_shared/db';
import { ok, err, parseBody } from '../_shared/response';
import { requireSelf } from '../_shared/auth';

const VALID_SEVERITIES = new Set(['mild', 'moderate', 'severe']);
const VALID_STATUSES = new Set(['active', 'resolved', 'managed']);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auth = requireSelf(event);
  if ('statusCode' in auth) return auth;
  const { userId } = auth;

  const db = await getDb();
  const method = event.httpMethod;
  const { conditionId } = event.pathParameters ?? {};

  // GET /users/{userId}/conditions
  if (method === 'GET' && !conditionId) {
    const result = await db.query(
      `SELECT id, name, severity, status, diagnosed_date, resolved_date, notes, created_at
       FROM medical_conditions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return ok(result.rows);
  }

  // POST /users/{userId}/conditions
  if (method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { name, severity, status, diagnosedDate, resolvedDate, notes } = body;
    if (!name) return err(400, 'name is required');
    if (severity && !VALID_SEVERITIES.has(severity)) return err(400, `Invalid severity. Must be one of: ${[...VALID_SEVERITIES].join(', ')}`);
    if (status && !VALID_STATUSES.has(status)) return err(400, `Invalid status. Must be one of: ${[...VALID_STATUSES].join(', ')}`);

    const result = await db.query(
      `INSERT INTO medical_conditions (user_id, name, severity, status, diagnosed_date, resolved_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, name, severity ?? 'mild', status ?? 'active', diagnosedDate ?? null, resolvedDate ?? null, notes ?? null],
    );
    return ok(result.rows[0], 201);
  }

  // PUT /users/{userId}/conditions/{conditionId}
  if (method === 'PUT' && conditionId) {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { name, severity, status, diagnosedDate, resolvedDate, notes } = body;
    if (severity && !VALID_SEVERITIES.has(severity)) return err(400, `Invalid severity. Must be one of: ${[...VALID_SEVERITIES].join(', ')}`);
    if (status && !VALID_STATUSES.has(status)) return err(400, `Invalid status. Must be one of: ${[...VALID_STATUSES].join(', ')}`);
    const result = await db.query(
      `UPDATE medical_conditions SET
         name          = COALESCE($2, name),
         severity      = COALESCE($3, severity),
         status        = COALESCE($4, status),
         diagnosed_date = COALESCE($5, diagnosed_date),
         resolved_date  = COALESCE($6, resolved_date),
         notes          = COALESCE($7, notes),
         updated_at     = NOW()
       WHERE id = $1 AND user_id = $8
       RETURNING *`,
      [conditionId, name, severity, status, diagnosedDate, resolvedDate, notes, userId],
    );
    if (result.rows.length === 0) return err(404, 'Condition not found');
    return ok(result.rows[0]);
  }

  // DELETE /users/{userId}/conditions/{conditionId}
  if (method === 'DELETE' && conditionId) {
    await db.query(`DELETE FROM medical_conditions WHERE id = $1 AND user_id = $2`, [conditionId, userId]);
    return ok({ deleted: true });
  }

  return err(405, 'Method not allowed');
};
