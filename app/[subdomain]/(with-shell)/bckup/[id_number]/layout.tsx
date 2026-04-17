"use client";

import { useEffect, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Calendar01Icon,
  CourseIcon,
  Settings01Icon,
  UserMultiple02Icon,
  BookOpen02Icon,
} from "@hugeicons/core-free-icons";
import type { NavItem } from "@/components/navigation";
import { useNavigation } from "@/contexts/navigation-context";
import { DetailSideNav } from "@/components/dashboard/detail-side-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHeaderBreadcrumbs } from "@/hooks/use-header-breadcrumbs";
import { useEmployeeDetail } from "@/hooks/use-employee";

function getEmployeeNavigation(employeeId: string): NavItem[] {
  return [
    {
      icon: DashboardSquare01Icon,
      label: "Overview",
      path: `/employees/${employeeId}`,
      meta: "Employee summary",
    },
    {
      icon: UserGroupIcon,
      label: "Details",
      path: `/employees/${employeeId}/details`,
      meta: "Personal and employment info",
    },
    {
      icon: Calendar01Icon,
      label: "Attendance",
      path: `/employees/${employeeId}/attendance`,
      meta: "Attendance records",
    },
    {
      icon: BookOpen02Icon,
      label: "Documents",
      path: `/employees/${employeeId}/documents`,
      meta: "Compliance and files",
    },
    {
      icon: UserMultiple02Icon,
      label: "Leave",
      path: `/employees/${employeeId}/leave`,
      meta: "Leave balances and requests",
    },
    {
      icon: CourseIcon,
      label: "Workflows",
      path: `/employees/${employeeId}/workflows`,
      meta: "Onboarding and offboarding",
    },
    {
      icon: BookOpen02Icon,
      label: "Performance",
      path: `/employees/${employeeId}/performance`,
      meta: "Reviews and growth",
    },
    {
      icon: UserMultiple02Icon,
      label: "Compensation",
      path: `/employees/${employeeId}/compensation`,
      meta: "Payroll package",
    },
    {
      icon: Settings01Icon,
      label: "Settings",
      path: `/employees/${employeeId}/settings`,
      meta: "Employee actions",
      requiredRoles: "admin",
    },
  ];
}

export default function EmployeeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const params = useParams<{ id_number: string }>();
  const pathname = usePathname();
  const { setStaffNavigation, isPortalUser } = useNavigation();
  const employeeId = params.id_number;
  const { data: employee, isLoading } = useEmployeeDetail(employeeId);

  useEffect(() => {
    if (employee) {
      const subtitle = [employee.jobTitle, employee.departmentName]
        .filter(Boolean)
        .join(" • ");

      setStaffNavigation(employee.id, employee.fullName || "Employee", {
        avatar: employee.photoUrl || undefined,
        subtitle,
        status: employee.employmentStatus || undefined,
        id_number: employee.employeeNumber || employee.id,
      });
    } else if (!isLoading && employeeId) {
      setStaffNavigation(employeeId, `Employee ${employeeId}`);
    }
  }, [employee, employeeId, isLoading, setStaffNavigation]);

  const currentTabLabel = useMemo(() => {
    if (!pathname) return "Overview";
    if (pathname.endsWith(`/employees/${employeeId}`)) return "Overview";

    const lastSegment = pathname.split("/").filter(Boolean).pop() || "overview";
    return lastSegment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [employeeId, pathname]);

  const employeeLabel = employee?.fullName || employee?.employeeNumber || `Employee ${employeeId}`;

  const breadcrumbs = useMemo(() => {
    const base = [
      { label: "Employees", href: "/employees" },
      { label: employeeLabel, href: `/employees/${employeeId}` },
    ];

    if (currentTabLabel === "Overview") {
      return [
        { label: "Employees", href: "/employees" },
        { label: employeeLabel, current: true },
      ];
    }

    return [...base, { label: currentTabLabel, current: true }];
  }, [currentTabLabel, employeeId, employeeLabel]);

  useHeaderBreadcrumbs(breadcrumbs);

  if (isPortalUser) {
    return <>{children}</>;
  }

  const navItems = getEmployeeNavigation(employeeId);

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <DetailSideNav items={navItems} />
      <ScrollArea className="flex-1 min-w-0">{children}</ScrollArea>
    </div>
  );
}
