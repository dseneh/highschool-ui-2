"use client"

import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdvancedTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function AdvancedTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: AdvancedTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-md fhover:bg-muted/50",
        column.columnDef.enableSorting === true && "px-2 py-1",
        className
      )}
    >
      <span>{title}</span>
      <div className="flex flex-col gap-0.5">
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="h-4 w-4 text-foreground" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="h-4 w-4 text-foreground" />
        ) : (
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  )
}
