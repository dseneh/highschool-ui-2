"use client";

import { PlusSignIcon, MoneyBagIcon, BookOpen01Icon, Invoice01Icon } from "@hugeicons/core-free-icons";
import { PencilEdit01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/ui/status-badge";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import type { AccountingJournalEntryDto, JournalEntryStatus } from "@/lib/api2/accounting-types";
import { Ellipsis } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface JournalEntriesTableProps {
  entries: AccountingJournalEntryDto[];
  isLoading: boolean;
  onRowClick?: (entry: AccountingJournalEntryDto) => void;
  onEdit?: (entry: AccountingJournalEntryDto) => void;
  onDelete?: (entry: AccountingJournalEntryDto) => void;
  onStatusChange?: (entry: AccountingJournalEntryDto, status: JournalEntryStatus) => void;
}

function buildColumns(
  onEdit?: (entry: AccountingJournalEntryDto) => void,
  onDelete?: (entry: AccountingJournalEntryDto) => void,
  onStatusChange?: (entry: AccountingJournalEntryDto, status: JournalEntryStatus) => void
): ColumnDef<AccountingJournalEntryDto>[] {
  return [
    {
      accessorKey: "posting_date",
      header: "Date",
      cell: ({ row }) => (row.original.posting_date ? format(new Date(row.original.posting_date), "dd MMM yyyy") : "—"),
    },
    {
      accessorKey: "reference_number",
      header: "Reference",
      cell: ({ row }) => <span className="font-mono uppercase text-primary">{row.original.reference_number ?? "—"}</span>,
    },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "total_debit",
      header: "Debit",
      cell: ({ row }) => <span className="font-semibold">{formatCurrency(Number(row.original.total_debit))}</span>,
    },
    {
      accessorKey: "total_credit",
      header: "Credit",
      cell: ({ row }) => <span className="font-semibold">{formatCurrency(Number(row.original.total_credit))}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
      meta: {
        displayName: "Status",
        filterType: "select",
        filterOptions: [
          { label: "Draft", value: "draft" },
          { label: "Posted", value: "posted" },
          { label: "Reversed", value: "reversed" },
        ],
      } as any,
      cell: ({ row }) => <StatusBadge status={row.original.status} className="capitalize" />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const entry = row.original;
        const isDraft = entry.status === "draft";
        const canPost = isDraft;
        const canEdit = isDraft;
        const canDelete = isDraft;

        return (
          <div onClick={(event) => event.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" className="h-8 w-8" aria-label="Entry actions">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                {canPost ? (
                  <DropdownMenuItem className="gap-2" onClick={() => onStatusChange?.(entry, "posted")}>
                    Mark as Posted
                  </DropdownMenuItem>
                ) : null}

                {canPost ? <DropdownMenuSeparator /> : null}

                <DropdownMenuItem className="gap-2" disabled={!canEdit} onClick={() => canEdit && onEdit?.(entry)}>
                  <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  disabled={!canDelete}
                  onClick={() => canDelete && onDelete?.(entry)}
                >
                  <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

export function JournalEntriesTable({ entries, isLoading, onRowClick, onEdit, onDelete, onStatusChange }: JournalEntriesTableProps) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const columns = buildColumns(onEdit, onDelete, onStatusChange);
  const statsItems = [
    {
      title: "Journal Entries",
      value: String(safeEntries.length),
      subtitle: "All recorded entries",
      icon: PlusSignIcon,
    },
    {
      title: "Posted",
      value: String(safeEntries.filter((entry) => entry.status === "posted").length),
      subtitle: "Finalized entries",
      icon: MoneyBagIcon,
    },
    {
      title: "Draft",
      value: String(safeEntries.filter((entry) => entry.status === "draft").length),
      subtitle: "Pending review",
      icon: BookOpen01Icon,
    },
    {
      title: "Total Debit",
      value: Number(safeEntries.reduce((sum, entry) => sum + Number(entry.total_debit ?? 0), 0)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      subtitle: "Aggregate debit amount",
      icon: Invoice01Icon,
    },
  ];

  return (
    <AccountingAdvancedTable
      columns={columns}
      data={safeEntries}
      loading={isLoading}
      onRowClick={onRowClick}
      stats={statsItems}
      searchPlaceholder="Search journal entries..."
      searchPredicate={(entry, search) =>
        entry.description.toLowerCase().includes(search) ||
        (entry.reference_number ?? "").toLowerCase().includes(search) ||
        entry.status.toLowerCase().includes(search)
      }
    />
  );
}
