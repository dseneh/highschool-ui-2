"use client";

import type { ComponentProps } from "react";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Tick01Icon,
  RefreshIcon,
  ArrowLeft01Icon,
  Search02Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  useDashboardStore,
  type HeaderBreadcrumbItem,
  type LayoutDensity,
} from "@/store/dashboard-store";
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav";
import Notification from "./notification";
import { AcademicYearIndicator } from "./academic-year-indicator";
import { Menu } from "lucide-react";

const densityLabels: Record<LayoutDensity, string> = {
  default: "Default",
  compact: "Compact",
  comfortable: "Comfortable",
};

type DashboardHeaderProps = {
  title?: string;
  showLayoutControls?: boolean;
  icon?: ComponentProps<typeof HugeiconsIcon>["icon"];
  backUrl?: string;
  isAdminWorkspace?: boolean;
};

export function DashboardHeader({
  title = "Dashboard",
  showLayoutControls = true,
  icon = DashboardSquare01Icon,
  backUrl: propsBackUrl,
  isAdminWorkspace = false,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const customBreadcrumbs = useDashboardStore((state) => state.breadcrumbs);
  const showAlertBanner = useDashboardStore((state) => state.showAlertBanner);
  const showStatsCards = useDashboardStore((state) => state.showStatsCards);
  const showChart = useDashboardStore((state) => state.showChart);
  const showTable = useDashboardStore((state) => state.showTable);
  const layoutDensity = useDashboardStore((state) => state.layoutDensity);
  const setShowAlertBanner = useDashboardStore(
    (state) => state.setShowAlertBanner,
  );
  const setShowStatsCards = useDashboardStore(
    (state) => state.setShowStatsCards,
  );
  const setShowChart = useDashboardStore((state) => state.setShowChart);
  const setShowTable = useDashboardStore((state) => state.setShowTable);
  const setLayoutDensity = useDashboardStore((state) => state.setLayoutDensity);
  const resetLayout = useDashboardStore((state) => state.resetLayout);

  const fromParam = searchParams.get("from");
  const returnToParam = searchParams.get("returnTo");
  const navigationParam = returnToParam || fromParam;
  const decodedFrom = useMemo(() => {
    if (!navigationParam) return undefined;
    try {
      return decodeURIComponent(navigationParam);
    } catch {
      return navigationParam;
    }
  }, [navigationParam]);

  // Allow only internal app paths for back navigation
  const safeFromUrl = decodedFrom?.startsWith("/") ? decodedFrom : undefined;
  const backUrl = safeFromUrl || propsBackUrl;

  const humanizePath = (path: string) => {
    const segment = path.split("?")[0].split("/").filter(Boolean).pop() || "Page";
    if (segment === "grading") return "Grading";
    if (segment === "gradebooks") return "Gradebooks";
    if (segment === "grades") return "My Classes & Grades";
    return segment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const fallbackBreadcrumbs = useMemo<HeaderBreadcrumbItem[]>(() => {
    if (safeFromUrl) {
      return [
        { label: humanizePath(safeFromUrl), href: safeFromUrl },
        { label: title, current: true },
      ];
    }

    // Show a minimal breadcrumb only on deeper routes.
    const isDeepRoute = (pathname || "").split("/").filter(Boolean).length > 1;
    if (isDeepRoute && propsBackUrl) {
      return [
        { label: humanizePath(propsBackUrl), href: propsBackUrl },
        { label: title, current: true },
      ];
    }

    return [{ label: title, current: true }];
  }, [safeFromUrl, propsBackUrl, title, pathname]);

  const breadcrumbItems = useMemo<HeaderBreadcrumbItem[]>(() => {
    const source = customBreadcrumbs && customBreadcrumbs.length > 0
      ? customBreadcrumbs
      : fallbackBreadcrumbs;

    if (source.length >= 2) {
      const first = source[0]?.label?.trim().toLowerCase();
      const second = source[1]?.label?.trim().toLowerCase();
      if (first && second && first === second) {
        return source.slice(1);
      }
    }

    return source;
  }, [customBreadcrumbs, fallbackBreadcrumbs]);

  return (
    <header className="w-full border-b bg-background">
      <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="-ml-2">
            <Menu className="size-5" />
          </SidebarTrigger>
          <div className="flex items-center gap-1 min-w-0">
            {backUrl ? (
              <Button
                size="icon"
                variant="outline"
                onClick={() => router.push(backUrl)}
                icon={<HugeiconsIcon icon={ArrowLeft01Icon} className="size-6" />}
                tooltip="Go back to list"
                className="size-8.5 shrink-0"
              />
            ) : (
              <Button
                size="icon"
                variant="outline"
                disabled
                className="size-8.5 shrink-0"
                icon={<HugeiconsIcon icon={icon} className="size-6" />}
              />
            )}
            <div className="min-w-0">
              {breadcrumbItems.length > 1 ? (
                <BreadcrumbNav items={breadcrumbItems} className="text-[15px] text-muted-foreground" />
              ) : (
                <h1 className="font-medium text-sm sm:text-base truncate">{title}</h1>
              )}
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Desktop view - all controls visible */}
          <div className="hidden sm:flex items-center gap-2">
            {!isAdminWorkspace ? (
              <>
                <AcademicYearIndicator />
                <div className="h-6 w-px bg-border mx-0.5" />
              </>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              icon={<HugeiconsIcon icon={Search02Icon} className="size-4" />}
              aria-label="Search"
              tooltip="Search anything..."
            >
              <span className="hidden lg:flex">Search</span>
            </Button>
            <Notification />
            {/* {!isAdminWorkspace ? (
              <>
                <div className="h-6 w-px bg-border mx-0.5" />
                <SystemStatusIndicator />
              </>
            ) : null} */}
            <ThemeToggle />
          </div>

          {/* Mobile view - compact controls + dropdown menu */}
          <div className="flex sm:hidden items-center gap-1">
            <Notification />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    icon={<HugeiconsIcon icon={MoreVerticalIcon} className="size-5" />}
                  />
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                {!isAdminWorkspace ? (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem disabled className="text-xs font-medium">
                        Academic Year
                      </DropdownMenuItem>
                      <AcademicYearIndicator />
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem disabled className="text-xs font-medium">
                      System Status
                    </DropdownMenuItem>
                    {/* <SystemStatusIndicator /> */}

                    <DropdownMenuSeparator />
                  </>
                ) : null}

                {showLayoutControls ? (
                  <>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                        Layout Density
                      </p>
                      {(Object.keys(densityLabels) as LayoutDensity[]).map((key) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => setLayoutDensity(key)}
                        >
                          {densityLabels[key]}
                          {layoutDensity === key && (
                            <HugeiconsIcon
                              icon={Tick01Icon}
                              className="size-4 ml-auto"
                            />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                        Show / Hide Sections
                      </p>
                      <DropdownMenuCheckboxItem
                        checked={showAlertBanner}
                        onCheckedChange={setShowAlertBanner}
                      >
                        Alert Banner
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={showStatsCards}
                        onCheckedChange={setShowStatsCards}
                      >
                        Statistics Cards
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={showChart}
                        onCheckedChange={setShowChart}
                      >
                        Financial Flow Chart
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={showTable}
                        onCheckedChange={setShowTable}
                      >
                        Employees Table
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={resetLayout}>
                      <HugeiconsIcon icon={RefreshIcon} className="size-4 mr-2" />
                      Reset to Default
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
