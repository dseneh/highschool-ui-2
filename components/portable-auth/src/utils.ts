/** Base64url decode without dependencies */
export function base64UrlDecode(input: string): string {
  // Pad string to length multiple of 4
  const pad = 4 - (input.length % 4 || 4);
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  // Browser fallback
  const binary = atob(b64);
  let out = "";
  for (let i = 0; i < binary.length; i++) out += String.fromCharCode(binary.charCodeAt(i));
  // Decode UTF-8
  try {
    return decodeURIComponent(escape(out));
  } catch {
    return out;
  }
}

export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getJwtExp(token: string): number | null {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  return typeof exp === "number" ? exp : null;
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

export function isProbablyProd(): boolean {
  // Next.js sets NODE_ENV=production in prod builds
  return typeof process !== "undefined" && process.env?.NODE_ENV === "production";
}
