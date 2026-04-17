"use client"

import PageLayout from "@/components/dashboard/page-layout"
import EmptyStateComponent from "@/components/shared/empty-state"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileIcon } from "@hugeicons/core-free-icons"

export default function EmployeeDocumentsPage() {
  return (
    <PageLayout title="Documents" description="Contracts, licenses, and certifications">
      <EmptyStateComponent
        title="Documents"
        description="Document management is being prepared. Check back soon."
        icon={<HugeiconsIcon icon={FileIcon} />}
      />
    </PageLayout>
  )
}
