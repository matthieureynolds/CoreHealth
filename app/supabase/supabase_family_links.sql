-- Family Link (Risk-Only) schema
-- Run this in Supabase SQL editor. RLS is strict and isolates users.

-- Relationship links between users (risk-only linkage)
CREATE TABLE IF NOT EXISTS relationship_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_supabase_uid UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- For delivery privacy, relative identifiers should be blinded; for now we store both a salted hash and an optional direct uid for routing.
  relative_uid_hash TEXT NOT NULL,
  relative_supabase_uid UUID NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  degree TEXT NOT NULL CHECK (degree IN ('parent','child','sibling','partner','other')), 
  direction TEXT NOT NULL CHECK (direction IN ('one_way','reciprocal')),
  status TEXT NOT NULL CHECK (status IN ('pending','active','revoked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relationship_links_owner ON relationship_links(owner_supabase_uid);
CREATE INDEX IF NOT EXISTS idx_relationship_links_relative_uid_hash ON relationship_links(relative_uid_hash);
CREATE INDEX IF NOT EXISTS idx_relationship_links_relative_uid ON relationship_links(relative_supabase_uid);

ALTER TABLE relationship_links ENABLE ROW LEVEL SECURITY;

-- Owners can see/manage only their own link rows
CREATE POLICY "Owners can select their relationship links" ON relationship_links
  FOR SELECT USING (owner_supabase_uid = auth.uid());

CREATE POLICY "Owners can insert their relationship links" ON relationship_links
  FOR INSERT WITH CHECK (owner_supabase_uid = auth.uid());

CREATE POLICY "Owners can update their relationship links" ON relationship_links
  FOR UPDATE USING (owner_supabase_uid = auth.uid());

-- Hereditary signals are broadcast by an issuer to first-degree recipients only
CREATE TABLE IF NOT EXISTS hereditary_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer_supabase_uid UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- Routing: prototype uses explicit recipient; future: blind routing/envelopes only
  recipient_supabase_uid UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  relation_degree_to_recipients TEXT NOT NULL CHECK (relation_degree_to_recipients IN ('parent','child','sibling','partner')),
  condition_code TEXT NOT NULL, -- ICD/SNOMED code or normalized string
  onset_age_band TEXT NOT NULL, -- e.g., "<40", "40–49", "50–59", "60+"
  severity_band TEXT NULL,
  lifestyle_component TEXT NULL,
  expires_at TIMESTAMPTZ NULL,
  status TEXT NOT NULL CHECK (status IN ('active','revoked')) DEFAULT 'active',
  -- Opaque encrypted payload for client-side-only usage
  ciphertext TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hereditary_signals_issuer ON hereditary_signals(issuer_supabase_uid);
CREATE INDEX IF NOT EXISTS idx_hereditary_signals_recipient ON hereditary_signals(recipient_supabase_uid);

ALTER TABLE hereditary_signals ENABLE ROW LEVEL SECURITY;

-- Issuer can write and read only their own signals
CREATE POLICY "Issuer can insert their signals" ON hereditary_signals
  FOR INSERT WITH CHECK (issuer_supabase_uid = auth.uid());

CREATE POLICY "Issuer can select their signals" ON hereditary_signals
  FOR SELECT USING (issuer_supabase_uid = auth.uid());

CREATE POLICY "Issuer can update (revoke) their signals" ON hereditary_signals
  FOR UPDATE USING (issuer_supabase_uid = auth.uid());

-- Recipients can receive (select) signals addressed to them, but never update/delete
CREATE POLICY "Recipient can select delivered signals" ON hereditary_signals
  FOR SELECT USING (recipient_supabase_uid = auth.uid());

-- Consent receipts for auditability (visible only to issuer)
CREATE TABLE IF NOT EXISTS signal_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES hereditary_signals (id) ON DELETE CASCADE,
  issuer_supabase_uid UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  consent_hash TEXT NOT NULL, -- hash(time, scope, signal fields)
  scope TEXT NOT NULL, -- e.g., "first_degree_only"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signal_receipts_issuer ON signal_receipts(issuer_supabase_uid);

ALTER TABLE signal_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Issuer can select their receipts" ON signal_receipts
  FOR SELECT USING (issuer_supabase_uid = auth.uid());

CREATE POLICY "Issuer can insert their receipts" ON signal_receipts
  FOR INSERT WITH CHECK (issuer_supabase_uid = auth.uid());

-- Keep updated_at in sync
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_relationship_links_updated ON relationship_links;
CREATE TRIGGER trg_relationship_links_updated
  BEFORE UPDATE ON relationship_links
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_hereditary_signals_updated ON hereditary_signals;
CREATE TRIGGER trg_hereditary_signals_updated
  BEFORE UPDATE ON hereditary_signals
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();


