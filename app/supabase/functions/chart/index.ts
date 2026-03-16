// Supabase Edge Function: chart
// GET /v1/users/:id/chart or /v1/users/chart?id=...

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
    // Support path style: /v1/users/:id/chart
    const pathParts = url.pathname.split('/').filter(Boolean);
    const maybeId = pathParts.length >= 4 && pathParts[2] !== 'chart' ? pathParts[2] : undefined;
    const userId = (url.searchParams.get('id') || maybeId || '').trim();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'missing user id' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, serviceKey);

    const { data, error } = await sb
      .from('user_charts')
      .select('version, updated_at, chart')
      .eq('user_id', userId)
      .single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    }

    const body = data.chart || {};
    const etag = `W/"${data.version}-${(data.updated_at || '').replace(/[^0-9]/g,'')}"`;
    if (req.headers.get('If-None-Match') === etag) {
      return new Response(null, { status: 304, headers: corsHeaders() });
    }
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json', ETag: etag, ...corsHeaders() } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'server error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
});


