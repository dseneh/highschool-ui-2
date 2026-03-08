import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getSubdomainFromHost } from "@/lib/tenant";

export default async function AdminRoutesLayout({
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
  const workspace = (hostSubdomain ?? paramSubdomain ?? "").toLowerCase();

  // Admin routes are only available on admin/public workspaces.
  if (workspace !== "admin" && workspace !== "public") {
    notFound();
  }

  return children;
}
