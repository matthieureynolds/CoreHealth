import { supabase } from '../../config/supabase';
import { Database } from '../../types/database';
import { HereditarySignal, RelationshipDirection, RelationshipLink, RelationshipStatus, RelationshipDegree } from '../../types';

type Tables = Database['public']['Tables'];

// Simple development-time envelope – replace with libsodium sealed boxes in production
function encodeEnvelope(payload: Record<string, any>): string {
  const json = JSON.stringify(payload);
  return typeof btoa !== 'undefined' ? btoa(json) : Buffer.from(json, 'utf8').toString('base64');
}

function decodeEnvelope(ciphertext: string): any {
  const json = typeof atob !== 'undefined' ? atob(ciphertext) : Buffer.from(ciphertext, 'base64').toString('utf8');
  return JSON.parse(json);
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Not authenticated');
  return data.user.id;
}

export const familyService = {
  async requestLink(params: {
    relativeUidHash: string;
    relativeSupabaseUid?: string | null;
    degree: RelationshipDegree;
    direction: RelationshipDirection;
  }): Promise<RelationshipLink> {
    const ownerId = await getCurrentUserId();
    const insert: Tables['relationship_links']['Insert'] = {
      owner_supabase_uid: ownerId,
      relative_uid_hash: params.relativeUidHash,
      relative_supabase_uid: params.relativeSupabaseUid ?? null,
      degree: params.degree,
      direction: params.direction,
      status: 'pending',
    };
    const { data, error } = await supabase
      .from('relationship_links')
      .insert(insert)
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      ownerSupabaseUid: data.owner_supabase_uid,
      relativeUidHash: data.relative_uid_hash,
      relativeSupabaseUid: data.relative_supabase_uid,
      degree: data.degree,
      direction: data.direction,
      status: data.status as RelationshipStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async acceptLink(params: {
    requesterUidHash: string; // hash of requester; recipient creates their own reciprocal active row
    degree: RelationshipDegree;
  }): Promise<RelationshipLink> {
    const myUid = await getCurrentUserId();
    const insert: Tables['relationship_links']['Insert'] = {
      owner_supabase_uid: myUid,
      relative_uid_hash: params.requesterUidHash,
      relative_supabase_uid: null,
      degree: params.degree,
      direction: 'reciprocal',
      status: 'active',
    };
    const { data, error } = await supabase
      .from('relationship_links')
      .insert(insert)
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      ownerSupabaseUid: data.owner_supabase_uid,
      relativeUidHash: data.relative_uid_hash,
      relativeSupabaseUid: data.relative_supabase_uid,
      degree: data.degree,
      direction: data.direction,
      status: data.status as RelationshipStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async listLinks(): Promise<RelationshipLink[]> {
    const ownerId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('relationship_links')
      .select('*')
      .eq('owner_supabase_uid', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      ownerSupabaseUid: r.owner_supabase_uid,
      relativeUidHash: r.relative_uid_hash,
      relativeSupabaseUid: r.relative_supabase_uid,
      degree: r.degree,
      direction: r.direction,
      status: r.status as RelationshipStatus,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async upsertSignal(params: {
    recipientSupabaseUid: string;
    relationDegreeToRecipients: 'parent' | 'child' | 'sibling' | 'partner';
    conditionCode: string;
    onsetAgeBand: string;
    severityBand?: string | null;
    lifestyleComponent?: string | null;
    expiresAt?: string | null;
    payload: Record<string, any>; // encrypted on-device
  }): Promise<HereditarySignal> {
    const issuerId = await getCurrentUserId();
    const ciphertext = encodeEnvelope(params.payload);
    const insert: Tables['hereditary_signals']['Insert'] = {
      issuer_supabase_uid: issuerId,
      recipient_supabase_uid: params.recipientSupabaseUid,
      relation_degree_to_recipients: params.relationDegreeToRecipients,
      condition_code: params.conditionCode,
      onset_age_band: params.onsetAgeBand,
      severity_band: params.severityBand ?? null,
      lifestyle_component: params.lifestyleComponent ?? null,
      expires_at: params.expiresAt ?? null,
      status: 'active',
      ciphertext,
    };
    const { data, error } = await supabase
      .from('hereditary_signals')
      .insert(insert)
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      issuerSupabaseUid: data.issuer_supabase_uid,
      recipientSupabaseUid: data.recipient_supabase_uid,
      relationDegreeToRecipients: data.relation_degree_to_recipients,
      conditionCode: data.condition_code,
      onsetAgeBand: data.onset_age_band,
      severityBand: data.severity_band,
      lifestyleComponent: data.lifestyle_component,
      expiresAt: data.expires_at,
      status: data.status,
      ciphertext: data.ciphertext,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async revokeSignal(signalId: string): Promise<void> {
    const issuerId = await getCurrentUserId();
    const { error } = await supabase
      .from('hereditary_signals')
      .update({ status: 'revoked' })
      .eq('id', signalId)
      .eq('issuer_supabase_uid', issuerId);
    if (error) throw error;
  },

  async listIncomingSignals(): Promise<HereditarySignal[]> {
    const myUid = await getCurrentUserId();
    const { data, error } = await supabase
      .from('hereditary_signals')
      .select('*')
      .eq('recipient_supabase_uid', myUid)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((s) => ({
      id: s.id,
      issuerSupabaseUid: s.issuer_supabase_uid,
      recipientSupabaseUid: s.recipient_supabase_uid,
      relationDegreeToRecipients: s.relation_degree_to_recipients,
      conditionCode: s.condition_code,
      onsetAgeBand: s.onset_age_band,
      severityBand: s.severity_band,
      lifestyleComponent: s.lifestyle_component,
      expiresAt: s.expires_at,
      status: s.status,
      ciphertext: s.ciphertext,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
  },

  // Development-time decrypt to derive features locally
  decryptPayload<T = any>(signal: HereditarySignal): T {
    return decodeEnvelope(signal.ciphertext) as T;
  },
};

export default familyService;


