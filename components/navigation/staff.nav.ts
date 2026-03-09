import {DashboardSquare01Icon, UserGroupIcon, Calendar01Icon, CourseIcon, Settings01Icon} from '@hugeicons/core-free-icons';
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
      icon: Calendar01Icon,
      label: "Schedule",
      path: `/staff/${staffId}/schedule`,
      meta: "Teaching schedule",
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
