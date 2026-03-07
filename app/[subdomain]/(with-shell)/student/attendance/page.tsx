"use client"

import { useCurrentStudent } from "@/hooks/use-current-student"
import { Skeleton } from "@/components/ui/skeleton"
import PageLayout from "@/components/dashboard/page-layout"

function AttendanceSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export default function StudentAttendancePage() {
  const { student, isLoading, error, refetch, isFetching } = useCurrentStudent()

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <PageLayout
      title="Attendance"
      description="Your attendance records"
      loading={isLoading}
      fetching={isFetching}
      refreshAction={handleRefresh}
      skeleton={<AttendanceSkeleton />}
      error={error}
      noData={!student}
    >
      <div className="space-y-4">
        {student && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Attendance view coming soon</p>
            <p className="text-sm mt-2">Navigate using the sidebar menu</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
