import { NextResponse } from "next/server";
import { buildPortableAuthConfig } from "@/lib/portable-auth-config";
import { createLoginRoute } from "@/components/portable-auth/src/server";

/**
 * Wrapper around createLoginRoute to ensure cookies are set correctly
 * for subdomain support - removes .localhost domain in development
 */
function getSetCookieValues(response: Response): string[] {
  const header = response.headers.get("set-cookie");
  if (header) return [header];
  const getSetCookie = (response.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
  if (typeof getSetCookie === "function") {
    const values = getSetCookie();
    return Array.isArray(values) ? values : [];
  }
  return [];
}

export async function POST(req: Request) {
  const host = req.headers.get("host") ?? "";
  const authConfig = buildPortableAuthConfig(host);
  const loginHandler = createLoginRoute(authConfig);
  
  const response = await loginHandler(req);
  const responseData = await response.json();

  // Extract set-cookie header(s) from portable-auth response
  let setCookieValues = getSetCookieValues(response);

  if (setCookieValues.length > 0 && responseData.ok) {
    // IMPORTANT: Browsers don't support ".localhost" as a cookie domain
    // Remove Domain=.localhost from the cookie header in development
    if (process.env.NODE_ENV === "development") {
      setCookieValues = setCookieValues.map((value) =>
        value.replace(/;\s*Domain=\.localhost/gi, ""),
      );
    }
  }

  // Create response with modified Set-Cookie header
  const nextResponse = NextResponse.json(responseData, {
    status: response.status,
  });

  // Set the cookie header (modified if needed)
  if (setCookieValues.length > 0) {
    setCookieValues.forEach((value) => nextResponse.headers.append("set-cookie", value));
  }

  return nextResponse;
}
