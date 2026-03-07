export interface EncryptedPayload {
  iv: string;   // base64 (12 bytes recommended for GCM)
  data: string; // base64 (ciphertext || authTag)
}