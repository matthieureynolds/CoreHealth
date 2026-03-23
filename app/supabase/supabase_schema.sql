-- CoreHealth Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable RLS (Row Level Security) for all tables
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- 1. Profiles table - stores user profile information linked to Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supabase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height NUMERIC, -- in cm
  weight NUMERIC, -- in kg
  ethnicity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Medical conditions table
CREATE TABLE IF NOT EXISTS medical_conditions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  diagnosed_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'resolved', 'managed')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  next_due DATE,
  location TEXT,
  batch_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Biomarkers table
CREATE TABLE IF NOT EXISTS biomarkers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  category TEXT CHECK (category IN ('cardiovascular', 'metabolic', 'hormonal', 'inflammatory', 'nutritional')) NOT NULL,
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')) DEFAULT 'stable',
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'low',
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Device data table
CREATE TABLE IF NOT EXISTS device_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_type TEXT CHECK (device_type IN ('whoop', 'apple_watch', 'eight_sleep', 'smart_toothbrush', 'smart_toilet')) NOT NULL,
  device_name TEXT NOT NULL,
  metrics JSONB NOT NULL, -- Store device-specific metrics as JSON
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Lab results table
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT NOT NULL,
  reference_range TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT CHECK (category IN ('blood', 'urine', 'imaging', 'other')) NOT NULL,
  status TEXT CHECK (status IN ('normal', 'high', 'low', 'critical')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_supabase_uid ON profiles(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_user_id ON medical_conditions(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_user_id ON vaccinations(user_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_user_id ON biomarkers(user_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_recorded_at ON biomarkers(recorded_at);
CREATE INDEX IF NOT EXISTS idx_device_data_user_id ON device_data(user_id);
CREATE INDEX IF NOT EXISTS idx_device_data_timestamp ON device_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_lab_results_user_id ON lab_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_date ON lab_results(date);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Create policies that allow users to only access their own data
-- Note: Since we're using Supabase Auth, we'll use auth.uid() for RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (supabase_uid = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (supabase_uid = auth.uid()::text);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (supabase_uid = auth.uid()::text);

-- Medical conditions policies
CREATE POLICY "Users can view own medical conditions" ON medical_conditions
  FOR SELECT USING (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

CREATE POLICY "Users can insert own medical conditions" ON medical_conditions
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

CREATE POLICY "Users can update own medical conditions" ON medical_conditions
  FOR UPDATE USING (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

-- Similar policies for other tables
CREATE POLICY "Users can view own vaccinations" ON vaccinations
  FOR SELECT USING (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

CREATE POLICY "Users can insert own vaccinations" ON vaccinations
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

CREATE POLICY "Users can view own biomarkers" ON biomarkers
  FOR SELECT USING (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

CREATE POLICY "Users can insert own biomarkers" ON biomarkers
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

CREATE POLICY "Users can view own device data" ON device_data
  FOR SELECT USING (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

CREATE POLICY "Users can insert own device data" ON device_data
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

CREATE POLICY "Users can view own lab results" ON lab_results
  FOR SELECT USING (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

CREATE POLICY "Users can insert own lab results" ON lab_results
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE supabase_uid = auth.uid()::text
  ));

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_conditions_updated_at BEFORE UPDATE ON medical_conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON vaccinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_biomarkers_updated_at BEFORE UPDATE ON biomarkers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON lab_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 