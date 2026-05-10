-- CoreHealth migration 003 — additional columns and tables
-- Run after 002_missing_tables.sql

-- ─── users: additional JSONB blobs ───────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS user_settings   JSONB,
  ADD COLUMN IF NOT EXISTS profile_data    JSONB,
  ADD COLUMN IF NOT EXISTS joined_leagues  JSONB,
  ADD COLUMN IF NOT EXISTS location_health JSONB;

-- ─── Trips (planned travel) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  departure_location TEXT NOT NULL,
  destination        TEXT NOT NULL,
  departure_date     TIMESTAMPTZ NOT NULL,
  return_date        TIMESTAMPTZ,
  timezone           TEXT,
  notes              TEXT,
  trip_data          JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_user ON trips (user_id, departure_date ASC);

DO $$ BEGIN
  CREATE TRIGGER trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Symptoms ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS symptoms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('physical', 'mental')),
  category    TEXT NOT NULL,
  severity    INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
  duration    TEXT,
  location    TEXT,
  notes       TEXT,
  medications TEXT[],
  factors     TEXT[],
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symptoms_user_time ON symptoms (user_id, logged_at DESC);

-- ─── Imaging results ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS imaging_results (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  modality     TEXT NOT NULL CHECK (modality IN (
                 'x-ray', 'mri', 'ct', 'ultrasound', 'pet',
                 'dexa', 'ecg', 'echo', 'endoscopy', 'other'
               )),
  body_part    TEXT,
  study_date   DATE,
  facility     TEXT,
  radiologist  TEXT,
  findings     TEXT,
  impression   TEXT,
  measurements JSONB,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_imaging_user ON imaging_results (user_id, study_date DESC);

DO $$ BEGIN
  CREATE TRIGGER imaging_results_updated_at BEFORE UPDATE ON imaging_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── device_data: extend device_type constraint to include apple_health ─────
ALTER TABLE device_data DROP CONSTRAINT IF EXISTS device_data_device_type_check;
ALTER TABLE device_data ADD CONSTRAINT device_data_device_type_check
  CHECK (device_type IN ('whoop', 'apple_watch', 'apple_health', 'oura', 'eight_sleep', 'other'));
