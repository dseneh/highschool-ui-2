"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { AdvancedTableColumnHeader } from "@/components/shared/advanced-table";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { useLeaveMutations } from "@/hooks/use-leave";
import type { CreateLeaveTypeCommand, LeaveTypeDto } from "@/lib/api2/leave-types";
import { LeaveTypeFormModal } from "./leave-type-form-modal";
import AlertDialogBox from "@/components/shared/alert-dialogbox";

function formatPolicyLabel(value: string) {
  return value || "Upfront";
}

interface LeaveTypesTableProps {
  leaveTypes: LeaveTypeDto[];
  onRefresh: () => void;
}

export function LeaveTypesTable({ leaveTypes, onRefresh }: LeaveTypesTableProps) {
  const { removeType, updateType } = useLeaveMutations();
  const [editingType, setEditingType] = React.useState<LeaveTypeDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeType.mutateAsync(deleteTarget);
      showToast.success("Deleted", "Leave type has been removed");
      onRefresh();
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    }
  };

  const handleEditSubmit = async (payload: CreateLeaveTypeCommand) => {
    if (!editingType) return;

    setIsSubmitting(true);
    try {
      await updateType.mutateAsync({ id: editingType.id, payload });
      showToast.success("Updated", "Leave type updated successfully");
      setEditingType(null);
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<LeaveTypeDto>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Leave Type" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.description && (
            <p className="text-sm text-muted-foreground">{row.original.description}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => row.original.code || "-",
    },
    {
      accessorKey: "defaultDays",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Default Days" />,
    },
    {
      accessorKey: "accrualFrequency",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Accrual" />,
      cell: ({ row }) => formatPolicyLabel(row.original.accrualFrequency),
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Accrual",
        filterType: "select",
        filterOptions: [
          { label: "Upfront", value: "Upfront" },
          { label: "Monthly", value: "Monthly" },
          { label: "Quarterly", value: "Quarterly" },
          { label: "Annually", value: "Annually" },
        ],
      } as never,
    },
    {
      accessorKey: "allowCarryover",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Carryover" />,
      cell: ({ row }) =>
        row.original.allowCarryover
          ? `Up to ${row.original.maxCarryoverDays} day${row.original.maxCarryoverDays === 1 ? "" : "s"}`
          : "Not allowed",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)) === value;
      },
      meta: {
        displayName: "Carryover",
        filterType: "select",
        filterOptions: [
          { label: "Allowed", value: "true" },
          { label: "Not Allowed", value: "false" },
        ],
      } as never,
    },
    {
      accessorKey: "requiresApproval",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Approval" />,
      cell: ({ row }) => (row.original.requiresApproval ? "Required" : "Optional"),
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)) === value;
      },
      meta: {
        displayName: "Approval",
        filterType: "select",
        filterOptions: [
          { label: "Required", value: "true" },
          { label: "Optional", value: "false" },
        ],
      } as never,
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
              checked={editingType?.id === row.original.id}
              onClick={() => setEditingType(row.original)}
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
        data={leaveTypes}
        noData={leaveTypes.length === 0}
        emptyStateTitle="No Leave Types"
        emptyStateDescription="There are no leave types configured."
        pageSize={8}
        searchPlaceholder="Search leave types..."
        searchPredicate={(row, normalizedSearch) =>
          row.name.toLowerCase().includes(normalizedSearch) ||
          (row.code || "").toLowerCase().includes(normalizedSearch) ||
          (row.description || "").toLowerCase().includes(normalizedSearch)
        }
      />

      <LeaveTypeFormModal
        open={Boolean(editingType)}
        onOpenChange={(open) => {
          if (!open) setEditingType(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        initialData={editingType ?? undefined}
      />

      <AlertDialogBox
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Leave Type"
        description="Are you sure you want to delete this leave type? This action cannot be undone."
        actionLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
