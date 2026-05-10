-- CoreHealth migration 005 — GDPR explicit consent records
-- Article 9(2)(a): explicit consent is the lawful basis for processing special category health data.
-- This table is an immutable audit log. Records are never deleted — only new rows are inserted
-- (a withdrawal row is added; the original grant row is retained as proof it existed).

CREATE TABLE IF NOT EXISTS consent_records (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version      TEXT NOT NULL,       -- privacy policy / terms version that was accepted (e.g. '1.0')
  purposes     TEXT[] NOT NULL,     -- explicit list of processing purposes consented to
  given_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ          -- NULL = active consent; set when user withdraws
);

CREATE INDEX IF NOT EXISTS idx_consent_user ON consent_records (user_id, given_at DESC);
