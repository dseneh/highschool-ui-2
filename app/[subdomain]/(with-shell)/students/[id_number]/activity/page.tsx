"use client";

import { useStudents as useStudentsApi } from "@/lib/api2/student";
import { EntityActivity } from "@/components/shared/entity-activity";
import { Skeleton } from "@/components/ui/skeleton";
import PageLayout from "@/components/dashboard/page-layout";
import { useResolvedStudentIdNumber } from "@/hooks/use-resolved-student-id-number";

export default function StudentActivityPage() {
  const idNumber = useResolvedStudentIdNumber();
  const studentsApi = useStudentsApi();
  const { data: student, isLoading } = studentsApi.getStudent(idNumber, {
    enabled: !!idNumber,
  });

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
        contentTypeName="students.student"
        objectId={student?.id}
        title="Student Activity"
      />
    </PageLayout>
  );
}
