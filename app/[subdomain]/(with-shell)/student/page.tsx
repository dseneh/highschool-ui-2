"use client"

import { useCurrentStudent } from "@/hooks/use-current-student"
import { StudentDetailHeader } from "@/components/students/student-detail-header"
import { StudentDashboardMetrics } from "@/components/students/student-dashboard-metrics"
import { StudentFinancialTrendChart } from "@/components/students/student-financial-trend-chart"
import { StudentFeesBreakdownChart } from "@/components/students/student-fees-breakdown-chart"
import { StudentFinancialOverview } from "@/components/students/student-financial-overview"
import { EnrollmentAlert } from "@/components/students/enrollment-alert"
import { WithdrawnBanner } from "@/components/students/withdrawn-banner"
import { Skeleton } from "@/components/ui/skeleton"
import PageLayout from "@/components/dashboard/page-layout"

export default function StudentPortalPage() {
  const { student, isLoading, error, refetch, isFetching } = useCurrentStudent()

  const handleRefresh = () => {
    void refetch()
  }

  if (isLoading && !student) {
    return (
      <PageLayout
        title="Loading Student Data..."
        description="Please wait while we load your student information."
        loading={true}
        actions={null}
        fetching={false}
        refreshAction={handleRefresh}
        skeleton={<LoadingSkeleton />}
        error={null}
        noData={false}
      />
    )
  }

  return (
    <PageLayout
      title={student?.full_name || "My Dashboard"}
      description={`Your financial and academic information`}
      loading={isLoading}
      actions={null}
      fetching={isFetching}
      refreshAction={handleRefresh}
      skeleton={<LoadingSkeleton />}
      error={error}
      noData={!student}
    >
      <div className="space-y-4">
        {/* Enrollment Alert — shown when student is not enrolled */}
        <EnrollmentAlert student={student} />

        {/* Withdrawn Banner — shown when student is in read-only state */}
        <WithdrawnBanner student={student} onReEnroll={() => {}} loading={false} />

        {/* Student Header */}
        {student && (
            <StudentDetailHeader
            student={student}
            />
        )}

        {/* Dashboard Metrics */}
        {student && <StudentDashboardMetrics student={student} />}

        {/* Financial Overview */}
        {student && <StudentFinancialOverview student={student} />}

        {/* Charts */}
        {student && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StudentFinancialTrendChart student={student} />
          <StudentFeesBreakdownChart student={student} />
        </div>
        )}
      </div>
    </PageLayout>
  );
}


const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />

          {/* Metrics skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>

          {/* Quick info skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>

          {/* Financial skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
          </div>
        </div>
  )
}