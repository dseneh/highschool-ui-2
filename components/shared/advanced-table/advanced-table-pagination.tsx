"use client"

import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AdvancedTablePaginationProps<TData> {
  table: Table<TData>
  pageSize?: number
  // Server-side pagination props (optional)
  totalCount?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function AdvancedTablePagination<TData>({
  table,
  pageSize = 20,
  totalCount,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
}: AdvancedTablePaginationProps<TData>) {
  // Determine if we're using server-side pagination
  const isServerSidePagination = totalCount !== undefined && onPageChange !== undefined

  let firstRowIndex: number
  let lastRowIndex: number
  let totalRows: number
  let totalPages: number
  let canGoNext: boolean
  let canGoPrev: boolean

  if (isServerSidePagination) {
    // Server-side pagination
    totalRows = totalCount!
    totalPages = Math.ceil(totalRows / pageSize) || 1
    firstRowIndex = (currentPage - 1) * pageSize + 1
    lastRowIndex = Math.min(totalRows, currentPage * pageSize)
    canGoPrev = currentPage > 1
    canGoNext = currentPage < totalPages
  } else {
    // Client-side pagination (original behavior)
    totalRows = table.getFilteredRowModel().rows.length
    const tablePageIndex = table.getState().pagination.pageIndex
    totalPages = table.getPageCount()
    firstRowIndex = tablePageIndex * pageSize + 1
    lastRowIndex = Math.min(totalRows, firstRowIndex + pageSize - 1)
    canGoPrev = table.getCanPreviousPage()
    canGoNext = table.getCanNextPage()
  }

  // Hide pagination if total results fit on one page
  if (totalRows === 0 || (totalRows <= pageSize)) {
    return null
  }

  const handlePageSizeChange = (newSize: number) => {
    if (isServerSidePagination && onPageSizeChange) {
      onPageSizeChange(newSize)
    } else {
      table.setPageSize(newSize)
    }
  }

  const handleFirstPage = () => {
    if (isServerSidePagination && onPageChange) {
      onPageChange(1)
    } else {
      table.setPageIndex(0)
    }
  }

  const handlePrevPage = () => {
    if (isServerSidePagination && onPageChange && canGoPrev) {
      onPageChange(currentPage - 1)
    } else if (!isServerSidePagination) {
      table.previousPage()
    }
  }

  const handleNextPage = () => {
    if (isServerSidePagination && onPageChange && canGoNext) {
      onPageChange(currentPage + 1)
    } else if (!isServerSidePagination) {
      table.nextPage()
    }
  }

  const handleLastPage = () => {
    if (isServerSidePagination && onPageChange) {
      onPageChange(totalPages)
    } else {
      table.setPageIndex(table.getPageCount() - 1)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 py-4">
      {/* Results info - always visible */}
      <div className="flex-1 text-xs text-muted-foreground order-1 sm:order-0">
        {totalRows > 0 ? (
          <span>
            Showing <span className="font-medium">{firstRowIndex}</span> to{" "}
            <span className="font-medium">{lastRowIndex}</span> of{" "}
            <span className="font-medium">{totalRows}</span> results
          </span>
        ) : (
          <span>No results</span>
        )}
      </div>

      {/* Controls - responsive layout */}
      <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center order-3 sm:order-0 w-full sm:w-auto">
        {/* Page size selector - visible on desktop, compact on mobile */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Rows per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              handlePageSizeChange(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info - visible on desktop */}
        <div className="text-xs text-muted-foreground hidden sm:block whitespace-nowrap">
          Page <span className="font-medium">{currentPage}</span> of{" "}
          <span className="font-medium">{totalPages}</span>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleFirstPage}
            disabled={!canGoPrev}
            title="First page"
            className="hidden sm:inline-flex"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={handlePrevPage}
            disabled={!canGoPrev}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page indicator on mobile */}
          <div className="flex items-center px-2 text-xs font-medium text-muted-foreground sm:hidden">
            {currentPage} / {totalPages}
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleNextPage}
            disabled={!canGoNext}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleLastPage}
            disabled={!canGoNext}
            title="Last page"
            className="hidden sm:inline-flex"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
