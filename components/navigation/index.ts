import {
  DashboardSquare01Icon, UserGroupIcon,
  Calendar01Icon, CourseIcon,
  Invoice01Icon,
  BookOpen02Icon,
  Settings01Icon, FileExportIcon, SchoolIcon, Call02Icon,
  UserMultiple02Icon
} from "@hugeicons/core-free-icons";
import { NavItem } from "./type";
import { primaryNavSections } from "./main.nav";
import { adminNavSections } from "./admin.nav";


// Legacy flat structure for backwards compatibility
export const primaryNavItems: NavItem[] = primaryNavSections.flatMap(
  (section) => section.items
);

export const adminNavItems: NavItem[] = adminNavSections.flatMap(
  (section) => section.items
);

export * from "./main.nav";
export * from "./admin.nav";
export * from "./student.nav";
export type { NavItem } from "./type";
export type { NavSection } from "./type";