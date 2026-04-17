"use client";

import * as React from "react";
import { DepartmentsTable } from "@/components/departments/departments-table";
import { DepartmentFormModal } from "@/components/departments/department-form-modal";
import { AuthButton } from "@/components/auth/auth-button";
import { useMemo, useCallback } from "react";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type {
  CreateEmployeeDepartmentCommand,
  EmployeeDepartmentDto,
} from "@/lib/api2/employee-types";
import PageLayout from "@/components/dashboard/page-layout";
import RefreshButton from "@/components/shared/refresh-button";
import { Plus } from "lucide-react";
import EmptyStateComponent from "@/components/shared/empty-state";
import {
  useEmployeeDepartments,
  useEmployeeMutations,
} from "@/hooks/use-employee";

export default function DepartmentsPage() {
  const { data, isLoading, error, isFetching, refetch } = useEmployeeDepartments();
  const { createDepartment } = useEmployeeMutations();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCreateSubmit = async (formData: CreateEmployeeDepartmentCommand) => {
    setIsSubmitting(true);
    try {
      await createDepartment.mutateAsync(formData);
      showToast.success(
        "Department created",
        "The department has been added to the system",
      );
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      showToast.error("Create failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentsList = useMemo<EmployeeDepartmentDto[]>(() => data ?? [], [data]);
  
  const isEmpty = !isLoading && departmentsList.length === 0;

  return (
    <PageLayout
      title="Departments"
      description="Manage departments and organizational units"
      actions={
        <div className="flex items-center gap-2">
          <AuthButton
          roles="admin"
          disable
          onClick={() => setShowCreateModal(true)}
          icon={<Plus />}
        >
          Add Department
        </AuthButton>
        <RefreshButton
              onClick={handleRefresh}
              loading={isFetching || isLoading}
              />
        </div>
      }
      error={error}
      filterActions={
        <DepartmentFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
      />
      }
      noData={isEmpty}
      emptyState={
        <EmptyStateComponent
          title="No departments yet"
          description="Create your first department to organize your employees and HR workflows."
          actionTitle="Add Department"
          handleAction={() => setShowCreateModal(true)}
        />
      }
      loading={isLoading}
    >
      <div className="">
         <DepartmentsTable departments={departmentsList} onRefresh={refetch} />
      </div>
      
    </PageLayout>
  );
}
