"use client";

import * as React from "react";
import { useStudents as useStudentsApi } from "@/lib/api2/student";
import { useGradeLevels } from "@/hooks/use-grade-level";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import {
  UserGroupIcon,
  UserCircleIcon,
  Invoice02Icon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import { StudentTable } from "../../../../components/students/student-table";
import { StudentTableSkeleton } from "@/components/students/student-table-skeleton";
import { EmptyStudents } from "@/components/students/empty-students";
import { StudentStatsCards } from "@/components/students/student-stats-cards";
import { StudentFormModal } from "@/components/students/student-form";
import { EnrollmentDialog } from "@/components/students/enrollment-dialog";
import { DeleteStudentDialog } from "@/components/students/delete-student-dialog";
import { AddStudentDropdown } from "@/components/students/add-student-dropdown";
import { useMemo, useCallback } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { useHasRole } from "@/hooks/use-authorization";
import type { StudentDto } from "@/lib/api2/student-types";
import type { CreateStudentCommand } from "@/lib/api2/student-types";
import PageLayout from "@/components/dashboard/page-layout";
import { getQueryClient } from "@/lib/query-client";
import type { StudentTableUrlParams } from "../../../../components/students/student-table";

export default function StudentsPage() {
  const studentsApi = useStudentsApi();
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("enrolled"),
  );
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [gradeLevelFilter, setGradeLevelFilter] = useQueryState("grade_level", parseAsString.withDefault(""));
  const [sectionFilter, setSectionFilter] = useQueryState("section", parseAsString.withDefault(""));
  const [genderFilter, setGenderFilter] = useQueryState("gender", parseAsString.withDefault(""));
  const [balanceOwedFilter, setBalanceOwedFilter] = useQueryState("balance_owed", parseAsString.withDefault(""));
  const [balanceCondition, setBalanceCondition] = useQueryState("balance_condition", parseAsString.withDefault(""));
  const [balanceMin, setBalanceMin] = useQueryState("balance_min", parseAsString.withDefault(""));
  const [balanceMax, setBalanceMax] = useQueryState("balance_max", parseAsString.withDefault(""));
  const [includeBilling, setIncludeBilling] = useQueryState("include_billing", parseAsString.withDefault("0"));
  const [showRank, setShowRank] = useQueryState("show_rank", parseAsString.withDefault("1"));
  const [showGradeAverage, setShowGradeAverage] = useQueryState("show_grade_average", parseAsString.withDefault("1"));
  const [showBalance, setShowBalance] = useQueryState("show_balance", parseAsString.withDefault("1"));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "page_size",
    parseAsInteger.withDefault(20),
  );

  const urlParams = useMemo<StudentTableUrlParams>(
    () => ({
      search,
      status: statusFilter,
      grade_level: gradeLevelFilter,
      section: sectionFilter,
      gender: genderFilter,
      balance_owed: balanceOwedFilter,
      balance_condition: balanceCondition,
      balance_min: balanceMin,
      balance_max: balanceMax,
      include_billing: includeBilling,
      show_rank: showRank,
      show_grade_average: showGradeAverage,
      show_balance: showBalance,
    }),
    [
      search,
      statusFilter,
      gradeLevelFilter,
      sectionFilter,
      genderFilter,
      balanceOwedFilter,
      balanceCondition,
      balanceMin,
      balanceMax,
      includeBilling,
      showRank,
      showGradeAverage,
      showBalance,
    ]
  );

  const studentQuery = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
      grade_level: gradeLevelFilter || undefined,
      section: sectionFilter || undefined,
      gender: genderFilter || undefined,
      balance_owed: balanceOwedFilter || undefined,
      balance_condition: balanceCondition || undefined,
      balance_min: balanceMin || undefined,
      balance_max: balanceMax || undefined,
      include_billing: includeBilling || "0",
      show_rank: showRank || "0",
      show_grade_average: showGradeAverage || "0",
      show_balance: showBalance || "0",
      page,
      page_size: pageSize,
    }),
    [
      search,
      statusFilter,
      gradeLevelFilter,
      sectionFilter,
      genderFilter,
      balanceOwedFilter,
      balanceCondition,
      balanceMin,
      balanceMax,
      includeBilling,
      showRank,
      showGradeAverage,
      showBalance,
      page,
      pageSize,
    ],
  );

  const { data, isLoading, error, isFetching, refetch } = studentsApi.getStudents(studentQuery);
  const { data: gradeLevels = [] } = useGradeLevels();
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

  const selectedGradeIds = useMemo(() => {
    if (!urlParams.grade_level) return [] as string[];
    return urlParams.grade_level
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }, [urlParams.grade_level]);

  const gradeFilterOptions = useMemo(() => {
    return [...gradeLevels]
      .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
      .map((grade) => ({
        label: grade.name,
        value: grade.id,
      }));
  }, [gradeLevels]);

  const sectionFilterOptions = useMemo(() => {
    if (selectedGradeIds.length !== 1) return [] as Array<{ label: string; value: string }>;
    const selectedGrade = gradeLevels.find((grade) => grade.id === selectedGradeIds[0]);
    const sections = selectedGrade?.sections || [];
    if (sections.length <= 1) return [];
    return [...sections]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((section) => ({
        label: section.name,
        value: section.id,
      }));
  }, [gradeLevels, selectedGradeIds]);

  const setUrlParams = useCallback(
    (params: StudentTableUrlParams & { page: number }) => {
      void setSearch(params.search || "");
      void setStatusFilter(params.status && params.status !== "all" ? params.status : "enrolled");
      void setGradeLevelFilter(params.grade_level || "");
      void setSectionFilter(params.section || "");
      void setGenderFilter(params.gender || "");
      void setBalanceOwedFilter(params.balance_owed || "");
      void setBalanceCondition(params.balance_condition || "");
      void setBalanceMin(params.balance_min || "");
      void setBalanceMax(params.balance_max || "");
      void setIncludeBilling(params.include_billing || "0");
      void setShowRank(params.show_rank || "0");
      void setShowGradeAverage(params.show_grade_average || "0");
      void setShowBalance(params.show_balance || "0");
      void setPage(params.page || 1);
    },
    [
      setSearch,
      setStatusFilter,
      setGradeLevelFilter,
      setSectionFilter,
      setGenderFilter,
      setBalanceOwedFilter,
      setBalanceCondition,
      setBalanceMin,
      setBalanceMax,
      setIncludeBilling,
      setShowRank,
      setShowGradeAverage,
      setShowBalance,
      setPage,
    ],
  );

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
        // loading={isLoading}
        error={error}
        // noData={isEmpty}
        skeleton={<StudentTableSkeleton />}
        emptyState={<EmptyStudents onAddStudent={() => setShowCreateModal(true)} />}
      >
        {/* Stats Cards */}
        <StudentStatsCards items={stats} />

          <StudentTable
            data={studentsList}
            onEnroll={handleEnroll}
            onFixEnrollment={handleFixEnrollment}
            onDelete={handleDelete}
            urlParams={urlParams}
            setUrlParams={setUrlParams}
            gradeFilterOptions={gradeFilterOptions}
            sectionFilterOptions={sectionFilterOptions}
            serverPagination={serverPagination}
            loading={isFetching}
          />
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
