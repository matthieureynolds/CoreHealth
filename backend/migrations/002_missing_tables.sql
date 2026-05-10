-- CoreHealth migration 002 — missing tables and columns
-- Run after 001_initial_schema.sql

-- ─── users: missing columns ───────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB,
  ADD COLUMN IF NOT EXISTS expo_push_token    TEXT,
  ADD COLUMN IF NOT EXISTS health_memory      TEXT;

-- ─── medical_conditions: missing columns ──────────────────────────────────────
ALTER TABLE medical_conditions
  ADD COLUMN IF NOT EXISTS severity      TEXT,
  ADD COLUMN IF NOT EXISTS resolved_date DATE;

-- ─── vaccinations: missing column ─────────────────────────────────────────────
ALTER TABLE vaccinations
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ─── Allergies ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS allergies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  severity    TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening')),
  reaction    TEXT,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  start_date  DATE,
  end_date    DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_allergies_user ON allergies (user_id, created_at DESC);

-- ─── Appointments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  event_date  TIMESTAMPTZ NOT NULL,
  doctor      TEXT,
  location    TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments (user_id, event_date ASC);

-- ─── Health alerts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('trend', 'abnormal', 'pattern')),
  severity    TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  biomarkers  TEXT[] NOT NULL DEFAULT '{}',
  dismissed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_alerts_user ON health_alerts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_alerts_active ON health_alerts (user_id, dismissed) WHERE dismissed = FALSE;

-- ─── Device tokens (Whoop / Oura OAuth) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type   TEXT NOT NULL CHECK (device_type IN ('whoop', 'oura')),
  access_token  TEXT NOT NULL,
  refresh_token TEXT,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, device_type)
);

-- ─── Triggers: auto-update updated_at ────────────────────────────────────────
CREATE TRIGGER allergies_updated_at BEFORE UPDATE ON allergies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER device_tokens_updated_at BEFORE UPDATE ON device_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
