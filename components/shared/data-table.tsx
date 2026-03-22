"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  OnChangeFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  X,
} from "lucide-react"
import EmptyStateComponent from "./empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchKeys?: { key: string; placeholder: string }[]
  searchPlaceholder?: string
  onRowClick?: (row: TData) => void
  showPagination?: boolean
  pageSize?: number
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  filters?: React.ReactNode
  loading?: boolean
  // Empty state props
  noData?: boolean
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateAction?: () => void
  emptyStateIcon?: React.ReactNode
  containerClassName?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchKeys,
  searchPlaceholder = "Search...",
  onRowClick,
  showPagination = true,
  pageSize = 20,
  rowSelection: externalRowSelection,
  onRowSelectionChange: externalOnRowSelectionChange,
  filters,
  loading = false,
  noData,
  emptyStateTitle = "No Data Available",
  emptyStateDescription = "There is no data to display at the moment.",
  emptyStateAction,
  emptyStateIcon,
  containerClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({})

  // Use external selection if provided, otherwise use internal
  const rowSelection = externalRowSelection ?? internalRowSelection
  const setRowSelection = externalOnRowSelectionChange ?? setInternalRowSelection

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {(searchKey || searchKeys || filters) && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Skeleton className="h-10 flex-1 min-w-50" />
            {filters && <Skeleton className="h-10 w-32" />}
          </div>
        )}
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full" />
            ))}
          </div>
        </div>
        {showPagination && (
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-64" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {(searchKey || searchKeys || filters) && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Single search key (backward compatible) */}
          {searchKey && !searchKeys && (
            <div className="relative flex-1 min-w-50">
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="pr-8 w-full md:w-md"
              />
              {(table.getColumn(searchKey)?.getFilterValue() as string) && (
                <button
                  type="button"
                  onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          
          {/* Multiple search keys */}
          {searchKeys && searchKeys.map((search) => (
            <div key={search.key} className="relative flex-1 min-w-50">
              <Input
                placeholder={search.placeholder}
                value={(table.getColumn(search.key)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(search.key)?.setFilterValue(event.target.value)
                }
                className="pr-8 w-full md:w-md"
              />
              {(table.getColumn(search.key)?.getFilterValue() as string) && (
                <button
                  type="button"
                  onClick={() => table.getColumn(search.key)?.setFilterValue("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          
          {filters && (
            <div className="flex flex-wrap items-center gap-2">
              {filters}
            </div>
          )}
        </div>
      )}

      <div className={cn("rounded-md border", containerClassName)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-4">
                  {noData ? (
                      <EmptyStateComponent
                        title={emptyStateTitle}
                        description={emptyStateDescription}
                        actionTitle={emptyStateAction ? "Take Action" : undefined}
                        handleAction={emptyStateAction}
                        icon={emptyStateIcon}
                      />
                  ) : (
                    <div className="h-24 text-center flex items-center justify-center">
                      No results.
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(showPagination && !noData) && (
        <div className="flex items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <span>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="h-8 w-17.5 rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                icon={<ChevronsLeftIcon />}
                tooltip="Go to first page"
              />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                icon={<ChevronLeftIcon />}
                tooltip="Go to previous page"
              />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                icon={<ChevronRightIcon />}
                tooltip="Go to next page"
              />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                icon={<ChevronsRightIcon />}
                tooltip="Go to last page"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
