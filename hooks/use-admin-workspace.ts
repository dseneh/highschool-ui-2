"use client";

import { useAuth } from "@/components/portable-auth/src/client";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { useTenantStore } from "@/store/tenant-store";

const ADMIN_WORKSPACES = new Set(["admin", "public"]);

export function isAdminWorkspaceName(workspace?: string | null): boolean {
  if (!workspace) return false;
  return ADMIN_WORKSPACES.has(workspace.toLowerCase());
}

export function useAdminWorkspace() {
  const subdomain = useTenantSubdomain();
  const { tenant: authTenant } = useAuth();
  const storeTenant = useTenantStore((state) => state.tenant);

  const workspace =
    (storeTenant?.workspace ||
      storeTenant?.schema_name ||
      authTenant?.workspace ||
      subdomain ||
      "")
      .toLowerCase();

  const isAdminWorkspace = isAdminWorkspaceName(workspace);

  return {
    workspace,
    isAdminWorkspace,
    isSchoolWorkspace: !isAdminWorkspace,
  };
}
