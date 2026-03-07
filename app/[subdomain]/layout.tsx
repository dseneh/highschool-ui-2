import { headers } from "next/headers";
import { TenantProvider } from "@/components/tenant-provider";
import { getSubdomainFromHost, ensureTenant } from "@/lib/tenant";

export default async function SubdomainRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain: paramSubdomain } = await params;
  const hostHeaders = await headers();
  const host = hostHeaders.get("host");
  const hostSub = getSubdomainFromHost(host);
  const subdomain = hostSub ?? paramSubdomain;
  const tenant = await ensureTenant(subdomain);

  return <TenantProvider initialTenant={tenant}>{children}</TenantProvider>;
}
