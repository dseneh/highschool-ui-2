"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ListTodo, UserPlus } from "lucide-react";
import {
  Building02Icon,
  CheckmarkCircle02Icon,
  UserAdd01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import PageLayout from "@/components/dashboard/page-layout";
import { EmployeeTable } from "@/components/dashboard/employees-table";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import { EmployeeFormModal } from "@/components/employees/employee-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { useEmployees, useEmployeeMutations } from "@/hooks/use-employee";
import type {
  CreateEmployeeCommand,
  EmployeeDto,
  UpdateEmployeeCommand,
} from "@/lib/api2/employee-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";

function toStatsCards(employees: EmployeeDto[]): StatsCardItem[] {
  const total = employees.length;
  const active = employees.filter(
    (employee) => (employee.employmentStatus ?? "").toLowerCase() === "active",
  ).length;
  const recentHires = employees.filter((employee) => {
    if (!employee.hireDate) return false;
    const diff = Date.now() - new Date(employee.hireDate).getTime();
    return diff < 30 * 24 * 60 * 60 * 1000;
  }).length;
  const departments = new Set(
    employees
      .map((employee) => employee.departmentName?.trim())
      .filter((value): value is string => Boolean(value)),
  ).size;

  return [
    {
      title: "Total Headcount",
      value: String(total),
      subtitle: `${active} active`,
      icon: UserGroupIcon,
    },
    {
      title: "Active Employees",
      value: String(active),
      subtitle: "Currently working",
      icon: CheckmarkCircle02Icon,
    },
    {
      title: "New Hires",
      value: String(recentHires),
      subtitle: "Joined in the last 30 days",
      icon: UserAdd01Icon,
    },
    {
      title: "Departments",
      value: String(departments),
      subtitle: "Teams represented",
      icon: Building02Icon,
    },
  ];
}

function EmployeePageSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="relative overflow-hidden rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 flex-col gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="size-10 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border">
        <div className="flex gap-6 border-b px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-6 border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </>
  );
}

export function EmployeeManagementPage() {
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const { data: employees = [], isLoading, isFetching, refetch } = useEmployees();
  const { create } = useEmployeeMutations();

  const handleRefresh = React.useCallback(() => {
    void refetch();
  }, [refetch]);

  async function handleCreate(payload: CreateEmployeeCommand | UpdateEmployeeCommand) {
    if (!("hireDate" in payload)) {
      return;
    }

    try {
      await create.mutateAsync(payload);
      showToast.success("Employee created", "The employee has been added to the system.");
      setShowCreateModal(false);
      void refetch();
    } catch (error) {
      showToast.error("Create failed", getErrorMessage(error));
    }
  }

  const isEmpty = !isLoading && employees.length === 0;

  return (
    <>
      <PageLayout
        title="Employee Management"
        description="Manage your organization's workforce, onboarding, and offboarding."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              iconLeft={<ListTodo className="h-4 w-4" />}
              onClick={() =>
                router.push(subdomain ? `/${subdomain}/employee-workflows` : "/employee-workflows")
              }
            >
              Workflows
            </Button>
            <Button
              iconLeft={<UserPlus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Add Employee
            </Button>
          </div>
        }
        loading={isLoading}
        fetching={isFetching}
        refreshAction={handleRefresh}
        skeleton={<EmployeePageSkeleton />}
        noData={isEmpty}
        emptyState={
          <div className="py-8 text-center text-muted-foreground">
            No employees found yet. Add your first employee to get started.
          </div>
        }
      >
        <StatsCards items={toStatsCards(employees)} className="xl:grid-cols-4" />
        <EmployeeTable employees={employees} />
      </PageLayout>

      <EmployeeFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreate}
        submitting={create.isPending}
      />
    </>
  );
}

export default EmployeeManagementPage;
