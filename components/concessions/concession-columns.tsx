"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { StudentConcessionDto } from "@/lib/api/billing-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Pencil, Trash, Eye } from "lucide-react"

export function getConcessionsColumns({
  currencySymbol = "$",
  onEdit,
  onDelete,
  onView,
}: {
  currencySymbol?: string
  onEdit?: (concession: StudentConcessionDto) => void
  onDelete?: (concession: StudentConcessionDto) => void
  onView?: (concession: StudentConcessionDto) => void
}): ColumnDef<StudentConcessionDto>[] {
  return [
    {
      accessorKey: "student",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student" />
      ),
      cell: ({ row }) => {
        const student = row.original.student
        return (
          <div>
            <p className="text-sm font-medium">{student?.full_name}</p>
            <p className="text-xs text-muted-foreground">{student?.id_number}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "concession_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.concession_type}
        </Badge>
      ),
    },
    {
      accessorKey: "target",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Target" />
      ),
      cell: ({ row }) => (
        <span className="capitalize text-sm">
          {row.original.target.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.concession_type === "percentage"
            ? `${row.original.value}%`
            : `${currencySymbol}${Number(row.original.value).toLocaleString()}`}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-purple-600">
          {currencySymbol}
          {Number(row.original.amount).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.original.active ? "default" : "secondary"}
          className="capitalize"
        >
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },

    {
      id: "actions",
      cell: ({ row }) => {
        const concession = row.original

        return (
            <div className="flex items-center space-x-2">
                <Button 
                icon={<Eye className="h-4 w-4" />}
                variant="outline"
                size="icon"
                onClick={() => onView?.(concession)}
                tooltip="View details"
                />
                <Button 
                icon={<Pencil className="h-4 w-4" />}
                variant="outline"
                size="icon"
                onClick={() => onEdit?.(concession)}
                tooltip="Edit concession"
                />
                <Button 
                icon={<Trash className="h-4 w-4 text-destructive" />}
                variant="outline"
                size="icon"
                onClick={() => onDelete?.(concession)}
                tooltip="Delete concession"
                />
           </div>
        )
      },
    },
  ]
}
