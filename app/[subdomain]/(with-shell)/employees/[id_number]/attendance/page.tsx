"use client"

import PageLayout from "@/components/dashboard/page-layout"
import EmptyStateComponent from "@/components/shared/empty-state"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon } from "@hugeicons/core-free-icons"

export default function EmployeeAttendancePage() {
  return (
    <PageLayout title="Attendance" description="Employee attendance and work hours">
      <EmptyStateComponent
        title="Attendance"
        description="Employee attendance tracking is being prepared. Check back soon."
        icon={<HugeiconsIcon icon={Calendar01Icon} />}
      />
    </PageLayout>
  )
}
