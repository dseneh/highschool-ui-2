"use client"

import * as React from "react"
import {
  SortingState,
  VisibilityState,
  RowSelectionState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TableType,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyStateComponent from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"
import { AdvancedTablePagination } from "./advanced-table-pagination"
import { BulkEditor } from "./bulk-editor"
import { AdvancedTableProps } from "./types"

// Note: ColumnMeta properties are defined at the column definition level
// using the meta property: column.columnDef.meta?.filterType, etc.

interface AdvancedTableComponentProps<TData, TValue>
  extends AdvancedTableProps<TData, TValue> {
  toolbar?: React.ReactNode | ((table: TableType<TData>) => React.ReactNode)
  // Pagination props for server-side pagination
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  loading?: boolean
}

export function AdvancedTable<TData, TValue>({
  columns,
  data,
  pageSize = 20,
  onRowClick,
  onRowSelectionChange,
  onTableInstanceReady,
  showPagination = true,
  showRowSelection = true,
  showBulkActions = true,
  onBulkEdit,
  onBulkDelete,
  onCustomBulkAction,
  customBulkActions,
  toolbar,
  totalCount,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  loading,
  noData,
  emptyStateTitle = "No Data Available",
  emptyStateDescription = "There is no data to display at the moment.",
  emptyStateAction,
  emptyStateIcon,
}: AdvancedTableComponentProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

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
        pageIndex: 0,
        pageSize,
      },
    },
    enableRowSelection: showRowSelection,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      onRowSelectionChange?.(newSelection)
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Notify parent of table instance
  React.useEffect(() => {
    onTableInstanceReady?.(table)
  }, [table, onTableInstanceReady])

  // Handlers that pass selected rows to callbacks
  const handleBulkEdit = React.useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
    onBulkEdit?.(selectedRows)
  }, [table, onBulkEdit])

  const handleBulkDelete = React.useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
    onBulkDelete?.(selectedRows)
  }, [table, onBulkDelete])

  const handleCustomBulkAction = React.useCallback((action: string) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
    onCustomBulkAction?.(action, selectedRows)
  }, [table, onCustomBulkAction])

  const loadingRows = React.useMemo(
    () => Array.from({ length: Math.max(3, Math.min(pageSize, 8)) }),
    [pageSize]
  )

  return (
    <div className="space-y-2">
      {toolbar && <div>{typeof toolbar === 'function' ? toolbar(table) : toolbar}</div>}

      <div className="rounded-lg border border-border overflow-hidden relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "font-medium text-muted-foreground",
                      header.column.columnDef.meta?.className
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    if (onRowClick) {
                      onRowClick(row.original)
                      return
                    }
                    if (showRowSelection) {
                      row.toggleSelected(!row.getIsSelected())
                    }
                  }}
                  className={cn(
                    "border-b border-border transition-colors",
                    (showRowSelection || onRowClick) && "cursor-pointer hover:bg-muted/50",
                    row.getIsSelected() && "bg-muted/50"
                  )}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "relative py-3",
                        cell.column.columnDef.meta?.className
                      )}
                    >
                      {/* Visual selection indicator */}
                      {index === 0 && row.getIsSelected() && (
                        <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
                      )}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : loading ? (
              loadingRows.map((_, rowIndex) => (
                <TableRow key={`loading-row-${rowIndex}`}>
                  {columns.map((_, columnIndex) => (
                    <TableCell key={`loading-cell-${rowIndex}-${columnIndex}`} className="py-3">
                      <Skeleton
                        className={cn(
                          "h-4",
                          columnIndex === 0
                            ? "w-5 rounded-sm"
                            : columnIndex === 1
                              ? "w-40"
                              : "w-28"
                        )}
                      />
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
                    <div className="h-24 text-center flex items-center justify-center text-sm text-muted-foreground">
                      No results.
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Bulk Actions Command Bar */}
        {showBulkActions && showRowSelection && (
          <BulkEditor
            table={table}
            rowSelection={rowSelection}
            onEdit={handleBulkEdit}
            onDelete={handleBulkDelete}
            onCustomAction={handleCustomBulkAction}
            customActions={customBulkActions}
          />
        )}
      </div>

      {showPagination && !noData && onPageChange && onPageSizeChange ? (
        <AdvancedTablePagination 
          table={table} 
          pageSize={pageSize}
          totalCount={totalCount || 0}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      ) : showPagination && !noData ? (
        <AdvancedTablePagination table={table} pageSize={pageSize} />
      ) : null}
    </div>
  )
}

