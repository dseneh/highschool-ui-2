import {DashboardSquare01Icon, UserGroupIcon, Calendar01Icon, CourseIcon, Settings01Icon, UserMultiple02Icon, BookOpen02Icon} from '@hugeicons/core-free-icons';
import {NavItem} from '@/components/navigation/type';
// Staff Detail Context Navigation
export function getStaffNavigation(staffId: string): NavItem[] {
  return [
    {
      icon: DashboardSquare01Icon,
      label: "Overview",
      path: `/staff/${staffId}`,
      meta: "Staff summary",
    },
    {
      icon: UserGroupIcon,
      label: "Details",
      path: `/staff/${staffId}/details`,
      meta: "Personal information",
    },
    {
      icon: UserMultiple02Icon,
      label: "Students",
      path: `/staff/${staffId}/students`,
      meta: "Class students",
    },
    {
      icon: BookOpen02Icon,
      label: "Grades",
      path: `/staff/${staffId}/grades`,
      meta: "My classes and gradebooks",
    },
    {
      icon: Calendar01Icon,
      label: "Schedule",
      path: `/staff/${staffId}/schedule`,
      meta: "Teaching schedule",
    },
    {
      icon: Calendar01Icon,
      label: "Calendar",
      path: `/staff/${staffId}/calendar`,
      meta: "Calendar view",
    },
    {
      icon: CourseIcon,
      label: "Classes",
      path: `/staff/${staffId}/classes`,
      meta: "Teaching assignments",
    },
    {
      icon: Settings01Icon,
      label: "Settings",
      path: `/staff/${staffId}/settings`,
      meta: "Staff settings",
      requiredRoles: "admin",
    },
  ];
}
