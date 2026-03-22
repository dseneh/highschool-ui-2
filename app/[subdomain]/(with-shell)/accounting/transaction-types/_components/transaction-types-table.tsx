"use client";

import { PlusSignIcon, PencilEdit01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import type { AccountingTransactionTypeDto, TransactionCategory } from "@/lib/api2/accounting-types";
import { Pencil, Trash } from "lucide-react";

const CATEGORY_OPTIONS: { value: TransactionCategory; label: string }[] = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
];

interface TransactionTypesTableProps {
  txTypes: AccountingTransactionTypeDto[];
  isLoading: boolean;
  onEdit: (row: AccountingTransactionTypeDto) => void;
  onDelete: (row: AccountingTransactionTypeDto) => void;
}

function buildColumns(
  onEdit: (row: AccountingTransactionTypeDto) => void,
  onDelete: (row: AccountingTransactionTypeDto) => void
): ColumnDef<AccountingTransactionTypeDto>[] {
  return [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-primary">{row.original.code}</span>,
    },
    { accessorKey: "name", 
      header: "Name" ,
      cell: ({ row }) => <div className="flex flex-col">
        <span className="font-semibold">{row.original.name}</span>
      <span className="text-xs text-muted-foreground">{row.original.description ?? "-"}</span>
      </div>,
    },
    // {
    //   accessorKey: "description",
    //   header: "Description",
    //   cell: ({ row }) => (
    //     <span className="text-xs text-muted-foreground">{row.original.description ?? "-"}</span>
    //   ),
    // },
    {
      accessorKey: "transaction_category",
      header: "Category",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
      meta: {
        displayName: "Category",
        filterType: "radio",
        filterOptions: CATEGORY_OPTIONS,
      } as any,
      cell: ({ row }) => <StatusBadge status={row.original.transaction_category} showIcon={false} />, 
    },
    {
      accessorKey: "default_ledger_account",
      header: "Default Account",
      cell: ({ row }) => (
        <span className="">
          {row.original.default_ledger_account_name ?? row.original.default_ledger_account ?? "-"}
        </span>
      ),
    },
    {
      id: "posting_ready",
      header: "Posting Ready",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.default_ledger_account ? "active" : "inactive"}
          label={row.original.default_ledger_account ? "Yes" : "Missing Account"}
        />
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)) === value;
      },
      meta: {
        displayName: "Status",
        filterType: "radio",
        filterOptions: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      } as any,
      cell: ({ row }) => <StatusBadge status={row.original.is_active ? "active" : "inactive"} />, 
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
         <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            tooltip="Edit"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => onEdit(row.original)}
          />
          <Button
            variant="outline"
            size="icon-sm"
            tooltip="Delete"
            icon={<Trash className="h-4 w-4 text-destructive" />}
            onClick={() => onDelete(row.original)}
          />
        </div>
      ),
    },
  ];
}

export function TransactionTypesTable({ txTypes, isLoading, onEdit, onDelete }: TransactionTypesTableProps) {
  const columns = buildColumns(onEdit, onDelete);
  const statsItems = [
    {
      title: "Total Types",
      value: String(txTypes.length),
      subtitle: "Configured transaction types",
      icon: PlusSignIcon,
    },
    {
      title: "Active",
      value: String(txTypes.filter((type) => type.is_active).length),
      subtitle: "Ready for transactions",
      icon: PencilEdit01Icon,
    },
    {
      title: "Income Types",
      value: String(txTypes.filter((type) => type.transaction_category === "income").length),
      subtitle: "Inbound transaction mapping",
      icon: PlusSignIcon,
    },
    {
      title: "Expense Types",
      value: String(txTypes.filter((type) => type.transaction_category === "expense").length),
      subtitle: "Outbound transaction mapping",
      icon: Delete01Icon,
    },
  ];

  return (
    <AccountingAdvancedTable
      columns={columns}
      data={txTypes}
      loading={isLoading}
      stats={statsItems}
      searchPlaceholder="Search transaction types..."
      searchPredicate={(type, search) =>
        type.name.toLowerCase().includes(search) ||
        type.code.toLowerCase().includes(search) ||
        (type.description ?? "").toLowerCase().includes(search)
      }
    />
  );
}
