"use client"

import { useCurrentStudent } from "@/hooks/use-current-student"
import { Skeleton } from "@/components/ui/skeleton"
import { redirect } from "next/navigation"
import PageLayout from "@/components/dashboard/page-layout"

export default function StudentGradesPage() {
  const { student, isLoading } = useCurrentStudent()

  if (!isLoading && !student) {
    redirect("/")
  }

  return (
    <PageLayout
      title="My Grades"
      description="Your academic grades"
      loading={isLoading}
      skeleton={<Skeleton className="h-96 rounded-xl" />}
    >
      <div className="text-center py-12 text-muted-foreground">
        <p>Grades view coming soon</p>
        <p className="text-sm mt-2">Navigate using the sidebar menu</p>
      </div>
    </PageLayout>
  )
}
