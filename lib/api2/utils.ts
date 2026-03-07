"use client";
import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTenantStore } from "@/store/tenant-store";
import { getSubdomainFromHost } from "@/lib/tenant";

export function useWorkspaceId() {
  const params = useParams();
  const tenant = useTenantStore((state) => state.tenant);

  // Memoize to avoid recalculation on every render
  const workspaceId = useMemo(() => {
    // Priority 1: URL params (/[subdomain]/...)
    if (params?.subdomain && typeof params.subdomain === 'string') {
      return params.subdomain;
    }

    // Priority 2: Tenant from store (multi-tenant context)
    if (tenant?.schema_name) {
      return tenant.schema_name;
    }

    // Priority 3: Extract from window location
    if (typeof window !== 'undefined') {
      const subdomain = getSubdomainFromHost(window.location.host);
      if (subdomain) {
        return subdomain;
      }
    }

    return '';
  }, [params, tenant]);

  return workspaceId;
}


export function useApiQuery(queryKey: any[], queryFn: () => Promise<any>, options = {}) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  })
}

export function useApiMutation(mutationFn: (data?: any) => Promise<any>, options = {}) {
  return useMutation({
    mutationFn,
    ...options,
  })
}
