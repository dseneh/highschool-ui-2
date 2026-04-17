"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import PageLayout from "@/components/dashboard/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeDetail } from "@/hooks/use-employee";
import type { EmployeeDto } from "@/lib/api2/employee-types";

interface EmployeeSubpageShellProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: (employee: EmployeeDto) => React.ReactNode;
}

export function EmployeeSubpageShell({
  title,
  description,
  actions,
  children,
}: EmployeeSubpageShellProps) {
  const params = useParams<{ id_number: string }>();
  const employeeId = params.id_number;
  const { data: employee, isLoading, error, refetch, isFetching } = useEmployeeDetail(employeeId);

  return (
    <PageLayout
      title={employee ? `${employee.fullName || employee.employeeNumber || "Employee"} • ${title}` : title}
      description={description}
      actions={actions}
      loading={isLoading}
      fetching={isFetching}
      error={error}
      noData={!employee && !isLoading}
      emptyStateTitle="Employee not found"
      emptyStateDescription="The requested employee record could not be located."
      refreshAction={() => {
        void refetch();
      }}
      skeleton={<EmployeeSubpageShellSkeleton />}
    >
      {employee ? children(employee) : null}
    </PageLayout>
  );
}

function EmployeeSubpageShellSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
