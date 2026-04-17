"use client"

import { useParams } from "next/navigation"
import { useStaff } from "@/lib/api2/staff"
import { StaffDetailHeader } from "@/components/staff/staff-detail-header"
import { StaffPersonalInfo } from "@/components/staff/staff-personal-info"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import PageLayout from "@/components/dashboard/page-layout"

export default function StaffDetailsPage() {
  const params = useParams()
  const idNumber = params.id_number as string

  const staffApi = useStaff()
  const { data: staff, isLoading, error, refetch, isFetching } = staffApi.getStaffMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/staff/"),
  })


  return (
    <PageLayout
    title="Staff Details"
    description={`View and manage detailed information for ${staff?.first_name} ${staff?.last_name}`}
    refreshAction={refetch}
    fetching={isFetching}
    error={error}
    noData={!staff}
    loading={isLoading}
    skeleton={
      <LoadingSkeleton />
    }
    emptyStateTitle="No Staff Found"
    emptyStateDescription="The staff member you are looking for does not exist or has been removed."
    >
      <div className="space-y-4">
        {/* Staff Header */}
        <StaffDetailHeader staff={staff} />

        {/* Detailed Personal Information */}
        <div>
          <StaffPersonalInfo staff={staff} />
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