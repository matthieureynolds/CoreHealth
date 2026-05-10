import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb } from '../_shared/db';
import { ok, err, forbidden, parseBody } from '../_shared/response';

const VALID_CATEGORIES = new Set(['cardiovascular', 'metabolic', 'hormonal', 'inflammatory', 'nutritional', 'other']);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const db = await getDb();
  const method = event.httpMethod;
  const cognitoSub = event.requestContext.authorizer?.claims?.sub;
  if (!cognitoSub) return forbidden();

  const { biomarkerId } = event.pathParameters ?? {};

  if (method === 'GET' && !biomarkerId) {
    const category = event.queryStringParameters?.category;
    const labResultId = event.queryStringParameters?.lab_result_id;
    const trends = event.queryStringParameters?.trends;

    // GET /biomarkers?trends=true — week-on-week delta per biomarker
    if (trends === 'true') {
      const result = await db.query(
        `WITH latest AS (
           SELECT DISTINCT ON (name) name, value, unit, risk_level, recorded_at
           FROM biomarkers WHERE user_id = $1
           ORDER BY name, recorded_at DESC
         ),
         week_ago AS (
           SELECT DISTINCT ON (name) name, value
           FROM biomarkers WHERE user_id = $1 AND recorded_at <= NOW() - INTERVAL '7 days'
           ORDER BY name, recorded_at DESC
         )
         SELECT l.name, l.value, l.unit, l.risk_level, l.recorded_at,
                w.value AS prev_value,
                CASE WHEN w.value IS NOT NULL AND w.value != 0
                  THEN ROUND(((l.value - w.value) / w.value * 100)::numeric, 1)
                  ELSE NULL
                END AS delta_pct
         FROM latest l
         LEFT JOIN week_ago w ON w.name = l.name
         ORDER BY l.name`,
        [cognitoSub],
      );
      return ok(result.rows);
    }

    if (category && !VALID_CATEGORIES.has(category)) return err(400, `Invalid category. Must be one of: ${[...VALID_CATEGORIES].join(', ')}`);

    let where = 'WHERE user_id = $1';
    const params: (string | number)[] = [cognitoSub];
    if (category) { where += ` AND category = $${params.push(category)}`; }
    if (labResultId) { where += ` AND lab_result_id = $${params.push(labResultId)}`; }
    const result = await db.query(
      `SELECT id, name, value, unit, category, trend, risk_level, reference_min,
              reference_max, recorded_at, lab_result_id
       FROM biomarkers ${where} ORDER BY recorded_at DESC`,
      params,
    );
    return ok(result.rows);
  }

  if (method === 'GET' && biomarkerId) {
    // Historical values for a specific biomarker (for charting)
    const result = await db.query(
      `SELECT id, name, value, unit, trend, risk_level, reference_min, reference_max, recorded_at
       FROM biomarkers
       WHERE user_id = $1 AND name = (
         SELECT name FROM biomarkers WHERE id = $2 AND user_id = $1
       )
       ORDER BY recorded_at DESC
       LIMIT 24`,
      [cognitoSub, biomarkerId],
    );
    return ok(result.rows);
  }

  if (method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const {
      name, value, unit, category, referenceMin, referenceMax,
      recordedAt, labResultId,
    } = body;

    if (!name || value === undefined || !unit || !category) {
      return err(400, 'name, value, unit, category are required');
    }
    if (!VALID_CATEGORIES.has(category)) return err(400, `Invalid category. Must be one of: ${[...VALID_CATEGORIES].join(', ')}`);
    if (name.length > 200) return err(400, 'name too long (max 200)');
    if (unit.length > 50)  return err(400, 'unit too long (max 50)');

    // Compute trend vs last reading of same biomarker
    const prev = await db.query(
      `SELECT value FROM biomarkers WHERE user_id = $1 AND name = $2 ORDER BY recorded_at DESC LIMIT 1`,
      [cognitoSub, name],
    );
    const prevValue = prev.rows[0]?.value;
    const trend = prevValue === undefined
      ? 'stable'
      : value > prevValue * 1.05 ? 'increasing'
      : value < prevValue * 0.95 ? 'decreasing'
      : 'stable';

    const riskLevel = referenceMin !== undefined && referenceMax !== undefined
      ? (value < referenceMin || value > referenceMax ? 'abnormal' : 'normal')
      : 'unknown';

    const result = await db.query(
      `INSERT INTO biomarkers
         (user_id, name, value, unit, category, trend, risk_level, reference_min, reference_max, recorded_at, lab_result_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [cognitoSub, name, value, unit, category, trend, riskLevel, referenceMin, referenceMax, recordedAt ?? new Date(), labResultId ?? null],
    );
    return ok(result.rows[0], 201);
  }

  if (method === 'DELETE' && biomarkerId) {
    await db.query(
      `DELETE FROM biomarkers WHERE id = $1 AND user_id = $2`,
      [biomarkerId, cognitoSub],
    );
    return ok({ deleted: true });
  }

  return err(405, 'Method not allowed');
};
