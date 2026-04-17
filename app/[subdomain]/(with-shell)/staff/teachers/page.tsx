"use client";

import * as React from "react";
import { useEmployee } from "@/lib/api2/employee";
import { StaffTable } from "@/components/employees/staff-table";
import { useMemo, useCallback } from "react";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type { StaffFormSchema } from "@/components/employees/staff-form";
import type { EmployeeListItem } from "@/lib/api2/employee/types";
import PageLayout from "@/components/dashboard/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTeacherDropdown } from "@/components/employees/add-teacher-dropdown";
import { StaffFormModal } from "@/components/employees/staff-form-modal";
import RefreshButton from "@/components/shared/refresh-button";
import EmptyStateComponent from "@/components/shared/empty-state";
import { StaffSelectDialog } from "@/components/employees/staff-select-dialog";
import { parseAsString, useQueryState } from "nuqs";
import type { StaffTableUrlParams } from "@/components/employees/staff-table";

export default function TeachersPage() {
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("all"),
  );
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [departmentFilter, setDepartmentFilter] = useQueryState(
    "department",
    parseAsString.withDefault(""),
  );
  const [genderFilter, setGenderFilter] = useQueryState("gender", parseAsString.withDefault(""));

  const urlParams = useMemo<StaffTableUrlParams>(
    () => ({
      search,
      status: statusFilter,
      department: departmentFilter,
      role: "teacher",
      gender: genderFilter,
    }),
    [search, statusFilter, departmentFilter, genderFilter],
  );

  const setUrlParams = useCallback(
    (params: StaffTableUrlParams & { page: number }) => {
      void setSearch(params.search || "");
      void setStatusFilter(params.status || "all");
      void setDepartmentFilter(params.department || "");
      void setGenderFilter(params.gender || "");
    },
    [setSearch, setStatusFilter, setDepartmentFilter, setGenderFilter],
  );

  const employeeApi = useEmployee();
  
  const { data, isLoading, error, isFetching, refetch } = employeeApi.getEmployees({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    department: departmentFilter || undefined,
    gender: genderFilter || undefined,
    is_teacher: true,
  });


  const createMutation = employeeApi.createEmployee();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showSelectStaffDialog, setShowSelectStaffDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCreateSubmit = async (formData: StaffFormSchema) => {
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      const {
        initialize_user_account,
        username,
        role,
        ...staffData
      } = formData;

      Object.entries(staffData).forEach(([key, value]) => {
        if (key === "photo" && value instanceof File) {
          payload.append(key, value);
        } else if (key === "date_of_birth" && value instanceof Date) {
          payload.append(key, value.toISOString().split("T")[0]);
        } else if (key === "hire_date" && value instanceof Date) {
          payload.append(key, value.toISOString().split("T")[0]);
        } else if (typeof value === "boolean") {
          // Convert boolean to Python-style True/False string
          payload.append(key, value ? "True" : "False");
        } else if (value !== null && value !== undefined && value !== "") {
          payload.append(key, String(value));
        }
      });

      if (initialize_user_account) {
        payload.append("initialize_user", "True");
        if (username?.trim()) {
          payload.append("username", username.trim());
        }
        if (role) {
          payload.append("role", role);
        }
      }

      await createMutation.mutateAsync(payload as any);
      showToast.success(
        "Teacher created",
        "The teacher has been added to the system",
      );
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      showToast.error("Create failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmpty = !isLoading && data && data.results.length === 0;

  return (
    <PageLayout
      title="Teachers"
      description="Manage your school's teaching staff"
      filterActions={
        <StaffFormModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSubmit={handleCreateSubmit}
          submitting={isSubmitting}
        />
      }
      actions={
        < >
          <AddTeacherDropdown
            onAddNewStaff={() => setShowCreateModal(true)}
            onAddFromStaff={() => setShowSelectStaffDialog(true)}
            disabled={isFetching || isLoading}
          />
        </>
      }
      fetching={isFetching}
      refreshAction={handleRefresh}
      loading={isLoading}
      error={error}
      noData={isEmpty}
      emptyState={
        <EmptyStateComponent
          title="No teachers found"
          description="Start by adding your first teacher to the system"
          handleAction={() => setShowCreateModal(true)}
          actionTitle="Add Teacher"
        />
      }
      skeleton={
        <div className="space-y-2 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      }
    >
      <div className="space-y-4">
        <StaffTable
          data={data as any}
          urlParams={urlParams}
          setUrlParams={setUrlParams}
          loading={isLoading}
        />
      </div>

      <StaffSelectDialog
        open={showSelectStaffDialog}
        onOpenChange={setShowSelectStaffDialog}
        onSuccess={refetch}
      />
    </PageLayout>
  );
}
