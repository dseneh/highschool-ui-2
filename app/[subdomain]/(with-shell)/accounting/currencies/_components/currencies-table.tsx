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
import type { AccountingCurrencyDto } from "@/lib/api2/accounting-types";
import {Pencil, Trash} from 'lucide-react';

interface CurrenciesTableProps {
  currencies: AccountingCurrencyDto[];
  isLoading: boolean;
  onEdit: (row: AccountingCurrencyDto) => void;
  onDelete: (row: AccountingCurrencyDto) => void;
}

function buildColumns(
  onEdit: (row: AccountingCurrencyDto) => void,
  onDelete: (row: AccountingCurrencyDto) => void
): ColumnDef<AccountingCurrencyDto>[] {
  return [
    { accessorKey: "code", header: "Code" },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "symbol",
      header: "Symbol",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.symbol}</span>,
    },
    { accessorKey: "decimal_places", header: "Decimals" },
    {
      accessorKey: "is_base_currency",
      header: "Base",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)) === value;
      },
      meta: {
        displayName: "Base Currency",
        filterType: "select",
        filterOptions: [
          { label: "Base", value: "true" },
          { label: "Non-base", value: "false" },
        ],
      } as any,
      cell: ({ row }) => (row.original.is_base_currency ? <StatusBadge status="active" label="Base" /> : null),
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
        filterType: "select",
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

export function CurrenciesTable({ currencies, isLoading, onEdit, onDelete }: CurrenciesTableProps) {
  const columns = buildColumns(onEdit, onDelete);
  const statsItems = [
    {
      title: "Total Currencies",
      value: String(currencies.length),
      subtitle: "Configured currencies",
      icon: PlusSignIcon,
    },
    {
      title: "Active",
      value: String(currencies.filter((currency) => currency.is_active).length),
      subtitle: "Available for postings",
      icon: PencilEdit01Icon,
    },
    {
      title: "Base Currency",
      value: currencies.find((currency) => currency.is_base_currency)?.code ?? "None",
      subtitle: "Primary reporting currency",
      icon: Delete01Icon,
    },
    {
      title: "Inactive",
      value: String(currencies.filter((currency) => !currency.is_active).length),
      subtitle: "Disabled currencies",
      icon: Delete01Icon,
    },
  ];

  return (
    <AccountingAdvancedTable
      columns={columns}
      data={currencies}
      loading={isLoading}
      stats={statsItems}
      searchPlaceholder="Search currencies..."
      searchPredicate={(currency, search) =>
        currency.name.toLowerCase().includes(search) ||
        currency.code.toLowerCase().includes(search) ||
        currency.symbol.toLowerCase().includes(search)
      }
    />
  );
}
