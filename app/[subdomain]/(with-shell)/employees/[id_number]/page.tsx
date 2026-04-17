"use client"

import { useParams } from "next/navigation"
import { useEmployee } from "@/lib/api2/employee"
import { StaffDetailHeader } from "@/components/employees/staff-detail-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AccountInfoSection } from "@/components/shared/account/account-info-section"
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards"
import { HugeiconsIcon } from "@hugeicons/react"
import { BookOpen02Icon, UserGroupIcon, Calendar01Icon, CheckmarkCircleIcon, UserIcon, Building02Icon } from "@hugeicons/core-free-icons"
import PageLayout from "@/components/dashboard/page-layout"
import { showToast } from "@/lib/toast"
import { getErrorMessage } from "@/lib/utils/error-handler"
import { useHasRole } from "@/hooks/use-authorization"

export default function EmployeeOverviewPage() {
  const params = useParams()
  const idNumber = params.id_number as string
  const currentUrl = window.location.href

  const canManageStaff = useHasRole("admin")

  const employeeApi = useEmployee()
  const { data: employee, isLoading, error, refetch, isFetching } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && currentUrl.includes("/employees/"),
  })

  const { mutateAsync: patchEmployee, isPending: isTogglingTeacher } = employeeApi.patchEmployee(employee?.id || "")

  const handleToggleTeacher = async (checked: boolean) => {
    try {
      await patchEmployee({ is_teacher: checked })
      showToast.success(checked ? "Marked as teaching staff" : "Removed from teaching staff")
      void refetch()
    } catch (err) {
      showToast.error(getErrorMessage(err))
    }
  }

  const handleRefresh = () => {
    void refetch()
  }

  const managerName =
    typeof employee?.manager === "string"
      ? employee.manager
      : employee?.manager?.full_name || "N/A"

  const isEmpty = !isLoading && !employee;

  return (
    <PageLayout
      title={employee?.full_name || "Employee"}
      description={`Detailed view of ${employee?.first_name}'s information`}
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
      noData={isEmpty}
    >
      {!isEmpty && (
      <div className="space-y-4">
        {/* Employee Header */}
        <StaffDetailHeader staff={employee} />

        {/* Quick Stats */}
        <StatsCards
          className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
          items={[
            {
              title: "Status",
              value: employee?.employment_status || "N/A",
              subtitle: employee?.employment_status === "active" ? "Currently employed" : "Review status",
              icon: CheckmarkCircleIcon,
            },
            {
              title: "Department",
              value: typeof employee?.department === "string"
                ? employee.department
                : employee?.department?.name || "N/A",
              subtitle: typeof employee?.position === "string"
                ? employee.position
                : employee?.position?.title || "No position",
              icon: Building02Icon,
              subtitleIcon: UserGroupIcon,
            },
            {
              title: "Hire Date",
              value: employee?.hire_date
                ? new Date(employee.hire_date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "N/A",
              subtitle: employee?.hire_date
                ? `${Math.floor((Date.now() - new Date(employee.hire_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years of service`
                : "Not set",
              icon: Calendar01Icon,
            },
            {
              title: "Manager",
              value: managerName,
              subtitle: "Reporting to",
              icon: UserIcon,
            },
          ] satisfies StatsCardItem[]}
        />

        {/* Teaching Staff Toggle */}
        <Card className="overflow-hidden border-border/80 transition-colors hover:border-primary/35">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                <HugeiconsIcon icon={BookOpen02Icon} className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{employee?.is_teaching_staff ? "Teaching Staff" : "Support Staff"}</p>
                <p className="text-xs text-muted-foreground">
                  {canManageStaff ? "Toggle to mark as teaching staff" : "Only admins can change this"}
                </p>
              </div>
            </div>
            <Switch
              checked={employee?.is_teacher ?? false}
              onCheckedChange={handleToggleTeacher}
              disabled={isTogglingTeacher || !canManageStaff}
              aria-label="Toggle teaching staff"
            />
          </CardContent>
        </Card>

        {/* Teaching Assignment (if teacher) */}
        {employee?.is_teaching_staff && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Teaching Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No teaching assignments yet</p>
            </CardContent>
          </Card>
        )}

        {/* Reporting Manager */}
        {employee?.manager && typeof employee.manager === "object" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reports To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-semibold">
                    {employee.manager.full_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {employee.manager.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {employee.manager.id_number}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {employee && (
          <AccountInfoSection
            entityLabel="Employee"
            fullName={employee.full_name}
            idNumber={employee.id_number}
            accountType="STAFF"
            dateOfBirth={employee.date_of_birth}
            userAccount={null}
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
