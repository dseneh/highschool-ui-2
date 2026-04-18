"use client";

import { useParams } from "next/navigation";
import { useEmployee } from "@/lib/api2/employee";
import { EntityActivity } from "@/components/shared/entity-activity";
import { Skeleton } from "@/components/ui/skeleton";
import PageLayout from "@/components/dashboard/page-layout";

export default function EmployeeActivityPage() {
  const params = useParams();
  const idNumber = params.id_number as string;

  const employeeApi = useEmployee();
  const { data: employee, isLoading } = employeeApi.getEmployeeMember(
    idNumber,
    { enabled: !!idNumber }
  );

  if (isLoading) {
    return (
      <PageLayout title="Activity" loading>
        <Skeleton className="h-40 w-full" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Activity">
      <EntityActivity
        contentTypeName="hr.employee"
        objectId={employee?.id}
        title="Employee Activity"
      />
    </PageLayout>
  );
}
