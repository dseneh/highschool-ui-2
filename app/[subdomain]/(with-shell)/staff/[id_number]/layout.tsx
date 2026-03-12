"use client";

import { useEffect, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { useNavigation } from "@/contexts/navigation-context";
import { useStaff } from "@/lib/api2/staff";
import { getStaffNavigation } from "@/components/navigation";
import { DetailSideNav } from "@/components/dashboard/detail-side-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHeaderBreadcrumbs } from "@/hooks/use-header-breadcrumbs";

export default function StaffDetailLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const params = useParams();
  const pathname = usePathname();
  const { setStaffNavigation, isPortalUser } = useNavigation();
  const idNumber = params.id_number as string;
  const staffApi = useStaff();
  const { data: staff, isLoading } = staffApi.getStaffMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/staff/"), // Only fetch if idNumber is present and URL contains "/staff/"
  });

  useEffect(() => {
    if (staff) {
      const position = typeof staff.position === 'string' 
        ? staff.position 
        : staff.position?.title;
      const department = typeof staff.primary_department === 'string'
        ? staff.primary_department
        : staff.primary_department?.name;
      const subtitle = [position, department].filter(Boolean).join(" - ");

      setStaffNavigation(staff.id_number, staff.full_name, {
        avatar: staff.photo || undefined,
        subtitle: subtitle,
        status: staff.status,
        id_number: staff.id_number,
      });
    } else if (!isLoading && idNumber) {
      setStaffNavigation(idNumber, `Staff #${idNumber}`);
    }
  }, [idNumber, staff, isLoading, setStaffNavigation]);

  const currentTabLabel = useMemo(() => {
    if (!pathname) return "Overview";
    if (pathname.endsWith(`/staff/${idNumber}`)) return "Overview";
    const lastSegment = pathname.split("/").filter(Boolean).pop() || "overview";
    return lastSegment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [pathname, idNumber]);

  const breadcrumbs = useMemo(() => {
    const staffLabel = staff?.full_name || `Staff #${idNumber}`;
    const base = [
      { label: "Staff", href: "/staff" },
      { label: staffLabel, href: `/staff/${idNumber}` },
    ];

    if (currentTabLabel === "Overview") {
      return [
        { label: "Staff", href: "/staff" },
        { label: staffLabel, current: true },
      ];
    }

    return [...base, { label: currentTabLabel, current: true }];
  }, [staff?.full_name, idNumber, currentTabLabel]);

  useHeaderBreadcrumbs(breadcrumbs);

  // Portal users (student/staff): render children directly — sidebar handles nav
  if (isPortalUser) {
    return <>{children}</>;
  }

  // Admin/registrar: render vertical tab rail (desktop) or dropdown bar (tablet) alongside content
  const navItems = getStaffNavigation(idNumber);

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

