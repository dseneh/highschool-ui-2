"use client";

import * as React from "react";
import { useStaff } from "@/lib/api2/staff";
import {
  Building02Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { DepartmentsTable } from "@/components/departments/departments-table";
import { DepartmentFormModal } from "@/components/departments/department-form-modal";
import { AuthButton } from "@/components/auth/auth-button";
import { useMemo, useCallback } from "react";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type { Department } from "@/lib/api2/staff/types";
import PageLayout from "@/components/dashboard/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import RefreshButton from "@/components/shared/refresh-button";
import { Plus } from "lucide-react";
import EmptyStateComponent from "@/components/shared/empty-state";

export default function DepartmentsPage() {
  const staffApi = useStaff();
  const { data, isLoading, error, isFetching, refetch } = staffApi.getDepartments({});
  const createMutation = staffApi.createDepartment();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCreateSubmit = async (formData: Partial<Department>) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(formData as any);
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

  const departmentsList = useMemo<Department[]>(() => {
    if (Array.isArray(data)) return data as Department[];
    return data?.results || [];
  }, [data]);
  
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
          description="Create your first department to get started with staff management."
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
