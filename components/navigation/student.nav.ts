import {DashboardSquare01Icon, UserGroupIcon, Calendar01Icon, Invoice01Icon, BookOpen02Icon, Settings01Icon, FileExportIcon, SchoolIcon, Call02Icon, UserMultiple02Icon} from '@hugeicons/core-free-icons';
import {NavItem} from '@/components/navigation/type';
import type { StudentDto } from '@/lib/api2/student-types';

function withReturnTo(path: string, returnTo?: string): string {
  if (!returnTo) return path;
  return `${path}?returnTo=${encodeURIComponent(returnTo)}`;
}

// Student Detail Context Navigation
export function getStudentNavigation(idNumber: string, returnTo?: string): NavItem[] {
  return [
    {
      icon: DashboardSquare01Icon,
      label: "Overview",
      path: withReturnTo(`/students/${idNumber}`, returnTo),
      meta: "Student summary",
    },
    {
      icon: UserGroupIcon,
      label: "Details",
      path: withReturnTo(`/students/${idNumber}/details`, returnTo),
      meta: "Personal information",
    },
    {
      icon: BookOpen02Icon,
      label: "Grades",
      path: withReturnTo(`/students/${idNumber}/grades`, returnTo),
      meta: "Academic performance",
    },
    {
      icon: Invoice01Icon,
      label: "Billing",
      path: withReturnTo(`/students/${idNumber}/billing`, returnTo),
      meta: "Fees and payments",
    },
    {
      icon: Calendar01Icon,
      label: "Attendance",
      path: withReturnTo(`/students/${idNumber}/attendance`, returnTo),
      meta: "Attendance records",
    },
    {
      icon: SchoolIcon,
      label: "Schedule",
      path: withReturnTo(`/students/${idNumber}/schedule`, returnTo),
      meta: "Class schedule",
    },
    {
      icon: Call02Icon,
      label: "Contacts",
      path: withReturnTo(`/students/${idNumber}/contacts`, returnTo),
      meta: "Emergency contacts",
    },
    {
      icon: UserMultiple02Icon,
      label: "Guardians",
      path: withReturnTo(`/students/${idNumber}/guardians`, returnTo),
      meta: "Parents and guardians",
    },
    {
      icon: FileExportIcon,
      label: "Reports",
      path: withReturnTo(`/students/${idNumber}/reports`, returnTo),
      meta: "Report cards",
    },
    {
      icon: Settings01Icon,
      label: "Settings",
      path: withReturnTo(`/students/${idNumber}/settings`, returnTo),
      meta: "Student settings",
      requiredRoles: "admin",
    },
  ];
}

type StudentNavigationAccessContext = Pick<
  StudentDto,
  "is_enrolled" | "number_of_enrollments" | "enrollments" | "current_enrollment"
>;

export function applyStudentNavigationAvailability(
  items: NavItem[],
  student: StudentNavigationAccessContext | null | undefined,
): NavItem[] {
  const hasPriorEnrollmentHistory =
    (student?.number_of_enrollments ?? 0) > 0 ||
    Boolean(student?.enrollments?.length);
  const hasPriorBillingHistory =
    Boolean(
      student?.enrollments?.some((enrollment) => {
        const summary = enrollment.billing_summary;
        if (!summary) return false;
        return (
          (summary.total_bill ?? 0) > 0 ||
          (summary.paid ?? 0) > 0 ||
          (summary.balance ?? 0) > 0
        );
      }),
    ) ||
    Boolean(
      student?.current_enrollment?.billing_summary &&
        (((student.current_enrollment.billing_summary.total_bill ?? 0) > 0) ||
          ((student.current_enrollment.billing_summary.paid ?? 0) > 0) ||
          ((student.current_enrollment.billing_summary.balance ?? 0) > 0)),
    );
  const isCurrentlyEnrolled = Boolean(student?.is_enrolled);

  return items.map((item) => {
    const itemPath = item.path.split("?")[0] || item.path;

    if (itemPath.endsWith("/grades") && !isCurrentlyEnrolled && !hasPriorEnrollmentHistory) {
      return {
        ...item,
        disabled: true,
        disabledReason: "Grades are available after enrollment history exists.",
      };
    }

    if (
      itemPath.endsWith("/billing") &&
      !isCurrentlyEnrolled &&
      !hasPriorEnrollmentHistory &&
      !hasPriorBillingHistory
    ) {
      return {
        ...item,
        disabled: true,
        disabledReason: "Billing is available after enrollment or billing history exists.",
      };
    }

    if (itemPath.endsWith("/attendance") && !isCurrentlyEnrolled) {
      return {
        ...item,
        disabled: true,
        disabledReason: "Attendance is only available for currently enrolled students.",
      };
    }

    if (itemPath.endsWith("/schedule") && !isCurrentlyEnrolled) {
      return {
        ...item,
        disabled: true,
        disabledReason: "Schedule is only available for currently enrolled students.",
      };
    }

    if (itemPath.endsWith("/reports") && !isCurrentlyEnrolled) {
      return {
        ...item,
        disabled: true,
        disabledReason: "Reports are only available for currently enrolled students.",
      };
    }

    return item;
  });
}

// Student Portal Navigation - for logged-in students viewing their own dashboard
export function getStudentPortalNavigation(): NavItem[] {
  return [
    {
      icon: DashboardSquare01Icon,
      label: "Overview",
      path: "/",
      meta: "Your dashboard",
    },
    {
      icon: Call02Icon,
      label: "Contacts",
      path: "/my-contacts",
      meta: "Your emergency contacts",
    },
    {
      icon: UserMultiple02Icon,
      label: "Guardians",
      path: "/my-guardians",
      meta: "Your parents and guardians",
    },
    {
      icon: Invoice01Icon,
      label: "Billing",
      path: "/my-billing",
      meta: "Fees and payments",
    },
    {
      icon: BookOpen02Icon,
      label: "Grades",
      path: "/my-grades",
      meta: "Your academic grades",
    },
    {
      icon: Calendar01Icon,
      label: "Attendance",
      path: "/my-attendance",
      meta: "Your attendance records",
    },
    {
      icon: SchoolIcon,
      label: "Class Schedule",
      path: "/my-schedule",
      meta: "Your class schedule",
    },
    {
      icon: Calendar01Icon,
      label: "Calendar",
      path: "/my-calendar",
      meta: "Schedule calendar view",
    },
    {
      icon: FileExportIcon,
      label: "Reports",
      path: "/my-reports",
      meta: "Your report cards",
    },
    {
      icon: Settings01Icon,
      label: "Settings",
      path: "/my-settings",
      meta: "Account settings",
    },
  ];
}
