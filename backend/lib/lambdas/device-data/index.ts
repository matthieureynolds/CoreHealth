/**
 * Device data ingestion + retrieval
 *
 * POST /users/{userId}/device-data          → ingest a batch of metrics from a wearable
 * GET  /users/{userId}/device-data          → latest reading per device (query: ?device_type=whoop)
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

  if (method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { deviceType, deviceName, metrics, timestamp } = body;
    if (!deviceType || !deviceName || !metrics || !timestamp) {
      return err(400, 'deviceType, deviceName, metrics, timestamp required');
    }
    if (isNaN(Date.parse(timestamp))) {
      return err(400, 'timestamp must be a valid ISO 8601 date string');
    }

    const result = await db.query(
      `INSERT INTO device_data (user_id, device_type, device_name, metrics, timestamp)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, device_type, device_name, metrics, timestamp`,
      [userId, deviceType, deviceName, JSON.stringify(metrics), timestamp],
    );
    return ok(result.rows[0], 201);
  }

  if (method === 'GET') {
    const deviceType = event.queryStringParameters?.device_type;
    // Return the latest reading per device, or filtered by device_type
    const result = deviceType
      ? await db.query(
          `SELECT DISTINCT ON (device_type) id, device_type, device_name, metrics, timestamp
           FROM device_data WHERE user_id = $1 AND device_type = $2
           ORDER BY device_type, timestamp DESC`,
          [userId, deviceType],
        )
      : await db.query(
          `SELECT DISTINCT ON (device_type) id, device_type, device_name, metrics, timestamp
           FROM device_data WHERE user_id = $1
           ORDER BY device_type, timestamp DESC`,
          [userId],
        );
    return ok(result.rows);
  }

  return err(405, 'Method not allowed');
};
