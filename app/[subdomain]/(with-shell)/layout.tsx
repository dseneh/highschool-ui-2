import { headers } from "next/headers";
import { TenantProvider } from "@/components/tenant-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ensureTenant, getSubdomainFromHost } from "@/lib/tenant";

export default async function SubdomainShellLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain: paramSubdomain } = await params;
  const hostHeaders = await headers();
  const host = hostHeaders.get("host");
  const hostSubdomain = getSubdomainFromHost(host);
  const subdomain = hostSubdomain ?? paramSubdomain;
  const tenant = await ensureTenant(subdomain);

  return (
    <TenantProvider initialTenant={tenant}>
      <DashboardShell>{children}</DashboardShell>
    </TenantProvider>
  );
}
