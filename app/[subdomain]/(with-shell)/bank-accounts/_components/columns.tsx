import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {formatCurrency, cn} from '@/lib/utils';
import {BankAccountDto} from '@/lib/api/finance-types';
import {ColumnDef} from '@tanstack/react-table';
import {DataTableColumnHeader} from '@/components/shared/data-table-column-header';
import {getStatusBadgeClass} from '@/lib/status-colors';
import {Edit02Icon, Delete02Icon, ViewIcon} from '@hugeicons/core-free-icons';
import {HugeiconsIcon} from '@hugeicons/react';
export function getColumns({
  currency,
  onView,
  onEdit,
  onDelete,
}: {
  currency: string;
  onView: (a: BankAccountDto) => void;
  onEdit: (a: BankAccountDto) => void;
  onDelete: (a: BankAccountDto) => void;
}): ColumnDef<BankAccountDto>[] {
  return [
    {
      accessorKey: "number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account #" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.number || "—"}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Name" />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.original.name}</p>
          {row.original.description && (
            <p className="text-xs text-muted-foreground truncate max-w-50">
              {row.original.description}
            </p>
          )}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "currency",
      header: "Currency",
      cell: ({ row }) => {
        const curr = row.original.currency;
        if (!curr) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm">
            {curr.symbol} {curr.code}
          </span>
        );
      },
      size: 100,
    },
    {
      id: "basic_analysis.totals.total_income",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Income"
          className="flex justify-end"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-sm text-green-600 dark:text-green-400 text-right block">
          {formatCurrency(row.original.basic_analysis?.totals.total_income ?? 0, currency)}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "row.original.basic_analysis.totals.total_expense",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Expenses"
          className="flex justify-end"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-sm text-red-600 dark:text-red-400 text-right block">
          {formatCurrency(row.original.basic_analysis?.totals.total_expense ?? 0, currency)}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Balance"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-sm font-medium text-right block">
          {formatCurrency(row.original.balance, currency)}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={cn(
            "text-xs capitalize",
            getStatusBadgeClass(row.original.active ? "active" : "inactive")
          )}
        >
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      ),
      size: 90,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(row.original);
            }}
            tooltip="View"
            icon={<HugeiconsIcon icon={ViewIcon} size={14} />}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original);
            }}
            tooltip="Edit"
            icon={<HugeiconsIcon icon={Edit02Icon} size={14} />}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.original);
            }}
            tooltip="Delete"
            icon={<HugeiconsIcon icon={Delete02Icon} size={14} />}
          />
        </div>
      ),
      size: 110,
    },
  ];
}
