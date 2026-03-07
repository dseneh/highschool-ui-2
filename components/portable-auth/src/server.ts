import type { AuthSession, PortableAuthConfig, TenantContext } from "./types";
import { buildClearCookieHeader, buildSetCookieHeader, getCookieValue, sealSession, unsealSession } from "./cookies";
import { backendLogin, backendLogout, backendRefresh } from "./backend";
import { getJwtExp, nowUnix } from "./utils";

const DEFAULT_COOKIE_NAME = "pa_session";

export type LoginResult = { ok: true } | { ok: false; error: string; status?: number };

export function getCookieName(cfg: PortableAuthConfig): string {
  return cfg.cookie.name ?? DEFAULT_COOKIE_NAME;
}

export async function readSession(cfg: PortableAuthConfig, req: Request): Promise<AuthSession | null> {
  const name = getCookieName(cfg);
  const raw = getCookieValue(req, name);
  if (!raw) return null;
  const session = await unsealSession(raw, cfg.cookie);
  if (!session) return null;

  // optional validation hook
  if (cfg.validateSession) await cfg.validateSession(session);

  return session;
}

export function sessionHeaders(cfg: PortableAuthConfig, session: AuthSession | null): Headers {
  const h = new Headers();
  const name = getCookieName(cfg);
  if (!session) {
    h.append("set-cookie", buildClearCookieHeader(name, cfg.cookie));
    return h;
  }
  // seal and set
  // Note: cookie payload is encrypted and HttpOnly
  return h;
}

export async function writeSessionHeader(cfg: PortableAuthConfig, session: AuthSession): Promise<string> {
  const name = getCookieName(cfg);
  const sealed = await sealSession(session, cfg.cookie);
  return buildSetCookieHeader(name, sealed, cfg.cookie);
}

export async function clearSessionHeader(cfg: PortableAuthConfig): Promise<string> {
  const name = getCookieName(cfg);
  return buildClearCookieHeader(name, cfg.cookie);
}

export async function resolveTenant(cfg: PortableAuthConfig, req: Request, fallback?: TenantContext | null): Promise<TenantContext | null> {
  const fromReq = await cfg.resolveTenantFromRequest?.(req);
  return fromReq ?? fallback ?? null;
}

/**
 * Refresh the access token if it is expired (or about to expire), and persist to cookie.
 * Returns { session, setCookie? } where setCookie is present if cookie should be updated.
 */
export async function ensureFreshTokens(
  cfg: PortableAuthConfig,
  req: Request,
  minTtlSeconds = 60,
): Promise<{ session: AuthSession | null; setCookie?: string }> {
  const session = await readSession(cfg, req);
  if (!session?.tokens?.accessToken || !session?.tokens?.refreshToken) {
    return { session };
  }

  const exp = getJwtExp(session.tokens.accessToken);
  session.accessExp = exp;
  const now = nowUnix();
  const needsRefresh = exp ? exp <= now + minTtlSeconds : false;

  console.log("Token exp:", exp, "now:", now, "needsRefresh:", needsRefresh);

  if (!needsRefresh) {
    return { session };
  }

  try {
    const tokens = await backendRefresh(cfg.backend, session.tenant, session.tokens.refreshToken);
    const newExp = getJwtExp(tokens.accessToken);
    const updated: AuthSession = {
      ...session,
      tokens,
      accessExp: newExp,
    };
    const setCookie = await writeSessionHeader(cfg, updated);
    return { session: updated, setCookie };
  } catch (error) {
    // Refresh failed; keep session (token expired, but don't clear)
    return { session };
  }
}

/**
 * Create Next.js Route Handler for /api/auth/login (POST)
 * Expects body: { workspace, credentials, user?: any }
 * - workspace: required
 * - credentials: forwarded to backend login
 * - user (optional): if you already have user payload from backend, you can set it here
 */
export function createLoginRoute(cfg: PortableAuthConfig) {
  return async function POST(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const workspace: string = body?.workspace;
      const credentials: Record<string, any> = body?.credentials ?? {};
      const userFromClient = body?.user ?? null;

      if (!workspace || typeof workspace !== "string") {
        return Response.json({ ok: false, error: "workspace is required" }, { status: 400 });
      }

      const tenant: TenantContext = { workspace };
      const { tokens, user: userFromBackend } = await backendLogin(cfg.backend, tenant, credentials);

      const user = cfg.normalizeUser
        ? cfg.normalizeUser(userFromClient ?? userFromBackend ?? null, tenant)
        : (userFromClient ?? userFromBackend ?? null);

      const exp = getJwtExp(tokens.accessToken);
      const session: AuthSession = { tenant, user, tokens, accessExp: exp };

      const setCookie = await writeSessionHeader(cfg, session);
      const headers = new Headers({ "set-cookie": setCookie });

      return Response.json({ ok: true, user, tenant }, { status: 200, headers });
    } catch (e: any) {
      const msg = e?.message || "Login failed";
      return Response.json({ ok: false, error: msg }, { status: 401 });
    }
  };
}

/**
 * Route for /api/auth/logout (POST)
 */
export function createLogoutRoute(cfg: PortableAuthConfig) {
  return async function POST(req: Request): Promise<Response> {
    const session = await readSession(cfg, req);
    try {
      if (session) {
        await backendLogout(cfg.backend, session.tenant, { refreshToken: session.tokens?.refreshToken });
      }
    } finally {
      const setCookie = await clearSessionHeader(cfg);
      const headers = new Headers({ "set-cookie": setCookie });
      return Response.json({ ok: true }, { status: 200, headers });
    }
  };
}

/**
 * Route for /api/auth/session (GET)
 * Returns { user, tenant, authenticated }
 * Also refreshes tokens if necessary.
 */
export function createSessionRoute(cfg: PortableAuthConfig) {
  return async function GET(req: Request): Promise<Response> {
    const { session, setCookie } = await ensureFreshTokens(cfg, req);
    const headers = new Headers();
    if (setCookie) headers.set("set-cookie", setCookie);

    if (!session) {
      return Response.json({ authenticated: false, user: null, tenant: null }, { status: 200, headers });
    }

    // If token is expired and refresh failed, clear session
    if (session.accessExp && session.accessExp * 1000 < Date.now() && !setCookie) {
      const clearCookie = await clearSessionHeader(cfg);
      headers.set("set-cookie", clearCookie);
      return Response.json({ authenticated: false, user: null, tenant: null }, { status: 200, headers });
    }

    return Response.json(
      { 
        authenticated: true, 
        user: session.user, 
        tenant: session.tenant, 
        accessExp: session.accessExp ?? null 
      },
      { status: 200, headers },
    );
  };
}

/**
 * Utility for server-only usage (Server Components / actions / route handlers):
 * - reads session
 * - refreshes tokens if needed
 */
export async function getServerSession(cfg: PortableAuthConfig, req: Request): Promise<{ session: AuthSession | null; setCookie?: string }> {
  return ensureFreshTokens(cfg, req);
}
