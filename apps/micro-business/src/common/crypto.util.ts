import * as crypto from 'crypto';

/**
 * AES-256-GCM symmetric encryption for secrets stored in DB (e.g. SMTP passwords).
 *
 * Format of stored ciphertext: `enc:v1:<iv_b64>:<authTag_b64>:<ciphertext_b64>`
 *
 * Key source: env var `SECRET_ENCRYPTION_KEY` (32 bytes, base64 or hex).
 * Fail-closed: if the key is missing or malformed, encryption throws — we never
 * silently persist plaintext to DB.
 *
 * NOTE: This file is duplicated in apps/micro-notification/src/common/crypto.util.ts.
 * Both services must use the SAME SECRET_ENCRYPTION_KEY env var for cross-service
 * encrypt/decrypt to work (micro-business writes, micro-notification reads).
 */

const ALGO = 'aes-256-gcm';
const PREFIX = 'enc:v1:';
const KEY_LENGTH = 32;

let cachedKey: Buffer | undefined;

function getKey(): Buffer {
  if (cachedKey !== undefined) return cachedKey;

  const raw = process.env.SECRET_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'SECRET_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32` and add it to your .env.',
    );
  }

  let key: Buffer;
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length === KEY_LENGTH * 2) {
    key = Buffer.from(raw, 'hex');
  } else {
    key = Buffer.from(raw, 'base64');
  }

  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `SECRET_ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (got ${key.length}). Use 32-byte hex or base64.`,
    );
  }

  cachedKey = key;
  return key;
}

export function encryptSecret(plaintext: string): string {
  if (!plaintext) return plaintext;
  const key = getKey();

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`;
}

export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}
