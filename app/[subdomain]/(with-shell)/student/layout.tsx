"use client";

import { useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { useCurrentStudent } from "@/hooks/use-current-student";
import { getStudentNavigation } from "@/components/navigation";
import { DetailSideNav } from "@/components/dashboard/detail-side-nav";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { setStudentNavigation, isPortalUser } = useNavigation();
  const { student, isLoading, isStudent } = useCurrentStudent();

  useEffect(() => {
    if (student && isStudent) {
      const grade = student.current_grade_level?.name || student.grade_level;
      const section = student.current_enrollment?.section?.name;
      const subtitle = [grade, section].filter(Boolean).join(" - ");

      setStudentNavigation(student.id_number, student.full_name, {
        avatar: student.photo || undefined,
        subtitle: subtitle,
        status: student.status,
        id_number: student.id_number,
      });
    }
  }, [student, isLoading, isStudent, setStudentNavigation]);

  // Portal users (student): render children directly — sidebar handles nav
  if (isPortalUser) {
    return <>{children}</>;
  }

  // Admin/registrar: render vertical tab rail (desktop) or dropdown bar (tablet) alongside content
  const studentIdNumber = student?.id_number || "";
  const navItems = getStudentNavigation(studentIdNumber);

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0">
      <DetailSideNav items={navItems} />
      <ScrollArea className="flex-1 min-w-0">
        {children}
      </ScrollArea>
    </div>
  );
}
