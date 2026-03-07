import axios from "axios";
import { API_URL } from "@/config/utils";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

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
});
adminApiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
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
