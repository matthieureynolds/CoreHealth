import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const RDS_CA = fs.existsSync(path.join(__dirname, 'certs', 'eu-north-1-bundle.pem'))
  ? fs.readFileSync(path.join(__dirname, 'certs', 'eu-north-1-bundle.pem')).toString()
  : undefined;

const secretsManager = new SecretsManagerClient({});

export const handler = async (): Promise<{ statusCode: number; body: string }> => {
  const result = await secretsManager.send(
    new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_ARN! }),
  );
  const secret = JSON.parse(result.SecretString!);

  const client = new Client({
    host: process.env.DB_ENDPOINT!,
    port: secret.port,
    database: secret.dbname,
    user: secret.username,
    password: secret.password,
    ssl: RDS_CA ? { rejectUnauthorized: true, ca: RDS_CA } : { rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
  });

  await client.connect();

  try {
    // Ensure migration tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Bootstrap: if users table already exists (DB was set up before tracking was added),
    // mark 001 and 002 as applied so they're not re-run.
    const { rows: [{ exists: usersExists }] } = await client.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
      ) AS exists
    `);
    if (usersExists) {
      await client.query(`
        INSERT INTO schema_migrations (filename) VALUES
          ('001_initial_schema.sql'),
          ('002_missing_tables.sql')
        ON CONFLICT DO NOTHING
      `);
    }

    // Load applied migrations
    const { rows: appliedRows } = await client.query<{ filename: string }>(`
      SELECT filename FROM schema_migrations
    `);
    const applied = new Set(appliedRows.map(r => r.filename));

    // Read migration files in order
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const ran: string[] = [];
    const skipped: string[] = [];

    for (const file of files) {
      if (applied.has(file)) {
        skipped.push(file);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`Running migration: ${file}`);

      await client.query('BEGIN');
      await client.query(sql);
      await client.query(`INSERT INTO schema_migrations (filename) VALUES ($1)`, [file]);
      await client.query('COMMIT');

      ran.push(file);
    }

    const summary = ran.length > 0
      ? `Applied: ${ran.join(', ')}`
      : 'No new migrations';

    console.log(summary, skipped.length > 0 ? `| Skipped: ${skipped.join(', ')}` : '');
    return { statusCode: 200, body: summary };
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
};
