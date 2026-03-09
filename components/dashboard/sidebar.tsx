"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/portable-auth/src/client";
import { useAuthStore } from "@/store/auth-store";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Settings01Icon,
  HelpCircleIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  primaryNavSections,
  getStudentNavigation,
  getStudentPortalNavigation,
  type NavItem,
  type NavSection,
} from "@/components/navigation";
import { useNavigation } from "@/contexts/navigation-context";
import { stripTenantFromPath } from "@/lib/tenant";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { useIsMobile } from "@/hooks/use-mobile";
import { hasRequiredRoles } from "@/hooks/use-authorization";

import SidebarHeaderDropDown from "./sidebar-header";
import NavStudentCard from "./nav-student-card";
import { useStudentByNumber } from "@/hooks/use-student";

export function DashboardSidebar({
  navSections = primaryNavSections,
  ...props
}: React.ComponentProps<typeof Sidebar> & { navSections?: NavSection[] }) {
  const { state: sidebarState, isMobile: isSidebarMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const subdomain = useTenantSubdomain();
  const { isPortalUser } = useNavigation();
  const currentUser = useAuthStore((state) => state.user);
  const { user: authUser } = useAuth();
  const params = useParams();
  const isMobile = useIsMobile();

  // Determine if current user is a student
  const isStudent = authUser?.account_type?.toLowerCase() === "student";

  // Keep sections collapsed by default (except active one)
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

  const { data: student } = useStudentByNumber(params.id_number as string, 
    { enabled: !!params.id_number && pathname?.includes('/students/') });

  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
  const hoverCloseTimer = React.useRef<number | null>(null);

  const openHoverMenu = (label: string) => {
    if (hoverCloseTimer.current) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
    setHoveredItem(label);
  };

  const closeHoverMenu = (label: string) => {
    if (hoverCloseTimer.current) {
      window.clearTimeout(hoverCloseTimer.current);
    }
    hoverCloseTimer.current = window.setTimeout(() => {
      setHoveredItem((current) => (current === label ? null : current));
    }, 120);
  };

  React.useEffect(() => {
    return () => {
      if (hoverCloseTimer.current) {
        window.clearTimeout(hoverCloseTimer.current);
      }
    };
  }, []);

  const toggleSection = (title: string, isOpen: boolean) => {
    setOpenSections((prev) => ({ ...prev, [title]: isOpen }));
  };

  const normalizedPath = React.useMemo(() => {
    const path = pathname && pathname !== "/" && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname || "/";

    const shouldStripTenantPrefix = subdomain !== "admin" && subdomain !== "public";
    return shouldStripTenantPrefix ? stripTenantFromPath(path, subdomain) : path;
  }, [pathname, subdomain]);

  const canViewNavItem = React.useCallback(
    (item: NavItem) => {
      if (!item.requiredRoles) {
        return true;
      }

      return hasRequiredRoles(currentUser?.role?.toLowerCase(), item.requiredRoles);
    },
    [currentUser?.role]
  );

  const filteredPrimaryNavSections = React.useMemo<NavSection[]>(() => {
    return navSections
      .map((section) => {
        const filteredItems = section.items
          .map((item) => {
            const filteredSubItems = item.subItems?.filter((subItem) => canViewNavItem(subItem));
            return {
              ...item,
              subItems: filteredSubItems,
            };
          })
          .filter((item) => {
            if (!canViewNavItem(item)) {
              return false;
            }

            if (item.subItems && item.subItems.length === 0) {
              return true;
            }

            return true;
          });

        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [canViewNavItem, navSections]);

  /*
   * ═══════════════════════════════════════════════════════════════════════
   * MENU STATE LOGIC
   * ═══════════════════════════════════════════════════════════════════════
   */

  // Check if we're on a detail page based on URL params
  const isOnStudentDetail = !!params.id_number && pathname?.includes('/students/');
  const isOnStaffDetail = !!params.id_number && pathname?.includes('/staff/');
  const isOnStudentPortal = isStudent && pathname?.includes('/student');

  // Sidebar menu swap only for:
  // 1. Non-students viewing student detail pages (staff, admin, teacher viewing /students/[id]) — swap
  // 2. Mobile users on student detail pages — swap
  // 3. Students viewing student portal routes — swap
  // Students should NOT see detail sidebar when viewing /students/[id]
  const shouldSwapMenu = (isOnStudentDetail && !isStudent && (isPortalUser || isMobile)) || isOnStudentPortal;

  // Menu state: "main", "student", or "staff" (but "staff" is no longer used - staff always see "main")
  const [activeMenu, setActiveMenu] = React.useState<"main" | "student">("main");

  // Initialize menu based on current route
  React.useEffect(() => {
    if (isStudent && isOnStudentPortal) {
      setActiveMenu("student");
    } else if (isStudent && isOnStudentDetail && shouldSwapMenu) {
      setActiveMenu("student");
    } else {
      setActiveMenu("main");
    }
  }, [shouldSwapMenu, isOnStudentDetail, isOnStudentPortal, isStudent]);

  // Menu configuration
  const menuConfig = {
    main: {
      isActive: activeMenu === "main",
      items: navSections,
      type: "accordion" as const,
    },
    student: {
      isActive: activeMenu === "student",
      items: isOnStudentDetail && params.id_number
        ? getStudentNavigation(params.id_number as string)
        : isStudent
        ? getStudentPortalNavigation()
        : [],
      type: "list" as const,
    },
  };

  const filteredStudentContextItems = React.useMemo(() => {
    const items = isOnStudentDetail && params.id_number
      ? getStudentNavigation(params.id_number as string)
      : isStudent
      ? getStudentPortalNavigation()
      : [];

    return items.filter((item) => canViewNavItem(item));
  }, [isOnStudentDetail, params.id_number, canViewNavItem, isStudent]);

  const handleMenuToggle = () => {
    if (activeMenu === "main") {
      setActiveMenu(isOnStudentDetail ? "student" : "main");
    } else {
      setActiveMenu("main");
    }
  };
  const getMenuToggleConfig = () => {
    // Portal users don't need the back button — sidebar is always in context mode
    if (isPortalUser) return null;

    if (activeMenu === "main") {
      if (isOnStudentDetail) {
        return {
          label: "View Student Menu",
          icon: ArrowRight01Icon,
          iconRotate: ""
        };
      }
      // Staff don't get a menu toggle - they always see main menu
      return null;
    }

    // activeMenu is student
    return {
      label: "Back to Main Menu",
      icon: ArrowLeft01Icon,
      iconRotate: ""
    };
  };

  const isCollapsed = sidebarState === "collapsed" && !isSidebarMobile;
  const menuButtonClass = "h-10 w-full px-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center";
  const menuIconClass = "size-5 opacity-70 group-hover/menu-button:opacity-100 transition-opacity";

  // Helper to render collapsed dropdown menu
  const renderCollapsedDropdown = (item: NavItem, isParentActive: boolean) => {
    const isHoverOpen = hoveredItem === item.label;
    return (
      <DropdownMenu
        key={item.label}
        open={isHoverOpen}
        onOpenChange={(open) => setHoveredItem(open ? item.label : null)}
      >
        <SidebarMenuItem>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "h-10 w-10 rounded-md flex items-center justify-center transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isParentActive && "bg-primary/10 text-primary"
              )}
              onMouseEnter={() => openHoverMenu(item.label)}
              onMouseLeave={() => closeHoverMenu(item.label)}
              aria-label={item.label}
            >
              <HugeiconsIcon icon={item.icon} className="size-5 shrink-0" />
            </button>
          </DropdownMenuTrigger>
        </SidebarMenuItem>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={8}
          className="min-w-48"
          onMouseEnter={() => openHoverMenu(item.label)}
          onMouseLeave={() => closeHoverMenu(item.label)}
        >
          {item.subItems?.map((subItem: Omit<NavItem, 'subItems'>) => {
            const isSubItemOpen =
              normalizedPath === subItem.path ||
              normalizedPath.startsWith(`${subItem.path}/`);
            return (
              <DropdownMenuItem
                key={subItem.path}
                onClick={() => {
                  setHoveredItem(null);
                  router.push(subItem.path);
                }}
                className={cn(
                  "cursor-pointer",
                  isSubItemOpen && "bg-accent text-accent-foreground font-medium"
                )}
              >
                {subItem.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Helper to render expanded collapsible menu
  const renderExpandedCollapsible = (item: NavItem, isParentActive: boolean, isOpen: boolean) => {
    return (
      <Collapsible
        key={item.label}
        open={isOpen}
        onOpenChange={(open) => toggleSection(item.label, open)}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={isParentActive}
            tooltip={item.label}
            className={cn("justify-between cursor-pointer", menuButtonClass)}
            onClick={() => toggleSection(item.label, !isOpen)}
          >
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={item.icon} className={menuIconClass} />
              <span className="font-medium group-data-[collapsible=icon]:hidden">{item.label}</span>
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground/50 opacity-50 group-data-[collapsible=icon]:hidden"
            />
          </SidebarMenuButton>
          <CollapsibleContent className="grid transition-[grid-template-rows,opacity] duration-200 data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100">
            <div className="overflow-hidden">
              <SidebarMenuSub>
                {item.subItems?.map((subItem: Omit<NavItem, 'subItems'>) => (
                  <SidebarMenuSubItem key={subItem.path}>
                    <SidebarMenuSubButton
                      render={<Link href={subItem.path || '#'} />}
                      isActive={
                        normalizedPath === subItem.path ||
                        normalizedPath.startsWith(`${subItem.path}/`)
                      }
                    >
                      <span>{subItem.label}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </div>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  };

  // Helper to render simple menu item (no sub-items)
  const renderSimpleMenuItem = (item: NavItem, isActive: boolean) => {
    return (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={item.label}
          className={menuButtonClass}
          render={<Link href={item.path} />}
        >
          <HugeiconsIcon icon={item.icon} className={menuIconClass} />
          <span className="font-medium group-data-[collapsible=icon]:hidden">{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full group-data-[collapsible=icon]:hidden">
              {item.badge}
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader className="p-4 pb-2 border-b">
        <SidebarHeaderDropDown />
      </SidebarHeader>

      <SidebarContent className="px-5 pt-5">
        {/* <div className="relative mb-4">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          />
          <Input
            placeholder="Search Anything..."
            className="pl-9 pr-10 h-9 bg-background"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-muted px-1.5 py-0.5 rounded text-[11px] text-muted-foreground font-medium">
            ⌘K
          </div>
        </div> */}

        {/* Menu Toggle Button (shown when sidebar can swap menus) */}
        {shouldSwapMenu && (() => {
          const config = getMenuToggleConfig();
          if (!config) return null;

          return (
            <div className="mb-1">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full",
                  "justify-start",
                  "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                )}
                onClick={handleMenuToggle}
                icon={<HugeiconsIcon icon={config.icon} className={cn("size-4", config.iconRotate)} />}
              >
                <span className="flex-1 text-left group-data-[collapsible=icon]:hidden">{config.label}</span>
              </Button>
            </div>
          );
        })()}

        {/* Context Card (Student/Staff) — only in sidebar when menu is swapped */}
        {shouldSwapMenu && activeMenu === "student" && student && (
          <div className="mb-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <NavStudentCard student={student} className="relative overflow-hidden rounded-lg border bg-card p-2 shadow-xs transition-all hover:shadow-md group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none" />
          </div>
        )}

        {/* Main Navigation */}
        {menuConfig.main.isActive && (
          <div className="space-y-2">
            {filteredPrimaryNavSections.map((section, sectionIndex) => (
              <SidebarGroup key={sectionIndex} className="p-0">
                {section.title && (
                  <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground/70 tracking-widest uppercase mb-1">
                    {section.title}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      // For detail pages (staff/student), use exact path matching
                      // For main nav, allow prefix matching for accordion sections
                      const isDetailContext = isOnStudentDetail || isOnStaffDetail;
                      const isActive =
                        (item.path === "/" && normalizedPath === "/") ||
                        (item.path !== "/" && isDetailContext
                          ? normalizedPath === item.path
                          : (normalizedPath === item.path || normalizedPath.startsWith(`${item.path}/`)));
                      const hasSubItems = item.subItems && item.subItems.length > 0;
                      const isSubItemActive = hasSubItems
                        ? item.subItems?.some(
                            (subItem) =>
                              isDetailContext
                                ? normalizedPath === subItem.path
                                : (normalizedPath === subItem.path || normalizedPath.startsWith(`${subItem.path}/`))
                          )
                        : false;
                      const isParentActive = isActive || isSubItemActive;
                      const sectionOverride = openSections[item.label];
                      const isOpen =
                        typeof sectionOverride === "boolean"
                          ? sectionOverride
                          : isParentActive && hasSubItems;

                      // Render based on item type and sidebar state
                      if (hasSubItems) {
                        return isCollapsed
                          ? renderCollapsedDropdown(item, isParentActive ?? false)
                          : renderExpandedCollapsible(item, isParentActive ?? false, isOpen ?? false);
                      }

                      return renderSimpleMenuItem(item, isActive);
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </div>
        )}

        {/* Context Navigation List (Student) */}
        {activeMenu === "student" && (
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredStudentContextItems?.map((item) => {
                  const isActive = normalizedPath === item.path;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className={menuButtonClass}
                        render={<Link href={item.path} />}
                      >
                        <HugeiconsIcon icon={item.icon} className={menuIconClass} />
                        <span className="font-medium group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>

      <SidebarFooter className="p-3 border-t">
        <SidebarUserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar User Menu — replaces logout button at footer               */
/* ------------------------------------------------------------------ */

function SidebarUserMenu() {
  const { logout } = useAuth()
  const user = useAuthStore((state) => state.user)
  const router = useRouter()

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName
  const displayName = user?.name || fullName || user?.username || user?.email || "User"
  const displayEmail = user?.email || user?.username || ""
  const userInitials =
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") ||
    displayName?.[0] ||
    "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            tooltip={displayName}
            className="w-full cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="size-7 rounded-full">
              <AvatarImage
                src={(user?.avatar as string) || "/ln.png"}
                alt={displayName}
              />
              <AvatarFallback className="rounded-full text-xs bg-primary/10 text-primary font-semibold">
                {userInitials.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </span>
            </div>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden"
            />
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      >
        <DropdownMenuGroup>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Avatar className="size-8 rounded-full">
              <AvatarImage
                src={(user?.avatar as string) || "/ln.png"}
                alt={displayName}
              />
              <AvatarFallback className="rounded-full text-xs bg-primary/10 text-primary font-semibold">
                {userInitials.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </span>
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <HugeiconsIcon icon={Settings01Icon} className="mr-2 size-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HugeiconsIcon icon={HelpCircleIcon} className="mr-2 size-4" />
            <span>Help &amp; Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-red-500 focus:text-red-500"
        >
          <HugeiconsIcon icon={Logout01Icon} className="mr-2 size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
