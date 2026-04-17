"use client";

import * as React from "react";
import { GraduationCap, UserPlus } from "lucide-react";
import {
  BookOpen02Icon,
  UserCircleIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import PageLayout from "@/components/dashboard/page-layout";
import { EmployeeTable } from "@/components/dashboard/employees-table";
import { EmployeeFormModal } from "@/components/employees/employee-form";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import { Button } from "@/components/ui/button";
import { useEmployees, useEmployeeMutations } from "@/hooks/use-employee";
import type {
  CreateEmployeeCommand,
  EmployeeDto,
  UpdateEmployeeCommand,
} from "@/lib/api2/employee-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";

function isTeachingEmployee(employee: EmployeeDto): boolean {
  const haystack = [
    employee.jobTitle,
    employee.positionName,
    employee.departmentName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return ["teacher", "teaching", "lecturer", "instructor", "tutor"].some((term) =>
    haystack.includes(term)
  );
}

function toStats(employees: EmployeeDto[]): StatsCardItem[] {
  const departments = new Set(
    employees
      .map((employee) => employee.departmentName?.trim())
      .filter((value): value is string => Boolean(value))
  ).size;

  return [
    {
      title: "Teachers",
      value: String(employees.length),
      subtitle: "Employee records tagged as teaching roles",
      icon: UserGroupIcon,
    },
    {
      title: "Active Teachers",
      value: String(
        employees.filter((employee) => (employee.employmentStatus ?? "").toLowerCase() === "active")
          .length
      ),
      subtitle: "Currently active",
      icon: UserCircleIcon,
    },
    {
      title: "Departments",
      value: String(departments),
      subtitle: "Academic and support teams",
      icon: BookOpen02Icon,
    },
  ];
}

export default function EmployeeTeachersPage() {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const { data: employees = [], isLoading, error, isFetching, refetch } = useEmployees();
  const { create } = useEmployeeMutations();

  const teacherEmployees = React.useMemo(
    () => employees.filter(isTeachingEmployee),
    [employees]
  );

  async function handleCreate(payload: CreateEmployeeCommand | UpdateEmployeeCommand) {
    if (!("hireDate" in payload)) {
      return;
    }

    try {
      await create.mutateAsync(payload as CreateEmployeeCommand);
      showToast.success("Employee created", "The employee has been added successfully.");
      setShowCreateModal(false);
      void refetch();
    } catch (submitError) {
      showToast.error("Create failed", getErrorMessage(submitError));
    }
  }

  return (
    <>
      <PageLayout
        title="Teaching Employees"
        description="Review employee records linked to teaching or academic roles."
        loading={isLoading}
        fetching={isFetching}
        refreshAction={() => {
          void refetch();
        }}
        error={error}
        noData={!isLoading && teacherEmployees.length === 0}
        emptyState={
          <div className="py-8 text-center text-muted-foreground">
            No teaching employees were found yet.
          </div>
        }
        actions={
          <Button
            onClick={() => setShowCreateModal(true)}
            iconLeft={<UserPlus className="h-4 w-4" />}
          >
            Add Employee
          </Button>
        }
      >
        <div className="space-y-6">
          <StatsCards items={toStats(teacherEmployees)} className="xl:grid-cols-3" />
          <EmployeeTable employees={teacherEmployees} />
        </div>
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
