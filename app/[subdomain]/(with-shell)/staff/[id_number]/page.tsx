"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { useStaff } from "@/lib/api2/staff"
import { StaffDetailHeader } from "@/components/staff/staff-detail-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AccountInfoSection } from "@/components/shared/account/account-info-section"
import { HugeiconsIcon } from "@hugeicons/react"
import { BookOpen02Icon, UserGroupIcon, Calendar01Icon, CheckmarkCircleIcon, UserIcon } from "@hugeicons/core-free-icons"
import PageLayout from "@/components/dashboard/page-layout"

export default function StaffOverviewPage() {
  const params = useParams()
  const idNumber = params.id_number as string
  const currentUrl = window.location.href

  const staffApi = useStaff()
  const { data: staff, isLoading, error, refetch, isFetching } = staffApi.getStaffMember(idNumber, {
    enabled: !!idNumber && currentUrl.includes("/staff/") // Only fetch if idNumber is present and URL contains "/staff/",
  })

  const handleRefresh = () => {
    void refetch()
  }

  const managerName =
    typeof staff?.manager === "string"
      ? staff.manager
      : staff?.manager?.full_name ||
        (typeof staff?.reports_to === "string"
          ? staff.reports_to
          : staff?.reports_to?.full_name) ||
        "N/A"

  const staffUserAccount =
    staff?.user_account && typeof staff.user_account === "object"
      ? {
          username: staff.user_account.username,
          email: staff.user_account.email,
          is_active: staff.user_account.is_active,
        }
      : null

  return (
    <PageLayout
      title={staff?.full_name || "Staff"}
      description={`Detailed view of ${staff?.first_name}'s information`}
      loading={isLoading}
      fetching={isFetching}
      refreshAction={handleRefresh}
      skeleton={
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      }
      error={error}
      noData={!staff}
    >
      {staff && (
      <div className="space-y-4">
        {/* Staff Header */}
        <StaffDetailHeader staff={staff} />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-lg font-semibold capitalize">{staff?.status || "N/A"}</p>
                </div>
                <HugeiconsIcon icon={CheckmarkCircleIcon} className="size-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="text-lg font-semibold">
                    {staff?.is_teacher ? "Teaching" : "Support"}
                  </p>
                </div>
                <HugeiconsIcon icon={BookOpen02Icon} className="size-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <p className="text-lg font-semibold">
                    {typeof staff?.primary_department === "string"
                      ? staff.primary_department
                      : staff?.primary_department?.name || "N/A"}
                  </p>
                </div>
                <HugeiconsIcon icon={UserGroupIcon} className="size-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Hire Date</p>
                  <p className="text-lg font-semibold">
                    {staff?.hire_date
                      ? new Date(staff.hire_date).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                <HugeiconsIcon icon={Calendar01Icon} className="size-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Manager</p>
                  <p className="text-lg font-semibold">{managerName}</p>
                </div>
                <HugeiconsIcon icon={UserIcon} className="size-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teaching Assignment (if teacher) */}
        {staff?.is_teacher && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Teaching Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {staff?.sections && staff.sections.length > 0 ? (
                <div className="space-y-3">
                  {staff.sections.map((section: any) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{section.name || "Section"}</p>
                        <p className="text-xs text-muted-foreground">
                          {section.grade_level && `Grade ${section.grade_level}`}
                        </p>
                      </div>
                      {section.students_count && (
                        <Badge variant="secondary" className="ml-2">
                          {section.students_count} students
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No teaching assignments yet</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Subjects Taught (if teacher) */}
        {staff?.is_teacher && staff?.subjects && staff.subjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {staff.subjects.map((subject: any) => (
                  <Badge key={subject.id} variant="outline">
                    {subject.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reporting Manager */}
        {staff?.reports_to && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reports To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {typeof staff.reports_to === "object" && staff.reports_to.photo ? (
                  <Image
                    src={staff.reports_to.photo}
                    alt={staff.reports_to.full_name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-semibold">
                      {typeof staff.reports_to === "string"
                        ? staff.reports_to[0]
                        : staff.reports_to.full_name?.[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">
                    {typeof staff.reports_to === "string"
                      ? staff.reports_to
                      : staff.reports_to.full_name}
                  </p>
                  {typeof staff.reports_to === "object" && (
                    <p className="text-xs text-muted-foreground">
                      ID: {staff.reports_to.id_number}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {staff && (
          <AccountInfoSection
            entityLabel="Staff"
            fullName={staff.full_name}
            idNumber={staff.id_number}
            accountType="STAFF"
            dateOfBirth={staff.date_of_birth}
            userAccount={staffUserAccount}
            onAccountCreated={async () => {
              await refetch()
            }}
          />
        )}
      </div>
      )}
    </PageLayout>
  )
}
