// Supabase Edge Function: commands
// POST /v1/commands { user_id, command, entity, id, patch, reason, version }

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function corsHeaders(methods = 'POST,OPTIONS') {
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
    const body = await req.json().catch(() => ({}));
    const user_id = (body.user_id || '').trim();
    const command = (body.command || '').trim();
    if (!user_id || !command) {
      return new Response(JSON.stringify({ error: 'missing user_id or command' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    }

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Minimal demo: support update_record for allergies/medications
    if (command === 'update_record') {
      const entity = (body.entity || '').trim();
      const patch = body.patch || {};
      if (entity === 'allergy') {
        const { data, error } = await sb.from('allergies').insert({ user_id, allergen: patch.allergen || 'unknown', severity: patch.severity || null, status: patch.status || 'active', payload: patch }).select('id').single();
        if (error) throw error;
        await sb.from('events').insert({ user_id, type: 'allergy.updated', source: 'commands', hash: crypto.randomUUID(), payload: { id: data.id, patch } });
        return new Response(JSON.stringify({ ok: true, entity: 'allergy', id: data.id }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
      }
      if (entity === 'medication') {
        const { data, error } = await sb.from('medications').insert({ user_id, name: patch.name || 'unknown', dose: patch.dose || null, payload: patch }).select('id').single();
        if (error) throw error;
        await sb.from('events').insert({ user_id, type: 'medication.updated', source: 'commands', hash: crypto.randomUUID(), payload: { id: data.id, patch } });
        return new Response(JSON.stringify({ ok: true, entity: 'medication', id: data.id }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
      }
    }

    // Default no-op for unknown commands
    return new Response(JSON.stringify({ ok: true, command, note: 'no-op' }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'server error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
});


