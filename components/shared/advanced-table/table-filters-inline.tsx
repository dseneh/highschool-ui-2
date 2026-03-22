// Inline table filters component - displays filters horizontally on larger screens
"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AdvancedTableFilter } from "./advanced-table-filter"

interface TableFiltersInlineProps<TData> {
  table: Table<TData>
  disabled?: boolean
}

type TableColumnLike<TData> = ReturnType<Table<TData>["getAllColumns"]>[number]

export function TableFiltersInline<TData>({ table, disabled = false }: TableFiltersInlineProps<TData>) {
  const [displayedColumnIds, setDisplayedColumnIds] = React.useState<string[]>([])

  // Column structure (meta/filterType) is static — compute once on mount
  const filterableColumns = React.useMemo(() => {
    return table.getAllColumns().filter(column => {
      const meta = column.columnDef.meta as any
      if (!meta?.filterType) return false
      if (meta.filterType === "number") return Boolean(meta?.filterConditions?.length)
      if (meta.filterType === "daterange") return true
      return Boolean(meta?.filterOptions?.length)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isColumnFilterActive = React.useCallback((column: TableColumnLike<TData>) => {
    const filterValue = column.getFilterValue() as any
    if (Array.isArray(filterValue)) return filterValue.length > 0
    if (filterValue && typeof filterValue === "object" && "value" in filterValue && !("condition" in filterValue)) {
      return Boolean(filterValue.value?.[0] || filterValue.value?.[1])
    }
    if (filterValue && typeof filterValue === "object" && "condition" in filterValue) {
      return Boolean(filterValue.condition)
    }
    return filterValue !== undefined && filterValue !== ""
  }, [])

  // Use table.getState().columnFilters as an effect trigger — this reference only
  // changes when actual filter values change (TanStack Table immutable updates),
  // so the effect never fires on every render like [filterableColumns] would.
  const columnFilters = table.getState().columnFilters

  React.useEffect(() => {
    const activeIds = filterableColumns
      .filter((column) => isColumnFilterActive(column))
      .map((column) => column.id)

    setDisplayedColumnIds((previousIds) => {
      const validIds = previousIds.filter((id) =>
        filterableColumns.some((column) => column.id === id)
      )
      const nextIds = [...validIds]
      activeIds.forEach((id) => {
        if (!nextIds.includes(id)) nextIds.push(id)
      })

      if (
        nextIds.length === previousIds.length &&
        nextIds.every((id, index) => id === previousIds[index])
      ) {
        return previousIds
      }

      return nextIds
    })
  }, [columnFilters, filterableColumns, isColumnFilterActive])

  const columnById = React.useMemo(() => {
    const map = new Map<string, TableColumnLike<TData>>()
    filterableColumns.forEach((column) => {
      map.set(column.id, column)
    })
    return map
  }, [filterableColumns])

  const renderedColumns = React.useMemo(
    () => displayedColumnIds.map((id) => columnById.get(id)).filter(Boolean) as TableColumnLike<TData>[],
    [displayedColumnIds, columnById]
  )

  const unappliedColumns = React.useMemo(
    () => filterableColumns.filter((column) => !displayedColumnIds.includes(column.id)),
    [filterableColumns, displayedColumnIds]
  )

  if (filterableColumns.length === 0) {
    return null
  }

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-2">
        {renderedColumns.map(column => {
          const meta = column.columnDef.meta as any
          const columnId = column.id
          const title = meta?.displayName || columnId
          
          return (
            <div key={columnId} className="group/filter relative">
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
              <button
                // variant="ghost"
                // size="icon-xs"
                className="absolute -top-1 -right-1 z-20 rounded-full border border-border bg-background shadow-sm opacity-0 transition-opacity group-hover/filter:opacity-100 group-focus-within/filter:opacity-100"
                disabled={disabled}
                onClick={() => {
                  column.setFilterValue(undefined)
                  setDisplayedColumnIds((previousIds) => previousIds.filter((id) => id !== columnId))
                }}
                aria-label={`Clear and hide ${title} filter`}
              >
                <X className="size-3 text-destructive" />
              </button>
            </div>
          )
        })}

        {unappliedColumns.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border border-primary text-xs font-semibold rounded-sm flex items-center gap-1 text-muted-foreground cursor-pointer hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 border-dashed"
                disabled={disabled}
                // iconLeft={<Plus className="size-3.5" />}
              >
                <Plus className="size-3.5" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-2">
              <div className="space-y-1">
                {unappliedColumns.map((column) => {
                  const meta = column.columnDef.meta as any
                  const title = meta?.displayName || column.id
                  return (
                    <button
                      key={column.id}
                      type="button"
                      className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                      onClick={() => {
                        setDisplayedColumnIds((prev) =>
                          prev.includes(column.id) ? prev : [...prev, column.id]
                        )
                      }}
                    >
                      {title}
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              setDisplayedColumnIds([])
            }}
            className="border border-border px-2 font-semibold text-primary sm:border-none sm:py-1 shrink-0"
            disabled={disabled}
          >
            Clear filters
          </Button>
        )} */}
      </div>
    </div>
  )
}
