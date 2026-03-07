"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useNavigation } from "@/contexts/navigation-context";
import { useStaff } from "@/lib/api2/staff";
import { getStaffNavigation } from "@/components/dashboard/navigation";
import { DetailSideNav } from "@/components/dashboard/detail-side-nav";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StaffDetailLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const params = useParams();
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

