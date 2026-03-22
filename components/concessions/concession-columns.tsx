"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { StudentConcessionDto } from "@/lib/api2/billing-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import type { ConditionFilter } from "@/components/shared/advanced-table/types"
import { DEFAULT_NUMBER_FILTER_CONDITIONS } from "@/components/shared/advanced-table/number-filter-utils"
import { Pencil, Trash, Eye } from "lucide-react"
import StatusBadge from "../ui/status-badge"

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
      filterFn: (row, _id, value) => {
        const searchValue = String(value || "").trim().toLowerCase()
        if (!searchValue) return true

        const student = row.original.student
        const name = String(student?.full_name || "").toLowerCase()
        const idNumber = String(student?.id_number || "").toLowerCase()

        return name.includes(searchValue) || idNumber.includes(searchValue)
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
      filterFn: (row, id, value) => {
        const selected = String(value || "")
        if (!selected || selected === "all") return true
        return String(row.getValue(id)) === selected
      },
      meta: {
        displayName: "Type",
        filterType: "radio",
        filterOptions: [
          { label: "All Types", value: "all" },
          { label: "Percentage", value: "percentage" },
          { label: "Flat", value: "flat" },
        ],
      } as any,
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
      filterFn: (row, id, value) => {
        const selected = String(value || "")
        if (!selected || selected === "all") return true
        return String(row.getValue(id)) === selected
      },
      meta: {
        displayName: "Target",
        filterType: "checkbox",
        filterOptions: [
          { label: "Entire Bill", value: "entire_bill" },
          { label: "Tuition", value: "tuition" },
          { label: "Other Fees", value: "other_fees" },
        ],
        filterSummaryMode: "count",
      } as any,
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
      filterFn: (row, _id, value) => {
        const filter = value as ConditionFilter | undefined
        if (!filter || !filter.condition) return true

        const amount = Number(row.original.amount || 0)
        const minRaw = filter.value?.[0]
        const maxRaw = filter.value?.[1]
        const minValue = minRaw === "" || minRaw === undefined || minRaw === null ? null : Number(minRaw)
        const maxValue = maxRaw === "" || maxRaw === undefined || maxRaw === null ? null : Number(maxRaw)
        const hasMin = minValue !== null && Number.isFinite(minValue)
        const hasMax = maxValue !== null && Number.isFinite(maxValue)

        switch (filter.condition) {
          case "is-between":
            if (hasMin && hasMax) return amount >= (minValue as number) && amount <= (maxValue as number)
            if (hasMin) return amount >= (minValue as number)
            if (hasMax) return amount <= (maxValue as number)
            return true
          case "is-greater-than":
            return hasMin ? amount > (minValue as number) : true
          case "is-greater-than-or-equal":
            return hasMin ? amount >= (minValue as number) : true
          case "is-less-than":
            return hasMin ? amount < (minValue as number) : true
          case "is-less-than-or-equal":
            return hasMin ? amount <= (minValue as number) : true
          case "is-equal-to":
            return hasMin ? amount === (minValue as number) : true
          default:
            return true
        }
      },
      meta: {
        displayName: "Amount",
        filterType: "number",
        filterConditions: DEFAULT_NUMBER_FILTER_CONDITIONS,
        formatter: (value: number | string) => {
          const numericValue = Number(value || 0)
          return Number.isFinite(numericValue)
            ? numericValue.toLocaleString()
            : String(value)
        },
      } as any,
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
         <StatusBadge status={row.original.active ? "active" : "inactive"} showIcon />
      ),
      filterFn: (row, _id, value) => {
        const selected = String(value || "")
        if (!selected || selected === "all") return true
        return selected === "active" ? Boolean(row.original.active) : !row.original.active
      },
      meta: {
        displayName: "Status",
        filterType: "radio",
        filterOptions: [
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      } as any,
    },

    {
      id: "actions",
      cell: ({ row }) => {
        const concession = row.original

        return (
            <div className="flex items-center space-x-2" onClick={(event) => event.stopPropagation()}>
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
