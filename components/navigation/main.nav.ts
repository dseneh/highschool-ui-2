import { Add01Icon, ArrowShrinkIcon, BookOpen02Icon, Briefcase01Icon, Building02Icon, Calendar01Icon, Calendar03Icon, ChartIcon, Coins01Icon, CourseIcon, CreditCardIcon, DashboardSquare01Icon, FileAttachmentIcon, FileIcon, Invoice01Icon, Settings01Icon, UserGroupIcon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
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
        icon: ArrowShrinkIcon,
        label: "Human Resources",
        path: "/employees",
        meta: "Employees and teachers",
        requiredRoles: "teacher",
        subItems: [
          // {
          //   label: "Create New Staff",
          //   path: "/staff/create",
          //   icon: Add01Icon,
          // },
          {
            label: "All Employees",
            path: "/employees",
            icon: UserGroupIcon,
          },
          {
            label: "Teachers",
            path: "/staff/teachers",
            icon: UserGroupIcon,
          },
          {
            icon: Calendar01Icon,
            label: "Attendance",
            path: "/employee-attendance",
            meta: "Employee presence and work hours",
            requiredRoles: "admin",
          },
          {
            icon: Calendar01Icon,
            label: "Leaves",
            path: "/leaves",
            meta: "Leave requests and approvals",
            requiredRoles: "admin",
          },
          {
            icon: Coins01Icon,
            label: "Payroll",
            path: "/payroll",
            meta: "Compensation, earnings, and deductions",
            requiredRoles: "admin",
          },
          {
            icon: ArrowShrinkIcon,
            label: "Workflows",
            path: "/employee-workflows",
            meta: "Onboarding and offboarding checklists",
            requiredRoles: "admin",
          },
          {
            icon: FileIcon,
            label: "Documents",
            path: "/employee-documents",
            meta: "Contracts, licenses, and certifications",
            requiredRoles: "admin",
          },
          {
            icon: ChartIcon,
            label: "Performance",
            path: "/performance",
            meta: "Employee reviews and development tracking",
            requiredRoles: "admin",
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
      // {
      //   icon: SchoolIcon,
      //   label: "Classes",
      //   path: "/classes",
      //   meta: "Class schedules and sections",
      //   requiredRoles: ["teacher", "registrar"],
      // },
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
        icon: BookOpen02Icon,
        label: "Accounting",
        path: "/accounting/journal-entries",
        meta: "Ledger accounts, journals, cash transactions",
        requiredRoles: "accountant",
        subItems: [
          {
            icon: Coins01Icon,
            label: "Currencies",
            path: "/accounting/currencies",
          },
          {
            icon: BookOpen02Icon,
            label: "Chart of Accounts",
            path: "/accounting/ledger-accounts",
          },
          {
            icon: Building02Icon,
            label: "Bank Accounts",
            path: "/accounting/bank-accounts",
          },
          {
            icon: Settings01Icon,
            label: "Fees Setup",
            path: "/accounting/fees-setup",
          },
          {
            icon: CreditCardIcon,
            label: "Concessions",
            path: "/accounting/concessions",
            meta: "Manage student concessions",
          },
          {
            icon: CreditCardIcon,
            label: "Transaction Types",
            path: "/accounting/transaction-types",
          },
          {
            icon: Coins01Icon,
            label: "Cash Transactions",
            path: "/accounting/cash-transactions",
          },
          {
            icon: Invoice01Icon,
            label: "Student Payments",
            path: "/accounting/student-payments",
          },
          {
            icon: FileIcon,
            label: "Journal Entries",
            path: "/accounting/journal-entries",
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
        icon: UserMultiple02Icon,
        label: "Users Accounts",
        path: "/users",
        meta: "User accounts and authentication",
        requiredRoles: "admin",
      },
      {
        icon: FileAttachmentIcon,
        label: "Activity Log",
        path: "/activity-logs",
        meta: "System activity and audit trail",
        requiredRoles: "admin",
      },
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
