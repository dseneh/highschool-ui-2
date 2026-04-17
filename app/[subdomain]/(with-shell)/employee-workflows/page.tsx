"use client";

import * as React from "react";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  UserAdd01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Plus } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
import PageLayout from "@/components/dashboard/page-layout";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import EmptyStateComponent from "@/components/shared/empty-state";
import RefreshButton from "@/components/shared/refresh-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeWorkflowFormModal } from "@/components/employees/employee-workflow-form-modal";
import { EmployeeWorkflowTable } from "@/components/employees/employee-workflow-table";
import { useEmployees } from "@/hooks/use-employee";
import { useEmployeeWorkflowTaskMutations, useEmployeeWorkflowTasks } from "@/hooks/use-employee-workflow";
import type { CreateEmployeeWorkflowTaskCommand } from "@/lib/api2/employee-workflow-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";

export default function EmployeeWorkflowsPage() {
  const { data: tasks = [], isLoading, error, isFetching, refetch } = useEmployeeWorkflowTasks();
  const { data: employees = [] } = useEmployees();
  const { create } = useEmployeeWorkflowTaskMutations();

  const [showTaskModal, setShowTaskModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onboardingCount = tasks.filter((item) => item.workflowType.toLowerCase() === "onboarding").length;
  const offboardingCount = tasks.filter((item) => item.workflowType.toLowerCase() === "offboarding").length;
  const completedCount = tasks.filter((item) => item.status.toLowerCase() === "completed").length;
  const overdueCount = tasks.filter((item) => item.isOverdue).length;

  const statsItems = React.useMemo<StatsCardItem[]>(
    () => [
      {
        title: "Workflow Tasks",
        value: String(tasks.length),
        subtitle: "Checklist items across employee lifecycles",
        icon: UserGroupIcon,
      },
      {
        title: "Onboarding",
        value: String(onboardingCount),
        subtitle: "New hire setup items",
        icon: UserAdd01Icon,
      },
      {
        title: "Completed",
        value: String(completedCount),
        subtitle: `${Math.max(tasks.length - completedCount, 0)} still open`,
        icon: CheckmarkCircle02Icon,
      },
      {
        title: "Overdue",
        value: String(overdueCount),
        subtitle: `${offboardingCount} offboarding tasks`,
        icon: Alert02Icon,
      },
    ],
    [completedCount, offboardingCount, onboardingCount, overdueCount, tasks.length]
  );

  const handleCreateTask = async (payload: CreateEmployeeWorkflowTaskCommand) => {
    setIsSubmitting(true);
    try {
      await create.mutateAsync(payload);
      showToast.success("Task saved", "Employee workflow task created successfully");
      setShowTaskModal(false);
      refetch();
    } catch (submitError) {
      showToast.error("Create failed", getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Employee Workflows"
      description="Track onboarding and offboarding checklists, ownership, and completion status"
      actions={
        <div className="flex items-center gap-2">
          <AuthButton roles="admin" disable onClick={() => setShowTaskModal(true)} icon={<Plus />}>
            Add Workflow Task
          </AuthButton>
          <RefreshButton onClick={refetch} loading={isLoading || isFetching} />
        </div>
      }
      error={error}
      loading={isLoading}
      emptyState={
        <EmptyStateComponent
          title="No workflow tasks yet"
          description="Start by adding the first onboarding or offboarding checklist item."
          actionTitle="Add Task"
          handleAction={() => setShowTaskModal(true)}
        />
      }
      noData={!isLoading && tasks.length === 0}
    >
      <div className="space-y-6">
        <StatsCards items={statsItems} className="mb-0 xl:grid-cols-4" />

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeWorkflowTable tasks={tasks} employees={employees} onRefresh={refetch} />
          </CardContent>
        </Card>
      </div>

      <EmployeeWorkflowFormModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        onSubmit={handleCreateTask}
        isSubmitting={isSubmitting}
        employees={employees}
      />
    </PageLayout>
  );
}
