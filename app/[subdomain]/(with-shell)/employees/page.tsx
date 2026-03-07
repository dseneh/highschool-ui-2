"use client";

import * as React from "react";
import PageLayout from "@/components/dashboard/page-layout";
import { SummaryCardGrid } from "@/components/dashboard/summary-card-grid";
import { EmployeesTable } from "@/components/dashboard/employees-table";
import type { SummaryCardData } from "@/lib/api/queries";
import { getIconByKey } from "@/lib/icon-map";
import type { EmployeeDto, CreateEmployeeCommand } from "@/lib/api/employee-types";
import { EmployeeFormModal } from "@/components/employees/employee-form";
import { AuthButton } from "@/components/auth/auth-button";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { UserIcon } from "lucide-react";
import { useEmployees, useEmployeeMutations } from "@/hooks/use-employee";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Summary helpers                                                    */
/* ------------------------------------------------------------------ */

function toSummaryCards(employees: EmployeeDto[]): SummaryCardData[] {
  const active = employees.filter(
    (e) => e.employmentStatus === "Active"
  ).length;
  const total = employees.length;
  const terminated = employees.filter(
    (e) => e.employmentStatus === "Terminated"
  ).length;
  const recentHires = employees.filter((e) => {
    if (!e.hireDate) return false;
    const diff = Date.now() - new Date(e.hireDate).getTime();
    return diff < 30 * 24 * 60 * 60 * 1000;
  }).length;

  return [
    {
      title: "Total Headcount",
      value: String(total),
      subtitle: `${active} active`,
      iconKey: "employees",
    },
    {
      title: "Active Employees",
      value: String(active),
      subtitle: `${terminated} terminated`,
      iconKey: "check",
    },
    {
      title: "New Hires",
      value: String(recentHires),
      subtitle: "Joined in the last 30 days",
      iconKey: "attendance",
    },
  ];
}

function toSummaryCardItems(items: SummaryCardData[]) {
  return items.map((item) => ({
    ...item,
    icon: getIconByKey(item.iconKey),
  }));
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function EmployeesPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const { data: employees = [], isLoading } = useEmployees();
  const { create } = useEmployeeMutations();

  async function handleCreate(
    payload: CreateEmployeeCommand | unknown
  ) {
    await create.mutateAsync(payload as CreateEmployeeCommand);
    setShowCreateModal(false);
  }

  const isEmpty = !isLoading && employees.length === 0;

  return (
    <>
      <PageLayout
        title="Employees"
        description="Manage your organization's workforce"
        actions={
          <AuthButton
            roles="admin"
            disable
            iconLeft={<UserIcon />}
            onClick={() => setShowCreateModal(true)}
          >
            Add Employee
          </AuthButton>
        }
        loading={isLoading}
        skeleton={
          <>
            {/* Summary cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="relative p-5 rounded-xl border bg-card overflow-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-3 flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-7 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="size-10 rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Table skeleton */}
            <div className="rounded-md border">
              <div className="border-b px-4 py-3 flex gap-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b px-4 py-3 flex items-center gap-6">
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
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </>
        }
        noData={isEmpty}
        emptyState={<div className="text-center text-muted-foreground py-8">No employees found</div>}
      >
        <SummaryCardGrid
          items={toSummaryCardItems(toSummaryCards(employees))}
        />
        <EmployeesTable employees={employees} />
      </PageLayout>

      {/* Create employee modal */}
      <EmployeeFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreate}
        submitting={create.isPending}
      />
    </>
  );
}
