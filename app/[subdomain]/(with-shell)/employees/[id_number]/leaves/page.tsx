"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Calendar01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import PageLayout from "@/components/dashboard/page-layout"
import RefreshButton from "@/components/shared/refresh-button"
import EmptyStateComponent from "@/components/shared/empty-state"
import { LeaveRequestsTable } from "@/components/leaves/leave-requests-table"
import { useEmployee } from "@/lib/api2/employee"
import { useLeaveRequests, useLeaveMutations } from "@/hooks/use-leave"
import { showToast } from "@/lib/toast"
import { getErrorMessage } from "@/lib/utils"

export default function EmployeeLeavesPage() {
  const params = useParams()
  const idNumber = params.id_number as string

  const employeeApi = useEmployee()
  const { data: employee, isLoading: employeeLoading } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/employees/"),
  })

  const {
    data: leaveRequests = [],
    isLoading: requestsLoading,
    isFetching,
    error,
    refetch,
  } = useLeaveRequests(
    employee?.id ? { employeeId: employee.id } : undefined,
  )

  const { approveRequest, rejectRequest, cancelRequest } = useLeaveMutations()

  const isLoading = employeeLoading || requestsLoading

  const handleApprove = async (id: string) => {
    try {
      await approveRequest.mutateAsync({ id })
      showToast.success("Leave approved", "The leave request has been approved")
      refetch()
    } catch (err) {
      showToast.error("Approval failed", getErrorMessage(err))
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectRequest.mutateAsync({ id })
      showToast.success("Leave rejected", "The leave request has been rejected")
      refetch()
    } catch (err) {
      showToast.error("Rejection failed", getErrorMessage(err))
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelRequest.mutateAsync({ id })
      showToast.success("Leave cancelled", "The leave request has been cancelled")
      refetch()
    } catch (err) {
      showToast.error("Cancel failed", getErrorMessage(err))
    }
  }

  return (
    <PageLayout
      title="Leaves"
      description="Leave requests and balances"
      actions={
        <RefreshButton onClick={refetch} loading={isLoading || isFetching} />
      }
      error={error}
      loading={isLoading}
      emptyState={
        <EmptyStateComponent
          title="No Leave Requests"
          description="This employee has no leave requests yet."
          icon={<HugeiconsIcon icon={Calendar01Icon} />}
        />
      }
      noData={!leaveRequests}
    >
      <LeaveRequestsTable
        requests={leaveRequests}
        onApprove={handleApprove}
        onReject={handleReject}
        onCancel={handleCancel}
      />
    </PageLayout>
  )
}
