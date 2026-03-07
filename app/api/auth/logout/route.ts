import { createLogoutRoute } from "@/components/portable-auth/src/server";
import { buildPortableAuthConfig } from "@/lib/portable-auth-config";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const host = req.headers.get("host") ?? "";
  const authConfig = buildPortableAuthConfig(host);
  const logoutHandler = createLogoutRoute(authConfig);
  
  try {
    // Call the portable-auth logout handler to clear backend session
    await logoutHandler(req);
  } catch (error) {
    console.error("Backend logout error:", error);
  }
  
  // Create clear cookie header - use simple approach that works across all domains
  const cookieName = authConfig.cookie.name || "pa_session";
  const isLocal = host.includes("localhost") || host === "127.0.0.1";
  
  // Clear cookie with minimal attributes - just ensure HttpOnly and Path match original
  // Don't set domain - let browser use current domain
  // For production, include Secure flag; for localhost, omit it
  const securePart = isLocal ? "" : "; Secure";
  const clearCookie = `${cookieName}=; Path=/; Max-Age=0; HttpOnly${securePart}; SameSite=Lax`;
    
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "set-cookie": clearCookie,
    },
  });
};
