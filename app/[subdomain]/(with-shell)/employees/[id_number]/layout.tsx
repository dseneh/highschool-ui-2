"use client";

import { useEffect, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { useNavigation } from "@/contexts/navigation-context";
import { useEmployee } from "@/lib/api2/employee";
import { getEmployeeNavigation } from "@/components/navigation/employee.nav";
import { DetailSideNav } from "@/components/dashboard/detail-side-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHeaderBreadcrumbs } from "@/hooks/use-header-breadcrumbs";

export default function EmployeeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const params = useParams();
  const pathname = usePathname();
  const { setStaffNavigation, isPortalUser } = useNavigation();
  const idNumber = params.id_number as string;
  const employeeApi = useEmployee();
  const { data: employee, isLoading } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/employees/"),
  });

  useEffect(() => {
    if (employee) {
      const position = typeof employee.position === 'string' 
        ? employee.position 
        : employee.position?.title;
      const department = typeof employee.department === 'string'
        ? employee.department
        : employee.department?.name;
      const subtitle = [position, department].filter(Boolean).join(" - ");

      setStaffNavigation(employee.id_number, employee.full_name, {
        avatar: employee.photo_url || undefined,
        subtitle: subtitle,
        status: employee.employment_status,
        id_number: employee.id_number,
      });
    } else if (!isLoading && idNumber) {
      setStaffNavigation(idNumber, `Employee #${idNumber}`);
    }
  }, [idNumber, employee, isLoading, setStaffNavigation]);

  const currentTabLabel = useMemo(() => {
    if (!pathname) return "Overview";
    if (pathname.endsWith(`/employees/${idNumber}`)) return "Overview";
    const lastSegment = pathname.split("/").filter(Boolean).pop() || "overview";
    return lastSegment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [pathname, idNumber]);

  const breadcrumbs = useMemo(() => {
    const employeeLabel = employee?.full_name || `Employee #${idNumber}`;
    const base = [
      { label: "Employees", href: "/employees" },
      { label: employeeLabel, href: `/employees/${idNumber}` },
    ];

    if (currentTabLabel === "Overview") {
      return [
        { label: "Employees", href: "/employees" },
        { label: employeeLabel, current: true },
      ];
    }

    return [...base, { label: currentTabLabel, current: true }];
  }, [employee?.full_name, idNumber, currentTabLabel]);

  useHeaderBreadcrumbs(breadcrumbs);

  // Portal users (student/staff): render children directly — sidebar handles nav
  if (isPortalUser) {
    return <>{children}</>;
  }

  // Admin/registrar: render vertical tab rail (desktop) or dropdown bar (tablet) alongside content
  const isTeachingStaff = employee?.is_teaching_staff ?? employee?.is_teacher ?? false;
  const navItems = getEmployeeNavigation(idNumber, isTeachingStaff);

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0">
      <DetailSideNav items={navItems} />
      {/* <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div> */}
      <ScrollArea className="flex-1 min-w-0">
      {children}
    </ScrollArea>
    </div>
  );
}

