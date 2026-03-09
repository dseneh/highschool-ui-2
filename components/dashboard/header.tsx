"use client";

import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  SidebarLeft01Icon,
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
import { useDashboardStore, type LayoutDensity } from "@/store/dashboard-store";
import Notification from "./notification";
import { AcademicYearIndicator } from "./academic-year-indicator";
import { SystemStatusIndicator } from "./system-status";
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
  const storeBackUrl = useDashboardStore((state) => state.backUrl);
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

  // Use store backUrl if available, otherwise fall back to props
  const backUrl = storeBackUrl || propsBackUrl;

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
            <h1 className="font-medium text-sm sm:text-base truncate">{title}</h1>
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
            <ThemeCustomizer />
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

                <DropdownMenuItem disabled className="text-xs font-medium">
                  Theme
                </DropdownMenuItem>
                <ThemeCustomizer />

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
