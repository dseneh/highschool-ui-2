// Encryption mode fix: Web Crypto does NOT support AES-CFB. Use AES-GCM across stack.
// This file provides BOTH client- and server-side decryption helpers using AES-GCM (256-bit).
// - Client: Web Crypto API (ciphertext must include the 16-byte auth tag appended at the end — default from Python AESGCM)
// - Server: Node `crypto` (splits auth tag from the end)

import { EncryptedPayload } from "./utils";

// ===== utils/secure-decrypt-client.ts (browser) =====



// AES key (base64) exposed for client ONLY when you intend to decrypt in browser (prod only)
const BASE64_KEY = process.env.NEXT_PUBLIC_AES_KEY || "";
let warnedMissingKeyClient = false;
let cachedCryptoKey: CryptoKey | null = null;

function b64ToBytes(b64: string): Uint8Array {
  // tolerant to URL-safe base64 and missing padding
  const norm = b64.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64.length / 4) * 4, '=');
  const bin = atob(norm);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getClientKey(): Promise<CryptoKey | null> {
  if (cachedCryptoKey) return cachedCryptoKey;
  if (!BASE64_KEY) return null;
  const keyRaw = b64ToBytes(BASE64_KEY);
  cachedCryptoKey = await crypto.subtle.importKey(
    'raw', keyRaw, { name: 'AES-GCM' }, false, ['decrypt']
  );
  return cachedCryptoKey;
}

export async function decryptAESClient(payload: EncryptedPayload | any): Promise<any> {
  // In dev we expect plain JSON
  if (process.env.NODE_ENV !== 'production') return payload;

  const key = await getClientKey();
  if (!key) {
    if (!warnedMissingKeyClient) {
      console.warn('[decryptAESClient] Missing NEXT_PUBLIC_AES_KEY; returning payload as-is.');
      warnedMissingKeyClient = true;
    }
    return payload;
  }

  // Validate payload
  if (!payload || typeof payload !== 'object' || !payload.iv || !payload.data) {
    console.warn('[decryptAESClient] Invalid payload shape; returning as-is.');
    return payload;
  }

  try {
    const iv = b64ToBytes(payload.iv); // 12 bytes recommended
    const cipherAndTag = b64ToBytes(payload.data); // ciphertext || 16-byte tag

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      key,
      cipherAndTag
    );

    const text = new TextDecoder().decode(new Uint8Array(decrypted));
    return JSON.parse(JSON.parse(text));
  } catch (e) {
    console.error('[decryptAESClient] Decryption failed:', e);
    throw new Error('Failed to decrypt payload (client)');
  }
}

// export function useSecureData() {
//   return useQuery({
//     queryKey: ['secureData'],
//     queryFn: async () => {
//       const res = await axios.get('/api/secure-data');
//       return await decryptAESClient(res.data);
//     },
//   });
// }

