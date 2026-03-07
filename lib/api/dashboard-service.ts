import apiClient from "@/lib/api-client";
import type { StudentDto } from "./student-types";

/* ------------------------------------------------------------------ */
/*  Dashboard Types                                                    */
/* ------------------------------------------------------------------ */

export type DashboardStats = {
  total_students?: number;
  total_staff?: number;
  total_teachers?: number;
  academic_year?: string;
  total_enrolled?: number;
  pending_bills?: number;
  total_courses?: number;
  active_sections?: number;
  avg_attendance?: number;
};

export type FinanceDataPoint = {
  month: string;
  moneyIn: number;
  moneyOut: number;
  moneyInChange: number;
  moneyOutChange: number;
};

export type SummaryCard = {
  title: string;
  value: string;
  subtitle: string;
  iconKey: string;
};

export type DashboardData = {
  alert: { pendingLeaves: number; overtimeApprovals: number };
  stats: SummaryCard[];
  chart: FinanceDataPoint[];
  employees: StudentDto[];
};

/* ------------------------------------------------------------------ */
/*  Dashboard API Functions                                            */
/* ------------------------------------------------------------------ */

/**
 * GET /students/summary/
 * Fetches dashboard summary statistics for students
 * Open to authenticated users (teachers, admins, staff, parents)
 */
export async function getDashboardSummary(_subdomain: string) {
  const { data } = await apiClient.get<DashboardStats>("students/summary/");
  return data;
}

/**
 * GET /students/?limit=5
 * Fetches recent students for the activity feed
 */
export async function getRecentStudents(
  _subdomain: string,
  params?: Record<string, any>
) {
  const { data } = await apiClient.get<any>("students/", {
    params: { limit: 5, ...params },
  });
  return data?.results || [];
}

/**
 * GET /billing/summary/
 * Fetches financial data for the fee collection chart (if available)
 */
export async function getFinancialSummary(_subdomain: string) {
  const { data } = await apiClient.get<FinanceDataPoint[]>(
    "billing/summary/"
  );
  return data;
}
