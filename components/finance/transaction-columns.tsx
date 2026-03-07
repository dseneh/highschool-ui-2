"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TransactionDto } from "@/lib/api2/finance-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { getStatusBadgeClass } from "@/lib/status-colors";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  MoreHorizontalIcon,
  ViewIcon,
  Edit02Icon,
  Tick01Icon,
  Delete02Icon,
  ArrowTurnBackwardIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function getTransactionColumns({
  currency = "USD",
  onViewDetail,
  onEdit,
  onApprove,
  onCancel,
  onDelete,
  enableSelection = false,
}: {
  currency?: string;
  onViewDetail?: (tx: TransactionDto) => void;
  onEdit?: (tx: TransactionDto) => void;
  onApprove?: (tx: TransactionDto) => void;
  onCancel?: (tx: TransactionDto) => void;
  onDelete?: (tx: TransactionDto) => void;
  enableSelection?: boolean;
}): ColumnDef<TransactionDto>[] {
  const columns: ColumnDef<TransactionDto>[] = [];

  // Checkbox column (conditional)
  if (enableSelection) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <div className="px-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    });
  }

  columns.push(
    {
      accessorKey: "transaction_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trans ID" />
      ),
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <button
            type="button"
            className="font-mono uppercase text-xs text-primary hover:underline truncate max-w-30 block"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail?.(tx);
            }}
          >
            {tx.transaction_id}
          </button>
        );
      },
      size: 130,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <div className="min-w-0 max-w-50">
            <p className="truncate text-sm font-medium">
              {tx.transaction_type?.name ?? "—"}
            </p>
            {tx.description && (
              <p className="truncate text-xs text-muted-foreground">
                {tx.description}
              </p>
            )}
          </div>
        );
      },
      size: 220,
    },
    {
      accessorKey: "student",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student" />
      ),
      cell: ({ row }) => {
        const student = row.original.student;
        if (!student) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="min-w-0 max-w-40">
            <p className="truncate text-sm">{student.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {student.id_number}
            </p>
          </div>
        );
      },
      size: 170,
    },
    {
      accessorKey: "account",
      header: "Account",
      cell: ({ row }) => {
        const acct = row.original.account;
        if (!acct) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm truncate max-w-30 block">
            {acct.name}
          </span>
        );
      },
      size: 130,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const dateStr = row.original.date;
        if (!dateStr) return "—";
        try {
          return (
            <span className="text-sm whitespace-nowrap">
              {format(new Date(dateStr), "MMM d, yyyy")}
            </span>
          );
        } catch {
          return dateStr;
        }
      },
      size: 120,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Amount"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const tx = row.original;
        const isExpense = tx.transaction_type?.type === "expense";
        const isCanceled = tx.status === "canceled";
        return (
          <span
            className={cn(
              "text-sm font-medium tabular-nums text-right block",
              isExpense && "text-red-600 dark:text-red-400",
              !isExpense && "text-green-600 dark:text-green-400",
              isCanceled && "line-through opacity-60"
            )}
          >
            {isExpense ? "-" : "+"}
            {formatCurrency(Math.abs(tx.amount), currency)}
          </span>
        );
      },
      size: 130,
    },
    {
      accessorKey: "payment_method",
      header: "Paid With",
      cell: ({ row }) => {
        const method = row.original.payment_method;
        if (!method)
          return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <Badge variant="secondary" className="text-xs font-normal">
            {method.name}
          </Badge>
        );
      },
      size: 110,
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => {
        const ref = row.original.reference;
        if (!ref) return <span className="text-muted-foreground">—</span>;
        return (
          <span
            className="text-xs text-muted-foreground truncate max-w-25 block"
            title={ref}
          >
            {ref}
          </span>
        );
      },
      size: 110,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={cn("text-xs capitalize", getStatusBadgeClass(status))}>
            {status}
          </Badge>
        );
      },
      size: 100,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const tx = row.original;
        const isApproved = tx.status === "approved";
        const isPending = tx.status === "pending";
        const isCanceled = tx.status === "canceled";
        const isTransfer = ["TRANSFER_IN", "TRANSFER_OUT"].includes(
          tx.transaction_type?.type_code ?? ""
        );

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7"
                  icon={<HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />}
                  aria-label="Open actions menu"
                  onClick={(e) => e.stopPropagation()}
                />
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail?.(tx);
                }}
              >
                <HugeiconsIcon icon={ViewIcon} className="size-4" />
                View Details
              </DropdownMenuItem>

              {!isApproved && !isCanceled && onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(tx);
                  }}
                >
                  <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                  Edit Transaction
                </DropdownMenuItem>
              )}

              {isPending && onApprove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(tx);
                    }}
                    className="text-green-600 focus:text-green-600"
                  >
                    <HugeiconsIcon icon={Tick01Icon} className="size-4" />
                    Approve Transaction
                  </DropdownMenuItem>
                </>
              )}

              {isApproved && !isTransfer && onCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(tx);
                    }}
                    className="text-orange-600 focus:text-orange-600"
                  >
                    <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="size-4" />
                    Reverse Transaction
                  </DropdownMenuItem>
                </>
              )}

              {!isApproved && !isTransfer && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(tx);
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                    Delete Transaction
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 50,
    });

  return columns;
}
