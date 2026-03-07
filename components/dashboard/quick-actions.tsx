"use client";

import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAdd01Icon,
  BookOpen02Icon,
  PieChartSquareIcon,
  Calendar03Icon,
  User02Icon,
  Rocket02Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

const actions = [
  {
    id: "enroll-student",
    label: "Enroll Student",
    description: "Add new student",
    icon: UserAdd01Icon,
    href: "/students/new",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "view-grades",
    label: "View Grades",
    description: "Check student results",
    icon: BookOpen02Icon,
    href: "/academics/grades",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    id: "attendance",
    label: "Attendance",
    description: "Track attendance",
    icon: Calendar03Icon,
    href: "/academics/attendance",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    id: "view-reports",
    label: "Reports",
    description: "View analytics",
    icon: PieChartSquareIcon,
    href: "/reports",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    id: "staff-directory",
    label: "Staff",
    description: "Manage teachers",
    icon: User02Icon,
    href: "/staff",
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    id: "billing",
    label: "Fee Management",
    description: "Student fees & invoices",
    icon: Rocket02Icon,
    href: "/finance/billing",
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
  },
];

export function QuickActions() {
  const router = useRouter();
  const subdomain = useTenantSubdomain();

  const handleAction = (href: string) => {
    if (subdomain) {
      router.push(`/${subdomain}${href}`);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.href)}
            className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left group"
          >
            <div className={`${action.bgColor} p-2 rounded-lg`}>
              <HugeiconsIcon 
                icon={action.icon} 
                className={`size-5 ${action.color}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
