"use client"

import PageLayout from "@/components/dashboard/page-layout"
import EmptyStateComponent from "@/components/shared/empty-state"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartIcon } from "@hugeicons/core-free-icons"

export default function EmployeePerformancePage() {
  return (
    <PageLayout title="Performance" description="Reviews and development tracking">
      <EmptyStateComponent
        title="Performance"
        description="Performance reviews and tracking is being prepared. Check back soon."
        icon={<HugeiconsIcon icon={ChartIcon} />}
      />
    </PageLayout>
  )
}
