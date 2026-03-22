"use client";

import * as React from "react";
import { useGradeLevels } from "@/hooks/use-grade-level";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import { useStudents, useStudentMutations } from "@/hooks/use-student";
import {
  UserGroupIcon,
  UserCircleIcon,
  Invoice02Icon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import { StudentTable } from "../../../../components/students/student-table";
import { StudentTableSkeleton } from "@/components/students/student-table-skeleton";
import { EmptyStudents } from "@/components/students/empty-students";
import { StatsCards } from "@/components/shared/stats-cards";
import { StudentFormModal } from "@/components/students/student-form";
import { EnrollmentDialog } from "@/components/students/enrollment-dialog";
import { DeleteStudentDialog } from "@/components/students/delete-student-dialog";
import { AddStudentDropdown } from "@/components/students/add-student-dropdown";
import { StudentBulkUploadDialog } from "@/components/students/student-bulk-upload-dialog";
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
  const [paidCondition, setPaidCondition] = useQueryState("paid_condition", parseAsString.withDefault(""));
  const [paidMin, setPaidMin] = useQueryState("paid_min", parseAsString.withDefault(""));
  const [paidMax, setPaidMax] = useQueryState("paid_max", parseAsString.withDefault(""));
  const [includeBilling, setIncludeBilling] = useQueryState("include_billing", parseAsString.withDefault("0"));
  const [showRank, setShowRank] = useQueryState("show_rank", parseAsString.withDefault("1"));
  const [showGradeAverage, setShowGradeAverage] = useQueryState("show_grade_average", parseAsString.withDefault("1"));
  const [showBalance, setShowBalance] = useQueryState("show_balance", parseAsString.withDefault("0"));
  const [showPaid, setShowPaid] = useQueryState("show_paid", parseAsString.withDefault("0"));
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
      paid_condition: paidCondition,
      paid_min: paidMin,
      paid_max: paidMax,
      include_billing: includeBilling,
      show_rank: showRank,
      show_grade_average: showGradeAverage,
      show_balance: showBalance,
      show_paid: showPaid,
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
      paidCondition,
      paidMin,
      paidMax,
      includeBilling,
      showRank,
      showGradeAverage,
      showBalance,
      showPaid,
    ]
  );

  const normalizeBooleanFlag = useCallback(
    (value: string): "0" | "1" | "true" | "false" => {
      if (value === "0" || value === "1" || value === "true" || value === "false") {
        return value;
      }
      return "0";
    },
    []
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
      paid_condition: paidCondition || undefined,
      paid_min: paidMin || undefined,
      paid_max: paidMax || undefined,
      include_billing: normalizeBooleanFlag(includeBilling),
      show_rank: normalizeBooleanFlag(showRank),
      show_grade_average: normalizeBooleanFlag(showGradeAverage),
      show_balance: normalizeBooleanFlag(showBalance),
      show_paid: normalizeBooleanFlag(showPaid),
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
      paidCondition,
      paidMin,
      paidMax,
      includeBilling,
      normalizeBooleanFlag,
      showRank,
      showGradeAverage,
      showBalance,
      showPaid,
      page,
      pageSize,
    ],
  );

  const { data, isLoading, error, isFetching, refetch } = useStudents(studentQuery);
  const { data: gradeLevels = [] } = useGradeLevels();
  const { create: createMutation, remove: removeMutation } = useStudentMutations();
  const { data: currentYear } = useCurrentAcademicYear();
  const canManageStudents = useHasRole("teacher");

  const queryClient = getQueryClient()
  
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = React.useState(false);
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
      removeMutation.mutate(
        { id: deleteStudent.id, force },
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
    [deleteStudent, removeMutation, queryClient],
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
      void setStatusFilter(params.status || "enrolled");
      void setGradeLevelFilter(params.grade_level || "");
      void setSectionFilter(params.section || "");
      void setGenderFilter(params.gender || "");
      void setBalanceOwedFilter(params.balance_owed || "");
      void setBalanceCondition(params.balance_condition || "");
      void setBalanceMin(params.balance_min || "");
      void setBalanceMax(params.balance_max || "");
      void setPaidCondition(params.paid_condition || "");
      void setPaidMin(params.paid_min || "");
      void setPaidMax(params.paid_max || "");
      void setIncludeBilling(params.include_billing || "0");
      void setShowRank(params.show_rank || "0");
      void setShowGradeAverage(params.show_grade_average || "0");
      void setShowBalance(params.show_balance || "0");
      void setShowPaid(params.show_paid || "0");
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
      setPaidCondition,
      setPaidMin,
      setPaidMax,
      setIncludeBilling,
      setShowRank,
      setShowGradeAverage,
      setShowBalance,
      setShowPaid,
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
              onUploadBulk={() => setShowBulkUploadModal(true)}
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
        <StatsCards items={stats} />

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

      <StudentBulkUploadDialog
        open={showBulkUploadModal}
        onOpenChange={setShowBulkUploadModal}
        gradeLevels={gradeLevels}
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
