"use client";

import { lazy, Suspense } from "react";
import { useAuth } from "@/components/portable-auth/src/client";
import { LandingContent } from "@/components/dashboard/landing-content";
import { useDashboard } from "@/lib/api2";
import { DashboardSkeleton } from "@/components/dashboard/loading-skeleton";
import { useAdminWorkspace } from "@/hooks/use-admin-workspace";

const StudentPortalPage = lazy(() =>
  import("./(student)/page").then((mod) => ({
    default: mod.default,
  }))
);

export default function DashboardPage() {
  const { user: currentUser } = useAuth();
  const { isAdminWorkspace } = useAdminWorkspace();

  const isStudent = currentUser?.account_type?.toLowerCase() === "student";
  const shouldFetchTenantDashboard = !isStudent && !isAdminWorkspace;

  const dashboard = useDashboard();
  const summaryQuery = dashboard.getDashboardSummary({
    staleTime: 5 * 60 * 1000,
    enabled: shouldFetchTenantDashboard,
  });
  const gradeLevelQuery = dashboard.getGradeLevelDistribution({
    staleTime: 5 * 60 * 1000,
    enabled: shouldFetchTenantDashboard,
  });
  const financialSummaryQuery = dashboard.getFinancialSummary({
    staleTime: 5 * 60 * 1000,
    enabled: shouldFetchTenantDashboard,
  });
  const paymentSummaryQuery = dashboard.getPaymentSummary({
    staleTime: 5 * 60 * 1000,
    enabled: shouldFetchTenantDashboard,
  });
  const paymentDistributionQuery = dashboard.getPaymentStatusDistribution({
    staleTime: 5 * 60 * 1000,
    enabled: shouldFetchTenantDashboard,
  });
  const topStudentsQuery = dashboard.getTopStudents({
    staleTime: 5 * 60 * 1000,
    enabled: shouldFetchTenantDashboard,
  });
  const recentStudentsQuery = dashboard.getRecentStudents(undefined, {
    staleTime: 5 * 60 * 1000,
    enabled: shouldFetchTenantDashboard,
  });

  const isLoading =
    summaryQuery.isLoading ||
    gradeLevelQuery.isLoading ||
    financialSummaryQuery.isLoading ||
    paymentSummaryQuery.isLoading ||
    paymentDistributionQuery.isLoading ||
    topStudentsQuery.isLoading ||
    recentStudentsQuery.isLoading;
  
  if (isStudent) {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <StudentPortalPage />
      </Suspense>
    );
  }

  if (isLoading && !summaryQuery.data) {
    return <DashboardSkeleton />;
  }

  return (
    <LandingContent
      summary={summaryQuery.data}
      gradeLevelData={gradeLevelQuery.data || []}
      financialData={financialSummaryQuery.data || []}
      paymentSummary={paymentSummaryQuery.data}
      paymentDistribution={paymentDistributionQuery.data || []}
      topStudents={topStudentsQuery.data || []}
      employees={recentStudentsQuery.data || []}
    />
  );
}

