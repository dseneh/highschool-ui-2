"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { AdvancedTableColumnHeader } from "@/components/shared/advanced-table";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePayrollMutations } from "@/hooks/use-payroll";
import type { CreatePayrollComponentCommand, PayrollComponentDto } from "@/lib/api2/payroll-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { PayrollComponentFormModal } from "./payroll-component-form-modal";
import AlertDialogBox from "@/components/shared/alert-dialogbox";

interface PayrollComponentsTableProps {
  components: PayrollComponentDto[];
  onRefresh: () => void;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function PayrollComponentsTable({ components, onRefresh }: PayrollComponentsTableProps) {
  const { removeComponent, updateComponent } = usePayrollMutations();
  const [editingComponent, setEditingComponent] = React.useState<PayrollComponentDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeComponent.mutateAsync(deleteTarget);
      showToast.success("Deleted", "Payroll component removed successfully");
      onRefresh();
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    }
  };

  const handleEditSubmit = async (payload: CreatePayrollComponentCommand) => {
    if (!editingComponent) return;

    setIsSubmitting(true);
    try {
      await updateComponent.mutateAsync({ id: editingComponent.id, payload });
      showToast.success("Updated", "Payroll component updated successfully");
      setEditingComponent(null);
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<PayrollComponentDto>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Component" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.description ? (
            <p className="text-sm text-muted-foreground">{row.original.description}</p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "componentType",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Type" />,
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;
        return value.includes(String(row.getValue(id)));
      },
      meta: {
        displayName: "Type",
        filterType: "checkbox",
        filterOptions: [
          { label: "Earning", value: "Earning" },
          { label: "Deduction", value: "Deduction" },
        ],
        filterSummaryMode: "count",
      } as never,
    },
    {
      accessorKey: "calculationMethod",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Method" />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Method",
        filterType: "select",
        filterOptions: [
          { label: "Fixed", value: "Fixed" },
          { label: "Percentage", value: "Percentage" },
        ],
      } as never,
    },
    {
      accessorKey: "defaultValue",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Default" />,
      cell: ({ row }) => formatMoney(row.original.defaultValue),
    },
    {
      accessorKey: "taxable",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Taxable" />,
      cell: ({ row }) => (row.original.taxable ? "Yes" : "No"),
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)) === value;
      },
      meta: {
        displayName: "Taxable",
        filterType: "select",
        filterOptions: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
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
              checked={editingComponent?.id === row.original.id}
              onClick={() => setEditingComponent(row.original)}
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
        data={components}
        noData={components.length === 0}
        emptyStateTitle="No Payroll Components"
        emptyStateDescription="There are no payroll components to display."
        pageSize={8}
        searchPlaceholder="Search payroll components..."
        searchPredicate={(row, normalizedSearch) =>
          row.name.toLowerCase().includes(normalizedSearch) ||
          (row.code || "").toLowerCase().includes(normalizedSearch) ||
          row.componentType.toLowerCase().includes(normalizedSearch) ||
          row.calculationMethod.toLowerCase().includes(normalizedSearch)
        }
      />

      <PayrollComponentFormModal
        open={Boolean(editingComponent)}
        onOpenChange={(open) => {
          if (!open) setEditingComponent(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        initialData={editingComponent ?? undefined}
      />

      <AlertDialogBox
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Payroll Component"
        description="Are you sure you want to delete this payroll component? This action cannot be undone."
        actionLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
