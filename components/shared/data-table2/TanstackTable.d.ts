import "@tanstack/react-table"
import type { RowData } from "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    displayName: string
    filterType?: "select" | "checkbox" | "number"
    filterOptions?: Array<{ label: string; value: string }>
  }
}
