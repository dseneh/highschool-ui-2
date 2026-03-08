import axios from "axios";
import { API_URL } from "@/config/utils";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

let adminTokenPromise: Promise<string | null> | null = null;
let adminTokenCache: { token: string | null; timestamp: number } | null = null;
const ADMIN_TOKEN_CACHE_TTL = 5000;

async function getAdminAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (adminTokenCache && Date.now() - adminTokenCache.timestamp < ADMIN_TOKEN_CACHE_TTL) {
    return adminTokenCache.token;
  }

  if (adminTokenPromise) {
    return adminTokenPromise;
  }

  adminTokenPromise = (async () => {
    try {
      const tokenRes = await fetch("/api/auth/token", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const token = tokenData?.accessToken ?? null;
        adminTokenCache = { token, timestamp: Date.now() };
        return token;
      }
    } catch {
      // Fall back to localStorage token for legacy auth flows.
    } finally {
      adminTokenPromise = null;
    }

    const fallbackToken = localStorage.getItem("accessToken");
    adminTokenCache = { token: fallbackToken, timestamp: Date.now() };
    return fallbackToken;
  })();

  return adminTokenPromise;
}

function ensureTrailingSlash(url: string): string {
  const [path, query] = url.split("?");
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

function addTrailingSlashInterceptor(instance: ReturnType<typeof axios.create>) {
  instance.interceptors.request.use((config) => {
    if (config.url) {
      config.url = ensureTrailingSlash(config.url);
    }
    return config;
  });
}

/** Public JSON client for unauthenticated endpoints. */
export const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: JSON_HEADERS,
});

/** Public client that automatically normalizes Django-style trailing slashes. */
export const djangoPublicApiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: JSON_HEADERS,
});
addTrailingSlashInterceptor(djangoPublicApiClient);

/** Public client that injects X-Tenant from localStorage when available. */
export const tenantScopedPublicApiClient = axios.create({
  baseURL: API_URL,
  headers: JSON_HEADERS,
});
tenantScopedPublicApiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const tenantId = localStorage.getItem("tenant_id");
    if (tenantId) {
      config.headers["X-Tenant"] = tenantId;
    }
  }
  return config;
});

/** Admin client that adds Bearer token and strips tenant header. */
export const adminApiClient = axios.create({
  baseURL: API_URL,
  headers: JSON_HEADERS,
  withCredentials: true,
});
adminApiClient.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const token = await getAdminAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (config.headers) {
    delete config.headers["X-Tenant"];
    delete config.headers["x-tenant"];
  }

  return config;
});

/**
 * Authenticated client for use-axios-auth hook.
 * Features:
 * - Extended timeout for file uploads (2 minutes)
 * - Trailing slash normalization
 * - withCredentials for cookie-based sessions
 * - Auth headers added dynamically by the hook
 */
export const authenticatedApiClient = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes for file uploads
  withCredentials: true,
  // No default Content-Type to allow automatic detection for FormData
});
addTrailingSlashInterceptor(authenticatedApiClient);
