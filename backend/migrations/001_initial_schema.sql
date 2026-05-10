-- CoreHealth initial schema
-- Run against RDS Postgres after first deploy
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector for AI embeddings

-- ─── Users ────────────────────────────────────────────────────────────────────
-- id = Cognito sub (UUID) — no separate user ID, Cognito sub is the primary key
CREATE TABLE users (
  id              UUID PRIMARY KEY,  -- Cognito sub
  email           TEXT NOT NULL UNIQUE,
  first_name      TEXT,
  surname         TEXT,
  preferred_name  TEXT,
  username        TEXT UNIQUE,
  photo_url       TEXT,
  date_of_birth   DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm       NUMERIC(5,1),
  weight_kg       NUMERIC(5,1),
  ethnicity       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Biomarkers ───────────────────────────────────────────────────────────────
CREATE TABLE biomarkers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  value           NUMERIC NOT NULL,
  unit            TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN (
                    'cardiovascular', 'metabolic', 'hormonal',
                    'inflammatory', 'nutritional', 'other'
                  )),
  trend           TEXT CHECK (trend IN ('increasing', 'decreasing', 'stable')),
  risk_level      TEXT CHECK (risk_level IN ('normal', 'abnormal', 'unknown')),
  reference_min   NUMERIC,
  reference_max   NUMERIC,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lab_result_id   UUID,               -- FK added after lab_results table created
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name, recorded_at) -- prevent duplicate readings
);

CREATE INDEX idx_biomarkers_user_name ON biomarkers (user_id, name, recorded_at DESC);
CREATE INDEX idx_biomarkers_category ON biomarkers (user_id, category);

-- ─── Lab results ──────────────────────────────────────────────────────────────
CREATE TABLE lab_results (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  s3_key              TEXT NOT NULL,
  file_name           TEXT NOT NULL,
  lab_name            TEXT,
  report_date         DATE,
  processing_status   TEXT NOT NULL DEFAULT 'pending'
                        CHECK (processing_status IN ('pending', 'processing', 'complete', 'failed')),
  biomarker_count     INTEGER DEFAULT 0,
  raw_text            TEXT,
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lab_results_user ON lab_results (user_id, report_date DESC);

-- Add FK from biomarkers to lab_results now that both tables exist
ALTER TABLE biomarkers
  ADD CONSTRAINT fk_biomarkers_lab_result
  FOREIGN KEY (lab_result_id) REFERENCES lab_results(id) ON DELETE SET NULL;

-- ─── Medical conditions ───────────────────────────────────────────────────────
CREATE TABLE medical_conditions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  diagnosed_date  DATE,
  status          TEXT CHECK (status IN ('active', 'resolved', 'managed')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Medications ──────────────────────────────────────────────────────────────
CREATE TABLE medications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  dosage      TEXT,
  frequency   TEXT,
  start_date  DATE,
  end_date    DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Vaccinations ─────────────────────────────────────────────────────────────
CREATE TABLE vaccinations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  date         DATE NOT NULL,
  next_due     DATE,
  location     TEXT,
  batch_number TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Device data (wearables) ──────────────────────────────────────────────────
-- High-frequency data, partitioned by month for performance
CREATE TABLE device_data (
  id          UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL CHECK (device_type IN (
                 'whoop', 'apple_watch', 'oura', 'eight_sleep', 'other'
               )),
  device_name TEXT NOT NULL,
  metrics     JSONB NOT NULL,  -- flexible schema per device type
  timestamp   TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create first 3 partitions (add more monthly as needed)
CREATE TABLE device_data_2025 PARTITION OF device_data
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE device_data_2026 PARTITION OF device_data
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE device_data_2027 PARTITION OF device_data
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

CREATE INDEX idx_device_data_user_time ON device_data (user_id, timestamp DESC);

-- ─── AI chat history ──────────────────────────────────────────────────────────
CREATE TABLE chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_user_time ON chat_messages (user_id, created_at DESC);

-- ─── Family hereditary signals (E2EE) ─────────────────────────────────────────
CREATE TABLE relationship_links (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relative_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  relative_id_hash    TEXT NOT NULL, -- hashed for privacy if relative not yet on platform
  degree              TEXT CHECK (degree IN ('parent', 'child', 'sibling', 'partner', 'other')),
  direction           TEXT CHECK (direction IN ('one_way', 'reciprocal')),
  status              TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hereditary_signals (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issuer_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  condition_code              TEXT NOT NULL,
  onset_age_band              TEXT NOT NULL,
  severity_band               TEXT,
  ciphertext                  TEXT NOT NULL, -- E2EE — never store plaintext
  expires_at                  TIMESTAMPTZ,
  status                      TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Triggers: auto-update updated_at ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER biomarkers_updated_at BEFORE UPDATE ON biomarkers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lab_results_updated_at BEFORE UPDATE ON lab_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER medical_conditions_updated_at BEFORE UPDATE ON medical_conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER medications_updated_at BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
