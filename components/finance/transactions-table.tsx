"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { TransactionDto } from "@/lib/api2/finance-types";
import {
  AdvancedTable,
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
import type { useTransactionFilterParams } from "./transaction-filters";

interface TransactionsTableProps {
  columns: ColumnDef<TransactionDto>[];
  data: TransactionDto[];
  loading?: boolean;
  filterState: ReturnType<typeof useTransactionFilterParams>;
  onRowClick?: (row: TransactionDto) => void;
  onSelectedRowsChange?: (rows: TransactionDto[]) => void;
  clearSelectionSignal?: number;
  totalCount?: number;
}

function parseCsv(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function TransactionsTable({
  columns,
  data,
  loading,
  filterState,
  onRowClick,
  onSelectedRowsChange,
  clearSelectionSignal,
  totalCount,
}: TransactionsTableProps) {
  const [tableInstance, setTableInstance] = React.useState<Table<TransactionDto> | null>(null);
  const isApplyingUrlFilters = React.useRef(false);
  const previousColumnFilters = React.useRef<string>("");
  const previousSelectionState = React.useRef<string>("");

  const [searchInputValue, setSearchInputValue] = React.useState(filterState.search);
  const isSearchDirty = searchInputValue.trim() !== filterState.search.trim();

  React.useEffect(() => {
    setSearchInputValue(filterState.search);
  }, [filterState.search]);

  React.useEffect(() => {
    if (!tableInstance) return;

    isApplyingUrlFilters.current = true;

    const applyArrayFilter = (columnId: string, csv: string) => {
      const column = tableInstance.getColumn(columnId);
      if (!column) return;
      const values = parseCsv(csv).filter((value) => value !== "all");
      column.setFilterValue(values.length > 0 ? values : undefined);
    };

    const applySelectFilter = (columnId: string, value: string) => {
      const column = tableInstance.getColumn(columnId);
      if (!column) return;
      column.setFilterValue(value && value !== "all" ? value : undefined);
    };

    applyArrayFilter("status", filterState.status || "");
    applyArrayFilter("transaction_type_id", filterState.transactionType || "");
    applySelectFilter("account_id", filterState.account || "all");
    applySelectFilter("academic_year_id", filterState.academicYear || "all");

    const dateColumn = tableInstance.getColumn("date");
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
    filterState.account,
    filterState.academicYear,
    filterState.dateFrom,
    filterState.dateTo,
    filterState.amountCondition,
    filterState.amountMin,
    filterState.amountMax,
  ]);

  React.useEffect(() => {
    if (!tableInstance) return;

    const handleStateChange = () => {
      if (isApplyingUrlFilters.current) return;

      const columnFilters = tableInstance.getState().columnFilters;
      const currentFiltersString = JSON.stringify(columnFilters);
      if (currentFiltersString === previousColumnFilters.current) return;
      previousColumnFilters.current = currentFiltersString;

      let nextStatus = "";
      let nextType = "";
      let nextAccount = "";
      let nextAcademicYear = "";
      let nextDateFrom = "";
      let nextDateTo = "";
      let nextAmountCondition = "";
      let nextAmountMin = "";
      let nextAmountMax = "";

      columnFilters.forEach((filter) => {
        if (filter.id === "status") {
          const selected = Array.isArray(filter.value)
            ? filter.value.map((value) => String(value)).filter((value) => Boolean(value) && value !== "all")
            : [];
          nextStatus = selected.join(",");
          return;
        }
        if (filter.id === "transaction_type_id") {
          const selected = Array.isArray(filter.value)
            ? filter.value.map((value) => String(value)).filter((value) => Boolean(value) && value !== "all")
            : [];
          nextType = selected.join(",");
          return;
        }
        if (filter.id === "account_id") {
          nextAccount = String(filter.value || "");
          return;
        }
        if (filter.id === "academic_year_id") {
          nextAcademicYear = String(filter.value || "");
          return;
        }
        if (filter.id === "date") {
          const dateFilter = filter.value as DateRangeFilter | undefined;
          nextDateFrom = String(dateFilter?.value?.[0] || "");
          nextDateTo = String(dateFilter?.value?.[1] || "");
          return;
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
      void filterState.setAccount(nextAccount || null);
      void filterState.setAcademicYear(nextAcademicYear || null);
      void filterState.setDateFrom(nextDateFrom || null);
      void filterState.setDateTo(nextDateTo || null);
      void filterState.setAmountCondition(nextAmountCondition || null);
      void filterState.setAmountMin(nextAmountMin || null);
      void filterState.setAmountMax(nextAmountMax || null);
      void filterState.setPage(1);
    };

    handleStateChange();
    const interval = setInterval(handleStateChange, 120);
    return () => clearInterval(interval);
  }, [tableInstance, filterState]);

  React.useEffect(() => {
    if (!tableInstance) return;

    const syncSelection = () => {
      const selectionState = JSON.stringify(tableInstance.getState().rowSelection);
      if (selectionState === previousSelectionState.current) return;
      previousSelectionState.current = selectionState;
      const selected = tableInstance.getFilteredSelectedRowModel().rows.map((row) => row.original);
      onSelectedRowsChange?.(selected);
    };

    syncSelection();
    const interval = setInterval(syncSelection, 120);
    return () => clearInterval(interval);
  }, [tableInstance, onSelectedRowsChange]);

  React.useEffect(() => {
    if (!tableInstance) return;
    tableInstance.toggleAllRowsSelected(false);
  }, [clearSelectionSignal, tableInstance]);

  return (
    <AdvancedTable
      loading={loading}
      columns={columns}
      data={data}
      pageSize={50}
      totalCount={totalCount ?? 0}
      currentPage={filterState.page}
      onPageChange={(nextPage) => {
        void filterState.setPage(nextPage);
      }}
      onPageSizeChange={() => {
        // Keep server page size fixed for transactions for now.
      }}
      onRowClick={onRowClick}
      showPagination={true}
      showRowSelection={true}
      showBulkActions={false}
      onTableInstanceReady={setTableInstance}
      toolbar={(table) => (
        <div className="p-1 space-y-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2 flex-1">
              <Searchbar
                value={searchInputValue}
                disabled={loading}
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
                placeholder="Search transactions..."
                className="w-full min-w-62.5 max-w-sm"
              />
              <div className="md:hidden">
                <TableFilters table={table} disabled={Boolean(loading)} />
              </div>
              <div className="hidden md:block">
                <TableFiltersInline table={table} disabled={Boolean(loading)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ViewOptions table={table} />
            </div>
          </div>
        </div>
      )}
    />
  );
}
