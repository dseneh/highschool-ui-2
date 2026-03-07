"use client";

import { lazy, Suspense } from "react";
import { useAuth } from "@/components/portable-auth/src/client";
import { LandingContent } from "@/components/dashboard/landing-content";
import { useDashboard } from "@/lib/api2";
import { DashboardSkeleton } from "@/components/dashboard/loading-skeleton";

const StudentPortalPage = lazy(() =>
  import("./student/page").then((mod) => ({
    default: mod.default,
  }))
);

export default function DashboardPage() {
  const { user: currentUser } = useAuth();

  const isStudent = currentUser?.account_type?.toLowerCase() === "student";

  const dashboard = useDashboard();
  const summaryQuery = dashboard.getDashboardSummary({
    staleTime: 5 * 60 * 1000,
    enabled: !isStudent,
  });
  const gradeLevelQuery = dashboard.getGradeLevelDistribution({
    staleTime: 5 * 60 * 1000,
    enabled: !isStudent,
  });
  const financialSummaryQuery = dashboard.getFinancialSummary({
    staleTime: 5 * 60 * 1000,
    enabled: !isStudent,
  });
  const paymentSummaryQuery = dashboard.getPaymentSummary({
    staleTime: 5 * 60 * 1000,
    enabled: !isStudent,
  });
  const paymentDistributionQuery = dashboard.getPaymentStatusDistribution({
    staleTime: 5 * 60 * 1000,
    enabled: !isStudent,
  });
  const topStudentsQuery = dashboard.getTopStudents({
    staleTime: 5 * 60 * 1000,
    enabled: !isStudent,
  });
  const recentStudentsQuery = dashboard.getRecentStudents(undefined, {
    staleTime: 5 * 60 * 1000,
    enabled: !isStudent,
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

