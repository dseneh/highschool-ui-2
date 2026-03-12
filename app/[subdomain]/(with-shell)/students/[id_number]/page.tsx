"use client"

import { useStudents as useStudentsApi } from "@/lib/api2/student"
import { StudentDetailHeader } from "@/components/students/student-detail-header"
import { StudentDashboardMetrics } from "@/components/students/student-dashboard-metrics"
import { StudentFinancialTrendChart } from "@/components/students/student-financial-trend-chart"
import { StudentFeesBreakdownChart } from "@/components/students/student-fees-breakdown-chart"
import { StudentFinancialOverview } from "@/components/students/student-financial-overview"
import { EnrollmentAlert } from "@/components/students/enrollment-alert"
import { WithdrawnBanner } from "@/components/students/withdrawn-banner"
import { Skeleton } from "@/components/ui/skeleton"
import PageLayout from "@/components/dashboard/page-layout"
import { useResolvedStudentIdNumber } from "@/hooks/use-resolved-student-id-number"

export default function StudentOverviewPage() {
  const idNumber = useResolvedStudentIdNumber()
  const studentsApi = useStudentsApi()

  const { data: student, isLoading, error, refetch, isFetching } = studentsApi.getStudent(idNumber, {
    enabled: !!idNumber,
  })

  const handleRefresh = () => {
    void refetch()
  }


  return (
    <PageLayout
    title={student?.full_name || "Student"}
    description={`Detailed view of ${student?.first_name}'s financial and academic information`}
    loading={isLoading}
    actions={null}
    fetching={isFetching}
    refreshAction={handleRefresh}
    skeleton={
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
    }
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
        <StudentDashboardMetrics student={student} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentFinancialTrendChart student={student} />
          <StudentFeesBreakdownChart student={student} />
        </div>

        {/* Financial Overview */}
        <StudentFinancialOverview student={student} />
      </div>
    </PageLayout>
  )
}
