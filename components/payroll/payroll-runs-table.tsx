"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, MoreVertical, Play, ReceiptText, Trash2 } from "lucide-react";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import { AdvancedTableColumnHeader } from "@/components/shared/advanced-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePayrollMutations } from "@/hooks/use-payroll";
import type { CreatePayrollRunCommand, PayrollRunDto } from "@/lib/api2/payroll-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { PayrollRunFormModal } from "./payroll-run-form-modal";

interface PayrollRunsTableProps {
  payrollRuns: PayrollRunDto[];
  onRefresh: () => void;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
    case "processing":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function PayrollRunsTable({ payrollRuns, onRefresh }: PayrollRunsTableProps) {
  const { removeRun, updateRun, processRun, markRunPaid } = usePayrollMutations();
  const [editingRun, setEditingRun] = React.useState<PayrollRunDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this payroll run?")) {
      return;
    }

    try {
      await removeRun.mutateAsync(id);
      showToast.success("Deleted", "Payroll run removed successfully");
      onRefresh();
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    }
  };

  const handleEditSubmit = async (payload: CreatePayrollRunCommand) => {
    if (!editingRun) return;

    setIsSubmitting(true);
    try {
      await updateRun.mutateAsync({ id: editingRun.id, payload });
      showToast.success("Updated", "Payroll run updated successfully");
      setEditingRun(null);
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcess = async (id: string) => {
    try {
      await processRun.mutateAsync(id);
      showToast.success("Processed", "Payroll run marked as completed");
      onRefresh();
    } catch (error) {
      showToast.error("Process failed", getErrorMessage(error));
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markRunPaid.mutateAsync(id);
      showToast.success("Paid", "Payroll run marked as paid");
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    }
  };

  const columns: ColumnDef<PayrollRunDto>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Run" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">Run date: {row.original.runDate || "Not set"}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Status",
        filterType: "select",
        filterOptions: [
          { label: "Draft", value: "Draft" },
          { label: "Processing", value: "Processing" },
          { label: "Completed", value: "Completed" },
          { label: "Paid", value: "Paid" },
        ],
      } as never,
    },
    {
      accessorKey: "employeeCount",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Employees" />,
    },
    {
      accessorKey: "grossPay",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Gross" />,
      cell: ({ row }) => formatMoney(row.original.grossPay, row.original.currency),
    },
    {
      accessorKey: "totalDeductions",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Deductions" />,
      cell: ({ row }) => formatMoney(row.original.totalDeductions, row.original.currency),
    },
    {
      accessorKey: "netPay",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Net" />,
      cell: ({ row }) => <span className="font-semibold">{formatMoney(row.original.netPay, row.original.currency)}</span>,
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
              checked={editingRun?.id === row.original.id}
              onClick={() => setEditingRun(row.original)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={false}
              onClick={() => handleProcess(row.original.id)}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Process Run
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={false}
              onClick={() => handleMarkPaid(row.original.id)}
              className="flex items-center gap-2"
            >
              <ReceiptText className="h-4 w-4" />
              Mark Paid
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={false}
              onClick={() => handleDelete(row.original.id)}
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
        data={payrollRuns}
        pageSize={8}
        searchPlaceholder="Search payroll runs..."
        searchPredicate={(row, normalizedSearch) =>
          row.name.toLowerCase().includes(normalizedSearch) ||
          row.status.toLowerCase().includes(normalizedSearch) ||
          row.currency.toLowerCase().includes(normalizedSearch)
        }
      />

      <PayrollRunFormModal
        open={Boolean(editingRun)}
        onOpenChange={(open) => {
          if (!open) setEditingRun(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        initialData={editingRun ?? undefined}
      />
    </>
  );
}
