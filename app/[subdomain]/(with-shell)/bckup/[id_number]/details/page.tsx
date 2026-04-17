"use client";

import { useParams } from "next/navigation";
import PageLayout from "@/components/dashboard/page-layout";
import { EmployeeOverviewTab } from "@/components/employees/employee-overview-tab";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeDetail } from "@/hooks/use-employee";

export default function EmployeeDetailsPage() {
  const params = useParams<{ id_number: string }>();
  const employeeId = params.id_number;
  const { data: employee, isLoading, error, refetch, isFetching } = useEmployeeDetail(employeeId);

  return (
    <PageLayout
      title="Employee Details"
      description={employee ? `View and manage detailed information for ${employee.fullName || employee.firstName || "this employee"}` : "View and manage employee information"}
      refreshAction={() => {
        void refetch();
      }}
      fetching={isFetching}
      error={error}
      noData={!employee}
      loading={isLoading}
      skeleton={<LoadingSkeleton />}
      emptyStateTitle="No Employee Found"
      emptyStateDescription="The employee you are looking for does not exist or has been removed."
    >
      {employee ? <EmployeeOverviewTab employee={employee} /> : null}
    </PageLayout>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
