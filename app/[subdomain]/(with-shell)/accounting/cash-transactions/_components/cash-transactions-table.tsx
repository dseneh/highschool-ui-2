"use client";

import * as React from "react";
import {
  PlusSignIcon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  Delete01Icon,
  MoreHorizontalIcon,
  ViewIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ColumnDef, Table } from "@tanstack/react-table";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import StatusBadge from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatsCards } from "@/components/shared/stats-cards";
import {
  AdvancedTable,
  DEFAULT_NUMBER_FILTER_CONDITIONS,
  Searchbar,
  TableFilters,
  TableFiltersInline,
  ViewOptions,
  getPrimaryConditionValue,
} from "@/components/shared/advanced-table";
import type {
  ConditionFilter,
  DateRangeFilter,
} from "@/components/shared/advanced-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { useCashTransactionFilterParams } from "@/components/accounting/cash-transaction-filters";
import type {
  AccountingCashTransactionDto,
  AccountingTransactionTypeDto,
  AccountingBankAccountDto,
  CashTransactionStatus,
} from "@/lib/api2/accounting-types";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_OPTIONS: { value: CashTransactionStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

interface CashTransactionsTableProps {
  transactions: AccountingCashTransactionDto[];
  txTypes: AccountingTransactionTypeDto[];
  bankAccounts: AccountingBankAccountDto[];
  filterState: ReturnType<typeof useCashTransactionFilterParams>;
  totalCount: number;
  isLoading: boolean;
  onRowClick?: (row: AccountingCashTransactionDto) => void;
  onApprove: (row: AccountingCashTransactionDto) => void;
  onReject: (row: AccountingCashTransactionDto) => void;
  onPost: (row: AccountingCashTransactionDto) => void;
  onEdit: (row: AccountingCashTransactionDto) => void;
  onDelete: (row: AccountingCashTransactionDto) => void;
}

function getRefId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    return String((value as { id?: string }).id ?? "");
  }
  return "";
}

function getRefName(
  value: unknown,
  fallbackById: Map<string, string>,
  key: "name" | "account_name" = "name"
): string {
  if (value && typeof value === "object" && key in value) {
    return String((value as Record<string, string>)[key] ?? "-");
  }
  const id = getRefId(value);
  return fallbackById.get(id) ?? "-";
}

function getTransactionTypeCode(value: unknown): string {
  if (value && typeof value === "object" && "code" in value) {
    return String((value as { code?: string }).code ?? "").toUpperCase();
  }
  return "";
}

function getSignedAmount(transaction: AccountingCashTransactionDto): number {
  const amount = Number(transaction.amount ?? 0);
  const txCode = getTransactionTypeCode(transaction.transaction_type);

  if (txCode === "TRANSFER_OUT") {
    return -Math.abs(amount);
  }

  if (txCode === "TRANSFER_IN") {
    return Math.abs(amount);
  }

  return amount;
}

function buildColumns(
  txTypeOptions: Array<{ value: string; label: string }>,
  txTypeNameById: Map<string, string>,
  bankAccountOptions: Array<{ value: string; label: string }>,
  bankAccountNameById: Map<string, string>,
  onViewDetail: ((row: AccountingCashTransactionDto) => void) | undefined,
  onApprove: (row: AccountingCashTransactionDto) => void,
  onReject: (row: AccountingCashTransactionDto) => void,
  onPost: (row: AccountingCashTransactionDto) => void,
  onEdit: (row: AccountingCashTransactionDto) => void,
  onDelete: (row: AccountingCashTransactionDto) => void
): ColumnDef<AccountingCashTransactionDto>[] {
  return [
    {
      accessorKey: "reference_number",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
      cell: ({ row }) => (
        <button
          type="button"
          className="font-mono uppercase text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail?.(row.original);
          }}
        >
          {row.original.reference_number ?? "-"}
        </button>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "transaction_date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      meta: {
        displayName: "Date",
        filterType: "daterange",
      } as any,
      cell: ({ row }) =>
        row.original.transaction_date ? format(new Date(row.original.transaction_date), "dd MMM yyyy") : "—",
      enableSorting: true,
    },
    {
      accessorKey: "description",
      // meta: {
      //   displayName: "Amount",
      //   filterType: "number",
      //   filterConditions: DEFAULT_NUMBER_FILTER_CONDITIONS,
      // } as any,
      // filterFn: (row, id, value) => {
      //   const filter = value as ConditionFilter | undefined;
      //   if (!filter?.condition) return true;

      //   const amountValue = Number(row.getValue(id));
      //   if (Number.isNaN(amountValue)) return true;

      //   const min = Number(filter.value?.[0]);
      //   const max = Number(filter.value?.[1]);

      //   if (filter.condition === "is-equal-to") {
      //     return !Number.isNaN(min) ? amountValue === min : true;
      //   }
      //   if (filter.condition === "is-greater-than") {
      //     return !Number.isNaN(min) ? amountValue > min : true;
      //   }
      //   if (filter.condition === "is-greater-than-or-equal") {
      //     return !Number.isNaN(min) ? amountValue >= min : true;
      //   }
      //   if (filter.condition === "is-less-than") {
      //     return !Number.isNaN(min) ? amountValue < min : true;
      //   }
      //   if (filter.condition === "is-less-than-or-equal") {
      //     return !Number.isNaN(min) ? amountValue <= min : true;
      //   }
      //   if (filter.condition === "is-between") {
      //     if (!Number.isNaN(min) && !Number.isNaN(max)) return amountValue >= min && amountValue <= max;
      //     if (!Number.isNaN(min)) return amountValue >= min;
      //     if (!Number.isNaN(max)) return amountValue <= max;
      //   }
      //   return true;
      // },
      header: () => <div>Description</div>,
      cell: ({ row }) => <div className="max-w-sm truncate">{row.original.description ?? "-"}</div>,
    },
    {
      id: "transaction_type_id",
      accessorFn: (row) => getRefId(row.transaction_type),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
      meta: {
        displayName: "Type",
        filterType: "select",
        filterOptions: txTypeOptions,
      } as any,
      cell: ({ row }) => <span className="">{getRefName(row.original.transaction_type, txTypeNameById)}</span>,
      enableSorting: true,
    },
    {
      id: "bank_account_id",
      accessorFn: (row) => getRefId(row.bank_account),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bank Account" />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
      meta: {
        displayName: "Bank Account",
        filterType: "select",
        filterOptions: bankAccountOptions,
      } as any,
      cell: ({ row }) => <span className="">{getRefName(row.original.bank_account, bankAccountNameById, "account_name")}</span>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" className="justify-end" />,
      cell: ({ row }) => {
        const signedAmount = getSignedAmount(row.original);
        return (
          <span className={cn(
            " text-sm font-semibold text-right block",
            signedAmount < 0 && "text-red-600",
            row.original.status === "rejected" && "line-through font-normal"
          )}>
            {formatCurrency(signedAmount, row.original.currency?.symbol )}
          </span>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
      meta: {
        displayName: "Status",
        filterType: "select",
        filterOptions: STATUS_OPTIONS,
      } as any,
      cell: ({ row }) => <StatusBadge status={row.original.status} className="capitalize" />,
      enableSorting: true,
    },
    {
      id: "posted",
      accessorFn: (row) => Boolean(row.journal_entry),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Posted" className="justify-center" />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)) === value;
      },
      meta: {
        displayName: "Posted",
        filterType: "select",
        filterOptions: [
          { value: "true", label: "Posted" },
          { value: "false", label: "Not Posted" },
        ],
      } as any,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox checked={Boolean(row.original.journal_entry)} disabled aria-label="Posted to journal" />
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const tx = row.original;
        const isApproved = tx.status === "approved";
        const isPending = tx.status === "pending";
        const isAlreadyPosted = Boolean(tx.journal_entry);
        const canPost = isApproved && !isAlreadyPosted;
        const canEdit = !isAlreadyPosted && tx.status !== "approved";

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

              <DropdownMenuItem
                disabled={!canEdit}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canEdit) onEdit(tx);
                }}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
                Edit Transaction
              </DropdownMenuItem>

              {(isPending || canPost) ? <DropdownMenuSeparator /> : null}

              {isPending ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(tx);
                  }}
                  className="text-green-600 focus:text-green-600"
                >
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
                  Approve Transaction
                </DropdownMenuItem>
              ) : null}

              {isPending ? (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(tx);
                  }}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                  Reject Transaction
                </DropdownMenuItem>
              ) : null}

              {canPost ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onPost(tx);
                  }}
                  className="text-blue-600 focus:text-blue-600"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                  Post to Journal
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(tx);
                }}
              >
                <HugeiconsIcon icon={Delete01Icon} className="size-4" />
                Delete Transaction
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 50,
    },
  ];
}

export function CashTransactionsTable({
  transactions,
  txTypes,
  bankAccounts,
  filterState,
  totalCount,
  isLoading,
  onRowClick,
  onApprove,
  onReject,
  onPost,
  onEdit,
  onDelete,
}: CashTransactionsTableProps) {
  const rows = Array.isArray(transactions) ? transactions : [];
  const txTypeOptions = React.useMemo(
    () => txTypes.map((type) => ({ value: type.id, label: type.name })),
    [txTypes]
  );
  const txTypeNameById = React.useMemo(
    () => new Map(txTypes.map((type) => [type.id, type.name])),
    [txTypes]
  );
  const bankAccountOptions = React.useMemo(
    () =>
      bankAccounts.map((account) => ({
        value: account.id,
        label: account.account_number || account.account_name,
      })),
    [bankAccounts]
  );
  const bankAccountNameById = React.useMemo(
    () => new Map(bankAccounts.map((account) => [account.id, account.account_name])),
    [bankAccounts]
  );

  const columns = React.useMemo(
    () =>
      buildColumns(
        txTypeOptions,
        txTypeNameById,
        bankAccountOptions,
        bankAccountNameById,
        onRowClick,
        onApprove,
        onReject,
        onPost,
        onEdit,
        onDelete
      ),
    [
      txTypeOptions,
      txTypeNameById,
      bankAccountOptions,
      bankAccountNameById,
      onRowClick,
      onApprove,
      onReject,
      onPost,
      onEdit,
      onDelete,
    ]
  );

  const [tableInstance, setTableInstance] = React.useState<Table<AccountingCashTransactionDto> | null>(null);
  const isApplyingUrlFilters = React.useRef(false);
  const previousColumnFilters = React.useRef("");
  const previousSorting = React.useRef("");

  const [searchInputValue, setSearchInputValue] = React.useState(filterState.search);
  const isSearchDirty = searchInputValue.trim() !== filterState.search.trim();

  React.useEffect(() => {
    setSearchInputValue(filterState.search);
  }, [filterState.search]);

  React.useEffect(() => {
    if (!tableInstance) return;
    isApplyingUrlFilters.current = true;

    tableInstance.getColumn("status")?.setFilterValue(filterState.status || undefined);
    tableInstance.getColumn("transaction_type_id")?.setFilterValue(filterState.transactionType || undefined);
    tableInstance.getColumn("bank_account_id")?.setFilterValue(filterState.bankAccount || undefined);

    const dateColumn = tableInstance.getColumn("transaction_date");
    if (dateColumn) {
      const hasDateFilter = Boolean(filterState.dateFrom || filterState.dateTo);
      dateColumn.setFilterValue(
        hasDateFilter
          ? {
              value: [filterState.dateFrom || "", filterState.dateTo || ""],
            }
          : undefined
      );
    }

    const amountColumn = tableInstance.getColumn("amount");
    if (amountColumn) {
      const hasAmountFilter = Boolean(
        filterState.amountCondition || filterState.amountMin || filterState.amountMax
      );

      if (!hasAmountFilter) {
        amountColumn.setFilterValue(undefined);
      } else {
        const isRangeCondition = filterState.amountCondition === "is-between";
        const primaryAmount =
          getPrimaryConditionValue({
            condition: filterState.amountCondition || "",
            value: [filterState.amountMin || "", filterState.amountMax || ""],
          }) || "";

        const amountFilter: ConditionFilter = {
          condition: filterState.amountCondition || "is-between",
          value: isRangeCondition
            ? [filterState.amountMin || "", filterState.amountMax || ""]
            : [primaryAmount, ""],
        };
        amountColumn.setFilterValue(amountFilter);
      }
    }

    setTimeout(() => {
      previousColumnFilters.current = JSON.stringify(tableInstance.getState().columnFilters);
      isApplyingUrlFilters.current = false;
    }, 0);
  }, [
    tableInstance,
    filterState.status,
    filterState.transactionType,
    filterState.bankAccount,
    filterState.dateFrom,
    filterState.dateTo,
    filterState.amountCondition,
    filterState.amountMin,
    filterState.amountMax,
  ]);

  React.useEffect(() => {
    if (!tableInstance) return;

    const nextSort = filterState.sortBy || "-transaction_date";
    const currentSort = tableInstance.getState().sorting[0];
    const currentSortKey = currentSort
      ? `${currentSort.desc ? "-" : ""}${currentSort.id}`
      : "-transaction_date";

    if (currentSortKey === nextSort) return;

    const isDesc = nextSort.startsWith("-");
    const columnId = isDesc ? nextSort.slice(1) : nextSort;
    tableInstance.setSorting(columnId ? [{ id: columnId, desc: isDesc }] : []);
  }, [tableInstance, filterState.sortBy]);

  React.useEffect(() => {
    if (!tableInstance) return;

    const handleStateChange = () => {
      if (isApplyingUrlFilters.current) return;

      const columnFilters = tableInstance.getState().columnFilters;
      const currentFiltersString = JSON.stringify(columnFilters);
      if (currentFiltersString !== previousColumnFilters.current) {
        previousColumnFilters.current = currentFiltersString;

        let nextStatus = "";
        let nextType = "";
        let nextBankAccount = "";
        let nextDateFrom = "";
        let nextDateTo = "";
        let nextAmountCondition = "";
        let nextAmountMin = "";
        let nextAmountMax = "";

        columnFilters.forEach((filter) => {
          if (filter.id === "status") nextStatus = String(filter.value || "");
          if (filter.id === "transaction_type_id") nextType = String(filter.value || "");
          if (filter.id === "bank_account_id") nextBankAccount = String(filter.value || "");
          if (filter.id === "transaction_date") {
            const dateFilter = filter.value as DateRangeFilter | undefined;
            nextDateFrom = String(dateFilter?.value?.[0] || "");
            nextDateTo = String(dateFilter?.value?.[1] || "");
          }
          if (filter.id === "amount") {
            const amountFilter = filter.value as ConditionFilter | undefined;
            if (amountFilter?.condition) {
              nextAmountCondition = amountFilter.condition;
              nextAmountMin = String(amountFilter.value?.[0] || "");
              nextAmountMax = String(amountFilter.value?.[1] || "");
            }
          }
        });

        void filterState.setStatus(nextStatus || null);
        void filterState.setTransactionType(nextType || null);
        void filterState.setBankAccount(nextBankAccount || null);
        void filterState.setDateFrom(nextDateFrom || null);
        void filterState.setDateTo(nextDateTo || null);
        void filterState.setAmountCondition(nextAmountCondition || null);
        void filterState.setAmountMin(nextAmountMin || null);
        void filterState.setAmountMax(nextAmountMax || null);
        void filterState.setPage(1);
      }

      const sorting = tableInstance.getState().sorting;
      const firstSort = sorting[0];
      const nextSortBy = firstSort
        ? `${firstSort.desc ? "-" : ""}${firstSort.id}`
        : "-transaction_date";

      if (nextSortBy !== previousSorting.current) {
        previousSorting.current = nextSortBy;
        void filterState.setSortBy(nextSortBy);
        void filterState.setPage(1);
      }
    };

    handleStateChange();
    const interval = setInterval(handleStateChange, 150);
    return () => clearInterval(interval);
  }, [tableInstance, filterState]);

  const statsItems = [
    {
      title: "Transactions",
      value: String(totalCount || rows.length),
      subtitle: "Recorded cash movements",
      icon: PlusSignIcon,
    },
    {
      title: "Pending",
      value: String(rows.filter((transaction) => transaction.status === "pending").length),
      subtitle: "Awaiting approval",
      icon: CheckmarkCircle01Icon,
    },
    {
      title: "Approved",
      value: String(rows.filter((transaction) => transaction.status === "approved").length),
      subtitle: "Ready to post",
      icon: ArrowRight01Icon,
    },
    {
      title: "Total Amount",
      value: Number(rows.reduce((sum, transaction) => sum + getSignedAmount(transaction), 0)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      subtitle: "Net transfer-aware total",
      icon: Cancel01Icon,
    },
  ];

  return (
    <div className="space-y-6">
      <StatsCards items={statsItems} />

      <AdvancedTable
        loading={isLoading}
        columns={columns}
        data={rows}
        pageSize={filterState.pageSize}
        totalCount={totalCount}
        currentPage={filterState.page}
        onPageChange={(nextPage) => {
          void filterState.setPage(nextPage);
        }}
        onPageSizeChange={(nextSize) => {
          void filterState.setPageSize(nextSize);
          void filterState.setPage(1);
        }}
        onRowClick={onRowClick}
        showPagination={true}
        showRowSelection={false}
        showBulkActions={false}
        onTableInstanceReady={setTableInstance}
        toolbar={(table) => (
          <div className="p-1 space-y-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-2 flex-1">
                <Searchbar
                  value={searchInputValue}
                  disabled={isLoading}
                  onChange={(event) => {
                    setSearchInputValue(event.target.value);
                  }}
                  onClear={() => {
                    setSearchInputValue("");
                    void filterState.setSearch(null);
                    void filterState.setPage(1);
                  }}
                  onSearch={() => {
                    void filterState.setSearch(searchInputValue || null);
                    void filterState.setPage(1);
                  }}
                  showDirtyIndicator={isSearchDirty}
                  placeholder="Search cash transactions..."
                  className="w-full min-w-62.5 max-w-sm"
                />
                <div className="md:hidden">
                  <TableFilters table={table} disabled={Boolean(isLoading)} />
                </div>
                <div className="hidden md:block">
                  <TableFiltersInline table={table} disabled={Boolean(isLoading)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ViewOptions table={table} />
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
