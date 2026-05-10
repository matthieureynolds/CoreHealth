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
  const { vaccinationId } = event.pathParameters ?? {};

  // GET /users/{userId}/vaccinations
  if (method === 'GET' && !vaccinationId) {
    const result = await db.query(
      `SELECT id, name, date, next_due, location, batch_number, notes, created_at
       FROM vaccinations WHERE user_id = $1 ORDER BY date DESC`,
      [userId],
    );
    return ok(result.rows);
  }

  // POST /users/{userId}/vaccinations
  if (method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { name, date, nextDue, location, batchNumber, notes } = body;
    if (!name) return err(400, 'name is required');
    if (!date) return err(400, 'date is required');

    const result = await db.query(
      `INSERT INTO vaccinations (user_id, name, date, next_due, location, batch_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, name, date, nextDue ?? null, location ?? null, batchNumber ?? null, notes ?? null],
    );
    return ok(result.rows[0], 201);
  }

  // PUT /users/{userId}/vaccinations/{vaccinationId}
  if (method === 'PUT' && vaccinationId) {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { name, date, nextDue, location, batchNumber, notes } = body;
    const result = await db.query(
      `UPDATE vaccinations SET
         name         = COALESCE($2, name),
         date         = COALESCE($3, date),
         next_due     = COALESCE($4, next_due),
         location     = COALESCE($5, location),
         batch_number = COALESCE($6, batch_number),
         notes        = COALESCE($7, notes),
         updated_at   = NOW()
       WHERE id = $1 AND user_id = $8
       RETURNING *`,
      [vaccinationId, name, date, nextDue, location, batchNumber, notes, userId],
    );
    if (result.rows.length === 0) return err(404, 'Vaccination not found');
    return ok(result.rows[0]);
  }

  // DELETE /users/{userId}/vaccinations/{vaccinationId}
  if (method === 'DELETE' && vaccinationId) {
    await db.query(`DELETE FROM vaccinations WHERE id = $1 AND user_id = $2`, [vaccinationId, userId]);
    return ok({ deleted: true });
  }

  return err(405, 'Method not allowed');
};
