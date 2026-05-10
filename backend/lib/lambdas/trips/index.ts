/**
 * Trips (planned travel)
 *
 * GET    /users/{userId}/trips             → list trips ordered by departure date
 * POST   /users/{userId}/trips             → create a trip
 * PUT    /users/{userId}/trips/{tripId}    → update a trip
 * DELETE /users/{userId}/trips/{tripId}    → delete a trip
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb } from '../_shared/db';
import { ok, err, parseBody, isPlainObject } from '../_shared/response';
import { requireSelf } from '../_shared/auth';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auth = requireSelf(event);
  if ('statusCode' in auth) return auth;
  const { userId } = auth;

  const db = await getDb();
  const method = event.httpMethod;
  const { tripId } = event.pathParameters ?? {};

  if (method === 'GET') {
    const result = await db.query(
      `SELECT id, departure_location, destination, departure_date, return_date, timezone, notes, trip_data
       FROM trips WHERE user_id = $1 ORDER BY departure_date ASC`,
      [userId],
    );
    return ok(result.rows);
  }

  if (method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { departureLocation, destination, departureDate, returnDate, timezone, notes, tripData } = body;
    if (!departureLocation || !destination || !departureDate) {
      return err(400, 'departureLocation, destination, departureDate required');
    }
    if (tripData !== undefined && (!isPlainObject(tripData) || JSON.stringify(tripData).length > 32_768)) {
      return err(400, 'tripData must be a JSON object (max 32 KB)');
    }
    const result = await db.query(
      `INSERT INTO trips (user_id, departure_location, destination, departure_date, return_date, timezone, notes, trip_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, departureLocation, destination, departureDate, returnDate ?? null,
       timezone ?? null, notes ?? null, tripData ? JSON.stringify(tripData) : null],
    );
    return ok(result.rows[0], 201);
  }

  if (method === 'PUT' && tripId) {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { departureLocation, destination, departureDate, returnDate, timezone, notes, tripData } = body;
    if (tripData !== undefined && (!isPlainObject(tripData) || JSON.stringify(tripData).length > 32_768)) {
      return err(400, 'tripData must be a JSON object (max 32 KB)');
    }
    const result = await db.query(
      `UPDATE trips SET
         departure_location = COALESCE($2, departure_location),
         destination        = COALESCE($3, destination),
         departure_date     = COALESCE($4, departure_date),
         return_date        = COALESCE($5, return_date),
         timezone           = COALESCE($6, timezone),
         notes              = COALESCE($7, notes),
         trip_data          = COALESCE($8, trip_data),
         updated_at         = NOW()
       WHERE id = $1 AND user_id = $9 RETURNING *`,
      [tripId, departureLocation, destination, departureDate, returnDate,
       timezone, notes, tripData ? JSON.stringify(tripData) : null, userId],
    );
    if (!result.rows.length) return err(404, 'Trip not found');
    return ok(result.rows[0]);
  }

  if (method === 'DELETE' && tripId) {
    await db.query(`DELETE FROM trips WHERE id = $1 AND user_id = $2`, [tripId, userId]);
    return ok({ deleted: true });
  }

  return err(405, 'Method not allowed');
};
