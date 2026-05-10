import { APIGatewayProxyResult } from 'aws-lambda';

// No Access-Control-Allow-Origin — this is a mobile-only API.
// Wildcard CORS on a health data API allows any website to make authenticated
// requests on behalf of a user's browser session. Irrelevant for React Native.
const headers = {
  'Content-Type': 'application/json',
};

export function ok(data: unknown, statusCode = 200): APIGatewayProxyResult {
  return { statusCode, headers, body: JSON.stringify(data) };
}

export function err(statusCode: number, message: string): APIGatewayProxyResult {
  return { statusCode, headers, body: JSON.stringify({ error: message }) };
}

export function forbidden(): APIGatewayProxyResult {
  return err(403, 'Forbidden');
}

export function parseBody(raw: string | null): Record<string, any> | null {
  try {
    return JSON.parse(raw ?? '{}');
  } catch {
    return null;
  }
}

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
