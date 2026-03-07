export interface TenantDomain {
  id: number;
  domain: string;
  is_primary: boolean;
}

export interface TenantThemeConfig {
  dark_mode?: boolean;
  color_theme?: string;
  font_family?: string;
  border_radius?: string;
  primary_color?: string;
  [key: string]: any;
}

export type Tenant = {
  id: string;
  id_number?: string;
  name: string;
  short_name?: string;
  schema_name: string;
  domain?: string;
  domains?: TenantDomain[];
  funding_type?: string;
  school_type?: string;
  slogan?: string | null;
  emis_number?: string | null;
  description?: string | null;
  date_est?: string | null;
  address?: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  phone?: string;
  email?: string;
  website?: string;
  status?: string;
  active?: boolean;
  logo?: string;
  logo_shape?: "square" | "landscape";
  theme_color?: string | null;
  theme_config?: TenantThemeConfig;
  created_at?: string;
  updated_at?: string;
  workspace?: string;
  full_address?: string;
};



export function getRootDomain(host: string): string {
  const hostname = host.split(":")[0];
  if (!hostname) return "";
  if (hostname === "localhost" || hostname === "127.0.0.1") return hostname;
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.split(".");

    return parts.length > 2
      ? parts.slice(1).join(".")
      : hostname;
  }
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  return parts.slice(1).join(".");
}

/**
 * Extract subdomain from a host header value.
 * Returns null if on root domain.
 */
export function getSubdomainFromHost(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === "localhost" || hostname === "127.0.0.1") return null;

  if (hostname.endsWith(".localhost")) {
    const parts = hostname.split(".");
    return parts.length > 2 ? parts[0] : null;
  }

  const parts = hostname.split(".");
  if (parts.length <= 2) return null;
  const sub = parts[0];
  const reserved = new Set(["www", "app", "api", "cdn"]);
  return reserved.has(sub) ? null : sub;
}
/**
 * Strip the tenant subdomain prefix from a pathname.
 * e.g. "/dujar/employees" → "/employees"
 */
export function stripTenantFromPath(pathname: string, subdomain: string): string {
  if (!subdomain) return pathname;
  const prefix = `/${subdomain}`;
  if (pathname === prefix) return "/";
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}

/**
 * Fetch tenant by subdomain/schema name.
 * This is a server-side function for getting tenant info during server-side rendering.
 */
export async function ensureTenant(subdomain: string | null): Promise<Tenant> {
  if (!subdomain) {
    return getDefaultTenant();
  }

  try {
    const { fetchTenantBySchema } = await import("@/lib/api2/tenant/api");
    const tenant = await fetchTenantBySchema(subdomain);
    return tenant || getDefaultTenant();
  } catch (error) {
    console.debug("Failed to fetch tenant:", error);
    return getDefaultTenant();
  }
}

/**
 * Resolve tenant by email address.
 * Searches across all tenants for a user with the given email.
 */
export async function resolveTenantFromEmail(email: string): Promise<Tenant | null> {
  if (!email) {
    return null;
  }

  try {
    const { searchTenantByEmail } = await import("@/lib/api2/tenant/api");
    const tenant = await searchTenantByEmail(email);
    return tenant || null;
  } catch (error) {
    console.debug("Failed to search tenant by email:", error);
    return null;
  }
}

/**
 * Get a default/fallback tenant for development/public pages.
 */
function getDefaultTenant(): Tenant {
  return {
    id: "default",
    name: "EzySchool",
    schema_name: "public",
    short_name: "EZY",
  };
}

/**
 * Get a basic tenant object from a subdomain/schema name.
 * Useful for client-side tenant lookups without making API calls.
 * Returns a minimal tenant object suitable for store assignment.
 */
export function getTenantFromSubdomain(schemaName: string | null): Tenant | null {
  if (!schemaName) {
    return null;
  }

  // Return a basic tenant object with the schema_name
  // The full tenant details will be loaded via ensureTenant() on the server
  return {
    id: schemaName,
    name: schemaName,
    schema_name: schemaName,
    short_name: schemaName.substring(0, 3).toUpperCase(),
  };
}

/**
 * Build the root login URL (on the root domain, no subdomain).
 */
export function buildRootLoginUrl(): string {
  if (typeof window === "undefined") return "/login";
  const { protocol, host } = window.location;
  const rootDomain = getRootDomain(host);
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  return `${protocol}//${rootDomain}${port}/login`;
}

/**
 * Change the workspace context by navigating to the new subdomain.
 */
export function changeWorkspace(targetSubdomain: string) {
  if (!targetSubdomain || typeof window === "undefined") return;
  
  const { protocol, host } = window.location;
  const hostname = host.split(":")[0];
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  
  // Determine new hostname
  let newHostname = hostname;
  
  if (hostname.endsWith(".localhost") || hostname === "localhost") {
    // Dev env logic
    if (hostname === "localhost") {
      newHostname = `${targetSubdomain}.localhost`;
    } else {
      // e.g. current.localhost -> target.localhost
      // Reset to base if needed, or just replace first part
      // Assuming simplistic structure <subdomain>.localhost
      newHostname = `${targetSubdomain}.localhost`;
    }
  } else {
     // Prod/Staging env logic
     // e.g. school.domain.com -> target.domain.com
     const parts = hostname.split(".");
     if (parts.length >= 3) {
       // Has subdomain
       parts[0] = targetSubdomain;
       newHostname = parts.join(".");
     } else {
       // No subdomain (root) -> prepend
       newHostname = `${targetSubdomain}.${hostname}`;
     }
  }
  
  window.location.href = `${protocol}//${newHostname}${port}`;
}
