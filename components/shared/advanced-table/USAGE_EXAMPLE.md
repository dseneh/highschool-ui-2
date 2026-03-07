/**
 * ADVANCED TABLE USAGE EXAMPLE
 * 
 * This file demonstrates how to use the AdvancedTable component
 * with filters, sorting, pagination, and row selection.
 */

import {
  AdvancedTable,
  AdvancedTableColumnHeader,
  AdvancedTableFilter,
  type ColumnDef,
  type FilterOption,
  type NumberCondition,
} from "@/components/shared/advanced-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

// Example data type
interface UserData {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "guest"
  status: "active" | "inactive"
  joinDate: Date
}

// Filter options for role column
const roleOptions: FilterOption[] = [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
  { label: "Guest", value: "guest" },
]

// Filter options for status column
const statusOptions: FilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

// Number conditions for numeric filters
const numberConditions: NumberCondition[] = [
  { label: "Is equal to", value: "is-equal-to" },
  { label: "Is greater than", value: "is-greater-than" },
  { label: "Is less than", value: "is-less-than" },
  { label: "Is between", value: "is-between" },
]

// Define columns with sorting, filtering capabilities
export const userColumns: ColumnDef<UserData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    meta: {
      className: "font-medium",
    },
  },

  {
    accessorKey: "email",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email")}</span>,
  },

  {
    accessorKey: "role",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge variant="secondary">
          {roleOptions.find((r) => r.value === role)?.label}
        </Badge>
      )
    },
    filterFn: "arrIncludesSome",
    meta: {
      filterType: "checkbox" as const,
      filterOptions: roleOptions,
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {statusOptions.find((s) => s.value === status)?.label}
        </Badge>
      )
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length === 0) return true
      return filterValue.includes(row.getValue(columnId))
    },
    meta: {
      filterType: "select" as const,
      filterOptions: statusOptions,
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => console.log("Edit", row.original.id)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => console.log("Delete", row.original.id)}>
          Delete
        </Button>
      </div>
    ),
    enableSorting: false,
  },
]

// Example data
const userData: UserData[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    status: "active",
    joinDate: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    joinDate: new Date("2024-01-15"),
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "guest",
    status: "inactive",
    joinDate: new Date("2024-02-01"),
  },
]

// Usage in a component
export function UserTableExample() {
  const handleRowSelectionChange = (selection: Record<string, boolean>) => {
    console.log("Selected rows:", selection)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>

      <AdvancedTable
        columns={userColumns}
        data={userData}
        pageSize={10}
        showPagination={true}
        showRowSelection={true}
        onRowSelectionChange={handleRowSelectionChange}
        toolbar={
          <div className="flex gap-2">
            <Button variant="outline">Export</Button>
            <Button>Add User</Button>
          </div>
        }
      />
    </div>
  )
}

/**
 * ADVANCED TABLE FEATURES:
 * 
 * 1. SORTING
 *    - Click column headers to sort
 *    - AdvancedTableColumnHeader shows sort direction
 *    - Automatic sorting state management
 * 
 * 2. FILTERING
 *    - AdvancedTableFilter component supports:
 *      - "select" type: Single select dropdown
 *      - "checkbox" type: Multi-select checkboxes
 *      - "number" type: Number conditions (equals, greater than, less than, between)
 *    - Define filters via column meta:
 *      meta: {
 *        filterType: "select" | "checkbox" | "number",
 *        filterOptions: [{ label, value }],
 *        filterConditions: [{ label, value }], // For number type
 *        formatter: (value) => string,
 *      }
 * 
 * 3. PAGINATION
 *    - AdvancedTablePagination handles all controls
 *    - Configurable page size
 *    - First, previous, next, last page buttons
 *    - Row count and page info display
 * 
 * 4. ROW SELECTION
 *    - Checkbox in header for select all
 *    - Individual row selection
 *    - Selected row highlighting
 *    - onRowSelectionChange callback
 * 
 * 5. CUSTOM TOOLBAR
 *    - Pass toolbar prop for custom controls
 *    - Can include action buttons, exports, settings, etc.
 * 
 * 6. COLUMN METADATA
 *    - Define column-level class names via meta.className
 *    - Set display names for headers
 *    - Configure filters per column
 *    - Custom formatters for display
 * 
 * EXAMPLE COLUMN DEFINITION:
 * 
 * {
 *   accessorKey: "status",
 *   header: ({ column }) => (
 *     <AdvancedTableColumnHeader column={column} title="Status" />
 *   ),
 *   cell: ({ row }) => <Badge>{row.getValue("status")}</Badge>,
 *   meta: {
 *     className: "text-center",
 *     filterType: "checkbox",
 *     filterOptions: [
 *       { label: "Active", value: "active" },
 *       { label: "Inactive", value: "inactive" },
 *     ],
 *   },
 * }
 * 
 * EXTENDING THE TABLE:
 * 
 * 1. Add bulk actions with row selection data
 * 2. Add column visibility toggle
 * 3. Add export functionality
 * 4. Add advanced filter combinations
 * 5. Add saved views/presets
 * 6. Add api data fetching with loading states
 */
