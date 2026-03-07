import * as React from "react";
import type { AuthUser, TenantContext } from "./types";

export type AuthState = {
  loading: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  tenant: TenantContext | null;
  accessExp?: number | null;
};

export type ClientAuthConfig = {
  sessionUrl?: string;
  loginUrl?: string;
  logoutUrl?: string;
};

const defaultCfg: Required<ClientAuthConfig> = {
  sessionUrl: "/api/auth/session",
  loginUrl: "/api/auth/login/",
  logoutUrl: "/api/auth/logout/",
};

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  login: (input: { workspace: string; credentials: Record<string, any>; user?: any }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
  config,
  initial,
}: {
  children: React.ReactNode;
  config?: ClientAuthConfig;
  initial?: Partial<AuthState>;
}) {
  const cfg = { ...defaultCfg, ...(config ?? {}) };

  const [state, setState] = React.useState<AuthState>({
    loading: true,
    authenticated: false,
    user: null,
    tenant: null,
    accessExp: null,
    ...initial,
  });

  const refresh = React.useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const res = await fetch(cfg.sessionUrl, { method: "GET", credentials: "include", cache: "no-store" });
    const data = await safeJson(res);

    if (data?.authenticated) {
      setState({
        loading: false,
        authenticated: true,
        user: data.user ?? null,
        tenant: data.tenant ?? null,
        accessExp: data.accessExp ?? null,
      });
    } else {
      setState({ loading: false, authenticated: false, user: null, tenant: null, accessExp: null });
    }
  }, [cfg.sessionUrl]);

  React.useEffect(() => {
    // load session once on mount
    void refresh();
  }, [refresh]);

  const login: AuthContextValue["login"] = React.useCallback(
    async ({ workspace, credentials, user }) => {
      const res = await fetch(cfg.loginUrl, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workspace, credentials, user }),
      });
      const data = await safeJson(res);
      if (!res.ok || !data?.ok) {
        const err = data?.error || "Login failed";
        return { ok: false, error: err };
      }
      // Update state with the user from login response
      // NOTE: Ensure keys match what the server sends back (normalized or raw)
      setState({
        loading: false,
        authenticated: true,
        user: data.user ?? null,
        tenant: data.tenant ?? null,
        accessExp: null,
      });
      return { ok: true };
    },
    [cfg.loginUrl],
  );

  const logout = React.useCallback(async () => {
    await fetch(cfg.logoutUrl, { method: "POST", credentials: "include" }).catch(() => void 0);
    setState({ loading: false, authenticated: false, user: null, tenant: null, accessExp: null });
    
    // Redirect to login page after logout completes
    if (typeof window !== "undefined") {
      // Extract root domain and redirect to login
      const host = window.location.host;
      const isLocalhost = host.includes("localhost");
      
      if (isLocalhost) {
        // On localhost, redirect to the same subdomain's login page
        window.location.href = `${window.location.protocol}//${host}/login`;
      } else {
        // On production, redirect to root domain login
        const rootDomain = host.split(".").slice(-2).join(".");
        window.location.href = `${window.location.protocol}//${rootDomain}/login`;
      }
    }
  }, [cfg.logoutUrl]);

  const setUser = React.useCallback((user: AuthUser | null) => {
    // purely client-side state override; if you need persistence, set user during login (preferred)
    setState((s) => ({ ...s, user }));
  }, []);

  const value: AuthContextValue = { ...state, refresh, login, logout, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}

/**
 * Tiny helper for non-React usage
 */
export async function fetchSession(config?: ClientAuthConfig): Promise<AuthState> {
  const cfg = { ...defaultCfg, ...(config ?? {}) };
  const res = await fetch(cfg.sessionUrl, { method: "GET", credentials: "include", cache: "no-store" });
  const data = await safeJson(res);
  if (data?.authenticated) {
    return { loading: false, authenticated: true, user: data.user ?? null, tenant: data.tenant ?? null, accessExp: data.accessExp ?? null };
  }
  return { loading: false, authenticated: false, user: null, tenant: null, accessExp: null };
}
