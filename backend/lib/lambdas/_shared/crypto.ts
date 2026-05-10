import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const sm = new SecretsManagerClient({});
let encryptionKey: Buffer | null = null;

async function getKey(): Promise<Buffer> {
  if (encryptionKey) return encryptionKey;
  const result = await sm.send(
    new GetSecretValueCommand({ SecretId: process.env.ENCRYPTION_KEY_ARN! }),
  );
  // Secret value is a 64-char hex string (32 bytes)
  encryptionKey = Buffer.from(result.SecretString!, 'hex');
  return encryptionKey;
}

// Pre-warm: begin fetching the key as soon as the module loads on a cold start.
// By the time the first handler invocation calls encrypt/decrypt, the key is
// already in flight (or cached) — eliminates the Secrets Manager round-trip
// from the hot path. Errors are intentionally swallowed here; they surface on
// the first actual encrypt/decrypt call.
if (process.env.ENCRYPTION_KEY_ARN) {
  getKey().catch(() => {});
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format (base64): [12-byte IV][16-byte auth tag][ciphertext]
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypt a value produced by encrypt().
 * Returns null if decryption fails (corrupted data or wrong key).
 */
export async function decrypt(encoded: string): Promise<string | null> {
  try {
    const key = await getKey();
    const buf = Buffer.from(encoded, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
