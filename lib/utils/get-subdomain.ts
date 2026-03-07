/**
 * Client-side utility to extract subdomain from the browser window.
 * Works with both localhost and production domains.
 * 
 * Examples:
 * - schoolname.localhost:3000 → "schoolname"
 * - schoolname.ezyschool.com → "schoolname"
 * - localhost:3000 → null
 * - ezyschool.com → null
 */
export function getSubdomainFromWindow(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("127.") ||
    hostname.endsWith(".localhost");

  if (isLocalhost) {
    // Check for subdomain.localhost pattern
    const parts = hostname.split(".");
    if (parts.length > 1 && parts[parts.length - 1] === "localhost") {
      const subdomain = parts[0];
      if (subdomain !== "localhost" && subdomain !== "www") {
        return subdomain;
      }
    }
    return null;
  }

  // Production: Extract subdomain from hostname
  const parts = hostname.split(".");
  if (parts.length > 2) {
    const subdomain = parts[0];
    if (subdomain !== "www") {
      return subdomain;
    }
  }

  return null;
}

/**
 * Extract workspace/tenant from URL path.
 * Useful for extracting tenant from API URLs.
 * 
 * Examples:
 * - "/api/v1/students/" → null
 * - "/s/schoolname/students/" → "schoolname"
 */
export function extractWorkspaceFromPath(url: string): string | null {
  if (!url) return null;

  const pathParts = url.split("/").filter(Boolean);
  // Check for /s/[workspace]/ pattern from v1
  if (pathParts.length > 1 && pathParts[0] === "s") {
    return pathParts[1];
  }

  return null;
}
