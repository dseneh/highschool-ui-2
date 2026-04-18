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
import type { EmployeeDto } from "@/lib/api2/employee-types";
import type {
  CreateEmployeeCompensationCommand,
  EmployeeCompensationDto,
  PayrollComponentDto,
} from "@/lib/api2/payroll-types";
import { usePayrollMutations } from "@/hooks/use-payroll";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { CompensationFormModal } from "./compensation-form-modal";

interface CompensationTableProps {
  compensations: EmployeeCompensationDto[];
  employees: EmployeeDto[];
  components: PayrollComponentDto[];
  onRefresh: () => void;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function CompensationTable({
  compensations,
  employees,
  components,
  onRefresh,
}: CompensationTableProps) {
  const { removeCompensation, updateCompensation } = usePayrollMutations();
  const [editingCompensation, setEditingCompensation] = React.useState<EmployeeCompensationDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this compensation package?")) {
      return;
    }

    try {
      await removeCompensation.mutateAsync(id);
      showToast.success("Deleted", "Compensation package removed successfully");
      onRefresh();
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    }
  };

  const handleEditSubmit = async (payload: CreateEmployeeCompensationCommand) => {
    if (!editingCompensation) return;

    setIsSubmitting(true);
    try {
      await updateCompensation.mutateAsync({ id: editingCompensation.id, payload });
      showToast.success("Updated", "Compensation package updated successfully");
      setEditingCompensation(null);
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<EmployeeCompensationDto>[] = [
    {
      accessorKey: "employeeName",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Employee" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          <p className="text-sm text-muted-foreground">{row.original.employeeNumber || "No employee number"}</p>
        </div>
      ),
    },
    {
      accessorKey: "baseSalary",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Base" />,
      cell: ({ row }) => formatMoney(row.original.baseSalary, row.original.currency),
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
      accessorKey: "paymentFrequency",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Frequency" />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Frequency",
        filterType: "select",
        filterOptions: [
          { label: "Monthly", value: "Monthly" },
          { label: "Bi-Weekly", value: "Bi-Weekly" },
          { label: "Weekly", value: "Weekly" },
          { label: "Annually", value: "Annually" },
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
              checked={editingCompensation?.id === row.original.id}
              onClick={() => setEditingCompensation(row.original)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
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
        data={compensations}
        pageSize={8}
        searchPlaceholder="Search compensation packages..."
        searchPredicate={(row, normalizedSearch) =>
          row.employeeName.toLowerCase().includes(normalizedSearch) ||
          (row.employeeNumber || "").toLowerCase().includes(normalizedSearch) ||
          row.paymentFrequency.toLowerCase().includes(normalizedSearch)
        }
      />

      <CompensationFormModal
        open={Boolean(editingCompensation)}
        onOpenChange={(open) => {
          if (!open) setEditingCompensation(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        employees={employees}
        components={components}
        initialData={editingCompensation ?? undefined}
      />
    </>
  );
}
