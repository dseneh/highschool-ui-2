"use client"

import { useCurrentStudent } from "@/hooks/use-current-student"
import { Skeleton } from "@/components/ui/skeleton"
import { redirect } from "next/navigation"
import PageLayout from "@/components/dashboard/page-layout"

export default function StudentSchedulePage() {
  const { student, isLoading } = useCurrentStudent()

  if (!isLoading && !student) {
    redirect("/")
  }

  return (
    <PageLayout
      title="Schedule"
      description="Your class schedule"
      loading={isLoading}
      skeleton={<Skeleton className="h-96 rounded-xl" />}
    >
      <div className="text-center py-12 text-muted-foreground">
        <p>Schedule view coming soon</p>
        <p className="text-sm mt-2">Navigate using the sidebar menu</p>
      </div>
    </PageLayout>
  )
}
