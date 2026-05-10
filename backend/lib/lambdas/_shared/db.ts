import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

// RDS CA bundle — bundled alongside the Lambda at deploy time via CDK commandHooks.
// Enables full TLS certificate verification against AWS RDS in eu-north-1.
const RDS_CA = fs.existsSync(path.join(__dirname, 'certs', 'eu-north-1-bundle.pem'))
  ? fs.readFileSync(path.join(__dirname, 'certs', 'eu-north-1-bundle.pem')).toString()
  : undefined;

const secretsManager = new SecretsManagerClient({});

// Module-level pool — reused across warm Lambda invocations
let pool: Pool | null = null;

interface DbSecret {
  username: string;
  password: string;
  host: string;
  port: number;
  dbname: string;
}

async function getSecret(): Promise<DbSecret> {
  const result = await secretsManager.send(
    new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_ARN! }),
  );
  return JSON.parse(result.SecretString!);
}

// Returns the Pool directly — callers use pool.query() which acquires and
// releases connections automatically. Never call pool.connect() in Lambda.
export async function getDb(): Promise<Pool> {
  if (!pool) {
    if (process.env.LOCAL_DEV === 'true') {
      // Local dev: skip Secrets Manager, connect directly via DATABASE_URL
      const url = process.env.DATABASE_URL;
      if (!url) throw new Error('DATABASE_URL required when LOCAL_DEV=true');
      pool = new Pool({
        connectionString: url,
        ssl: false,
        max: 2,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000,
      });
    } else {
      const secret = await getSecret();
      pool = new Pool({
        host: process.env.DB_ENDPOINT!,
        port: secret.port,
        database: secret.dbname,
        user: secret.username,
        password: secret.password,
        ssl: { rejectUnauthorized: true, ca: RDS_CA },
        max: 2,                   // 2 per Lambda instance — t3.micro (~112 max_connections) handles ~50 concurrent Lambdas before exhaustion
        idleTimeoutMillis: 10000, // Aggressive idle timeout — Lambda invocations are bursty, don't hold connections between requests
        connectionTimeoutMillis: 5000, // Fail fast — Lambda latency budget is tight
      });
    }
  }
  return pool;
}
