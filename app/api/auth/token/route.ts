import { NextResponse } from "next/server";
import { buildPortableAuthConfig } from "@/lib/portable-auth-config";
import { getServerSession } from "@/components/portable-auth/src/server";

/**
 * Token endpoint - returns access token for client-side API calls.
 * This allows the browser to call Django API directly while keeping tokens in HttpOnly cookie.
 */
export async function GET(req: Request) {
  try {
    const host = req.headers.get("host") ?? "";
    const authConfig = buildPortableAuthConfig(host);
    const { session, setCookie } = await getServerSession(authConfig, req);

    // Normalize cookie domain in development
    let setCookieHeader = setCookie ?? null;
    if (setCookieHeader && process.env.NODE_ENV === "development") {
      setCookieHeader = setCookieHeader.replace(/;\s*Domain=\.localhost/gi, "");
    }

    if (!session || !session.tokens?.accessToken) {
      const response = NextResponse.json(
        { accessToken: null, user: null, error: "No valid session" },
        { status: 401 }
      );
      if (setCookieHeader) {
        response.headers.set("set-cookie", setCookieHeader);
      }
      return response;
    }

    const response = NextResponse.json(
      {
        accessToken: session.tokens.accessToken,
        user: session.user ?? null,
      },
      { status: 200 }
    );
    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader);
    }
    return response;
  } catch (error) {
    console.error("Error reading auth session in /api/auth/token:", error);
    return Response.json(
      { accessToken: null, user: null, error: "Server error" },
      { status: 500 }
    );
  }
}
