import {DashboardSquare01Icon, Building02Icon, ChartIcon, FileAttachmentIcon} from '@hugeicons/core-free-icons';
import {NavSection} from '@/components/navigation/type';
// Admin/Superadmin Navigation - For public/admin schema
export const adminNavSections: NavSection[] = [
  {
    items: [
      {
        icon: DashboardSquare01Icon,
        label: "Dashboard",
        path: "/admin/dashboard",
        meta: "Admin overview and insights",
      },
    ],
  },
  {
    title: "Tenant Management",
    items: [
      {
        icon: Building02Icon,
        label: "Tenants",
        path: "/admin/tenants",
        meta: "Manage schools and organizations",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        icon: FileAttachmentIcon,
        label: "Audit Logs",
        path: "/admin/logs",
        meta: "System activity logs",
      },
      {
        icon: ChartIcon,
        label: "Debug",
        path: "/admin/debug",
        meta: "Debug tools",
      },
    ],
  },
];
