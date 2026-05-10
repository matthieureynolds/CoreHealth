/**
 * Run all pending migrations against a local Postgres instance.
 * Uses DATABASE_URL directly — no Secrets Manager.
 *
 * Usage:
 *   npm run local:migrate
 *
 * Requires:
 *   - docker compose up -d   (or any Postgres at DATABASE_URL)
 *   - .env.local with LOCAL_DEV=true and DATABASE_URL set
 */

import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL not set. Copy .env.local.example → .env.local and fill in.');
  }

  const client = new Client({
    connectionString: url,
    ssl: false,
    connectionTimeoutMillis: 10000,
  });

  await client.connect();
  console.log('Connected to local Postgres.\n');

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows: appliedRows } = await client.query<{ filename: string }>(
      `SELECT filename FROM schema_migrations`,
    );
    const applied = new Set(appliedRows.map(r => r.filename));

    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    let ranCount = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  skip  ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(`INSERT INTO schema_migrations (filename) VALUES ($1)`, [file]);
      await client.query('COMMIT');

      console.log(`  ✓     ${file}`);
      ranCount++;
    }

    console.log(ranCount === 0 ? '\nNo new migrations.' : `\n${ranCount} migration(s) applied.`);
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
