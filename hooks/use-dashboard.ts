"use client";

import { useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  getDashboardSummary,
  getRecentStudents,
  getFinancialSummary,
  type DashboardStats,
  type FinanceDataPoint,
} from "@/lib/api2/dashboard-service";

const dashboardKeys = {
  all: (sub: string) => ["dashboard", sub] as const,
  summary: (sub: string) => ["dashboard", sub, "summary"] as const,
  recentStudents: (sub: string) => ["dashboard", sub, "recentStudents"] as const,
  financialSummary: (sub: string) => ["dashboard", sub, "financialSummary"] as const,
};

export function useDashboardSummary(options = {}) {
  const subdomain = useTenantSubdomain();

  return useQuery<DashboardStats | null>({
    queryKey: dashboardKeys.summary(subdomain),
    queryFn: () => getDashboardSummary(subdomain),
    enabled: Boolean(subdomain),
    ...options,
  });
}

export function useRecentStudents(options = {}) {
  const subdomain = useTenantSubdomain();

  return useQuery<any[]>({
    queryKey: dashboardKeys.recentStudents(subdomain),
    queryFn: () => getRecentStudents(subdomain),
    enabled: Boolean(subdomain),
    ...options,
  });
}

export function useFinancialSummary(options = {}) {
  const subdomain = useTenantSubdomain();

  return useQuery<FinanceDataPoint[] | null>({
    queryKey: dashboardKeys.financialSummary(subdomain),
    queryFn: () => getFinancialSummary(subdomain),
    enabled: Boolean(subdomain),
    ...options,
  });
}

/**
 * Combined hook that fetches all dashboard data
 * Provides optimized parallel queries with shared caching
 */
export function useDashboard(options = {}) {
  const subdomain = useTenantSubdomain();

  const summary = useQuery<DashboardStats | null>({
    queryKey: dashboardKeys.summary(subdomain),
    queryFn: () => getDashboardSummary(subdomain),
    enabled: Boolean(subdomain),
    ...options,
  });

  const recentStudents = useQuery<any[]>({
    queryKey: dashboardKeys.recentStudents(subdomain),
    queryFn: () => getRecentStudents(subdomain),
    enabled: Boolean(subdomain),
    ...options,
  });

  const financialSummary = useQuery<FinanceDataPoint[] | null>({
    queryKey: dashboardKeys.financialSummary(subdomain),
    queryFn: () => getFinancialSummary(subdomain),
    enabled: Boolean(subdomain),
    ...options,
  });

  const isLoading = summary.isLoading || recentStudents.isLoading || financialSummary.isLoading;
  const isError = summary.isError || recentStudents.isError || financialSummary.isError;

  return {
    summary: summary.data,
    recentStudents: recentStudents.data,
    financialSummary: financialSummary.data,
    isLoading,
    isError,
    isFetching: summary.isFetching || recentStudents.isFetching || financialSummary.isFetching,
  };
}
