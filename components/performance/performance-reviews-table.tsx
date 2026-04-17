"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import { AdvancedTableColumnHeader } from "@/components/shared/advanced-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEmployeePerformanceReviewMutations } from "@/hooks/use-employee-performance-reviews";
import type { EmployeeDto } from "@/lib/api2/employee-types";
import type {
  CreateEmployeePerformanceReviewCommand,
  EmployeePerformanceReviewDto,
} from "@/lib/api2/employee-performance-review-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { PerformanceReviewFormModal } from "./performance-review-form-modal";
import AlertDialogBox from "@/components/shared/alert-dialogbox";

interface PerformanceReviewsTableProps {
  records: EmployeePerformanceReviewDto[];
  employees: EmployeeDto[];
  onRefresh: () => void;
}

function formatDate(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === "completed") return <Badge>Completed</Badge>;
  if (normalized === "acknowledged") return <Badge variant="outline">Acknowledged</Badge>;
  if (normalized === "in progress") return <Badge variant="secondary">In Progress</Badge>;
  return <Badge variant="destructive">Draft</Badge>;
}

function RatingBadge({ rating }: { rating: string }) {
  const normalized = rating.toLowerCase();

  if (normalized === "outstanding") return <Badge>Outstanding</Badge>;
  if (normalized === "exceeds expectations") return <Badge variant="secondary">Exceeds</Badge>;
  if (normalized === "meets expectations") return <Badge variant="outline">Meets</Badge>;
  return <Badge variant="destructive">Needs Improvement</Badge>;
}

export function PerformanceReviewsTable({ records, employees, onRefresh }: PerformanceReviewsTableProps) {
  const { remove, update } = useEmployeePerformanceReviewMutations();
  const [editingRecord, setEditingRecord] = React.useState<EmployeePerformanceReviewDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget);
      showToast.success("Deleted", "Performance review removed successfully");
      onRefresh();
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    }
  };

  const employeeFilterOptions = React.useMemo(
    () =>
      Array.from(new Map(records.map((record) => [record.employeeId, record.employeeName])).entries()).map(
        ([value, label]) => ({ value, label })
      ),
    [records]
  );

  const handleEditSubmit = async (payload: CreateEmployeePerformanceReviewCommand) => {
    if (!editingRecord) return;

    setIsSubmitting(true);
    try {
      await update.mutateAsync({ id: editingRecord.id, payload });
      showToast.success("Updated", "Performance review updated successfully");
      setEditingRecord(null);
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<EmployeePerformanceReviewDto>[] = [
    {
      accessorKey: "employeeName",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Employee" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          <p className="text-sm text-muted-foreground">{row.original.employeeNumber || "No employee number"}</p>
        </div>
      ),
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;
        return value.includes(row.original.employeeId);
      },
      meta: {
        displayName: "Employee",
        filterType: "checkbox",
        filterOptions: employeeFilterOptions,
        filterSummaryMode: "count",
      } as never,
    },
    {
      accessorKey: "reviewTitle",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Review" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.reviewTitle}</p>
          <p className="text-sm text-muted-foreground">{row.original.reviewPeriod || "No period"}</p>
        </div>
      ),
    },
    {
      accessorKey: "reviewDate",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Dates" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm">Reviewed: {formatDate(row.original.reviewDate)}</p>
          <p className="text-sm text-muted-foreground">Next: {formatDate(row.original.nextReviewDate)}</p>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Rating" />,
      cell: ({ row }) => <RatingBadge rating={row.original.rating} />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Rating",
        filterType: "select",
        filterOptions: [
          { label: "Outstanding", value: "Outstanding" },
          { label: "Exceeds Expectations", value: "Exceeds Expectations" },
          { label: "Meets Expectations", value: "Meets Expectations" },
          { label: "Needs Improvement", value: "Needs Improvement" },
        ],
      } as never,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Status",
        filterType: "select",
        filterOptions: [
          { label: "Draft", value: "Draft" },
          { label: "In Progress", value: "In Progress" },
          { label: "Completed", value: "Completed" },
          { label: "Acknowledged", value: "Acknowledged" },
        ],
      } as never,
    },
    {
      accessorKey: "overallScore",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Score" />,
      cell: ({ row }) => row.original.overallScore?.toFixed(1) || row.original.ratingScore.toFixed(1),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" icon={<MoreVertical />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={editingRecord?.id === row.original.id}
              onClick={() => setEditingRecord(row.original)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={false}
              onClick={() => setDeleteTarget(row.original.id)}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <AccountingAdvancedTable
        columns={columns}
        data={records}
        noData={records.length === 0}
        emptyStateTitle="No Performance Reviews"
        emptyStateDescription="There are no performance reviews to display."
        pageSize={10}
        searchPlaceholder="Search performance reviews..."
        searchPredicate={(row, normalizedSearch) =>
          row.employeeName.toLowerCase().includes(normalizedSearch) ||
          (row.employeeNumber || "").toLowerCase().includes(normalizedSearch) ||
          row.reviewTitle.toLowerCase().includes(normalizedSearch) ||
          (row.reviewPeriod || "").toLowerCase().includes(normalizedSearch) ||
          row.status.toLowerCase().includes(normalizedSearch) ||
          row.rating.toLowerCase().includes(normalizedSearch) ||
          (row.reviewerName || "").toLowerCase().includes(normalizedSearch)
        }
      />

      <PerformanceReviewFormModal
        open={Boolean(editingRecord)}
        onOpenChange={(open) => {
          if (!open) setEditingRecord(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        employees={employees}
        initialData={editingRecord ?? undefined}
      />

      <AlertDialogBox
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Performance Review"
        description="Are you sure you want to delete this performance review? This action cannot be undone."
        actionLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
