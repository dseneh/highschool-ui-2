// Table filters component - renders filters for filterable columns
"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Filter, X } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { AdvancedTableFilter } from "./advanced-table-filter"
import { Badge } from "@/components/ui/badge"

interface TableFiltersProps<TData> {
  table: Table<TData>
  disabled?: boolean
}

export function TableFilters<TData>({ table, disabled = false }: TableFiltersProps<TData>) {
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

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    return filterableColumns.filter(column => {
      const filterValue = column.getFilterValue()
      if (Array.isArray(filterValue)) {
        return filterValue.length > 0
      }
      if (filterValue && typeof filterValue === "object" && "condition" in filterValue) {
        return Boolean((filterValue as { condition?: string }).condition)
      }
      return filterValue !== undefined && filterValue !== ""
    }).length
  }, [filterableColumns])

  const clearAllFilters = React.useCallback(() => {
    filterableColumns.forEach(column => {
      column.setFilterValue(undefined)
    })
  }, [filterableColumns])

  if (filterableColumns.length === 0) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 relative" disabled={disabled}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge 
              variant="default" 
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filter Table</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 text-xs"
                disabled={disabled}
              >
                <X className="mr-1 h-3 w-3" />
                Clear all
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {filterableColumns.map(column => {
              const meta = column.columnDef.meta as any
              const columnId = column.id
              const title = meta?.displayName || columnId
              
              return (
                <div key={columnId} className="flex flex-col items-start w-full space-y-2">
                  <label className="text-sm font-medium">
                    {title}
                  </label>
                  <AdvancedTableFilter
                    column={column}
                    title={title}
                    filterType={meta?.filterType}
                    options={meta?.filterOptions}
                    conditions={meta?.filterConditions}
                    formatter={meta?.formatter}
                    summaryMode={meta?.filterSummaryMode}
                    disabled={disabled}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
