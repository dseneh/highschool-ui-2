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
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { useHasRole } from "@/hooks/use-authorization";
import type { StudentDto } from "@/lib/api2/student-types";
import type { CreateStudentCommand } from "@/lib/api2/student-types";
import PageLayout from "@/components/dashboard/page-layout";
import { getQueryClient } from "@/lib/query-client";

export default function StudentsPage() {
  const studentsApi = useStudentsApi();
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("enrolled"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "page_size",
    parseAsInteger.withDefault(20),
  );

  const studentQuery = useMemo(
    () => ({
      status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
      page,
      page_size: pageSize,
    }),
    [statusFilter, page, pageSize],
  );

  const { data, isLoading, error, isFetching, refetch } = studentsApi.getStudents(studentQuery);
  const createMutation = studentsApi.createStudent();
  const { data: currentYear } = useCurrentAcademicYear();
  const canManageStudents = useHasRole("teacher");

  const queryClient = getQueryClient()
  
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
    refetch();
  }, [refetch]);

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
            queryClient.invalidateQueries({ queryKey: ["students"] });
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
    [deleteStudent, studentsApi, queryClient],
  );

  const studentsList = useMemo(() => {
    if (Array.isArray(data)) return data;
    return data?.results || [];
  }, [data]);

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
        emptyState={<EmptyStudents onAddStudent={() => setShowCreateModal(true)} />}
      >
        {/* Stats Cards */}
        {!isEmpty && !isLoading && <StudentStatsCards items={stats} />}
        {!isEmpty && !isLoading && (

          <StudentTable
            data={studentsList}
            onEnroll={handleEnroll}
            onFixEnrollment={handleFixEnrollment}
            onDelete={handleDelete}
            statusFilter={statusFilter}
            onStatusFilterChange={(nextStatus) => {
              void setStatusFilter(nextStatus || "all");
              void setPage(1);
            }}
            serverPagination={serverPagination}
          />
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
            queryClient.invalidateQueries({ queryKey: ["students"] });
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
