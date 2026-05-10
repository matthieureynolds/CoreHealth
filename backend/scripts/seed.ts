/**
 * CoreHealth seed script — creates a realistic test user for local/staging development.
 *
 * Usage:
 *   npm run local:seed           — seed against local Docker Postgres (uses DATABASE_URL)
 *   npm run local:seed -- --reset  — wipe + re-seed local DB
 *   npm run seed                 — seed against AWS RDS (uses DB_SECRET_ARN + DB_ENDPOINT)
 *   npm run seed -- --reset      — wipe + re-seed AWS RDS
 *
 * The test user UUID is fixed so the script is idempotent across runs.
 */

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';

// ─── Fixed test user — stable across runs ────────────────────────────────────
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const TEST_USER_EMAIL = 'alex.chen@corehealth.test';

// ─── DB connection ────────────────────────────────────────────────────────────
async function connect(): Promise<Client> {
  let client: Client;

  if (process.env.LOCAL_DEV === 'true') {
    // Local: connect directly via DATABASE_URL
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not set. Copy .env.local.example → .env.local.');
    client = new Client({ connectionString: url, ssl: false, connectionTimeoutMillis: 10000 });
  } else {
    // AWS: fetch credentials from Secrets Manager
    const secretArn = process.env.DB_SECRET_ARN;
    const dbEndpoint = process.env.DB_ENDPOINT;
    if (!secretArn || !dbEndpoint) {
      throw new Error('DB_SECRET_ARN and DB_ENDPOINT must be set. Copy .env.example → .env.');
    }
    const sm = new SecretsManagerClient({ region: process.env.AWS_REGION ?? 'eu-north-1' });
    const result = await sm.send(new GetSecretValueCommand({ SecretId: secretArn }));
    const secret = JSON.parse(result.SecretString!);
    client = new Client({
      host: dbEndpoint, port: secret.port, database: secret.dbname,
      user: secret.username, password: secret.password,
      ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000,
    });
  }

  await client.connect();
  return client;
}

// ─── Reset ────────────────────────────────────────────────────────────────────
async function reset(client: Client): Promise<void> {
  console.log('Resetting test user...');
  // CASCADE handles all child tables
  await client.query(`DELETE FROM users WHERE id = $1`, [TEST_USER_ID]);
  console.log('Test user deleted.');
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed(client: Client): Promise<void> {

  // ── User ──────────────────────────────────────────────────────────────────
  await client.query(`
    INSERT INTO users (
      id, email, first_name, surname, date_of_birth, gender,
      height_cm, weight_kg, ethnicity
    ) VALUES (
      $1, $2, 'Alex', 'Chen', '1991-03-15', 'male',
      178, 76.5, 'East Asian'
    )
    ON CONFLICT (id) DO NOTHING
  `, [TEST_USER_ID, TEST_USER_EMAIL]);
  console.log('✓ User');

  // ── Biomarkers (3 readings each for trend testing) ────────────────────────
  // Format: [name, unit, category, values with dates (newest last), ref_min, ref_max]
  // Readings are spaced ~6 weeks apart so the trend analyzer sees real movement.

  const biomarkerSeries: Array<{
    name: string; unit: string; category: string;
    readings: Array<{ value: number; date: string }>;
    refMin?: number; refMax?: number;
  }> = [
    {
      name: 'LDL Cholesterol', unit: 'mmol/L', category: 'cardiovascular',
      readings: [
        { value: 3.8, date: '2025-10-01' },
        { value: 4.1, date: '2025-11-15' },
        { value: 4.4, date: '2026-01-02' },
      ],
      refMin: 0, refMax: 3.4,
    },
    {
      name: 'HDL Cholesterol', unit: 'mmol/L', category: 'cardiovascular',
      readings: [
        { value: 1.6, date: '2025-10-01' },
        { value: 1.5, date: '2025-11-15' },
        { value: 1.4, date: '2026-01-02' },
      ],
      refMin: 1.0, refMax: 3.0,
    },
    {
      name: 'Triglycerides', unit: 'mmol/L', category: 'cardiovascular',
      readings: [
        { value: 1.3, date: '2025-10-01' },
        { value: 1.5, date: '2025-11-15' },
        { value: 1.4, date: '2026-01-02' },
      ],
      refMin: 0, refMax: 1.7,
    },
    {
      name: 'HbA1c', unit: '%', category: 'metabolic',
      readings: [
        { value: 5.2, date: '2025-10-01' },
        { value: 5.4, date: '2025-11-15' },
        { value: 5.6, date: '2026-01-02' },
      ],
      refMin: 4.0, refMax: 5.6,
    },
    {
      name: 'Fasting Glucose', unit: 'mmol/L', category: 'metabolic',
      readings: [
        { value: 5.0, date: '2025-10-01' },
        { value: 5.2, date: '2025-11-15' },
        { value: 5.3, date: '2026-01-02' },
      ],
      refMin: 3.9, refMax: 5.5,
    },
    {
      name: 'Testosterone (Total)', unit: 'nmol/L', category: 'hormonal',
      readings: [
        { value: 18.5, date: '2025-10-01' },
        { value: 17.2, date: '2025-11-15' },
        { value: 16.1, date: '2026-01-02' },
      ],
      refMin: 9.9, refMax: 27.8,
    },
    {
      name: 'Cortisol (AM)', unit: 'nmol/L', category: 'hormonal',
      readings: [
        { value: 420, date: '2025-10-01' },
        { value: 480, date: '2025-11-15' },
        { value: 510, date: '2026-01-02' },
      ],
      refMin: 170, refMax: 540,
    },
    {
      name: 'hsCRP', unit: 'mg/L', category: 'inflammatory',
      readings: [
        { value: 0.8, date: '2025-10-01' },
        { value: 1.2, date: '2025-11-15' },
        { value: 2.1, date: '2026-01-02' },
      ],
      refMin: 0, refMax: 3.0,
    },
    {
      name: 'Ferritin', unit: 'µg/L', category: 'nutritional',
      readings: [
        { value: 85, date: '2025-10-01' },
        { value: 72, date: '2025-11-15' },
        { value: 58, date: '2026-01-02' },
      ],
      refMin: 30, refMax: 400,
    },
    {
      name: 'Vitamin D (25-OH)', unit: 'nmol/L', category: 'nutritional',
      readings: [
        { value: 62, date: '2025-10-01' },
        { value: 48, date: '2025-11-15' },
        { value: 38, date: '2026-01-02' },  // declining — below optimal
      ],
      refMin: 50, refMax: 200,
    },
    {
      name: 'Haemoglobin', unit: 'g/dL', category: 'nutritional',
      readings: [
        { value: 15.2, date: '2025-10-01' },
        { value: 14.8, date: '2025-11-15' },
        { value: 14.5, date: '2026-01-02' },
      ],
      refMin: 13.5, refMax: 17.5,
    },
  ];

  for (const bm of biomarkerSeries) {
    const readings = bm.readings;
    for (let i = 0; i < readings.length; i++) {
      const r = readings[i];
      // Compute trend from direction of last two readings
      let trend: string | null = null;
      if (i > 0) {
        const prev = readings[i - 1].value;
        trend = r.value > prev ? 'increasing' : r.value < prev ? 'decreasing' : 'stable';
      }
      const riskLevel = (bm.refMin !== undefined && bm.refMax !== undefined)
        ? (r.value < bm.refMin || r.value > bm.refMax ? 'abnormal' : 'normal')
        : 'unknown';

      await client.query(`
        INSERT INTO biomarkers (
          user_id, name, value, unit, category, trend, risk_level,
          reference_min, reference_max, recorded_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        ON CONFLICT (user_id, name, recorded_at) DO NOTHING
      `, [
        TEST_USER_ID, bm.name, r.value, bm.unit, bm.category,
        trend, riskLevel, bm.refMin ?? null, bm.refMax ?? null,
        `${r.date}T08:00:00Z`,
      ]);
    }
    console.log(`  ✓ ${bm.name} (${readings.length} readings)`);
  }
  console.log('✓ Biomarkers');

  // ── Medical conditions ─────────────────────────────────────────────────────
  await client.query(`
    INSERT INTO medical_conditions (user_id, name, diagnosed_date, status, severity, notes)
    VALUES
      ($1, 'Stage 1 Hypertension', '2023-06-01', 'managed', 'mild',
       'Borderline. Managed with lifestyle. Monitor quarterly.'),
      ($1, 'Vitamin D Deficiency', '2024-11-01', 'active', 'mild',
       'Supplementing 2000 IU daily. Retest in 3 months.')
    ON CONFLICT DO NOTHING
  `, [TEST_USER_ID]);
  console.log('✓ Medical conditions');

  // ── Medications ────────────────────────────────────────────────────────────
  await client.query(`
    INSERT INTO medications (user_id, name, dosage, frequency, start_date, notes)
    VALUES
      ($1, 'Vitamin D3', '2000 IU', 'Daily', '2024-11-15', 'With breakfast'),
      ($1, 'Omega-3 Fish Oil', '1000mg', 'Daily', '2024-09-01', 'Cardiovascular support')
    ON CONFLICT DO NOTHING
  `, [TEST_USER_ID]);
  console.log('✓ Medications');

  // ── Allergies ──────────────────────────────────────────────────────────────
  await client.query(`
    INSERT INTO allergies (user_id, name, severity, reaction, status)
    VALUES
      ($1, 'Penicillin', 'moderate', 'Hives and facial swelling', 'active'),
      ($1, 'Tree nuts', 'mild', 'Oral itching', 'active')
    ON CONFLICT DO NOTHING
  `, [TEST_USER_ID]);
  console.log('✓ Allergies');

  // ── Vaccinations ───────────────────────────────────────────────────────────
  await client.query(`
    INSERT INTO vaccinations (user_id, name, date, next_due, notes)
    VALUES
      ($1, 'COVID-19 (XBB Booster)', '2024-10-05', NULL, 'Pfizer — 5th dose'),
      ($1, 'Influenza 2024/25', '2024-10-05', '2025-10-01', 'Annual flu shot')
    ON CONFLICT DO NOTHING
  `, [TEST_USER_ID]);
  console.log('✓ Vaccinations');

  // ── Appointments ───────────────────────────────────────────────────────────
  await client.query(`
    INSERT INTO appointments (user_id, title, subtitle, event_date, doctor, location, notes)
    VALUES
      ($1, 'Annual Blood Panel', 'Comprehensive metabolic + lipid + hormones',
       '2026-04-20T09:00:00Z', 'Dr. Sarah Okonkwo', 'City Health Clinic, London',
       'Fasted 12h before. Focus: LDL trend, testosterone, Vitamin D recheck.'),
      ($1, 'GP Follow-up: Blood Pressure', NULL,
       '2026-05-10T10:30:00Z', 'Dr. James Farrell', 'Harley Street Practice',
       'Bring home BP log.')
    ON CONFLICT DO NOTHING
  `, [TEST_USER_ID]);
  console.log('✓ Appointments');

  // ── Symptoms ──────────────────────────────────────────────────────────────
  await client.query(`
    INSERT INTO symptoms (user_id, type, category, severity, duration, notes, factors, logged_at)
    VALUES
      ($1, 'physical', 'Energy & Fatigue', 6, '3 days',
       'Persistent mid-afternoon energy crash. Not linked to sleep quality (Oura score 85).',
       ARRAY['work_stress', 'high_caffeine'],
       '2026-04-05T15:00:00Z'),
      ($1, 'physical', 'Musculoskeletal', 3, '1 day',
       'Mild lower back tightness after long flight.',
       ARRAY['sedentary'],
       '2026-03-22T20:00:00Z')
    ON CONFLICT DO NOTHING
  `, [TEST_USER_ID]);
  console.log('✓ Symptoms');

  console.log(`\nTest user ready.`);
  console.log(`  ID:    ${TEST_USER_ID}`);
  console.log(`  Email: ${TEST_USER_EMAIL}`);
  console.log(`\nNote: this user has no Cognito account. To test auth flows, create a`);
  console.log(`  Cognito user with the same email and update the users.id to match the Cognito sub.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const doReset = process.argv.includes('--reset');

  console.log(`CoreHealth seed script`);
  console.log(`Mode: ${doReset ? 'RESET + seed' : 'seed (idempotent)'}\n`);

  const client = await connect();

  try {
    if (doReset) {
      await reset(client);
    }
    await seed(client);
    console.log('\nDone.');
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
