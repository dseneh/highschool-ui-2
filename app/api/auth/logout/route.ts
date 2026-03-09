import { createLogoutRoute } from "@/components/portable-auth/src/server";
import { buildPortableAuthConfig } from "@/lib/portable-auth-config";

export const POST = async (req: Request) => {
  const host = req.headers.get("host") ?? "";
  const authConfig = buildPortableAuthConfig(host);
  const logoutHandler = createLogoutRoute(authConfig);
  
  // The logoutHandler already:
  // 1. Calls backend logout endpoint
  // 2. Clears session cookie with CORRECT domain attribute (matching login)
  // 3. Returns proper response with Set-Cookie header
  return logoutHandler(req);
};
