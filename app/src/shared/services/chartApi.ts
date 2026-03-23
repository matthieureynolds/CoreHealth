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

