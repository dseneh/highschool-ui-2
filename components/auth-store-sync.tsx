"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/portable-auth/src/client";
import { useAuthStore } from "@/store/auth-store";
import { User } from "@/types/auth";
import { useTenantStore } from "@/store/tenant-store";
import { getTenantInfo } from "@/lib/api2/tenant-service";
import { Tenant } from "@/lib/tenant";

export function AuthStoreSync() {
  const { user, authenticated, tenant: authTenant } = useAuth();
  const { login, logout, user: storedUser } = useAuthStore();
  const { setTenant, tenant: storedTenant } = useTenantStore();

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
        if (!authenticated || !authTenant?.workspace) return;
        
        if (storedTenant?.schema_name === authTenant.workspace) return;

        try {
            const tenantInfo = await getTenantInfo(authTenant.workspace);
            setTenant(tenantInfo as Tenant);
        } catch (error) {
            console.error("Failed to fetch tenant info:", error);
            
            const userTenant = storedUser?.tenants?.find(t => t.schema_name === authTenant.workspace);
            if (userTenant) {
                const fallbackTenant: Tenant = {
                    id: userTenant.id,
                    name: userTenant.name,
                    schema_name: userTenant.schema_name,
                    workspace: authTenant.workspace,
                    logo: userTenant.logo,
                    active: true,
                };
                setTenant(fallbackTenant);
            }
        }
    }
    
    fetchTenant();
  }, [authenticated, authTenant, storedTenant, setTenant, storedUser]);

  return null;
}
