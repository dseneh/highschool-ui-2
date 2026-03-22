"use client";

import * as React from "react";
import { useStaff } from "@/lib/api2/staff";
import {
  UserGroupIcon,
  UserCircleIcon,
  Building02Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { StaffTable } from "../../../../components/staff/staff-table";
import { useMemo, useCallback, useState } from "react";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type { StaffListItem } from "@/lib/api2/staff/types";
import PageLayout from "@/components/dashboard/page-layout";
import { AddStaffDropdown } from "@/components/staff/add-staff-dropdown";
import { StaffFormModal } from "@/components/staff/staff-form-modal";
import type { StaffFormSchema } from "@/components/staff/staff-form";
import { StaffBulkUploadDialog } from "@/components/staff/staff-bulk-upload-dialog";
import { StatsCards } from "@/components/shared/stats-cards";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { StaffTableUrlParams } from "../../../../components/staff/staff-table";

export default function StaffPage() {
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("all"),
  );
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [departmentFilter, setDepartmentFilter] = useQueryState(
    "department",
    parseAsString.withDefault(""),
  );
  const [roleFilter, setRoleFilter] = useQueryState("role", parseAsString.withDefault("all"));
  const [genderFilter, setGenderFilter] = useQueryState("gender", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("page_size", parseAsInteger.withDefault(20));

  const urlParams = useMemo<StaffTableUrlParams>(
    () => ({
      search,
      status: statusFilter,
      department: departmentFilter,
      role: roleFilter,
      gender: genderFilter,
    }),
    [search, statusFilter, departmentFilter, roleFilter, genderFilter]
  );

  const staffQuery = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      department: departmentFilter || undefined,
      is_teacher:
        roleFilter === "teacher"
          ? "true"
          : roleFilter === "staff"
            ? "false"
            : undefined,
      gender: genderFilter || undefined,
      page,
      page_size: pageSize,
    }),
    [search, statusFilter, departmentFilter, roleFilter, genderFilter, page, pageSize],
  );

  const staffApi = useStaff();
  const { data, isLoading, error, isFetching, refetch } = staffApi.getStaff(staffQuery);
  const { data: departmentsData } = staffApi.getDepartments({ page_size: 500 });
  const createMutation = staffApi.createStaff();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        "Staff created",
        "The staff member has been added to the system",
      );
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      showToast.error("Create failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const staffList = useMemo(() => {
    if (Array.isArray(data)) return data;
    return data?.results || [];
  }, [data]);

  const departmentFilterOptions = useMemo(() => {
    const departments = Array.isArray(departmentsData)
      ? departmentsData
      : departmentsData?.results || [];

    return departments
      .map((department: { id: string; name: string }) => ({
        label: department.name,
        value: department.id,
      }))
      .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));
  }, [departmentsData]);

  const serverPagination = useMemo(() => {
    if (Array.isArray(data) || !data || typeof data.count !== "number") {
      return undefined;
    }

    return {
      totalCount: data.count,
      currentPage: page,
      pageSize,
      onPageChange: (nextPage: number) => {
        void setPage(nextPage);
      },
      onPageSizeChange: (nextPageSize: number) => {
        void setPageSize(nextPageSize);
        void setPage(1);
      },
    };
  }, [data, page, pageSize, setPage, setPageSize]);

  const setUrlParams = useCallback(
    (params: StaffTableUrlParams & { page: number }) => {
      void setSearch(params.search || "");
      void setStatusFilter(params.status || "all");
      void setDepartmentFilter(params.department || "");
      void setRoleFilter(params.role || "all");
      void setGenderFilter(params.gender || "");
      void setPage(params.page || 1);
    },
    [setSearch, setStatusFilter, setDepartmentFilter, setRoleFilter, setGenderFilter, setPage]
  );

  // Calculate stats from staff data
  const stats = useMemo(() => {
    const totalStaff = data?.count || (Array.isArray(data) ? data.length : 0);
    const activeStaff = staffList.filter(
      (s: StaffListItem) => s.status === "active",
    ).length;
    const teacherCount = staffList.filter(
      (s: StaffListItem) => s.is_teacher === true,
    ).length;
    const departmentsSet = new Set<string>();
    staffList.forEach((s: StaffListItem) => {
      if (s.primary_department) {
        const deptName = typeof s.primary_department === 'string' 
          ? s.primary_department 
          : s.primary_department.name;
        if (deptName) departmentsSet.add(deptName);
      }
    });

    return [
      {
        title: "Total Staff",
        value: totalStaff.toString(),
        subtitle: `${activeStaff} active`,
        icon: UserGroupIcon,
        subtitleIcon: UserCircleIcon,
      },
      {
        title: "Teachers",
        value: teacherCount.toString(),
        subtitle: "Teaching staff",
        icon: UserCircleIcon,
      },
      {
        title: "Departments",
        value: departmentsSet.size.toString(),
        subtitle: "Active departments",
        icon: Building02Icon,
      },
      {
        title: "Non-Teaching",
        value: (totalStaff - teacherCount).toString(),
        subtitle: "Support staff",
        icon: User02Icon,
      },
    ];
  }, [data, staffList]);

  return (
    <>
      <PageLayout
        title="Staff Management"
        description="Manage and view staff information"
        actions={
          <>
            <AddStaffDropdown
              disabled={isLoading || isFetching}
              onAddIndividual={() => setShowCreateModal(true)}
              onUploadBulk={() => setShowBulkUploadModal(true)}
            />
          </>
        }
        fetching={isFetching}
        refreshAction={handleRefresh}
        // loading={isLoading}
        error={error}
        // noData={isEmpty}
        skeleton={<StaffTableSkeleton />}
        filterActions={
           <StaffFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateSubmit}
        submitting={isSubmitting}
      />
        }
        emptyStateTitle="No Staff created yet!"
        emptyStateDescription="Start by adding staff to the system."
        emptyStateAction={() => setShowCreateModal(true)}
      >
        {/* Stats Cards */}
             <StatsCards items={stats} />

          <StaffTable
            data={data}
            urlParams={urlParams}
            setUrlParams={setUrlParams}
            departmentFilterOptions={departmentFilterOptions}
            serverPagination={serverPagination}
            loading={isFetching}
            onDataChanged={handleRefresh}
          />

      </PageLayout>

      {/* Staff Form Modal */}

      <StaffBulkUploadDialog
        open={showBulkUploadModal}
        onOpenChange={setShowBulkUploadModal}
        onSuccess={() => {
          refetch();
        }}
      />
    </>
  );
}

function StaffTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-48 w-full bg-muted rounded-xl animate-pulse" />
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}