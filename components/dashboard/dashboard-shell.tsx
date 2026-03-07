"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { primaryNavSections } from "@/components/dashboard/navigation";
import { useAuth } from "@/components/portable-auth/src/client";
import { useTenantStore } from "@/store/tenant-store";
import {
  buildRootLoginUrl,
  stripTenantFromPath,
  getTenantFromSubdomain,
} from "@/lib/tenant";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authenticated, loading, tenant: authTenant, user } = useAuth();
  const setTenant = useTenantStore((state) => state.setTenant);
  const subdomain = useTenantSubdomain();

  const pathname = usePathname();
  const normalizedPath = useMemo(() => {
    const path = pathname && pathname !== "/" && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname || "/";
    return stripTenantFromPath(path, subdomain);
  }, [pathname, subdomain]);

  const activeItem = useMemo(() => {
    const allItems = primaryNavSections.flatMap((section) =>
      section.items.flatMap((item) =>
        item.subItems && item.subItems.length > 0
          ? [item, ...item.subItems]
          : [item]
      )
    );

    const matches = allItems.filter((item) =>
      item.path === "/"
        ? normalizedPath === "/"
        : normalizedPath === item.path ||
          normalizedPath.startsWith(`${item.path}/`)
    );

    return matches.sort((a, b) => b.path.length - a.path.length)[0] || allItems[0];
  }, [normalizedPath]);

  const backUrl = useMemo(() => {
    if (activeItem.path === "/" || activeItem.path === normalizedPath) {
      return undefined;
    }
    if (normalizedPath.startsWith(activeItem.path + "/")) {
      return activeItem.path;
    }
    return undefined;
  }, [activeItem, normalizedPath]);

  const showLayoutControls = activeItem.path === "/";

  useEffect(() => {
    // Only set tenant if it's not already set or if authTenant.workspace changes
    const currentTenant = useTenantStore.getState().tenant;
    const tenantId = subdomain || authTenant?.workspace;
    
    // Avoid loops: only update if the tenant actually needs to change
    if (currentTenant?.schema_name === tenantId) {
      return;
    }
    
    const tenantFromList = tenantId ? getTenantFromSubdomain(tenantId) : null;
    if (tenantFromList) {
      setTenant(tenantFromList);
    }
  }, [authTenant?.workspace, setTenant, subdomain]);

  useEffect(() => {
    if (loading) return;
    if (authenticated) return;

    // Redirect to subdomain login, not root login
    const redirectUrl =
      typeof window !== "undefined" ? window.location.href : pathname;
    const loginUrl = subdomain ? `/login` : buildRootLoginUrl();

    if (typeof window !== "undefined") {
      const url = new URL(loginUrl, window.location.origin);
      url.searchParams.set("redirectUrl", redirectUrl);
      window.location.href = url.toString();
    } else {
      router.replace(`/login?redirectUrl=${encodeURIComponent(redirectUrl)}`);
    }
  }, [authenticated, loading, pathname, router, subdomain]);

  // Check if user has default password and redirect to change-password page
  useEffect(() => {
    if (loading || !authenticated || !user) return;
    
    // Skip check if already on change-password page
    if (pathname === '/change-password') return;
    
    // Redirect to change password if user has default password
    if (user.is_default_password === true) {
      router.replace('/change-password');
    }
  }, [authenticated, loading, user, pathname, router]);

  if (loading || !authenticated) {
    return null;
  }

  return (
    <SidebarProvider className="bg-sidebar">
      <DashboardSidebar />
      <div className="h-svh overflow-hidden lg:p-2 w-full">
        <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background min-h-0">
          <DashboardHeader
            title={activeItem.label}
            icon={activeItem.icon}
            showLayoutControls={showLayoutControls}
            backUrl={backUrl}
          />
          <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
