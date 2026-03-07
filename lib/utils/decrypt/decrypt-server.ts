import { createDecipheriv } from 'crypto';
import { EncryptedPayload } from './utils';

const SERVER_BASE64_KEY = process.env.AES_KEY || '';
let warnedMissingKeyServer = false;

export function decryptAESServer(payload: EncryptedPayload | any): any {
  if (process.env.NODE_ENV !== 'production') return payload;

  if (!SERVER_BASE64_KEY) {
    if (!warnedMissingKeyServer) {
      // Use console.error on server so it shows up in logs/observability
      console.error('[decryptAESServer] Missing AES_KEY; returning payload as-is.');
      warnedMissingKeyServer = true;
    }
    return payload;
  }

  if (!payload || typeof payload !== 'object' || !payload.iv || !payload.data) {
    console.error('[decryptAESServer] Invalid payload shape; returning as-is.');
    return payload;
  }

  try {
    const key = Buffer.from(SERVER_BASE64_KEY.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const iv = Buffer.from(payload.iv.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const full = Buffer.from(payload.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

    // Split last 16 bytes as auth tag (128-bit)
    if (full.length < 17) throw new Error('ciphertext too short');
    const authTag = full.subarray(full.length - 16);
    const ciphertext = full.subarray(0, full.length - 16);

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch (e) {
    console.error('[decryptAESServer] Decryption failed:', e);
    throw new Error('Failed to decrypt payload (server)');
  }
}