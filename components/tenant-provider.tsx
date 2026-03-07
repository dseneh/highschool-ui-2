"use client";

import { useEffect } from "react";
import type { Tenant } from "@/lib/tenant";
import { useTenantStore } from "@/store/tenant-store";

export function TenantProvider({
  initialTenant,
  children,
}: {
  initialTenant: Tenant | null;
  children: React.ReactNode;
}) {
  const setTenant = useTenantStore((state) => state.setTenant);

  useEffect(() => {
    if (initialTenant) {
      // Only update if tenant actually changed
      const currentTenant = useTenantStore.getState().tenant;
      if (currentTenant?.schema_name !== initialTenant.schema_name) {
        setTenant(initialTenant);
      }
    }
  }, [initialTenant, setTenant]);

  return <>{children}</>;
}
