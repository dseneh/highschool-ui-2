// Inline table filters component - displays filters horizontally on larger screens
"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { AdvancedTableFilter } from "./advanced-table-filter"

interface TableFiltersInlineProps<TData> {
  table: Table<TData>
  disabled?: boolean
}

export function TableFiltersInline<TData>({ table, disabled = false }: TableFiltersInlineProps<TData>) {
  const columns = table.getAllColumns()
  
  // Get filterable columns (those with filterType in meta)
  const filterableColumns = React.useMemo(() => {
    return columns.filter(column => {
      const meta = column.columnDef.meta as any
      if (!meta?.filterType) return false
      if (meta.filterType === "number") return Boolean(meta?.filterConditions?.length)
      return Boolean(meta?.filterOptions?.length)
    })
  }, [columns])

  // Check if any filters are active
  const isFiltered = React.useMemo(() => {
    return table.getState().columnFilters.length > 0
  }, [table])

  if (filterableColumns.length === 0) {
    return null
  }

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-2">
        {filterableColumns.map(column => {
          const meta = column.columnDef.meta as any
          const columnId = column.id
          const title = meta?.displayName || columnId
          
          return (
            <AdvancedTableFilter
              key={columnId}
              column={column}
              title={title}
              filterType={meta?.filterType}
              options={meta?.filterOptions}
              conditions={meta?.filterConditions}
              formatter={meta?.formatter}
              summaryMode={meta?.filterSummaryMode}
              disabled={disabled}
            />
          )
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="border border-border px-2 font-semibold text-primary sm:border-none sm:py-1 shrink-0"
            disabled={disabled}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
