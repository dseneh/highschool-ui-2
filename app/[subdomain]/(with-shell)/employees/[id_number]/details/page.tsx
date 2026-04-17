"use client"

import { useParams } from "next/navigation"
import { useEmployee } from "@/lib/api2/employee"
import { StaffDetailHeader } from "@/components/employees/staff-detail-header"
import { StaffPersonalInfo } from "@/components/employees/staff-personal-info"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import PageLayout from "@/components/dashboard/page-layout"

export default function EmployeeDetailsPage() {
  const params = useParams()
  const idNumber = params.id_number as string

  const employeeApi = useEmployee()
  const { data: employee, isLoading, error, refetch, isFetching } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/employees/"),
  })


  return (
    <PageLayout
    title="Employee Details"
    description={`View and manage detailed information for ${employee?.first_name} ${employee?.last_name}`}
    refreshAction={refetch}
    fetching={isFetching}
    error={error}
    noData={!employee}
    loading={isLoading}
    skeleton={
      <LoadingSkeleton />
    }
    emptyStateTitle="No Employee Found"
    emptyStateDescription="The employee you are looking for does not exist or has been removed."
    >
      <div className="space-y-4">
        {/* Employee Header */}
        <StaffDetailHeader staff={employee} />

        {/* Detailed Personal Information */}
        <div>
          <StaffPersonalInfo staff={employee} />
        </div>
      </div>
    </PageLayout>
  )
}


function LoadingSkeleton() {
  return (
    <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
  )
}