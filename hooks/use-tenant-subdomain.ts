"use client";

import { useParams } from "next/navigation";
import { useTenantStore } from "@/store/tenant-store";

export function useTenantSubdomain() {
  const tenant = useTenantStore((state) => state.tenant);
  const params = useParams<{ subdomain?: string }>();
  const paramValue = Array.isArray(params?.subdomain)
    ? params?.subdomain[0]
    : params?.subdomain;

  return tenant?.schema_name ?? paramValue ?? "";
}
