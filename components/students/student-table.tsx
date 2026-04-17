"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import type { ConditionFilter } from "@/components/shared/advanced-table";
import { Download } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DialogBox } from "@/components/ui/dialog-box";
import { WithdrawStudentDialog } from "@/components/students/withdraw-student-dialog";
import { AdvancedTable, Searchbar, TableFilters, TableFiltersInline, ViewOptions } from "@/components/shared/advanced-table";
import { AuthButton } from "@/components/auth/auth-button";
import { useStudentMutations } from "@/hooks/use-student";
import { exportStudentsToCSV } from "@/lib/export-utils";
import { StudentExportSheet } from "@/components/students/student-export-sheet";
import { showToast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth-store";
import { getStudentColumns } from "./student-columns";
import type { StudentDto } from "@/lib/api2/student-types";

export interface StudentTableUrlParams {
  search: string;
  status: string;
  grade_level: string;
  section: string;
  gender: string;
  balance_owed: string;
  balance_condition: string;
  balance_min: string;
  balance_max: string;
  paid_condition: string;
  paid_min: string;
  paid_max: string;
  show_rank: string;
  show_grade_average: string;
  show_balance: string;
  show_paid: string;
  include_billing: string;
}

interface StudentTableProps {
  data: StudentDto[];
  onEnroll?: (student: StudentDto) => void;
  onFixEnrollment?: (student: StudentDto) => void;
  onDelete?: (student: StudentDto) => void;
  urlParams: StudentTableUrlParams;
  setUrlParams: (params: StudentTableUrlParams & { page: number }) => void;
  gradeFilterOptions?: Array<{ label: string; value: string }>;
  sectionFilterOptions?: Array<{ label: string; value: string }>;
  serverPagination?: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  loading?: boolean;
}

function parseCsv(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function StudentTable({
  data,
  onEnroll,
  onFixEnrollment,
  onDelete,
  urlParams,
  setUrlParams,
  gradeFilterOptions = [],
  sectionFilterOptions = [],
  serverPagination,
  loading,
}: StudentTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnToUrl = React.useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);
  const user = useAuthStore((state) => state.user);
  const { withdraw, remove, reinstate } = useStudentMutations();

  const [tableInstance, setTableInstance] = React.useState<Table<StudentDto> | null>(null);
  const isApplyingUrlFilters = React.useRef(false);
  const previousColumnFilters = React.useRef<string>("");
  // Stable ref so interval-based effects can read the latest urlParams
  // without needing urlParams in their dependency arrays (which caused loops).
  const urlParamsRef = React.useRef(urlParams);
  React.useEffect(() => {
    urlParamsRef.current = urlParams;
  }, [urlParams]);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [studentsToDelete, setStudentsToDelete] = React.useState<StudentDto[]>([]);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = React.useState(false);
  const [studentsToWithdraw, setStudentsToWithdraw] = React.useState<StudentDto[]>([]);
  const [reinstateDialogOpen, setReinstateDialogOpen] = React.useState(false);
  const [studentToReinstate, setStudentToReinstate] = React.useState<StudentDto | null>(null);
  const [isReinstating, setIsReinstating] = React.useState(false);
  const [searchInputValue, setSearchInputValue] = React.useState(urlParams.search);
  const [exportSheetOpen, setExportSheetOpen] = React.useState(false);
  const [exportSheetParams, setExportSheetParams] = React.useState<StudentTableUrlParams>(urlParams);
  const isSearchDirty = searchInputValue.trim() !== urlParams.search.trim();

  React.useEffect(() => {
    setSearchInputValue(urlParams.search);
  }, [urlParams.search]);

  React.useEffect(() => {
    if (!exportSheetOpen) {
      setExportSheetParams(urlParams);
    }
  }, [exportSheetOpen, urlParams]);

  const buildParamsFromTableState = React.useCallback(
    (table: Table<StudentDto>): StudentTableUrlParams => {
      const columnFilters = table.getState().columnFilters;
      // Read via ref so this callback stays stable (urlParams not in deps).
      const currentUrlParams = urlParamsRef.current;
      const nextParams: StudentTableUrlParams = {
        search: currentUrlParams.search,
        status: "all",
        grade_level: "",
        section: "",
        gender: "",
        balance_owed: "",
        balance_condition: "",
        balance_min: "",
        balance_max: "",
        paid_condition: "",
        paid_min: "",
        paid_max: "",
        show_rank: currentUrlParams.show_rank,
        show_grade_average: currentUrlParams.show_grade_average,
        show_balance: currentUrlParams.show_balance,
        show_paid: currentUrlParams.show_paid,
        include_billing: currentUrlParams.include_billing,
      };

      columnFilters.forEach((filter) => {
        if (filter.id === "enrollment_status") {
          const selected = Array.isArray(filter.value)
            ? filter.value.map((value) => String(value).toLowerCase()).filter((value) => value !== "all")
            : [];
          nextParams.status = selected.length > 0 ? selected.join(",") : "all";
          return;
        }
        if (filter.id === "grade_level") {
          nextParams.grade_level = Array.isArray(filter.value) ? filter.value.join(",") : "";
          return;
        }
        if (filter.id === "section") {
          if (sectionFilterOptions.length <= 1) return;
          nextParams.section = Array.isArray(filter.value) ? filter.value.join(",") : "";
          return;
        }
        if (filter.id === "gender") {
          nextParams.gender = Array.isArray(filter.value) ? filter.value.join(",") : "";
          return;
        }
        if (filter.id === "balance_owed") {
          nextParams.balance_owed = String(filter.value || "");
          return;
        }
        if (filter.id === "balance") {
          const balanceFilter = filter.value as ConditionFilter | undefined;
          if (balanceFilter?.condition) {
            nextParams.balance_condition = balanceFilter.condition;
            nextParams.balance_min = String(balanceFilter.value?.[0] || "");
            nextParams.balance_max = String(balanceFilter.value?.[1] || "");
          }
          return;
        }
        if (filter.id === "paid") {
          const paidFilter = filter.value as ConditionFilter | undefined;
          if (paidFilter?.condition) {
            nextParams.paid_condition = paidFilter.condition;
            nextParams.paid_min = String(paidFilter.value?.[0] || "");
            nextParams.paid_max = String(paidFilter.value?.[1] || "");
          }
        }
      });

      return nextParams;
    },
    // urlParamsRef is a stable ref object — reading .current inside the callback
    // means we always get fresh values without rebuilding the callback on every
    // urlParams change, which was breaking the interval-based effects.
    [sectionFilterOptions],
  );

  const handleOpenExportSheet = React.useCallback(() => {
    if (tableInstance) {
      setExportSheetParams(buildParamsFromTableState(tableInstance));
    } else {
      setExportSheetParams(urlParams);
    }
    setExportSheetOpen(true);
  }, [buildParamsFromTableState, tableInstance, urlParams]);

  const handleReinstate = React.useCallback((student: StudentDto) => {
    setStudentToReinstate(student);
    setReinstateDialogOpen(true);
  }, []);

  const handleReinstateConfirm = React.useCallback(() => {
    if (!studentToReinstate) return;
    setIsReinstating(true);
    reinstate.mutate(
      { id: studentToReinstate.id },
      {
        onSuccess: () => {
          showToast.success(
            "Student reinstated",
            `${studentToReinstate.full_name} has been reinstated successfully`,
          );
          setReinstateDialogOpen(false);
          setStudentToReinstate(null);
          setIsReinstating(false);
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "An error occurred";
          showToast.error("Reinstatement failed", message);
          setIsReinstating(false);
        },
      },
    );
  }, [studentToReinstate, reinstate]);

  const columns = React.useMemo(
    () =>
      getStudentColumns({
        onEnroll,
        onFixEnrollment,
        onReinstate: handleReinstate,
        onDelete,
        user,
        gradeFilterOptions,
        sectionFilterOptions,
        returnToUrl,
      }),
    [onEnroll, onFixEnrollment, handleReinstate, onDelete, user, gradeFilterOptions, sectionFilterOptions, returnToUrl]
  );

  React.useEffect(() => {
    const canUseSectionFilter = sectionFilterOptions.length > 1;
    if (!canUseSectionFilter && urlParams.section) {
      setUrlParams({
        ...urlParams,
        section: "",
        page: 1,
      });
    }
  }, [sectionFilterOptions, urlParams, setUrlParams]);

  React.useEffect(() => {
    if (!tableInstance) return;

    isApplyingUrlFilters.current = true;

    const shouldShowBalance = urlParams.show_balance === "1" || urlParams.show_balance === "true";
    const shouldShowPaid = urlParams.show_paid === "1" || urlParams.show_paid === "true";
    const balanceColumn = tableInstance.getColumn("balance");
    if (balanceColumn && balanceColumn.getIsVisible() !== shouldShowBalance) {
      balanceColumn.toggleVisibility(shouldShowBalance);
    }

    const paidColumn = tableInstance.getColumn("paid");
    if (paidColumn && paidColumn.getIsVisible() !== shouldShowPaid) {
      paidColumn.toggleVisibility(shouldShowPaid);
    }

    const applyArrayFilter = (columnId: string, csv: string) => {
      const column = tableInstance.getColumn(columnId);
      if (!column) return;
      const values = parseCsv(csv).filter((value) => value !== "all");
      column.setFilterValue(values.length > 0 ? values : undefined);
    };

    const applySelectFilter = (columnId: string, value: string) => {
      const column = tableInstance.getColumn(columnId);
      if (!column) return;
      column.setFilterValue(value || undefined);
    };

    applyArrayFilter("enrollment_status", urlParams.status);
    applyArrayFilter("grade_level", urlParams.grade_level);
    const canUseSectionFilter = sectionFilterOptions.length > 1;
    applyArrayFilter("section", canUseSectionFilter ? urlParams.section : "");
    applyArrayFilter("gender", urlParams.gender);
    applySelectFilter("balance_owed", urlParams.balance_owed);

    const balanceColumnForFilter = tableInstance.getColumn("balance");
    if (balanceColumnForFilter) {
      const hasBalanceFilter = Boolean(
        urlParams.balance_condition || urlParams.balance_min || urlParams.balance_max
      );

      if (!hasBalanceFilter) {
        balanceColumnForFilter.setFilterValue(undefined);
      } else {
        const condition = urlParams.balance_condition || "is-between";
        const balanceFilter: ConditionFilter = {
          condition,
          value: [urlParams.balance_min || "", urlParams.balance_max || ""],
        };
        balanceColumnForFilter.setFilterValue(balanceFilter);
      }
    }

    const paidColumnForFilter = tableInstance.getColumn("paid");
    if (paidColumnForFilter) {
      const hasPaidFilter = Boolean(
        urlParams.paid_condition || urlParams.paid_min || urlParams.paid_max
      );

      if (!hasPaidFilter) {
        paidColumnForFilter.setFilterValue(undefined);
      } else {
        const condition = urlParams.paid_condition || "is-between";
        const paidFilter: ConditionFilter = {
          condition,
          value: [urlParams.paid_min || "", urlParams.paid_max || ""],
        };
        paidColumnForFilter.setFilterValue(paidFilter);
      }
    }

    setTimeout(() => {
      previousColumnFilters.current = JSON.stringify(tableInstance.getState().columnFilters);
      isApplyingUrlFilters.current = false;
    }, 0);
  }, [tableInstance, urlParams, sectionFilterOptions]);

  React.useEffect(() => {
    if (!tableInstance) return;

    const handleStateChange = () => {
      if (isApplyingUrlFilters.current) return;

      const columnFilters = tableInstance.getState().columnFilters;
      const currentFiltersString = JSON.stringify(columnFilters);
      if (currentFiltersString === previousColumnFilters.current) return;
      previousColumnFilters.current = currentFiltersString;

      setUrlParams({
        ...buildParamsFromTableState(tableInstance),
        page: 1,
      });
    };

    handleStateChange();
    const interval = setInterval(handleStateChange, 100);
    return () => clearInterval(interval);
  }, [
    tableInstance,
    setUrlParams,
    buildParamsFromTableState,
  ]);

  React.useEffect(() => {
    if (!tableInstance) return;

    const syncVisibleMetricParams = () => {
      // Skip while the apply-url-filter effect is writing to the table;
      // column visibility state hasn't committed yet so getIsVisible() is stale.
      if (isApplyingUrlFilters.current) return;

      const isRankVisible = tableInstance.getColumn("rank")?.getIsVisible() ?? false;
      const isGradeAverageVisible = tableInstance.getColumn("grade_average")?.getIsVisible() ?? false;
      const isBalanceVisible = tableInstance.getColumn("balance")?.getIsVisible() ?? false;
      const isPaidVisible = tableInstance.getColumn("paid")?.getIsVisible() ?? false;

      const nextShowRank = isRankVisible ? "1" : "0";
      const nextShowGradeAverage = isGradeAverageVisible ? "1" : "0";
      const nextShowBalance = isBalanceVisible ? "1" : "0";
      const nextShowPaid = isPaidVisible ? "1" : "0";
      const nextIncludeBilling = "0";

      // Read latest URL params via ref — no need for urlParams in deps.
      const currentUrlParams = urlParamsRef.current;

      if (
        currentUrlParams.show_rank === nextShowRank &&
        currentUrlParams.show_grade_average === nextShowGradeAverage &&
        currentUrlParams.show_balance === nextShowBalance &&
        currentUrlParams.show_paid === nextShowPaid &&
        currentUrlParams.include_billing === nextIncludeBilling
      ) {
        return;
      }

      setUrlParams({
        ...currentUrlParams,
        show_rank: nextShowRank,
        show_grade_average: nextShowGradeAverage,
        show_balance: nextShowBalance,
        show_paid: nextShowPaid,
        include_billing: nextIncludeBilling,
        page: serverPagination?.currentPage ?? 1,
      });
    };

    syncVisibleMetricParams();
    const interval = setInterval(syncVisibleMetricParams, 200);
    return () => clearInterval(interval);
  }, [tableInstance, setUrlParams, serverPagination?.currentPage]);

  const clearSelection = React.useCallback(() => {
    tableInstance?.toggleAllRowsSelected(false);
  }, [tableInstance]);

  const handleBulkDelete = React.useCallback((selectedRows: StudentDto[]) => {
    const deletable = selectedRows.filter((student) => student.can_delete);
    if (deletable.length === 0) {
      showToast.error("Cannot delete", "None of the selected students can be deleted");
      return;
    }
    setStudentsToDelete(deletable);
    setDeleteDialogOpen(true);
  }, []);

  const handleCustomBulkAction = React.useCallback(
    (action: string, selectedRows: StudentDto[]) => {
      if (action === "bulk_enroll") {
        const enrollable = selectedRows.filter((student) => !student.is_enrolled);
        if (enrollable.length === 0) {
          showToast.error("Cannot enroll", "All selected students are already enrolled");
          return;
        }
        enrollable.forEach((student) => onEnroll?.(student));
        clearSelection();
        showToast.success("Success", `${enrollable.length} student(s) ready for enrollment`);
        return;
      }

      if (action === "bulk_withdraw") {
        const withdrawable = selectedRows.filter((student) => student.is_enrolled);
        if (withdrawable.length === 0) {
          showToast.error("Cannot withdraw", "None of the selected students are enrolled");
          return;
        }
        setStudentsToWithdraw(withdrawable);
        setWithdrawDialogOpen(true);
        return;
      }

      if (action === "bulk_export") {
        exportStudentsToCSV(
          selectedRows,
          `students-selected-${new Date().toISOString().slice(0, 10)}.csv`
        );
        showToast.success("Exported", `${selectedRows.length} students exported to CSV`);
      }
    },
    [clearSelection, onEnroll]
  );

  const handleRowClick = React.useCallback((student: StudentDto) => {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    router.push(`/students/${student.id_number}?returnTo=${encodeURIComponent(returnTo)}`);
  }, [router]);

  return (
    <>
      <AdvancedTable
        loading={loading}
        columns={columns}
        data={data}
        noData={!loading && data.length === 0}
        emptyStateTitle="No Students Found"
        emptyStateDescription="There are no students to display at the moment."
        pageSize={serverPagination?.pageSize ?? 10}
        totalCount={serverPagination?.totalCount}
        currentPage={serverPagination?.currentPage ?? 1}
        onPageChange={serverPagination?.onPageChange}
        onPageSizeChange={serverPagination?.onPageSizeChange}
        onRowClick={handleRowClick}
        showPagination={true}
        showRowSelection={true}
        showBulkActions={true}
        onBulkDelete={handleBulkDelete}
        onCustomBulkAction={handleCustomBulkAction}
        customBulkActions={[
          { label: "Enroll", action: "bulk_enroll" },
          { label: "Withdraw", action: "bulk_withdraw" },
          { label: "Export", action: "bulk_export" },
        ]}
        onTableInstanceReady={setTableInstance}
        toolbar={(table) => (
          <div className="p-1 space-y-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-2 flex-1">
                <Searchbar
                  value={searchInputValue}
                  disabled={loading}
                  onChange={(event) => {
                    setSearchInputValue(event.target.value)
                  }}
                  onClear={() => {
                    setSearchInputValue("")
                    setUrlParams({
                      ...urlParams,
                      search: "",
                      page: 1,
                    })
                  }}
                  onSearch={() => {
                    setUrlParams({
                      ...urlParams,
                      search: searchInputValue,
                      page: 1,
                    });
                  }}
                  showDirtyIndicator={isSearchDirty}
                  placeholder="Search students..."
                  className="w-full min-w-62.5 max-w-sm"
                />
                <div className="md:hidden">
                  <TableFilters table={table} disabled={Boolean(loading)} />
                </div>
                <div className="hidden md:block">
                  <TableFiltersInline table={table} disabled={Boolean(loading)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ViewOptions table={table} />
                <AuthButton
                  roles="teacher"
                  disable
                  variant="outline"
                  size="sm"
                  onClick={handleOpenExportSheet}
                  icon={<Download className="h-4 w-4" />}
                >
                  Download Data
                </AuthButton>
              </div>
            </div>
          </div>
        )}
      />

      {studentsToWithdraw.length === 1 ? (
        <WithdrawStudentDialog
          open={withdrawDialogOpen}
          onOpenChange={setWithdrawDialogOpen}
          student={studentsToWithdraw[0]}
          loading={withdraw.isPending}
          onConfirm={(payload: { withdrawal_date: string; withdrawal_reason: string }) => {
            withdraw.mutate(
              { id: studentsToWithdraw[0].id, payload },
              {
                onSuccess: () => {
                  showToast.success("Success", "Student withdrawn successfully");
                  setWithdrawDialogOpen(false);
                  setStudentsToWithdraw([]);
                  clearSelection();
                },
                onError: (error: Error) => {
                  showToast.error("Error", error.message || "Failed to withdraw student");
                },
              }
            );
          }}
        />
      ) : studentsToWithdraw.length > 1 ? (
        <DialogBox
          open={withdrawDialogOpen}
          onOpenChange={setWithdrawDialogOpen}
          title="Bulk Withdraw Not Supported"
          description="Please withdraw students one at a time to specify individual withdrawal dates and reasons."
          actionLabel="OK"
          onAction={() => {
            setWithdrawDialogOpen(false);
            setStudentsToWithdraw([]);
          }}
          cancelLabel={false}
        />
      ) : null}

      <DialogBox
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Students"
        description={
          <>
            Are you sure you want to delete <strong>{studentsToDelete.length}</strong> student(s)?
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              This action cannot be undone. All associated data will be permanently removed.
            </span>
          </>
        }
        actionLabel={`Delete ${studentsToDelete.length} Student${studentsToDelete.length !== 1 ? "s" : ""}`}
        actionVariant="destructive"
        actionLoading={remove.isPending}
        onAction={() => {
          const rowsToDelete = [...studentsToDelete];
          Promise.all(
            rowsToDelete.map((student) =>
              remove.mutateAsync({ id: student.id, force: false })
            )
          )
            .then(() => {
              rowsToDelete.forEach((student) => onDelete?.(student));
              setDeleteDialogOpen(false);
              setStudentsToDelete([]);
              clearSelection();
              showToast.success("Success", `${rowsToDelete.length} student(s) deleted`);
            })
            .catch((error: Error) => {
              showToast.error("Error", error.message || "Failed to delete selected students");
            });
        }}
      />

      <DialogBox
        open={reinstateDialogOpen}
        onOpenChange={(open) => {
          if (!open) { setStudentToReinstate(null); }
          setReinstateDialogOpen(open);
        }}
        title="Reinstate Student"
        description={
          <>
            Are you sure you want to reinstate <strong>{studentToReinstate?.full_name}</strong>?
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              The student will be restored to active status. You can then re-enroll them for the current academic year.
            </span>
          </>
        }
        actionLabel="Reinstate Student"
        actionLoading={isReinstating}
        actionLoadingText="Reinstating..."
        onAction={handleReinstateConfirm}
      />

      <StudentExportSheet
        open={exportSheetOpen}
        onOpenChange={setExportSheetOpen}
        urlParams={exportSheetParams}
        gradeFilterOptions={gradeFilterOptions}
        sectionFilterOptions={sectionFilterOptions}
      />
    </>
  );
}
