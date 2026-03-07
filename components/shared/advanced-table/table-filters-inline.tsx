// Inline table filters component - displays filters horizontally on larger screens
"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { AdvancedTableFilter } from "./advanced-table-filter"

interface TableFiltersInlineProps<TData> {
  table: Table<TData>
}

export function TableFiltersInline<TData>({ table }: TableFiltersInlineProps<TData>) {
  const columns = table.getAllColumns()
  
  // Get filterable columns (those with filterType in meta)
  const filterableColumns = React.useMemo(() => {
    return columns.filter(column => {
      const meta = column.columnDef.meta as any
      return meta?.filterType && meta?.filterOptions
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
    <div className="flex flex-wrap items-center gap-2 sm:gap-x-6">
      <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:items-center">
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
            />
          )
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="border border-border px-2 font-semibold text-primary sm:border-none sm:py-1"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
