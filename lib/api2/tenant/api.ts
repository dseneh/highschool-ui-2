import axios from "axios";
import type { Tenant } from "@/lib/tenant";

/**
 * Server-safe HTTP client for tenant API calls.
 * Uses plain axios without auth interceptors since tenant endpoints are public.
 * Safe to use in both client and server components.
 */
const apiBase = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Ensure trailing slashes for Django
apiBase.interceptors.request.use((config) => {
  if (config.url) {
    const [path, query] = config.url.split("?");
    const normalizedPath = path.endsWith("/") ? path : `${path}/`;
    config.url = query ? `${normalizedPath}?${query}` : normalizedPath;
  }
  return config;
});

/**
 * Fetch tenant by schema name (subdomain).
 * Public endpoint - no authentication required.
 */
export async function fetchTenantBySchema(schemaName: string): Promise<Tenant | null> {
  if (!schemaName) {
    return null;
  }

  try {
    const response = await apiBase.get<Tenant>(`/tenants/${schemaName}/`);
    return response.data;
  } catch (error) {
    console.debug(`Failed to fetch tenant: ${schemaName}`, error);
    return null;
  }
}

/**
 * Search for tenant by email address.
 * Uses the tenant search endpoint to find users across all tenants.
 */
export async function searchTenantByEmail(email: string): Promise<Tenant | null> {
  if (!email) {
    return null;
  }

  try {
    const response = await apiBase.get<any>(`/tenants/search/`, {
      params: { email },
    });

    // Assuming endpoint returns results array or tenant info
    if (Array.isArray(response.data?.results) && response.data.results.length > 0) {
      return response.data.results[0].tenant;
    } else if (response.data?.tenant) {
      return response.data.tenant;
    }
    return null;
  } catch (error) {
    console.debug(`Failed to search tenant by email: ${email}`, error);
    return null;
  }
}
