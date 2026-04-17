"use client";

import * as React from "react";
import {
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { AuthButton } from "@/components/auth/auth-button";
import PageLayout from "@/components/dashboard/page-layout";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RefreshButton from "@/components/shared/refresh-button";
import EmptyStateComponent from "@/components/shared/empty-state";
import { Plus } from "lucide-react";
import { useLeaveMutations, useLeaveRequests, useLeaveTypes } from "@/hooks/use-leave";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type { CreateLeaveRequestCommand, CreateLeaveTypeCommand } from "@/lib/api2/leave-types";
import { LeaveRequestFormModal } from "@/components/leaves/leave-request-form-modal";
import { LeaveRequestsTable } from "@/components/leaves/leave-requests-table";
import { LeaveTypeFormModal } from "@/components/leaves/leave-type-form-modal";
import { LeaveTypesTable } from "@/components/leaves/leave-types-table";

export default function LeaveManagementPage() {
  const { data: leaveRequests = [], isLoading, error, isFetching, refetch } = useLeaveRequests();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const {
    createRequest,
    createType,
    approveRequest,
    rejectRequest,
    cancelRequest,
  } = useLeaveMutations();

  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [showLeaveTypeModal, setShowLeaveTypeModal] = React.useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = React.useState(false);
  const [isSubmittingType, setIsSubmittingType] = React.useState(false);

  const pendingCount = leaveRequests.filter((item) => item.status.toLowerCase() === "pending").length;
  const approvedCount = leaveRequests.filter((item) => item.status.toLowerCase() === "approved").length;
  const rejectedCount = leaveRequests.filter((item) => item.status.toLowerCase() === "rejected").length;

  const statsItems = React.useMemo<StatsCardItem[]>(
    () => [
      {
        title: "Pending Requests",
        value: String(pendingCount),
        subtitle: "Awaiting approval",
        icon: Clock01Icon,
      },
      {
        title: "Approved Requests",
        value: String(approvedCount),
        subtitle: "Approved leave records",
        icon: CheckmarkCircle02Icon,
      },
      {
        title: "Rejected Requests",
        value: String(rejectedCount),
        subtitle: "Declined or not approved",
        icon: Cancel01Icon,
      },
      {
        title: "Leave Types",
        value: String(leaveTypes.length),
        subtitle: "Available leave policies",
        icon: Calendar01Icon,
      },
    ],
    [approvedCount, leaveTypes.length, pendingCount, rejectedCount]
  );

  const handleCreateRequest = async (payload: CreateLeaveRequestCommand) => {
    setIsSubmittingRequest(true);
    try {
      await createRequest.mutateAsync(payload);
      showToast.success("Leave request created", "The employee leave request has been submitted");
      setShowRequestModal(false);
      refetch();
    } catch (submitError) {
      showToast.error("Create failed", getErrorMessage(submitError));
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleCreateType = async (payload: CreateLeaveTypeCommand) => {
    setIsSubmittingType(true);
    try {
      await createType.mutateAsync(payload);
      showToast.success("Leave type created", "The leave type has been added to the system");
      setShowLeaveTypeModal(false);
      refetch();
    } catch (submitError) {
      showToast.error("Create failed", getErrorMessage(submitError));
    } finally {
      setIsSubmittingType(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveRequest.mutateAsync({ id });
      showToast.success("Leave approved", "The leave request has been approved");
      refetch();
    } catch (actionError) {
      showToast.error("Approval failed", getErrorMessage(actionError));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectRequest.mutateAsync({ id });
      showToast.success("Leave rejected", "The leave request has been rejected");
      refetch();
    } catch (actionError) {
      showToast.error("Rejection failed", getErrorMessage(actionError));
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelRequest.mutateAsync({ id });
      showToast.success("Leave cancelled", "The leave request has been cancelled");
      refetch();
    } catch (actionError) {
      showToast.error("Cancel failed", getErrorMessage(actionError));
    }
  };

  return (
    <PageLayout
      title="Leave Management"
      description="Manage leave requests, approvals, and leave types for employees"
      actions={
        <div className="flex items-center gap-2">
          <AuthButton roles="admin" disable onClick={() => setShowLeaveTypeModal(true)} icon={<Plus />}>
            Add Leave Type
          </AuthButton>
          <AuthButton roles="admin" disable onClick={() => setShowRequestModal(true)} icon={<Plus />}>
            New Leave Request
          </AuthButton>
          <RefreshButton onClick={refetch} loading={isLoading || isFetching} />
        </div>
      }
      error={error}
      loading={isLoading}
      emptyState={
        <EmptyStateComponent
          title="No leave records yet"
          description="Start by creating a leave type and submitting the first leave request."
          actionTitle="New Leave Request"
          handleAction={() => setShowRequestModal(true)}
        />
      }
      noData={!isLoading && leaveRequests.length === 0 && leaveTypes.length === 0}
    >
      <div className="space-y-6">
        <StatsCards items={statsItems} className=" xl:grid-cols-4" />

        <Tabs defaultValue="requests" className="w-full">
          <Card>
            <CardHeader className="gap-4">
              <div className="space-y-1">
                <CardTitle>Leave Records</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Switch between employee leave requests and leave type configuration.
                </p>
              </div>
              <TabsList variant="line" className="w-full sm:max-w-md">
                <TabsTrigger value="requests">Leave Requests</TabsTrigger>
                <TabsTrigger value="types">Leave Types</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="requests" className="mt-0">
                <LeaveRequestsTable
                  requests={leaveRequests}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onCancel={handleCancel}
                />
              </TabsContent>

              <TabsContent value="types" className="mt-0">
                <LeaveTypesTable leaveTypes={leaveTypes} onRefresh={refetch} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>

      <LeaveRequestFormModal
        open={showRequestModal}
        onOpenChange={setShowRequestModal}
        onSubmit={handleCreateRequest}
        isSubmitting={isSubmittingRequest}
      />

      <LeaveTypeFormModal
        open={showLeaveTypeModal}
        onOpenChange={setShowLeaveTypeModal}
        onSubmit={handleCreateType}
        isSubmitting={isSubmittingType}
      />
    </PageLayout>
  );
}
