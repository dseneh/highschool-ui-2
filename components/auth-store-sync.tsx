"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/portable-auth/src/client";
import { useAuthStore } from "@/store/auth-store";
import { User } from "@/types/auth";
import { useTenantStore } from "@/store/tenant-store";
import { getTenantInfo } from "@/lib/api2/tenant-service";
import { Tenant } from "@/lib/tenant";

function normalizeWorkspace(value?: string | null): string {
  const workspace = (value ?? "").toLowerCase();
  // Backend maps /tenants/admin/ to the public tenant.
  return workspace === "admin" ? "public" : workspace;
}

export function AuthStoreSync() {
  const { user, authenticated, tenant: authTenant } = useAuth();
  const { login, logout, user: storedUser } = useAuthStore();
  const { setTenant, tenant: storedTenant } = useTenantStore();
  const requestedWorkspace = authTenant?.workspace;

  // Sync Auth User to Store
  useEffect(() => {
    if (authenticated && user && JSON.stringify(user) !== JSON.stringify(storedUser)) {
      login(user as User);
    } else if (!authenticated && storedUser) {
      logout();
      setTenant(null);
    }
  }, [user, authenticated, login, logout, storedUser, setTenant]);

  useEffect(() => {
    async function fetchTenant() {
        if (!authenticated || !requestedWorkspace) return;

        const normalizedRequestedWorkspace = normalizeWorkspace(requestedWorkspace);
        const normalizedStoredWorkspace = normalizeWorkspace(
          storedTenant?.workspace || storedTenant?.schema_name
        );

        if (normalizedStoredWorkspace === normalizedRequestedWorkspace) return;

        try {
            const tenantInfo = await getTenantInfo(requestedWorkspace);
            setTenant(tenantInfo as Tenant);
        } catch (error) {
            console.error("Failed to fetch tenant info:", error);
            
            const userTenant = storedUser?.tenants?.find(
              (t) => normalizeWorkspace(t.schema_name) === normalizedRequestedWorkspace
            );
            if (userTenant) {
                const fallbackTenant: Tenant = {
                    id: userTenant.id,
                    name: userTenant.name,
                    schema_name: userTenant.schema_name,
                    workspace: requestedWorkspace,
                    logo: userTenant.logo,
                    active: true,
                };
                setTenant(fallbackTenant);
            }
        }
    }
    
    fetchTenant();
  }, [authenticated, requestedWorkspace, storedTenant, setTenant, storedUser]);

  return null;
}
