"use client";

import { useParams } from "next/navigation";
import { getSubdomainFromHost } from "@/lib/tenant";

export function useTenantSubdomain() {
  const params = useParams<{ subdomain?: string }>();
  const paramValue = Array.isArray(params?.subdomain)
    ? params?.subdomain[0]
    : params?.subdomain;
  const hostSubdomain =
    typeof window !== "undefined"
      ? getSubdomainFromHost(window.location.host)
      : null;

  return hostSubdomain ?? paramValue ?? "";
}
