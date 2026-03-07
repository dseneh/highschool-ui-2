import { NextResponse } from "next/server";
import { resolveTenantFromEmail, ensureTenant } from "@/lib/tenant";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, subdomain } = body as { email?: string; subdomain?: string };

  const tenantFromEmail = email ? await resolveTenantFromEmail(email) : null;
  const tenantFromSubdomain = subdomain ? await ensureTenant(subdomain) : null;

  const tenant = tenantFromSubdomain ?? tenantFromEmail ?? null;

  return NextResponse.json({ tenant });
}
