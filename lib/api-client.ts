import axios from "axios";
import type { AxiosError } from "axios";
import { getSubdomainFromWindow, extractWorkspaceFromPath } from "@/lib/utils/get-subdomain";

/**
 * Key used to persist the current tenant subdomain in localStorage.
 */
export const TENANT_STORAGE_KEY = "ezy:tenant";

/**
 * Base URL for the Django API.
 * Defaults to local development server.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

/**
 * Fetch access token from Next.js API route.
 * This endpoint reads the session from the encrypted cookie and returns the token.
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * Reusable Axios instance pre-configured with:
 *  - baseURL pointing at the Django API
 *  - automatic `X-Tenant` header derived from subdomain
 *  - automatic `Authorization: Bearer {token}` header
 *  - JSON content-type
 *  - credentials included
 */
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

/**
 * Request interceptor:
 * 1. Fetches access token from session endpoint
 * 2. Adds Authorization: Bearer {token} header
 * 3. Adds X-Tenant header from subdomain
 * 4. Ensures URLs end with trailing slash (Django convention)
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Add Authorization header for authenticated requests
    const accessToken = typeof window !== "undefined" ? await getAccessToken() : null;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add tenant header from subdomain or localStorage
    if (typeof window !== "undefined") {
      const subdomainFromWindow = getSubdomainFromWindow();
      const workspaceFromPath = extractWorkspaceFromPath(config.url || "");
      const tenantFromStorage = localStorage.getItem(TENANT_STORAGE_KEY);

      const tenant = subdomainFromWindow || workspaceFromPath || tenantFromStorage;
      if (tenant) {
        config.headers["x-tenant"] = tenant;
      }
    }

    // Ensure trailing slash before query params (Django convention)
    if (config.url) {
      const [path, query] = config.url.split("?");
      const normalizedPath = path.endsWith("/") ? path : `${path}/`;
      config.url = query ? `${normalizedPath}?${query}` : normalizedPath;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor:
 * Handles 401 errors (token expired/invalid)
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Could trigger refresh or redirect to login
      console.warn("Unauthorized request - token may be expired");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
