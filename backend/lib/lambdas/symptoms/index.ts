/**
 * Symptoms log
 *
 * GET  /users/{userId}/symptoms   → list recent symptom entries (last 50)
 * POST /users/{userId}/symptoms   → log a new symptom
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

  if (method === 'GET') {
    const result = await db.query(
      `SELECT id, type, category, severity, duration, location, notes, medications, factors, logged_at
       FROM symptoms WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 50`,
      [userId],
    );
    return ok(result.rows);
  }

  if (method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { type, category, severity, duration, location, notes, medications, factors, loggedAt } = body;
    if (!type || !category || severity === undefined) return err(400, 'type, category, severity required');
    const result = await db.query(
      `INSERT INTO symptoms (user_id, type, category, severity, duration, location, notes, medications, factors, logged_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [userId, type, category, severity, duration ?? null, location ?? null, notes ?? null,
       medications ?? [], factors ?? [], loggedAt ?? new Date()],
    );
    return ok(result.rows[0], 201);
  }

  return err(405, 'Method not allowed');
};
