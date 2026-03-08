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
  Tick01Icon,
  UserIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import {
  buildRootLoginUrl,
  getRootDomain,
  changeWorkspace,
} from "@/lib/tenant";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/portable-auth/src/client";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import AvatarImg from "../shared/avatar-img";

export default function SidebarHeaderDropDown() {
  const [loggingOut, setLoggingOut] = React.useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);
  const tenant = useTenantStore((state) => state.tenant);
  const clearTenant = useTenantStore((state) => state.clearTenant);
  const subdomain = useTenantSubdomain();
  const routeWorkspace =
    typeof window !== "undefined"
      ? window.location.hostname.split(".")[0] || ""
      : "";
  const currentWorkspace =
    routeWorkspace || tenant?.workspace || tenant?.schema_name || subdomain;

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none w-full">
          <div className="size-10 rounded-2xl bg-background border shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
            <AvatarImg
              src={tenant?.logo}
              alt={tenant?.name}
              name={tenant?.name}
              className="size-10"
              imgClassName="size-10"
            />
          </div>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="font-semibold text-sm truncate w-full text-left">
              {tenant?.name ?? "EzySchool"}
            </span>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground truncate w-full text-left">
              {tenant?.workspace ?? tenant?.schema_name ?? subdomain ?? null}
            </span>
          </div>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="size-4 text-muted-foreground shrink-0"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
              Workspaces
            </p>

            {/* Render tenants from user profile */}
            {user?.tenants?.map((t) => {
              const workspaceFromTenant = (t as { workspace?: string }).workspace;
              const targetWorkspace = workspaceFromTenant ?? t.schema_name;
              const isSelected =
                currentWorkspace === targetWorkspace ||
                currentWorkspace === t.schema_name;

              return (
              <DropdownMenuItem
                key={t.id}
                onClick={() => changeWorkspace(targetWorkspace)}
                className={isSelected ? "cursor-pointer bg-accent" : "cursor-pointer"}
              >
                <div className="size-7 shadow-xs flex items-center justify-center mr-2 overflow-hidden">
                   <AvatarImg
                      src={t?.logo}
                      alt={t?.name}
                      name={t?.name}
                      className="size-7"
                      imgClassName="size-7 object-cover"
                    />
                </div>
                <div className="flex items-start flex-col truncate flex-1">
                  <span className="text-sm">{t.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {targetWorkspace}
                  </span>
                </div>
                {/* {isSelected && (
                  <HugeiconsIcon
                    icon={Tick01Icon}
                    className="size-4 ml-auto shrink-0"
                  />
                )} */}
              </DropdownMenuItem>
            )})}

            {(!user?.tenants || user.tenants.length === 0) && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                No workspaces found
              </div>
            )}
          </DropdownMenuGroup>

          {/* <DropdownMenuSeparator /> */}

          {/* <DropdownMenuItem>
                    <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
                    Create Workspace
                  </DropdownMenuItem> */}

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <HugeiconsIcon icon={UserIcon} className="size-4 mr-2" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
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
  );
}
