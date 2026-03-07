"use client";

import * as React from "react";
import { useStaff } from "@/lib/api2/staff";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  UserCircleIcon,
  Building02Icon,
  User02Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { StaffTable } from "@/components/staff/staff-table";
import { Button } from "@/components/ui/button";
import { useMemo, useCallback, useState } from "react";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type { StaffListItem } from "@/lib/api2/staff/types";
import PageLayout from "@/components/dashboard/page-layout";
import { AddStaffDropdown } from "@/components/staff/add-staff-dropdown";
import { StaffFormModal } from "@/components/staff/staff-form-modal";
import type { StaffFormSchema } from "@/components/staff/staff-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StaffPage() {
  const staffApi = useStaff();
  const { data, isLoading, error, isFetching, refetch } = staffApi.getStaff({});
  const createMutation = staffApi.createStaff();
  const [deleteStaff, setDeleteStaff] = useState<StaffListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCreateSubmit = async (formData: StaffFormSchema) => {
    setIsSubmitting(true);
    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
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

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteStaff) return;
    setIsDeleting(true);
    const deleteMutation = staffApi.deleteStaff(deleteStaff.id);
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        showToast.success(
          "Staff deleted",
          `${deleteStaff.full_name} has been permanently removed`,
        );
        setDeleteStaff(null);
        setIsDeleting(false);
        refetch();
      },
      onError: (err) => {
        showToast.error("Delete failed", getErrorMessage(err));
        setIsDeleting(false);
      },
    });
  }, [deleteStaff, staffApi, refetch]);

  const staffList = useMemo(() => {
    if (Array.isArray(data)) return data;
    return data?.results || [];
  }, [data]);

  const isEmpty = !isLoading && staffList.length === 0;

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
              onUploadBulk={() =>
                showToast.info(
                  "Coming soon",
                  "Bulk upload is in the works and will be available soon.",
                )
              }
            />
          </>
        }
        fetching={isFetching}
        refreshAction={handleRefresh}
        loading={isLoading}
        error={error}
        noData={isEmpty}
        skeleton={<StaffTableSkeleton />}
        filterActions={
           <StaffFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateSubmit}
        submitting={isSubmitting}
      />
        }
      >
        {/* Stats Cards */}
        {!isEmpty && !isLoading && <StaffStatsCards items={stats} />}

        <StaffTable data={data} />

        {data && data.count > 0 && !isLoading && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {staffList.length} of {data.count} staff members
          </div>
        )}
      </PageLayout>

      {/* Staff Form Modal */}
     

      {/* Delete Dialog */}
      {deleteStaff && (
        <AlertDialog open={!!deleteStaff} onOpenChange={(open) => !open && setDeleteStaff(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete staff member?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deleteStaff.full_name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
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

function StaffStatsCards({
  items,
}: {
  items: Array<{
    title: string;
    value: string;
    subtitle: string;
    icon: any;
    subtitleIcon?: any;
  }>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((item) => (
        <div key={item.title} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <HugeiconsIcon icon={item.icon} className="w-5 h-5 text-primary" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {item.title}
          </h3>
          <p className="text-2xl font-bold mb-2">{item.value}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {item.subtitleIcon && (
              <HugeiconsIcon icon={item.subtitleIcon} className="w-3 h-3" />
            )}
            {item.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}
