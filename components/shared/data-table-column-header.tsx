"use client"

import { Column } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowDownUp, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div
        className="h-8 data-[state=open]:bg-accent flex items-center cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDownIcon className="ml-1 size-4 text-blue-500" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUpIcon className="ml-1 size-4  text-blue-500" />
        ) : (
          <ArrowDownUp className="ml-1 size-4 text-gray-400 dark:text-gray-500 " />
        )}
      </div>
    </div>
  )
}

    // <div className={cn("flex items-center space-x-2", className)}>
    //   <Button
    //     variant="ghost"
    //     size="sm"
    //     className="-ml-3 h-8 data-[state=open]:bg-accent"
    //     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     iconRight={column.getIsSorted() === "desc" ? (
    //       <ArrowDownIcon className="ml-1 size-4" />
    //     ) : column.getIsSorted() === "asc" ? (
    //       <ArrowUpIcon className="ml-1 size-4" />
    //     ) : (
    //       <ChevronsUpDownIcon className="ml-1 size-4" />
    //     )}
    //   >
    //     <span>{title}</span>
        
    //   </Button>
    // </div>