import { NextResponse, type NextRequest } from "next/server";

const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "cdn"]);
const PUBLIC_FILE = /\.[^/]+$/;

// Vercel platform domains that should be treated as root domains (no subdomain extraction)
const VERCEL_PLATFORM_DOMAINS = [".vercel.app", ".vercel.sh", ".now.sh"];

function splitHost(host: string) {
  const [hostname, port] = host.split(":");
  return { hostname: hostname.toLowerCase(), port };
}

function isVercelPlatformDomain(hostname: string) {
  return VERCEL_PLATFORM_DOMAINS.some((domain) => hostname.endsWith(domain));
}

function getSubdomain(hostname: string) {
  if (!hostname) return null;
  if (hostname === "localhost" || hostname === "127.0.0.1") return null;
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.split(".");
    return parts.length > 1 ? parts[0] : null;
  }
  
  // Ignore Vercel platform domains - treat them as root domains
  // e.g., project-name.vercel.app should NOT extract "project-name" as subdomain
  if (isVercelPlatformDomain(hostname)) {
    return null;
  }
  
  const parts = hostname.split(".");
  if (parts.length <= 2) return null;
  const subdomain = parts[0];
  return RESERVED_SUBDOMAINS.has(subdomain) ? null : subdomain;
}

function getRootDomain(hostname: string) {
  if (!hostname) return "";
  if (hostname === "localhost" || hostname === "127.0.0.1") return hostname;
  if (hostname.endsWith(".localhost")) return "localhost";
  
  // For Vercel platform domains, return the full hostname as root
  if (isVercelPlatformDomain(hostname)) {
    return hostname;
  }
  
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  return parts.slice(1).join(".");
}

function isLocalhost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  );
}

function isIpAddress(hostname: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";
  const { hostname, port } = splitHost(host);
  const subdomain = getSubdomain(hostname);
  const rootDomain = getRootDomain(hostname);

  if (subdomain) {
    const prefix = `/${subdomain}`;
    if (pathname === prefix) {
      return NextResponse.next();
    }

    // Special case: admin subdomain uses /admin/* namespace routes.
    // We still need to rewrite /admin/... to /admin/admin/... for [subdomain] routing.
    if (pathname.startsWith(`${prefix}/`) && subdomain !== "admin") {
      return NextResponse.next();
    }

    const rewriteUrl = nextUrl.clone();
    rewriteUrl.pathname = `${prefix}${pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (!isIpAddress(hostname) && hostname !== "127.0.0.1") {
    const [_, firstSegment, ...rest] = pathname.split("/");
    if (firstSegment && firstSegment !== "login" && !RESERVED_SUBDOMAINS.has(firstSegment)) {
      const redirectUrl = nextUrl.clone();
      redirectUrl.hostname = `${firstSegment}.${rootDomain}`;
      if (port) redirectUrl.port = port;
      const nextPath = rest.length ? `/${rest.join("/")}` : "/";
      redirectUrl.pathname = nextPath;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

export default proxy;
