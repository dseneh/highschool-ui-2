// Example usage of DataTable2 component
// Adapt this to your specific use case
"use client"

import { DataTable } from "@/components/shared/data-table2"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/shared/data-table2/DataTableColumnHeader"
import { DataTableRowActions } from "@/components/shared/data-table2/DataTableRowActions"
import { ConditionFilter } from "@/components/shared/data-table2"

// 1. Define your data type
type User = {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  department: string
  salary: number
}

// 2. Create column helper
const columnHelper = createColumnHelper<User>()

// 3. Define columns
const columns = [
  // Selection column
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={() => table.toggleAllPageRowsSelected()}
        className="translate-y-0.5"
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={() => row.toggleSelected()}
        className="translate-y-0.5"
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      displayName: "Select",
    },
  }),

  // Name column with sorting
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Name",
    },
  }),

  // Email column
  columnHelper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Email",
    },
  }),

  // Status column (for select filter)
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Status",
    },
    cell: ({ getValue }) => {
      const status = getValue()
      return (
        <span
          className={
            status === "active"
              ? "text-green-600"
              : "text-gray-500"
          }
        >
          {status}
        </span>
      )
    },
  }),

  // Department column (for checkbox filter)
  columnHelper.accessor("department", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Department",
    },
    filterFn: "arrIncludesSome",
  }),

  // Salary column (for number filter)
  columnHelper.accessor("salary", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Salary" />
    ),
    enableSorting: true,
    meta: {
      className: "text-right",
      displayName: "Salary",
    },
    cell: ({ getValue }) => {
      return (
        <span className="font-medium">
          ${getValue().toLocaleString()}
        </span>
      )
    },
    filterFn: (row, columnId, filterValue: ConditionFilter) => {
      const value = row.getValue(columnId) as number
      const [min, max] = filterValue.value as [number, number]

      switch (filterValue.condition) {
        case "is-equal-to":
          return value == min
        case "is-between":
          return value >= min && value <= max
        case "is-greater-than":
          return value > min
        case "is-less-than":
          return value < min
        default:
          return true
      }
    },
  }),

  // Actions column
  columnHelper.display({
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: "text-right",
      displayName: "Actions",
    },
    cell: ({ row }) => <DataTableRowActions row={row} />,
  }),
]

// 4. Use the component
export default function UsersDataTable() {
  // Your data (this would typically come from an API)
  const data: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "active",
      department: "Engineering",
      salary: 120000,
    },
    // ... more data
  ]

  return (
    <DataTable
      columns={columns as ColumnDef<User>[]}
      data={data}
      pageSize={20}
      // Filter configurations
      statuses={[
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]}
      regions={[
        { label: "Engineering", value: "Engineering" },
        { label: "Sales", value: "Sales" },
        { label: "Marketing", value: "Marketing" },
      ]}
      conditions={[
        { label: "Equal to", value: "is-equal-to" },
        { label: "Between", value: "is-between" },
        { label: "Greater than", value: "is-greater-than" },
        { label: "Less than", value: "is-less-than" },
      ]}
      formatters={{
        currency: (value) => `$${value.toLocaleString()}`,
      }}
    />
  )
}
