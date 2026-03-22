"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import PageLayout from "@/components/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Coins01Icon,
  UserAccountIcon,
  DollarCircleIcon,
  PieChart01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import type { StudentConcessionDto } from "@/lib/api2/billing-types";
import { useBillingsApi } from "@/lib/api2/billing/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { AddConcessionDialog } from "@/components/students/add-concession-dialog";
import type { StudentSearchResult } from "@/components/concessions/student-search-card";
import { DeleteConcessDialog } from "@/components/concessions/delete-concession-dialog";
import { useBillings } from "@/lib/api2";
import { AcademicYearSelect } from "@/components/shared/data-reusable";
import { useQueryState } from "nuqs";
import { getConcessionsColumns } from "@/components/concessions/concession-columns";
import { getQueryClient } from "@/lib/query-client";
import { ViewConcessionSheet } from "@/components/concessions/view-concession-dialog";
import { useMemo } from "react";
import { StatsCards } from "@/components/shared/stats-cards";
import { AdvancedTable } from "@/components/shared/advanced-table";
import { useAcademicYears } from "@/hooks/use-academic-year";
import { Searchbar } from "@/components/shared/advanced-table/searchbar";
import { TableFilters } from "@/components/shared/advanced-table/table-filters";
import { TableFiltersInline } from "@/components/shared/advanced-table/table-filters-inline";
import { ViewOptions } from "@/components/shared/advanced-table/view-options";

export default function ConcessionsPage() {
  const [selectedStudent] = useState<StudentSearchResult | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedConcession, setSelectedConcession] =
    useState<StudentConcessionDto | null>(null);
  const [editingConcession, setEditingConcession] =
    useState<StudentConcessionDto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [viewingConcession, setViewingConcession] =
    useState<StudentConcessionDto | null>(null);

  const [searchInputValue, setSearchInputValue] = useState("");
  const [appliedSearchValue, setAppliedSearchValue] = useState("");

  const [academicYear] = useQueryState("year");
  const { data: academicYears = [] } = useAcademicYears();

  const { createStudentConcessionApi, updateStudentConcessionApi } =
    useBillingsApi();
  const api = useBillings();

  const {
    data: concessionsData,
    isLoading,
    refetch,
    isFetching,
    error,
  } = api.getStudentConcessions(
    academicYear!,
    {},
    {
      enabled: !!academicYear,
    },
  );

  // Fetch concession stats
  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = api.getStudentConcessionStats(academicYear!, {
    enabled: !!academicYear,
  });

  const queryClient = getQueryClient();

  // Create mutation
  const createConcessMutation = useMutation({
    mutationFn: async (payload: {
      student: string;
      concession_type: "percentage" | "flat";
      target: "entire_bill" | "tuition" | "other_fees";
      value: number;
      notes?: string;
      active?: boolean;
    }) => {
      await createStudentConcessionApi("current", payload);
    },
    onSuccess: () => {
      toast.success("Concession created successfully");
      queryClient.invalidateQueries({
        queryKey: ["concessions"],
      });
      refetch();
      refetchStats();
      setShowAddDialog(false);
      setEditingConcession(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Update mutation
  const updateConcessMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      student: string;
      concession_type: "percentage" | "flat";
      target: "entire_bill" | "tuition" | "other_fees";
      value: number;
      notes?: string;
      active?: boolean;
    }) => {
      const { id, ...data } = payload;
      await updateStudentConcessionApi(id, data);
    },
    onSuccess: () => {
      toast.success("Concession updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["concessions"],
      });
      refetch();
      refetchStats();
      setShowAddDialog(false);
      setEditingConcession(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleDeleteSuccess = () => {
    refetch();
    refetchStats();
  };

  const handleEdit = (concession: StudentConcessionDto) => {
    setEditingConcession(concession);
    setShowAddDialog(true);
  };

  const handleOpenDeleteDialog = (concession: StudentConcessionDto) => {
    setSelectedConcession(concession);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (concession: StudentConcessionDto) => {
    setViewingConcession(concession);
    setIsViewSheetOpen(true);
  };

  const rows = concessionsData ?? [];
  const isSearchDirty = searchInputValue !== appliedSearchValue;

  const columns = getConcessionsColumns({
    currencySymbol: "$",
    onEdit: handleEdit,
    onDelete: handleOpenDeleteDialog,
    onView: handleView,
  });

  const selectedAcademicYearName = useMemo(() => {
    if (!academicYears.length) return null;

    if (academicYear) {
      return academicYears.find((year) => year.id === academicYear)?.name ?? academicYear;
    }

    return academicYears.find((year) => year.current)?.name ?? null;
  }, [academicYears, academicYear]);

  const statsItems = useMemo(() => {
    const safeStats = statsData ?? {
      total_concessions: 0,
      total_students: 0,
      total_amount: 0,
      average_amount: 0,
    };

    return [
      {
        title: "Total Concessions",
        value: String(safeStats.total_concessions ?? 0),
        subtitle: "Active entries this year",
        icon: Coins01Icon,
      },
      {
        title: "Students Covered",
        value: String(safeStats.total_students ?? 0),
        subtitle: "Distinct student count",
        icon: UserAccountIcon,
      },
      {
        title: "Total Amount",
        value: `$${Number(safeStats.total_amount ?? 0).toLocaleString()}`,
        subtitle: "Computed concessions",
        icon: DollarCircleIcon,
      },
      {
        title: "Average Amount",
        value: `$${Number(safeStats.average_amount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        subtitle: selectedAcademicYearName
          ? `Academic year: ${selectedAcademicYearName}`
          : "Current academic year",
        icon: PieChart01Icon,
        subtitleIcon: Calendar03Icon,
      },
    ];
  }, [statsData, selectedAcademicYearName]);

  return (
    <PageLayout
      title="Concessions"
      description="Manage student concessions and discounts"
      loading={isLoading}
      fetching={isFetching}
      refreshAction={refetch}
      noData={!concessionsData}
      error={error}
      actions={
        <div className="flex items-center gap-2">
          <AcademicYearSelect autoSelectCurrent autoSelectFirst noTitle />
          <Button
            onClick={() => setShowAddDialog(true)}
            icon={<HugeiconsIcon icon={Add01Icon} className="size-4" />}
          >
            Add Concession
          </Button>
        </div>
      }
      globalChildren={
        <>
          <AddConcessionDialog
            open={showAddDialog}
            onOpenChange={(open) => {
              setShowAddDialog(open);
              if (!open) setEditingConcession(null);
            }}
            mode={editingConcession ? "edit" : "create"}
            initialValue={editingConcession}
            student={
              editingConcession?.student
                ? (editingConcession.student as any)
                : selectedStudent
                  ? (selectedStudent as any)
                  : undefined
            }
            skipSearch={!!(editingConcession?.student || selectedStudent)}
            onSubmit={async (payload) => {
              if (editingConcession) {
                updateConcessMutation.mutate({
                  id: editingConcession.id,
                  ...payload,
                });
              } else {
                createConcessMutation.mutate(payload);
              }
            }}
            submitting={
              editingConcession
                ? updateConcessMutation.isPending
                : createConcessMutation.isPending
            }
          />

          {/* Delete Confirmation Dialog */}
          <DeleteConcessDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            concession={selectedConcession}
            onSuccess={handleDeleteSuccess}
          />

          {/* View Concession Sheet */}
          <ViewConcessionSheet
            open={isViewSheetOpen}
            onOpenChange={setIsViewSheetOpen}
            concession={viewingConcession}
            currencySymbol="$"
          />
        </>
      }
      emptyStateTitle="No concession found"
      emptyStateDescription="There was no concession found for the selected academic year."
    >
      {!isLoadingStats ? <StatsCards items={statsItems} /> : null}

      <AdvancedTable
        columns={columns}
        data={rows}
        pageSize={20}
        showPagination={rows.length > 10}
        showRowSelection={false}
        showBulkActions={false}
        onRowClick={handleView}
        toolbar={(table) => (
          <div className="p-1 space-y-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-2 flex-1">
                <Searchbar
                  value={searchInputValue}
                  disabled={isLoading || isFetching}
                  onChange={(event) => {
                    setSearchInputValue(event.target.value);
                  }}
                  onClear={() => {
                    setSearchInputValue("");
                    setAppliedSearchValue("");
                    table.getColumn("student")?.setFilterValue(undefined);
                  }}
                  onSearch={() => {
                    const normalizedValue = searchInputValue.trim();
                    setAppliedSearchValue(normalizedValue);
                    table.getColumn("student")?.setFilterValue(normalizedValue || undefined);
                  }}
                  showDirtyIndicator={isSearchDirty}
                  placeholder="Search student name or ID..."
                  className="w-full min-w-62.5 max-w-sm"
                />
                <div className="md:hidden">
                  <TableFilters table={table} disabled={Boolean(isLoading || isFetching)} />
                </div>
                <div className="hidden md:block">
                  <TableFiltersInline table={table} disabled={Boolean(isLoading || isFetching)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ViewOptions table={table} />
              </div>
            </div>
          </div>
        )}
      />
    </PageLayout>
  );
}
