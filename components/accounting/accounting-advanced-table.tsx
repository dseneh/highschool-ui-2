"use client";

import { useMemo, useState } from "react";
import type { ColumnDef, Table } from "@tanstack/react-table";

import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import {
  AdvancedTable,
  Searchbar,
  TableFilters,
  TableFiltersInline,
  ViewOptions,
} from "@/components/shared/advanced-table";

interface AccountingAdvancedTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
  searchPredicate?: (row: TData, normalizedSearch: string) => boolean;
  stats?: StatsCardItem[];
  onRowClick?: (row: TData) => void;
}

export function AccountingAdvancedTable<TData>({
  columns,
  data,
  loading,
  pageSize = 20,
  searchPlaceholder = "Search...",
  searchPredicate,
  stats,
  onRowClick,
}: AccountingAdvancedTableProps<TData>) {
  const [searchValue, setSearchValue] = useState("");
  const [tableInstance, setTableInstance] = useState<Table<TData> | null>(null);

  const filteredData = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    if (!normalized) return data;

    if (searchPredicate) {
      return data.filter((row) => searchPredicate(row, normalized));
    }

    return data;
  }, [data, searchValue, searchPredicate]);

  return (
    <div className="space-y-6">
      <StatsCards items={stats ?? []} /> 

      <AdvancedTable
        loading={loading}
        columns={columns}
        data={filteredData}
        pageSize={pageSize}
        onRowClick={onRowClick}
        showRowSelection={false}
        showBulkActions={false}
        onTableInstanceReady={setTableInstance}
        toolbar={(table) => (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-65 flex-1 items-center gap-2">
              <Searchbar
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchPlaceholder}
                className="max-w-sm"
              />
              <div className="md:hidden">
                <TableFilters table={table} />
              </div>
              <div className="hidden md:block">
                <TableFiltersInline table={table} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {tableInstance ? <ViewOptions table={table} /> : null}
            </div>
          </div>
        )}
      />
    </div>
  );
}
