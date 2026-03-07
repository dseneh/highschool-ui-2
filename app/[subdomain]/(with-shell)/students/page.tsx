"use client";

import * as React from "react";
import { useStudents as useStudentsApi } from "@/lib/api2/student";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  UserCircleIcon,
  Invoice02Icon,
  CreditCardIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { StudentTable } from "@/components/students/student-table";
import { StudentTableSkeleton } from "@/components/students/student-table-skeleton";
import { EmptyStudents } from "@/components/students/empty-students";
import { StudentStatsCards } from "@/components/students/student-stats-cards";
import { StudentFormModal } from "@/components/students/student-form";
import { EnrollmentDialog } from "@/components/students/enrollment-dialog";
import { DeleteStudentDialog } from "@/components/students/delete-student-dialog";
import { AddStudentDropdown } from "@/components/students/add-student-dropdown";
import { Button } from "@/components/ui/button";
import { useMemo, useCallback } from "react";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { useHasRole } from "@/hooks/use-authorization";
import type { StudentDto } from "@/lib/api2/student-types";
import type { CreateStudentCommand } from "@/lib/api2/student-types";
import PageLayout from "@/components/dashboard/page-layout";

export default function StudentsPage() {
  const studentsApi = useStudentsApi();
  const { data, isLoading, error, isFetching } = studentsApi.getStudents({});
  const createMutation = studentsApi.createStudent();
  const { data: currentYear } = useCurrentAcademicYear();
  const canManageStudents = useHasRole("teacher");
  
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [enrollStudent, setEnrollStudent] = React.useState<StudentDto | null>(
    null,
  );
  const [fixEnrollStudent, setFixEnrollStudent] =
    React.useState<StudentDto | null>(null);
  const [deleteStudent, setDeleteStudent] = React.useState<StudentDto | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleRefresh = useCallback(() => {
    // TODO: Implement query invalidation for api2 students
  }, []);

  const handleEnroll = useCallback((student: StudentDto) => {
    setEnrollStudent(student);
  }, []);

  const handleFixEnrollment = useCallback((student: StudentDto) => {
    setFixEnrollStudent(student);
  }, []);

  const handleDelete = useCallback((student: StudentDto) => {
    setDeleteStudent(student);
  }, []);

  const handleDeleteConfirm = useCallback(
    (force: boolean) => {
      if (!deleteStudent) return;
      setIsDeleting(true);
      const deleteMutation = studentsApi.deleteStudent(deleteStudent.id);
      deleteMutation.mutate(
        force,
        {
          onSuccess: () => {
            showToast.success(
              "Student deleted",
              `${deleteStudent.full_name} has been permanently removed`,
            );
            setDeleteStudent(null);
            setIsDeleting(false);
          },
          onError: (err) => {
            showToast.error("Delete failed", getErrorMessage(err));
            setIsDeleting(false);
          },
        },
      );
    },
    [deleteStudent, studentsApi],
  );

  const studentsList = useMemo(() => {
    if (Array.isArray(data)) return data;
    return data?.results || [];
  }, [data]);
  const isEmpty = !isLoading && studentsList.length === 0;

  // Calculate stats from student data
  const stats = useMemo(() => {
    const totalStudents = data?.count || (Array.isArray(data) ? data.length : 0);
    const enrolledCount = studentsList.filter(
      (s: StudentDto) => s.status === "enrolled",
    ).length;
    const activeEnrollments = studentsList.filter(
      (s: StudentDto) => s.current_enrollment?.status === "active",
    ).length;
    const totalBalance = studentsList.reduce(
      (sum: number, s: StudentDto) =>
        sum + (s.current_enrollment?.billing_summary?.balance || 0),
      0,
    );
    const paidInFull = studentsList.filter(
      (s: StudentDto) => s.current_enrollment?.billing_summary?.balance === 0,
    ).length;

    return [
      {
        title: "Total Students",
        value: totalStudents.toString(),
        subtitle: `${enrolledCount} enrolled`,
        icon: UserGroupIcon,
        subtitleIcon: UserCircleIcon,
      },
      {
        title: "Active Enrollments",
        value: activeEnrollments.toString(),
        subtitle: `${data?.count || 0} this year`,
        icon: UserCircleIcon,
      },
      {
        title: "Outstanding Balance",
        value: `${totalBalance.toLocaleString()}`,
        subtitle: "Total fees due",
        icon: Invoice02Icon,
      },
      {
        title: "Payment Status",
        value: paidInFull.toString(),
        subtitle: "Paid in full",
        icon: CreditCardIcon,
      },
    ];
  }, [data, studentsList]);

  return (
    <>
      <PageLayout
        title="Students"
        description="Manage and view student information"
        actions={
          <>
            <AddStudentDropdown
              disabled={isLoading || isFetching || !canManageStudents}
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
        skeleton={<StudentTableSkeleton />}
        emptyState={<EmptyStudents />}
      >
        {/* Stats Cards */}
        {!isEmpty && !isLoading && <StudentStatsCards items={stats} />}

        <StudentTable
          data={studentsList}
          onEnroll={handleEnroll}
          onFixEnrollment={handleFixEnrollment}
          onDelete={handleDelete}
        />

        {data && data.count > 0 && !isLoading && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {studentsList.length} of {data.count} students
          </div>
        )}
      </PageLayout>

      <StudentFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={async (payload) => {
          try {
            await createMutation.mutateAsync(payload as CreateStudentCommand);
            showToast.success(
              "Student created",
              "The student has been added to the system",
            );
            setShowCreateModal(false);
          } catch (error) {
            showToast.error("Create failed", getErrorMessage(error));
          }
        }}
        submitting={createMutation.isPending}
      />

      {/* Enrollment Dialog */}
      {enrollStudent && (
        <EnrollmentDialog
          open={!!enrollStudent}
          onOpenChange={(open) => {
            if (!open) setEnrollStudent(null);
          }}
          student={enrollStudent}
          currentYear={currentYear ?? null}
          isReEnroll={false}
        />
      )}

      {/* Fix Enrollment Dialog (re-enroll mode) */}
      {fixEnrollStudent && (
        <EnrollmentDialog
          open={!!fixEnrollStudent}
          onOpenChange={(open) => {
            if (!open) setFixEnrollStudent(null);
          }}
          student={fixEnrollStudent}
          currentYear={currentYear ?? null}
          isReEnroll={true}
        />
      )}

      {/* Delete Dialog */}
      {deleteStudent && (
        <DeleteStudentDialog
          open={!!deleteStudent}
          onOpenChange={(open) => {
            if (!open) setDeleteStudent(null);
          }}
          student={deleteStudent}
          onConfirm={handleDeleteConfirm}
          loading={isDeleting}
        />
      )}
    </>
  );
}
