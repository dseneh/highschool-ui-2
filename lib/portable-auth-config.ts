import type { PortableAuthConfig } from "@/components/portable-auth/src/types";
import { API_URL, AUTH_SECRET } from "@/config/utils";
import { getRootDomain } from "@/lib/tenant";

const BACKEND_BASE_URL = API_URL.replace("/api/v1", ""); // Get base URL without /api/v1

/**
 * Build a PortableAuthConfig for the current host.
 * The cookie domain is set to the root domain so the session cookie is
 * shared across all tenant subdomains.
 * 
 * This configuration connects to the real Django backend at localhost:8000
 */
export function buildPortableAuthConfig(host: string): PortableAuthConfig {
  const rootDomain = getRootDomain(host);
  const isLocal =
    rootDomain === "localhost" ||
    rootDomain === "127.0.0.1" ||
    rootDomain.endsWith(".localhost");

  return {
    backend: {
      baseUrl: BACKEND_BASE_URL,
      loginPath: "/api/v1/auth/login/",
      refreshPath: "/api/v1/auth/token/refresh/",
      logoutPath: "/api/v1/auth/logout/",
      buildHeaders: (tenant) => {
        const headers: Record<string, string> = {};
        // Add tenant identifier to request headers
        if (tenant?.workspace) {
          headers["x-tenant"] = tenant.workspace;
        }
        return headers;
      },
      parseLoginResponse: (data) => {
        // Django returns { access, refresh, user }
        return {
          tokens: {
            accessToken: data.access ?? data.accessToken,
            refreshToken: data.refresh ?? data.refreshToken,
          },
          user: data.user ?? null,
        };
      },
      parseRefreshResponse: (data) => {
        return {
          tokens: {
            accessToken: data.access ?? data.accessToken,
            refreshToken: data.refresh ?? data.refreshToken,
          },
        };
      },
    },
    cookie: {
      name: "pa_session",
      secret: AUTH_SECRET,
      // In development: ".localhost" allows cookies across subdomains
      // In production: use root domain with leading dot
      domain: isLocal ? ".localhost" : `.${rootDomain}`,
      path: "/",
      httpOnly: true,
      secure: !isLocal,
      sameSite: "Lax",
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    },
    normalizeUser: (user, tenant) => {
      if (!user) return null;
      
      // Standardize user object keys to camelCase for frontend consistency
      // IMPORTANT: We preserve all original fields by spreading ...user first
      const normalized = {
        ...user,
        // Map common backend fields (snake_case) to frontend standard (camelCase)
        firstName: user.first_name || user.firstName,
        lastName: user.last_name || user.lastName,
        avatar: user.photo || user.avatar,
        // Mark this as the current user (used for badge display and protection)
        is_current_user: true,
        // Ensure workspace is attached
        workspace: tenant.workspace,
      };
      
      return normalized;
    },
    resolveTenantFromRequest: (req) => {
      // Extract tenant from subdomain or headers
      const host = req.headers.get("host") ?? "";
      const hostname = host.split(":")[0];
      
      // Check for subdomain (e.g., schoolname.localhost:3000)
      if (hostname.includes("localhost")) {
        const parts = hostname.split(".");
        if (parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "www") {
          return { workspace: parts[0] };
        }
      } else {
        // Production: check for subdomain
        const rootDomain = hostname.split(".").slice(-2).join(".");
        if (rootDomain && hostname !== rootDomain && hostname !== `www.${rootDomain}`) {
          const subdomain = hostname.replace(`.${rootDomain}`, "");
          if (subdomain && subdomain !== "www") {
            return { workspace: subdomain };
          }
        }
      }
      
      return null;
    },
  };
}
