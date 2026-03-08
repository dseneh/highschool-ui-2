import { buildPortableAuthConfig } from "@/lib/portable-auth-config";
import { createSessionRoute, readSession } from "@/components/portable-auth/src/server";
import { NextResponse } from "next/server";
import { API_URL } from "@/config/utils";

const CURRENT_USER_PATH = "/auth/users/current/";

/**
 * Wrapper around createSessionRoute to ensure cookies are set correctly
 * for subdomain support - removes .localhost domain in development
 */
function getSetCookieValues(response: Response): string[] {
  const header = response.headers.get("set-cookie");
  if (header) return [header];
  const getSetCookie = (response.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
  if (typeof getSetCookie === "function") {
    const values = getSetCookie.call(response.headers);
    return Array.isArray(values) ? values : [];
  }
  return [];
}

export async function GET(req: Request) {
  try {
    const host = req.headers.get("host") ?? "";
    const authConfig = buildPortableAuthConfig(host);
    const sessionHandler = createSessionRoute(authConfig);
    const response = await sessionHandler(req);

    const payload = await response.clone().json().catch(() => null);

    if (payload?.authenticated === true && payload?.tenant?.workspace) {
      const session = await readSession(authConfig, req).catch(() => null);
      const accessToken = session?.tokens?.accessToken;

      if (accessToken) {
        const currentUserRes = await fetch(`${API_URL}${CURRENT_USER_PATH}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-tenant": payload.tenant.workspace,
          },
          cache: "no-store",
        }).catch(() => null);

        if (currentUserRes?.ok) {
          const freshUser = await currentUserRes.json().catch(() => null);
          if (freshUser) {
            payload.user = freshUser;
          }
        }
      }
    }

    // Extract set-cookie header(s) if present (for token refresh)
    let setCookieValues = getSetCookieValues(response);

    if (setCookieValues.length > 0) {
      // Remove Domain=.localhost from the cookie string in development
      if (process.env.NODE_ENV === "development") {
        setCookieValues = setCookieValues.map((value) =>
          value.replace(/;\s*Domain=\.localhost/gi, ""),
        );
      }
    }

    if (setCookieValues.length === 0) {
      if (payload) {
        return NextResponse.json(payload, { status: response.status });
      }
      return response;
    }

    const headers = new Headers(response.headers);
    headers.delete("set-cookie");
    setCookieValues.forEach((value) => headers.append("set-cookie", value));
    return new NextResponse(payload ? JSON.stringify(payload) : response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Error handling /api/auth/session:", error);
    return NextResponse.json(
      { authenticated: false, user: null, tenant: null },
      { status: 500 },
    );
  }
}
