"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Settings01Icon,
  UserIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { DialogBox } from "@/components/ui/dialog-box";
import StatusBadge from "@/components/ui/status-badge";
import {
  buildRootLoginUrl,
  getRootDomain,
  changeWorkspace,
  getSubdomainFromHost,
} from "@/lib/tenant";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/portable-auth/src/client";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import AvatarImg from "../shared/avatar-img";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export default function SidebarHeaderDropDown() {
  const [openWorkspaceDialog, setOpenWorkspaceDialog] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const router = useRouter();
  const { state: sidebarState, isMobile } = useSidebar();
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);
  const tenant = useTenantStore((state) => state.tenant);
  const clearTenant = useTenantStore((state) => state.clearTenant);
  const subdomain = useTenantSubdomain();
  const routeWorkspace =
    typeof window !== "undefined"
      ? getSubdomainFromHost(window.location.host) ?? ""
      : "";
  const isSidebarCollapsed = sidebarState === "collapsed" && !isMobile;
  const currentWorkspace =
    subdomain || routeWorkspace || tenant?.schema_name || tenant?.workspace || "";
  const currentTenant = user?.tenants?.find((tenantItem) => {
    const workspaceFromTenant = (tenantItem as { workspace?: string }).workspace;
    const workspace = tenantItem.schema_name ?? workspaceFromTenant ?? "";
    return workspace.toLowerCase() === currentWorkspace.toLowerCase();
  }) ?? null;

  const currentTenantName = tenant?.name ?? currentTenant?.name ?? "EzySchool";
  const currentTenantLogo = tenant?.logo ?? currentTenant?.logo;
  const currentTenantWorkspace =
    currentWorkspace || tenant?.schema_name || tenant?.workspace || "—";
  const tenantStatus = tenant?.status ?? (tenant?.active ? "active" : "inactive");
  const normalizedTenantStatus = String(tenantStatus || "").toLowerCase();

  const otherTenants = (user?.tenants ?? []).filter((tenantItem) => {
    const workspaceFromTenant = (tenantItem as { workspace?: string }).workspace;
    const workspace = tenantItem.schema_name ?? workspaceFromTenant ?? "";
    if (!workspace) return false;
    return workspace.toLowerCase() !== currentWorkspace.toLowerCase();
  });

  const handleSwitchWorkspace = (targetWorkspace: string) => {
    if (!targetWorkspace) return;
    setOpenWorkspaceDialog(false);
    changeWorkspace(targetWorkspace);
  };

  return (
    <>
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none w-full">
          <div className="size-10 rounded-2xl bg-background border shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
            <AvatarImg
              src={currentTenantLogo}
              alt={currentTenantName}
              name={currentTenantName}
              className="size-10"
              imgClassName="size-10"
            />
          </div>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="font-semibold text-sm truncate w-full text-left">
              {currentTenantName}
            </span>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground truncate w-full text-left">
              {currentTenantWorkspace}
            </span>
          </div>
          {!isSidebarCollapsed && (
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="size-4 text-muted-foreground shrink-0"
            />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-88 max-w-[calc(100vw-1rem)]">
          <DropdownMenuGroup>
            <div className="px-2 py-2">
              <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
                <div className="flex items-center gap-2">
                  <AvatarImg
                    src={currentTenantLogo}
                    alt={currentTenantName}
                    name={currentTenantName}
                    className="size-9"
                    imgClassName="size-9 object-cover"
                  />
                  <div className="min-w-0 flex-1 pr-1">
                    <p className="text-sm font-semibold leading-tight wrap-break-word">{currentTenantName}</p>
                    <p className="truncate text-xs text-muted-foreground">{currentTenantWorkspace}</p>
                  </div>
                  {normalizedTenantStatus && normalizedTenantStatus !== "active" ? (
                    <StatusBadge
                      status={tenantStatus}
                      showIcon={false}
                      className="capitalize"
                    />
                  ) : null}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-2.5 w-full"
                onClick={() => setOpenWorkspaceDialog(true)}
              >
                Change Workspace
              </Button>
            </div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/account-settings")}> 
              <HugeiconsIcon icon={UserIcon} className="size-4 mr-2" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <HugeiconsIcon icon={Settings01Icon} className="size-4 mr-2" />
              Workspace Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive"
            disabled={loggingOut}
            onClick={async () => {
              if (loggingOut) return;
              setLoggingOut(true);
              try {
                await logout();
                clearTenant();
                if (typeof window !== "undefined") {
                  clearAuthCookies(getRootDomain(window.location.host));
                  window.location.href = buildRootLoginUrl();
                } else {
                  router.push("/login");
                }
              } catch (error) {
                console.error("Logout error:", error);
                setLoggingOut(false);
              }
            }}
          >
            {loggingOut && (
              <svg
                className="animate-spin size-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {!loggingOut && (
              <HugeiconsIcon icon={Logout01Icon} className="size-4 mr-2" />
            )}
            {loggingOut ? "Logging out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <DialogBox
      open={openWorkspaceDialog}
      onOpenChange={setOpenWorkspaceDialog}
      title="Change Workspace"
      description="Select a workspace to switch your current context."
      cancelLabel="Close"
      className="sm:max-w-lg"
    >
      <div className="space-y-2 pb-3 pt-1">
        {otherTenants.length > 0 ? (
          otherTenants.map((tenantItem) => {
            const workspaceFromTenant = (tenantItem as { workspace?: string }).workspace;
            const targetWorkspace = tenantItem.schema_name ?? workspaceFromTenant ?? "";
            const targetStatus =
              (tenantItem as { status?: string }).status ??
              ((tenantItem as { active?: boolean }).active ? "active" : undefined);
            const normalizedTargetStatus = String(targetStatus || "unknown").toLowerCase();
            const badgeVariant = normalizedTargetStatus === "active" ? "default" : "secondary";

            return (
              <button
                key={tenantItem.id}
                type="button"
                onClick={() => handleSwitchWorkspace(targetWorkspace)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 text-left transition-colors",
                  "hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                <AvatarImg
                  src={tenantItem.logo}
                  alt={tenantItem.name}
                  name={tenantItem.name}
                  className="size-9"
                  imgClassName="size-9 object-cover"
                />
                <div className="min-w-0 flex-1 pr-1">
                  <p className="text-sm font-medium leading-tight wrap-break-word">{tenantItem.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{targetWorkspace}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge
                    status={targetStatus || "unknown"}
                    showIcon={false}
                    variants={{
                      active: badgeVariant,
                      unknown: "secondary",
                    }}
                    labels={{ unknown: "Unknown" }}
                    className="capitalize"
                  />
                  <span className="text-[11px] text-muted-foreground">Tenant</span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            No other workspaces available.
          </div>
        )}
      </div>
    </DialogBox>
    </>
  );
}
