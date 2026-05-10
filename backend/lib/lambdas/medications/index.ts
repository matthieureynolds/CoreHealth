import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb } from '../_shared/db';
import { ok, err, parseBody } from '../_shared/response';
import { requireSelf } from '../_shared/auth';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auth = requireSelf(event);
  if ('statusCode' in auth) return auth;
  const { userId } = auth;

  const db = await getDb();
  const method = event.httpMethod;
  const { medicationId } = event.pathParameters ?? {};

  // GET /users/{userId}/medications
  if (method === 'GET' && !medicationId) {
    const result = await db.query(
      `SELECT id, name, dosage, frequency, start_date, end_date, notes, created_at
       FROM medications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return ok(result.rows);
  }

  // POST /users/{userId}/medications
  if (method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { name, dosage, frequency, startDate, endDate, notes } = body;
    if (!name) return err(400, 'name is required');

    const result = await db.query(
      `INSERT INTO medications (user_id, name, dosage, frequency, start_date, end_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, name, dosage ?? null, frequency ?? null, startDate ?? null, endDate ?? null, notes ?? null],
    );
    return ok(result.rows[0], 201);
  }

  // PUT /users/{userId}/medications/{medicationId}
  if (method === 'PUT' && medicationId) {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { name, dosage, frequency, startDate, endDate, notes } = body;
    const result = await db.query(
      `UPDATE medications SET
         name      = COALESCE($2, name),
         dosage    = COALESCE($3, dosage),
         frequency = COALESCE($4, frequency),
         start_date = COALESCE($5, start_date),
         end_date   = COALESCE($6, end_date),
         notes      = COALESCE($7, notes),
         updated_at = NOW()
       WHERE id = $1 AND user_id = $8
       RETURNING *`,
      [medicationId, name, dosage, frequency, startDate, endDate, notes, userId],
    );
    if (result.rows.length === 0) return err(404, 'Medication not found');
    return ok(result.rows[0]);
  }

  // DELETE /users/{userId}/medications/{medicationId}
  if (method === 'DELETE' && medicationId) {
    await db.query(`DELETE FROM medications WHERE id = $1 AND user_id = $2`, [medicationId, userId]);
    return ok({ deleted: true });
  }

  return err(405, 'Method not allowed');
};
