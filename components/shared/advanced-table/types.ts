import { ColumnDef } from "@tanstack/react-table"

/**
 * Extend TanStack React Table ColumnMeta for advanced table features
 */
declare global {
  interface JSX {
    IntrinsicAttributes: {
      className?: string
    }
  }
}

export type FilterType = "select" | "checkbox" | "radio" | "number" | "daterange"

export interface FilterOption {
  label: string
  value: string
}

export interface NumberCondition {
  label: string
  value: string
  selectedLabel?: string
}

export interface ConditionFilter {
  condition: string
  value: [number | string, number | string]
}

export interface DateRangeFilter {
  value: [string, string]
}

export type FilterValue = string | string[] | ConditionFilter | DateRangeFilter | undefined

export interface AdvancedTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
  onRowClick?: (row: TData) => void
  onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void
  onTableInstanceReady?: (table: any) => void
  showPagination?: boolean
  showRowSelection?: boolean
  // Bulk actions
  showBulkActions?: boolean
  onBulkEdit?: (selectedRows: TData[]) => void
  onBulkDelete?: (selectedRows: TData[]) => void
  onCustomBulkAction?: (action: string, selectedRows: TData[]) => void
  customBulkActions?: Array<{
    label: string
    action: string
    shortcut?: string
  }>
  // View options
  showViewOptions?: boolean
  // Export
  showExport?: boolean
  onExport?: () => void
}

/**
 * Extend TanStack React Table ColumnMeta
 */
export interface TableColumnMeta {
  className?: string
  displayName?: string
  filterType?: FilterType
  filterOptions?: FilterOption[]
  filterConditions?: NumberCondition[]
  formatter?: (value: any) => string
  filterSummaryMode?: "labels" | "count" | "dot"
}
