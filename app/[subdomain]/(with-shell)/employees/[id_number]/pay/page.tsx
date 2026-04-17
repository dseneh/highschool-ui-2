"use client"

import PageLayout from "@/components/dashboard/page-layout"
import EmptyStateComponent from "@/components/shared/empty-state"
import { HugeiconsIcon } from "@hugeicons/react"
import { Coins01Icon } from "@hugeicons/core-free-icons"

export default function EmployeePayPage() {
  return (
    <PageLayout title="Pay" description="Compensation and payslips">
      <EmptyStateComponent
        title="Pay"
        description="Compensation and payslip management is being prepared. Check back soon."
        icon={<HugeiconsIcon icon={Coins01Icon} />}
      />
    </PageLayout>
  )
}
