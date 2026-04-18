import type { BackendAuthConfig, JwtPair, TenantContext } from "./types";

function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl.endsWith("/") && !path.startsWith("/")) return `${baseUrl}/${path}`;
  if (baseUrl.endsWith("/") && path.startsWith("/")) return `${baseUrl}${path.slice(1)}`;
  return `${baseUrl}${path}`;
}

export async function backendLogin(
  cfg: BackendAuthConfig,
  tenant: TenantContext,
  credentials: Record<string, any>,
  extraHeaders?: Record<string, string>,
): Promise<{ tokens: JwtPair; user: any | null }> {
  const url = joinUrl(cfg.baseUrl, cfg.loginPath);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(cfg.buildHeaders?.(tenant) ?? {}),
    ...(extraHeaders ?? {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(credentials),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Backend login failed (${res.status}): ${text || res.statusText}`);
  }

  const data = await res.json();
  const parsed = cfg.parseLoginResponse(data);
  if (!parsed?.tokens?.accessToken || !parsed?.tokens?.refreshToken) {
    throw new Error("parseLoginResponse must return { tokens: { accessToken, refreshToken } }");
  }
  return { tokens: parsed.tokens, user: parsed.user ?? null };
}

export async function backendRefresh(
  cfg: BackendAuthConfig,
  tenant: TenantContext,
  refreshToken: string,
): Promise<JwtPair> {
  const url = joinUrl(cfg.baseUrl, cfg.refreshPath);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(cfg.buildHeaders?.(tenant) ?? {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Backend refresh failed (${res.status}): ${text || res.statusText}`);
  }

  const data = await res.json();
  const parsed = cfg.parseRefreshResponse(data);
  if (!parsed?.tokens?.accessToken || !parsed?.tokens?.refreshToken) {
    throw new Error("parseRefreshResponse must return { tokens: { accessToken, refreshToken } }");
  }
  return parsed.tokens;
}

export async function backendLogout(
  cfg: BackendAuthConfig,
  tenant: TenantContext,
  tokens: { refreshToken?: string } | null,
  extraHeaders?: Record<string, string>,
): Promise<void> {
  if (!cfg.logoutPath) return;
  const url = joinUrl(cfg.baseUrl, cfg.logoutPath);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(cfg.buildHeaders?.(tenant) ?? {}),
    ...(extraHeaders ?? {}),
  };
  // best effort
  await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ refresh: tokens?.refreshToken }),
    cache: "no-store",
  }).catch(() => void 0);
}
