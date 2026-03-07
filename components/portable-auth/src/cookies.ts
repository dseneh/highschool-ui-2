import Iron from "@hapi/iron";
import type { AuthSession, CookieSecurity } from "./types";
import { isProbablyProd } from "./utils";

/* lightweight cookie parse/serialize – zero external deps */
function parseCookie(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  for (const pair of header.split(";")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    let val = pair.slice(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    try {
      result[key] = decodeURIComponent(val);
    } catch {
      result[key] = val;
    }
  }
  return result;
}

function serializeCookie(
  name: string,
  value: string,
  opts: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: string;
    path?: string;
    domain?: string;
    maxAge?: number;
  } = {},
): string {
  let s = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (opts.maxAge != null) s += `; Max-Age=${opts.maxAge}`;
  if (opts.domain) s += `; Domain=${opts.domain}`;
  if (opts.path) s += `; Path=${opts.path}`;
  if (opts.httpOnly) s += "; HttpOnly";
  if (opts.secure) s += "; Secure";
  if (opts.sameSite) s += `; SameSite=${opts.sameSite}`;
  return s;
}

type IronSealed<T> = T;
const IRON_DEFAULTS = Iron.defaults;

function cookieOptions(sec: CookieSecurity) {
  const secureDefault = sec.secure ?? isProbablyProd();
  return {
    httpOnly: sec.httpOnly ?? true,
    secure: secureDefault,
    sameSite: sec.sameSite ?? "Lax",
    path: sec.path ?? "/",
    domain: sec.domain,
    maxAge: sec.maxAgeSeconds ?? 60 * 60 * 24 * 30,
  } as const;
}

export async function sealSession(
  session: AuthSession,
  sec: CookieSecurity,
): Promise<string> {
  return Iron.seal(session as IronSealed<AuthSession>, sec.secret, IRON_DEFAULTS);
}

export async function unsealSession(
  value: string,
  sec: CookieSecurity,
): Promise<AuthSession | null> {
  try {
    return (await Iron.unseal(value, sec.secret, IRON_DEFAULTS)) as AuthSession;
  } catch {
    return null;
  }
}

export function getCookieValue(req: Request, name: string): string | null {
  const header = req.headers.get("cookie") || "";
  const parsed = parseCookie(header);
  return parsed[name] ?? null;
}

export function buildSetCookieHeader(
  name: string,
  value: string,
  sec: CookieSecurity,
): string {
  return serializeCookie(name, value, cookieOptions(sec));
}

export function buildClearCookieHeader(
  name: string,
  sec: CookieSecurity,
): string {
  return serializeCookie(name, "", { ...cookieOptions(sec), maxAge: 0 });
}
