"use client"

import { useParams } from "next/navigation"
import { useStaff } from "@/lib/api2/staff"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    BookOpen02Icon,
    User02Icon
} from "@hugeicons/core-free-icons"
import PageLayout from "@/components/dashboard/page-layout"
import {
    EmptyState,
    EmptyStateIcon,
    EmptyStateTitle,
    EmptyStateDescription,
} from "@/components/ui/empty-state"

export default function StaffClassesPage() {
  const params = useParams()
  const idNumber = params.id_number as string
  const staffApi = useStaff()

  const { data: staff, isLoading, error, refetch, isFetching } = staffApi.getStaffMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/staff/"), 
  })

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <PageLayout
      title="Teaching Assignments"
      description="Teaching assignments and classes"
      loading={isLoading}
      fetching={isFetching}
      refreshAction={handleRefresh}
      skeleton={
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
      error={error}
      noData={!staff || !staff.is_teacher || !staff.sections || staff.sections.length === 0}
      emptyStateTitle={!staff?.is_teacher ? "Not a Teacher" : staff.sections.length === 0 ? "No Classes Assigned" : "Not A Teacher"}
      emptyStateDescription={"This teacher has not been assigned to any classes yet."}
    >
      <div className="space-y-6">
        {/* Classes Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={BookOpen02Icon} className="h-5 w-5" />
              Teaching Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staff?.sections && staff.sections.length > 0 && (
              <div className="space-y-4">
                {staff.sections.map((section: any, idx: number) => (
                  <div key={idx} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{section.name || "Section Name"}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.grade_level || "Grade Level"} • {section.students_count || 0} students
                        </p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subjects (if available) */}
        {staff?.subjects && staff.subjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Teaching Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {staff.subjects.map((subject: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <span className="font-medium">{subject.name || subject}</span>
                    <Badge variant="outline">{subject.grade_level || "All Levels"}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}
