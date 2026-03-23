export type TimeseriesPoint = { ts: string; value: number };

const BASE_URL = process.env.EXPO_PUBLIC_COREHEALTH_API || 'http://localhost:4000';
const IS_SUPABASE_EDGE = /functions\.supabase\.co/i.test(BASE_URL);

export async function getUserChart(userId: string) {
  const url = IS_SUPABASE_EDGE
    ? `${BASE_URL}/functions/v1/chart?id=${encodeURIComponent(userId)}`
    : `${BASE_URL}/v1/users/${encodeURIComponent(userId)}/chart`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`chart ${res.status}`);
  return await res.json();
}

export async function getTimeseries(userId: string, metric: string, params?: { from?: string; to?: string; granularity?: string }) {
  const q = new URLSearchParams({ metric, ...(params || {}) } as any).toString();
  const url = IS_SUPABASE_EDGE
    ? `${BASE_URL}/functions/v1/timeseries?id=${encodeURIComponent(userId)}&${q}`
    : `${BASE_URL}/v1/users/${encodeURIComponent(userId)}/timeseries?${q}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`timeseries ${res.status}`);
  return await res.json() as { metric: string; granularity: string; points: TimeseriesPoint[] };
}

export async function postCommand(body: { user_id: string; command: string; entity?: string; id?: string; patch?: any; reason?: string; version?: number }) {
  const url = IS_SUPABASE_EDGE
    ? `${BASE_URL}/functions/v1/commands`
    : `${BASE_URL}/v1/commands`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`command ${res.status}`);
  return await res.json();
}


