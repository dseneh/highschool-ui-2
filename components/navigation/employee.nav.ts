import {DashboardSquare01Icon, UserGroupIcon, Calendar01Icon, CourseIcon, Settings01Icon, UserMultiple02Icon, BookOpen02Icon, Coins01Icon, FileIcon, FileEditIcon, ChartIcon} from '@hugeicons/core-free-icons';
import {NavItem} from '@/components/navigation/type';

// Employee Detail Context Navigation
export function getEmployeeNavigation(employeeId: string, isTeachingStaff = false): NavItem[] {
  const teacherItems: NavItem[] = isTeachingStaff
    ? [
        {
          icon: UserMultiple02Icon,
          label: "Students",
          path: `/employees/${employeeId}/students`,
          meta: "Class students",
        },
        {
          icon: BookOpen02Icon,
          label: "Grades",
          path: `/employees/${employeeId}/grades`,
          meta: "My classes and gradebooks",
        },
        {
          icon: Calendar01Icon,
          label: "Schedule",
          path: `/employees/${employeeId}/schedule`,
          meta: "Teaching schedule",
        },
        {
          icon: CourseIcon,
          label: "Classes",
          path: `/employees/${employeeId}/classes`,
          meta: "Teaching assignments",
        },
      ]
    : [];

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
      meta: "Personal information",
    },
    ...teacherItems,
    {
      icon: Calendar01Icon,
      label: "Attendance",
      path: `/employees/${employeeId}/attendance`,
      meta: "Presence and work hours",
    },
    {
      icon: Calendar01Icon,
      label: "Leaves",
      path: `/employees/${employeeId}/leaves`,
      meta: "Leave requests and balances",
    },
    {
      icon: Coins01Icon,
      label: "Pay",
      path: `/employees/${employeeId}/pay`,
      meta: "Compensation and payslips",
    },
    {
      icon: FileIcon,
      label: "Documents",
      path: `/employees/${employeeId}/documents`,
      meta: "Contracts, licenses, and certifications",
    },
    {
      icon: ChartIcon,
      label: "Performance",
      path: `/employees/${employeeId}/performance`,
      meta: "Reviews and development tracking",
    },
    {
      icon: FileEditIcon,
      label: "Activity",
      path: `/employees/${employeeId}/activity`,
      meta: "Audit trail",
      requiredRoles: "admin",
    },
    {
      icon: Settings01Icon,
      label: "Settings",
      path: `/employees/${employeeId}/settings`,
      meta: "Employee settings",
      requiredRoles: "admin",
    },
  ];
}
