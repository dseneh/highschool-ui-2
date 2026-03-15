import { Add01Icon, BookOpen02Icon, Briefcase01Icon, Building02Icon, Calendar01Icon, Calendar03Icon, ChartIcon, Coins01Icon, CourseIcon, CreditCardIcon, DashboardSquare01Icon, FileIcon, Invoice01Icon, SchoolIcon, Settings01Icon, UserGroupIcon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { NavSection } from "./type";

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
        label: "Calendar",
        path: "/calendar",
        meta: "School timetable calendar",
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
            label: "Class Sections",
            path: "/setup/sections",
            icon: CourseIcon,
          },
          {
            label: "Periods & Times",
            path: "/setup/period-times",
            icon: Calendar03Icon,
          },
          {
            label: "Section Scheduler",
            path: "/setup/section-subject-scheduler",
            icon: Calendar03Icon,
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
