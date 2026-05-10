/**
 * Appointments CRUD
 *
 * GET    /users/{userId}/appointments             → list upcoming appointments
 * POST   /users/{userId}/appointments             → create
 * PUT    /users/{userId}/appointments/{id}        → update
 * DELETE /users/{userId}/appointments/{id}        → delete
 */

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
  const { appointmentId } = event.pathParameters ?? {};

  if (method === 'GET') {
    const result = await db.query(
      `SELECT id, title, subtitle, event_date, doctor, location, notes, created_at
       FROM appointments WHERE user_id = $1
       ORDER BY event_date ASC`,
      [userId],
    );
    return ok(result.rows);
  }

  if (method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { title, subtitle, eventDate, doctor, location, notes } = body;
    if (!title) return err(400, 'title is required');
    if (!eventDate) return err(400, 'eventDate is required');
    const result = await db.query(
      `INSERT INTO appointments (user_id, title, subtitle, event_date, doctor, location, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, title, subtitle ?? null, eventDate, doctor ?? null, location ?? null, notes ?? null],
    );
    return ok(result.rows[0], 201);
  }

  if (method === 'PUT' && appointmentId) {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { title, subtitle, eventDate, doctor, location, notes } = body;
    const result = await db.query(
      `UPDATE appointments SET
         title      = COALESCE($2, title),
         subtitle   = COALESCE($3, subtitle),
         event_date = COALESCE($4, event_date),
         doctor     = COALESCE($5, doctor),
         location   = COALESCE($6, location),
         notes      = COALESCE($7, notes),
         updated_at = NOW()
       WHERE id = $1 AND user_id = $8 RETURNING *`,
      [appointmentId, title, subtitle, eventDate, doctor, location, notes, userId],
    );
    if (!result.rows.length) return err(404, 'Appointment not found');
    return ok(result.rows[0]);
  }

  if (method === 'DELETE' && appointmentId) {
    await db.query(`DELETE FROM appointments WHERE id = $1 AND user_id = $2`, [appointmentId, userId]);
    return ok({ deleted: true });
  }

  return err(405, 'Method not allowed');
};
