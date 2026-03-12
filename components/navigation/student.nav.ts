import {DashboardSquare01Icon, UserGroupIcon, Calendar01Icon, Invoice01Icon, BookOpen02Icon, Settings01Icon, FileExportIcon, SchoolIcon, Call02Icon, UserMultiple02Icon} from '@hugeicons/core-free-icons';
import {NavItem} from '@/components/navigation/type';

// Student Detail Context Navigation
export function getStudentNavigation(idNumber: string): NavItem[] {
  return [
    {
      icon: DashboardSquare01Icon,
      label: "Overview",
      path: `/students/${idNumber}`,
      meta: "Student summary",
    },
    {
      icon: UserGroupIcon,
      label: "Details",
      path: `/students/${idNumber}/details`,
      meta: "Personal information",
    },
    {
      icon: BookOpen02Icon,
      label: "Grades",
      path: `/students/${idNumber}/grades`,
      meta: "Academic performance",
    },
    {
      icon: Invoice01Icon,
      label: "Billing",
      path: `/students/${idNumber}/billing`,
      meta: "Fees and payments",
    },
    {
      icon: Calendar01Icon,
      label: "Attendance",
      path: `/students/${idNumber}/attendance`,
      meta: "Attendance records",
    },
    {
      icon: SchoolIcon,
      label: "Schedule",
      path: `/students/${idNumber}/schedule`,
      meta: "Class schedule",
    },
    {
      icon: Call02Icon,
      label: "Contacts",
      path: `/students/${idNumber}/contacts`,
      meta: "Emergency contacts",
    },
    {
      icon: UserMultiple02Icon,
      label: "Guardians",
      path: `/students/${idNumber}/guardians`,
      meta: "Parents and guardians",
    },
    {
      icon: FileExportIcon,
      label: "Reports",
      path: `/students/${idNumber}/reports`,
      meta: "Report cards",
    },
    {
      icon: Settings01Icon,
      label: "Settings",
      path: `/students/${idNumber}/settings`,
      meta: "Student settings",
      requiredRoles: "admin",
    },
  ];
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
