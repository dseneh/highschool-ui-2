"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigation } from "@/contexts/navigation-context";
import { stripTenantFromPath } from "@/lib/tenant";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import type { NavItem } from "@/components/navigation";
import { useMemo } from "react";
import NavStudentCard from "./nav-student-card";
import NavStaffCard from "./nav-staff-card";
import { useStudentByNumber } from "@/hooks/use-student";
import { useStaff } from "@/lib/api2/staff";

interface DetailSideNavProps {
  items: NavItem[];
}

export function DetailSideNav({ items }: DetailSideNavProps) {
  const subdomain = useTenantSubdomain();
  const pathname = usePathname();
  const { contextTitle, contextData } = useNavigation();

  const params = useParams()
  const studentIdNumber = params.id_number as string | undefined;
  
  // Determine context once to avoid redundant checks
  const isStudentContext = pathname?.includes('/students/');
  const isStaffContext = pathname?.includes('/staff/');
  
  // Only fetch student data in student context
  const {data: student, isLoading: studentLoading } = useStudentByNumber(
    studentIdNumber, 
    { enabled: !!studentIdNumber && isStudentContext }
  );
  
  // Only fetch staff data in staff context
  const staffApi = useStaff();
  const { data: staff, isLoading: staffLoading } = staffApi.getStaffMember(
    studentIdNumber || '', 
    { enabled: !!studentIdNumber && isStaffContext }
  );

  const normalizedPath = useMemo(() => {
    const path =
      pathname && pathname !== "/" && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname || "/";
    return stripTenantFromPath(path, subdomain);
  }, [pathname, subdomain]);

  const activeItem = useMemo(
    () => items.find((item) => normalizedPath === item.path) || items[0],
    [items, normalizedPath]
  );

  // Only show loading for the active context
  const isLoading = isStudentContext ? studentLoading : isStaffContext ? staffLoading : false;

  if (isLoading) {
    return (
      <>
        {/* ── Tablet: Dropdown bar skeleton (sm → lg) ── */}
        <div className="hidden sm:flex lg:hidden items-center gap-2 px-4 py-2 border-b bg-sidebar/50 sticky top-0 z-10">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <span className="text-muted-foreground">·</span>
          <Skeleton className="h-8 w-32" />
        </div>

        {/* ── Desktop: Vertical tab rail skeleton (lg+) ── */}
        <nav className="hidden lg:flex flex-col w-50 shrink-0 border-r bg-sidebar/50">
          {/* Context Card Skeleton */}
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>

          {/* Nav Items Skeleton */}
          <div className="flex-1 overflow-y-auto py-1.5 px-2">
            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item.path}>
                  <div className="flex items-center gap-2.5 px-2.5 py-2">
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </>
    );
  }

  return (
    <>
      {/* ── Tablet: Dropdown bar (sm → lg) ── */}
      <div className="hidden sm:flex lg:hidden items-center gap-2 px-4 py-2 border-b bg-sidebar/50 sticky top-0 z-10">
        <Avatar className="size-7 rounded-full ring-1 ring-background">
          <AvatarImage src={contextData?.avatar} alt={contextTitle} />
          <AvatarFallback className="rounded-full text-[10px] font-semibold">
            {contextTitle?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-semibold truncate max-w-32">
          {contextTitle}
        </span>
        <span className="text-muted-foreground">·</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5">
                <HugeiconsIcon icon={activeItem.icon} className="size-4" />
                <span>{activeItem.label}</span>
                <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="min-w-48">
            {items.map((item) => {
              const isActive = normalizedPath === item.path;
              return (
                <DropdownMenuItem
                  key={item.path}
                  render={<Link href={item.path} />}
                  className={cn(isActive && "bg-accent font-semibold")}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    className={cn("size-4 mr-2", isActive ? "opacity-100" : "opacity-60")}
                  />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Desktop: Vertical tab rail (lg+) ── */}
      <nav className="hidden lg:flex flex-col w-50 shrink-0 border-r bg-sidebar/50">
      {/* Context Card */}
      {isStaffContext && staff ? (
        <NavStaffCard staff={staff} />
      ) : student ? (
        <NavStudentCard student={student} />
      ) : null}

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-1.5 px-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = normalizedPath === item.path;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/15"
                      : "text-muted-foreground"
                  )}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "opacity-100" : "opacity-60"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
    </>
  );
}
