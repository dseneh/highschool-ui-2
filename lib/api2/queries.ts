import type { EmployeeDto } from "./employee-types";

/* Re-export the canonical employee types so existing consumers keep working */
export type { EmployeeDto } from "./employee-types";

/* ------------------------------------------------------------------ */
/*  Shared types used by all page components                           */
/* ------------------------------------------------------------------ */

export type SummaryCardData = {
  title: string;
  value: string;
  subtitle: string;
  iconKey: string;
};

/* Dashboard */
export type DashboardData = {
  alert: { pendingLeaves: number; overtimeApprovals: number };
  stats: SummaryCardData[];
  chart: {
    month: string;
    moneyIn: number;
    moneyOut: number;
    moneyInChange: number;
    moneyOutChange: number;
  }[];
  employees: EmployeeDto[];
};

/* Employees - the proxy now returns EmployeeDto[] directly */
export type EmployeePageData = EmployeeDto[];

/* Attendance */
export type AttendanceData = {
  summaryCards: SummaryCardData[];
  attendanceRows: {
    id: string;
    name: string;
    team: string;
    date: string;
    status: string;
    hours: string;
  }[];
  requestRows: {
    id: string;
    name: string;
    days: string;
    type: string;
    status: string;
  }[];
};

/* Performance */
export type PerformanceData = {
  summaryCards: SummaryCardData[];
  reviewRows: {
    id: string;
    name: string;
    team: string;
    cycle: string;
    rating: string;
    status: string;
  }[];
};

/* Invoices */
export type InvoiceData = {
  summaryCards: SummaryCardData[];
  invoices: {
    id: string;
    vendor: string;
    due: string;
    amount: string;
    status: string;
  }[];
  approvals: {
    id: string;
    invoice: string;
    owner: string;
    status: string;
  }[];
};

/* Notifications */
export type NotificationData = {
  summaryCards: SummaryCardData[];
  notifications: {
    id: string;
    title: string;
    description: string;
    time: string;
    type: string;
    status: string;
  }[];
  quickActions: {
    title: string;
    detail: string;
  }[];
};

/* Payroll */
export type PayrollData = {
  summaryCards: SummaryCardData[];
  payrollRuns: {
    id: string;
    period: string;
    status: string;
    employees: number;
    amount: string;
  }[];
  approvals: {
    id: string;
    name: string;
    role: string;
    status: string;
  }[];
};

/* ------------------------------------------------------------------ */
/*  Fetch helpers                                                      */
/* ------------------------------------------------------------------ */

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchDashboard(sub: string) {
  return fetchJson<DashboardData>(`/api/tenants/${sub}/dashboard`);
}

export function fetchEmployees(sub: string, params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  return fetchJson<EmployeePageData>(`/api/tenants/${sub}/employees${qs}`);
}

export function fetchAttendance(sub: string) {
  return fetchJson<AttendanceData>(`/api/tenants/${sub}/attendance`);
}

export function fetchPerformance(sub: string) {
  return fetchJson<PerformanceData>(`/api/tenants/${sub}/performance`);
}

export function fetchInvoices(sub: string) {
  return fetchJson<InvoiceData>(`/api/tenants/${sub}/invoices`);
}

export function fetchNotifications(sub: string) {
  return fetchJson<NotificationData>(`/api/tenants/${sub}/notifications`);
}

export function fetchPayroll(sub: string) {
  return fetchJson<PayrollData>(`/api/tenants/${sub}/payroll`);
}
