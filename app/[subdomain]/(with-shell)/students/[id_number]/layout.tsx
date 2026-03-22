"use client";

import { useEffect, useMemo } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useNavigation } from "@/contexts/navigation-context";
import { useStudents as useStudentsApi } from "@/lib/api2/student";
import { applyStudentNavigationAvailability, getStudentNavigation } from "@/components/navigation";
import { DetailSideNav } from "@/components/dashboard/detail-side-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHeaderBreadcrumbs } from "@/hooks/use-header-breadcrumbs";

export default function StudentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setStudentNavigation, isPortalUser } = useNavigation();
  const idNumber = params.id_number as string;
  
  const returnTo = useMemo(() => {
    const rawValue = searchParams.get("returnTo");
    if (!rawValue || !rawValue.startsWith("/students")) return "/students";
    return rawValue;
  }, [searchParams]);
  
  const studentsApi = useStudentsApi();
  const { data: student, isLoading } = studentsApi.getStudent(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/students/"), // Only fetch if idNumber is present and URL contains "/students/"
  });

  useEffect(() => {
    if (student) {
      const grade = student.current_grade_level?.name || student.grade_level;
      const section = student.current_enrollment?.section?.name;
      const subtitle = [grade, section].filter(Boolean).join(" - ");

      setStudentNavigation(student.id_number, student.full_name, {
        avatar: student.photo || undefined,
        subtitle: subtitle,
        status: student.status,
        id_number: student.id_number,
      });
    } else if (!isLoading && idNumber) {
      setStudentNavigation(idNumber, `Student #${idNumber}`);
    }
  }, [idNumber, student, isLoading, setStudentNavigation]);

  const currentTabLabel = useMemo(() => {
    if (!pathname) return "Overview";
    if (pathname.endsWith(`/students/${idNumber}`)) return "Overview";
    const lastSegment = pathname.split("/").filter(Boolean).pop() || "overview";
    return lastSegment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [pathname, idNumber]);

  const breadcrumbs = useMemo(() => {
    const studentLabel = student?.full_name || `Student #${idNumber}`;
    const base = [
      { label: "Students", href: returnTo },
      { label: studentLabel, href: `/students/${idNumber}?returnTo=${encodeURIComponent(returnTo)}` },
    ];

    if (currentTabLabel === "Overview") {
      return [
        { label: "Students", href: returnTo },
        { label: studentLabel, current: true },
      ];
    }

    return [...base, { label: currentTabLabel, current: true }];
  }, [student?.full_name, idNumber, currentTabLabel, returnTo]);

  useHeaderBreadcrumbs(breadcrumbs);

  // Portal users (student/staff): render children directly — sidebar handles nav
  if (isPortalUser) {
    return <>{children}</>;
  }

  // Admin/registrar: render vertical tab rail (desktop) or dropdown bar (tablet) alongside content
  const navItems = applyStudentNavigationAvailability(
    getStudentNavigation(idNumber, returnTo),
    student,
  );

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

