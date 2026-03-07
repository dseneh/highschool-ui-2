"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import PageLayout from "@/components/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import type { StudentConcessionDto } from "@/lib/api2/billing-types";
import { useBillingsApi } from "@/lib/api2/billing/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { AddConcessionDialog } from "@/components/students/add-concession-dialog";
import type { StudentSearchResult } from "@/components/concessions/student-search-card";
import { DeleteConcessDialog } from "@/components/concessions/delete-concession-dialog";
import { DataTable } from "@/components/shared/data-table";
import { useBillings } from "@/lib/api2";
import { AcademicYearSelect } from "@/components/shared/data-reusable";
import { useQueryState } from "nuqs";
import { getConcessionsColumns } from "@/components/concessions/concession-columns";
import { getQueryClient } from "@/lib/query-client";
import { ConcessionStatsCards } from "@/components/concessions/concession-stats-cards";
import { ConcessionFilters } from "@/components/concessions/concession-filters";
import { ViewConcessionDialog } from "@/components/concessions/view-concession-dialog";
import { useMemo } from "react";

export default function ConcessionsPage() {
  const [selectedStudent] = useState<StudentSearchResult | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedConcession, setSelectedConcession] =
    useState<StudentConcessionDto | null>(null);
  const [editingConcession, setEditingConcession] =
    useState<StudentConcessionDto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingConcession, setViewingConcession] =
    useState<StudentConcessionDto | null>(null);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  const [academicYear] = useQueryState("year");

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
    setIsViewDialogOpen(true);
  };

  // Filter logic
  const filteredData = useMemo(() => {
    if (!concessionsData) return [];

    return concessionsData.filter((concession: StudentConcessionDto) => {
      // Type filter
      if (typeFilter !== "all" && concession.concession_type !== typeFilter) {
        return false;
      }

      // Target filter
      if (targetFilter !== "all" && concession.target !== targetFilter) {
        return false;
      }

      // Amount filter
      const amount = Number(concession.amount || 0);
      if (minAmount && amount < Number(minAmount)) {
        return false;
      }
      if (maxAmount && amount > Number(maxAmount)) {
        return false;
      }

      return true;
    });
  }, [concessionsData, typeFilter, targetFilter, minAmount, maxAmount]);

  const hasActiveFilters =
    typeFilter !== "all" ||
    targetFilter !== "all" ||
    minAmount !== "" ||
    maxAmount !== "";

  const handleClearFilters = () => {
    setTypeFilter("all");
    setTargetFilter("all");
    setMinAmount("");
    setMaxAmount("");
  };

  const columns = getConcessionsColumns({
    currencySymbol: "$",
    onEdit: handleEdit,
    onDelete: handleOpenDeleteDialog,
    onView: handleView,
  });

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

          {/* View Concession Dialog */}
          <ViewConcessionDialog
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
            concession={viewingConcession}
            currencySymbol="$"
          />
        </>
      }
      emptyStateTitle="No concession found"
      emptyStateDescription="There was no concession found for the selected academic year."
    >
      {/* Stats Cards */}
      <ConcessionStatsCards
        stats={statsData}
        isLoading={isLoadingStats}
        currency="$"
      />

      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="student"
        showPagination={filteredData?.length > 10}
        filters={
          <ConcessionFilters
            typeFilter={typeFilter}
            targetFilter={targetFilter}
            minAmount={minAmount}
            maxAmount={maxAmount}
            onTypeFilterChange={setTypeFilter}
            onTargetFilterChange={setTargetFilter}
            onMinAmountChange={setMinAmount}
            onMaxAmountChange={setMaxAmount}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        }
      />
    </PageLayout>
  );
}
