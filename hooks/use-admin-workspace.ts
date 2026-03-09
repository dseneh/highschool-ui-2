"use client";

import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

const ADMIN_WORKSPACES = new Set(["admin", "public"]);

export function isAdminWorkspaceName(workspace?: string | null): boolean {
  if (!workspace) return false;
  return ADMIN_WORKSPACES.has(workspace.toLowerCase());
}

export function useAdminWorkspace() {
  const subdomain = useTenantSubdomain();

  // URL subdomain is the only source of truth for active workspace.
  const workspace = (subdomain || "").toLowerCase();

  const isAdminWorkspace = isAdminWorkspaceName(workspace);

  return {
    workspace,
    isAdminWorkspace,
    isSchoolWorkspace: !isAdminWorkspace,
  };
}
