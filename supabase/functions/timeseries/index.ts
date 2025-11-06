// Supabase Edge Function: timeseries
// GET /v1/users/:id/timeseries?metric=hr&from=...&to=...&granularity=daily

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function corsHeaders(methods = 'GET,OPTIONS') {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  } as Record<string, string>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const maybeId = pathParts.length >= 4 && pathParts[2] !== 'timeseries' ? pathParts[2] : undefined;
    const userId = (url.searchParams.get('id') || maybeId || '').trim();
    const metric = (url.searchParams.get('metric') || '').trim();
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const granularity = url.searchParams.get('granularity') || 'raw';

    if (!userId || !metric) {
      return new Response(JSON.stringify({ error: 'missing user id or metric' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    }

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    let q = sb
      .from('device_events')
      .select('ts,value')
      .eq('user_id', userId)
      .eq('metric', metric)
      .order('ts', { ascending: true })
      .limit(2000);
    if (from) q = q.gte('ts', from);
    if (to) q = q.lte('ts', to);

    const { data, error } = await q;
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    }

    // Optional downsampling (daily avg)
    let points = data || [];
    if (granularity === 'daily') {
      const map = new Map<string, number[]>();
      for (const p of points) {
        const day = new Date(p.ts).toISOString().slice(0, 10);
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(Number(p.value));
      }
      const daily: { ts: string; value: number }[] = [];
      for (const [day, arr] of map) {
        const avg = arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);
        daily.push({ ts: `${day}T00:00:00.000Z`, value: Math.round(avg * 100) / 100 });
      }
      daily.sort((a, b) => a.ts.localeCompare(b.ts));
      points = daily as any;
    }

    return new Response(JSON.stringify({ metric, granularity, points }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'server error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
});


