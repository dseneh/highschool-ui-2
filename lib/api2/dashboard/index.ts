"use client";
import { useDashboardApi } from './api'
import { useApiQuery } from '../utils'

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

export type GradeLevelDistribution = {
  grade_level: string;
  short_name?: string;
  grade_id: string;
  count: number;
  percentage: number;
  level: number;
};

export type PaymentStatusDistribution = {
  status: string;
  statusKey: string;
  count: number;
  percentage: number;
  color: string;
};

export type AttendanceDistribution = {
  [key: string]: { count: number; percentage: number };
};

export type SectionDistribution = {
  section: string;
  section_id: string;
  count: number;
  capacity: number;
  utilization: number;
};

export type PaymentSummary = {
  total_expected: number;
  total_paid: number;
  total_pending: number;
  collection_rate: number;
  enrollment_count: number;
};

export type TopStudent = {
  id: string;
  full_name: string;
  id_number: string;
  grade_level: string;
  final_average: number;
};

export type DashboardData = {
  alert: { pendingLeaves: number; overtimeApprovals: number };
  stats: SummaryCard[];
  chart: FinanceDataPoint[];
  employees: any[];
  distributions?: {
    gradeLevel: GradeLevelDistribution[];
    paymentStatus: PaymentStatusDistribution[];
    attendance: AttendanceDistribution;
    sections: SectionDistribution[];
    paymentSummary?: PaymentSummary;
  };
};

export function useDashboard() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useDashboardApi()

    const getDashboardSummary = (options = {}) =>
        useApiQuery(
            ['dashboard', 'summary'],
            () => api.getDashboardSummary().then((res: any) => res.data),
            options,
        )

    const getRecentStudents = (params?: any, options = {}) =>
        useApiQuery(
            ['dashboard', 'recentStudents', params],
            () => api.getRecentStudents(params).then((res: any) => res.data?.results || []),
            options,
        )

    const getFinancialSummary = (options = {}) =>
        useApiQuery(
            ['dashboard', 'financialSummary'],
            () => api.getFinancialSummary().then((res: any) => res.data).catch(() => null),
            options,
        )

    const getGradeLevelDistribution = (options = {}) =>
        useApiQuery(
            ['dashboard', 'gradeLevelDistribution'],
            () => api.getGradeLevelDistribution().then((res: any) => res.data),
            options,
        )

    const getPaymentStatusDistribution = (options = {}) =>
        useApiQuery(
            ['dashboard', 'paymentStatusDistribution'],
            () => api.getPaymentStatusDistribution().then((res: any) => res.data),
            options,
        )

    const getAttendanceDistribution = (options = {}) =>
        useApiQuery(
            ['dashboard', 'attendanceDistribution'],
            () => api.getAttendanceDistribution().then((res: any) => res.data),
            options,
        )

    const getSectionDistribution = (options = {}) =>
        useApiQuery(
            ['dashboard', 'sectionDistribution'],
            () => api.getSectionDistribution().then((res: any) => res.data),
            options,
        )

    const getPaymentSummary = (options = {}) =>
        useApiQuery(
            ['dashboard', 'paymentSummary'],
            () => api.getPaymentSummary().then((res: any) => res.data),
            options,
        )

    const getTopStudents = (options = {}) =>
        useApiQuery(
            ['dashboard', 'topStudents'],
            () => api.getTopStudents().then((res: any) => res.data),
            options,
        )

    return {
        getDashboardSummary,
        getRecentStudents,
        getFinancialSummary,
        getGradeLevelDistribution,
        getPaymentStatusDistribution,
        getAttendanceDistribution,
        getSectionDistribution,
        getPaymentSummary,
        getTopStudents,
    }
}
