import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Notification01Icon,
  UserGroupIcon,
  Calendar01Icon,
  Calendar03Icon,
  Calendar04Icon,
  Coins01Icon,
  CreditCardIcon,
  CourseIcon,
  Invoice01Icon,
  BookOpen02Icon,
  Settings01Icon,
  FileIcon,
  FileExportIcon,
  Building02Icon,
  ChartIcon,
  SchoolIcon,
  Add01Icon,
  Call02Icon,
  UserMultiple02Icon,
  Briefcase01Icon,
} from "@hugeicons/core-free-icons";

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];

export type NavItem = {
  label: string;
  path: string;
  icon: IconType;
  badge?: string;
  meta?: string;
  requiredRoles?: string | string[];
  subItems?: Omit<NavItem, 'subItems'>[];
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

// Main Navigation - Organized by functional areas
export const primaryNavSections: NavSection[] = [
  // Dashboard
  {
    items: [
      {
        icon: DashboardSquare01Icon,
        label: "Dashboard",
        path: "/",
        meta: "Overview and insights",
      },
    ],
  },
  // Administration
  {
    title: "Administration",
    items: [
      {
        icon: UserGroupIcon,
        label: "Students",
        path: "/students",
        meta: "Student enrollment and records",
        requiredRoles: "teacher",
        subItems: [
          // {
          //   label: "Create New Student",
          //   path: "/students/create",
          //   icon: Add01Icon,
          // },
          {
            label: "All Students",
            path: "/students",
            icon: UserGroupIcon,
          },
        ]
      },
      {
        icon: UserMultiple02Icon,
        label: "Users Management",
        path: "/users",
        meta: "User accounts and authentication",
        requiredRoles: "admin",
      },
      {
        icon: Building02Icon,
        label: "Staff",
        path: "/staff",
        meta: "Staff and teachers",
        requiredRoles: "teacher",
        subItems: [
          // {
          //   label: "Create New Staff",
          //   path: "/staff/create",
          //   icon: Add01Icon,
          // },
          {
            label: "All Staff",
            path: "/staff",
            icon: UserGroupIcon,
          },
          {
            label: "Teachers",
            path: "/staff/teachers",
            icon: UserGroupIcon,
          },
          {
            icon: Briefcase01Icon,
            label: "Positions",
            path: "/positions",
            meta: "Position titles and roles",
            requiredRoles: "admin",
          },
          {
            icon: Building02Icon,
            label: "Departments",
            path: "/departments",
            meta: "Departments and organizational units",
            requiredRoles: "admin",
          },
        ]
      },
    ],
  },
  // Academic
  {
    title: "Academic",
    items: [
      {
        icon: BookOpen02Icon,
        label: "Grading",
        path: "/grading",
        meta: "Gradebooks and assessments",
        requiredRoles: ["teacher", "registrar"],
        subItems: [
          {
            label: "Overview",
            path: "/grading",
            icon: DashboardSquare01Icon,
          },
          {
            label: "Gradebooks",
            path: "/grading/gradebooks",
            icon: BookOpen02Icon,
          },
          {
            label: "Review",
            path: "/grading/review",
            icon: FileIcon,
          },
          {
            label: "Approve",
            path: "/grading/approve",
            icon: FileIcon,
          },
          {
            label: "Settings",
            path: "/grading/settings",
            icon: Settings01Icon,
          },
        ],
      },
      {
        icon: Calendar01Icon,
        label: "Attendance",
        path: "/attendance",
        meta: "Attendance tracking",
        requiredRoles: ["teacher", "registrar"],
      },
      {
        icon: SchoolIcon,
        label: "Classes",
        path: "/classes",
        meta: "Class schedules and sections",
        requiredRoles: ["teacher", "registrar"],
      },
      {
        icon: Calendar03Icon,
        label: "Academic Setup",
        path: "/setup/academic-years",
        meta: "Years, terms, and setup",
        requiredRoles: "admin",
        subItems: [
          {
            label: "Academic Years",
            path: "/setup/academic-years",
            icon: Calendar03Icon,
          },
          {
            label: "Grade Levels",
            path: "/setup/grade-levels",
            icon: BookOpen02Icon,
          },
          {
            label: "Sections",
            path: "/setup/sections",
            icon: CourseIcon,
          },
          {
            label: "Subjects",
            path: "/setup/subjects",
            icon: FileIcon,
          },
          // {
          //   label: "Semesters",
          //   path: "/setup/semesters",
          //   icon: Calendar04Icon,
          // },
          {
            label: "Marking Periods",
            path: "/setup/marking-periods",
            icon: FileIcon,
          },
          {
            label: "Installments",
            path: "/setup/installments",
            icon: Invoice01Icon,
          },
        ],
      },
    ]
  },
  // Financial
  {
    title: "Financial Mgmt",
    items: [
      {
        icon: Coins01Icon,
        label: "Financials",
        path: "/transactions",
        meta: "Transactions, billing, accounts",
        requiredRoles: "accountant",
        subItems: [
          {
            icon: Coins01Icon,
            label: "Transactions",
            path: "/transactions",
          },
          {
            icon: Coins01Icon,
            label: "Bank Accounts",
            path: "/bank-accounts",
          },
          {
            icon: Invoice01Icon,
            label: "Billing",
            path: "/billing",
          },
          {
            icon: CreditCardIcon,
            label: "Concessions",
            path: "/concessions",
            meta: "Manage student concessions",
          },
          {
            icon: CreditCardIcon,
            label: "Payment Methods",
            path: "/setup/payment-methods",
          },
          {
            icon: Coins01Icon,
            label: "Transaction Types",
            path: "/setup/transaction-types",
          },
        ],
      },
      {
        icon: Settings01Icon,
        label: "Fee Management",
        path: "/fees",
        meta: "Manage fee structure",
        requiredRoles: "accountant",
        subItems: [
          {
            icon: Add01Icon,
            label: "General Fees",
            path: "/fees",
            meta: "School-wide fee types",
          },
          {
            icon: Settings01Icon,
            label: "Section Fees",
            path: "/fees/sections",
            meta: "Assign fees to sections",
          },
        ],
      },
    ],
  },
  // System
  {
    title: "System",
    items: [
      {
        icon: ChartIcon,
        label: "Reports",
        path: "/reports",
        meta: "Analytics and exports",
        requiredRoles: "teacher",
      },
      {
        icon: Settings01Icon,
        label: "Settings",
        path: "/settings",
        meta: "Tenant branding and configuration",
        requiredRoles: "admin",
      },
      // {
      //   icon: Notification01Icon,
      //   label: "Notifications",
      //   path: "/notifications",
      //   badge: "9+",
      //   meta: "Alerts and messages",
      // },
    ],
  },
];

// Legacy flat structure for backwards compatibility
export const primaryNavItems: NavItem[] = primaryNavSections.flatMap(
  (section) => section.items
);

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
      icon: BookOpen02Icon,
      label: "Grades",
      path: "/student/grades",
      meta: "Your academic grades",
    },
    {
      icon: Calendar01Icon,
      label: "Attendance",
      path: "/student/attendance",
      meta: "Your attendance records",
    },
    {
      icon: SchoolIcon,
      label: "Schedule",
      path: "/student/schedule",
      meta: "Your class schedule",
    },
    {
      icon: Invoice01Icon,
      label: "Billing",
      path: "/student/billing",
      meta: "Fees and payments",
    },
    {
      icon: Settings01Icon,
      label: "Settings",
      path: "/student/settings",
      meta: "Account settings",
    },
  ];
}
