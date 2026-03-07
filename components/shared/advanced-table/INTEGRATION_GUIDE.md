# Advanced Table Integration Guide

Step-by-step guide for integrating the AdvancedTable system into existing pages.

## Quick Start

### 1. Basic Setup

```tsx
import {
  AdvancedTable,
  AdvancedTableColumnHeader,
  type ColumnDef,
  type FilterOption,
} from "@/components/shared/advanced-table"

// Define your data interface
interface UserData {
  id: string
  name: string
  email: string
  role: "admin" | "user"
}

// Define columns
const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Role" />
    ),
    meta: {
      filterType: "select",
      filterOptions: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
    },
  },
]

// Use in component
export function UserList() {
  return (
    <AdvancedTable
      columns={columns}
      data={userData}
      showPagination={true}
    />
  )
}
```

## Migration Path

### From Direct TanStack Implementation

**Before:**
```tsx
const [sorting, setSorting] = useState<SortingState>([])
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: { sorting, columnFilters, pagination },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onPaginationChange: setPagination,
})

// ... render table manually with table.getHeaderGroups(), table.getHeaderGroups(), etc.
```

**After:**
```tsx
<AdvancedTable
  columns={columns}
  data={data}
  showPagination={true}
/>
```

### With Row Selection

**Before:**
```tsx
const [rowSelection, setRowSelection] = useState({})

const table = useReactTable({
  // ... config
  state: { rowSelection },
  onRowSelectionChange: setRowSelection,
})

// In component state:
const selectedRows = table.getSelectedRowModel().rows
```

**After:**
```tsx
<AdvancedTable
  columns={columns}
  data={data}
  showRowSelection={true}
  onRowSelectionChange={(selection) => {
    const selectedIds = Object.keys(selection)
    // Use selectedIds for bulk actions
  }}
/>
```

## Common Integration Scenarios

### Scenario 1: Payment Methods List

**Target File:** `/app/[subdomain]/(with-shell)/setup/payment-methods/_components/list.tsx`

**Current State:** Uses DataTable wrapper
**Goal:** Add advanced filtering and sorting

**Steps:**

1. Import AdvancedTable components
```tsx
import {
  AdvancedTable,
  AdvancedTableColumnHeader,
  type ColumnDef,
} from "@/components/shared/advanced-table"
```

2. Update column definitions
```tsx
const paymentColumns: ColumnDef<PaymentMethod>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Payment Method" />
    ),
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Type" />
    ),
    meta: {
      filterType: "select",
      filterOptions: [
        { label: "Card", value: "card" },
        { label: "Bank Transfer", value: "bank_transfer" },
        { label: "Cash", value: "cash" },
      ],
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(row.original.id)}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.original.id)}
        >
          Delete
        </Button>
      </div>
    ),
    enableSorting: false,
  },
]
```

3. Replace DataTable with AdvancedTable
```tsx
export function PaymentMethodsList() {
  const { data, isLoading } = usePaymentMethods()

  if (isLoading) return <LoadingSkeleton />

  return (
    <AdvancedTable
      columns={paymentColumns}
      data={data}
      showPagination={true}
      toolbar={
        <Button onClick={handleCreate}>
          Add Payment Method
        </Button>
      }
    />
  )
}
```

### Scenario 2: Student List with Filters

**Target File:** `/app/[subdomain]/(with-shell)/students/_components/list.tsx`

**Requires:**
- Name/email search
- Class/section filtering
- Gender filtering
- Status filtering

**Implementation:**

```tsx
const studentColumns: ColumnDef<Student>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: "rollNumber",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Roll No." />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Student Name" />
    ),
  },
  {
    accessorKey: "class",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Class" />
    ),
    meta: {
      filterType: "checkbox",
      filterOptions: classes.map(c => ({ label: c.name, value: c.id })),
    },
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Gender" />
    ),
    meta: {
      filterType: "select",
      filterOptions: [
        { label: "Male", value: "M" },
        { label: "Female", value: "F" },
      ],
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
          {status}
        </Badge>
      )
    },
    meta: {
      filterType: "select",
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionsMenu student={row.original} />
    ),
    enableSorting: false,
  },
]

export function StudentList() {
  const { data: students, isLoading } = useStudents()
  const { data: classes } = useClasses()

  if (isLoading) return <LoadingSkeleton />

  return (
    <AdvancedTable
      columns={studentColumns}
      data={students}
      showPagination={true}
      showRowSelection={true}
      pageSize={20}
      toolbar={
        <Button onClick={handleAddStudent}>
          Add Student
        </Button>
      }
      onRowSelectionChange={(selection) => {
        const selectedIds = Object.keys(selection)
        if (selectedIds.length > 0) {
          console.log("Bulk actions available for:", selectedIds)
        }
      }}
    />
  )
}
```

### Scenario 3: Grades Table with Numeric Filters

**Target File:** Grading system table

**Features needed:**
- Filter by score ranges
- Sort by student name, date, score
- Filter by subject
- Pagination

**Implementation:**

```tsx
const gradeColumns: ColumnDef<Grade>[] = [
  {
    accessorKey: "studentName",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Student" />
    ),
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Subject" />
    ),
    meta: {
      filterType: "select",
      filterOptions: subjects.map(s => ({ label: s.name, value: s.id })),
    },
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Score" />
    ),
    cell: ({ row }) => {
      const score = row.getValue("score") as number
      return (
        <Badge variant={score >= 70 ? "default" : "secondary"}>
          {score}%
        </Badge>
      )
    },
    meta: {
      filterType: "number",
      filterConditions: [
        { label: "Equals", value: "is-equal-to" },
        { label: "Greater than", value: "is-greater-than" },
        { label: "Less than", value: "is-less-than" },
        { label: "Between", value: "is-between" },
      ],
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("date") as Date
      return date.toLocaleDateString()
    },
  },
]
```

## Advanced Patterns

### Pattern: Search + Filter Combination

For searching within filtered results, use column-level filtering:

```tsx
{
  accessorKey: "email",
  header: ({ column }) => (
    <AdvancedTableColumnHeader column={column} title="Email" />
  ),
  filterFn: (row, id, filterValue) => {
    if (!filterValue) return true
    const value = row.getValue(id) as string
    return value.toLowerCase().includes(filterValue.toLowerCase())
  },
}
```

### Pattern: Conditional Formatting

Apply styling based on cell values:

```tsx
{
  accessorKey: "balance",
  header: "Balance",
  cell: ({ row }) => {
    const balance = row.getValue("balance") as number
    return (
      <span className={balance < 0 ? "text-red-600" : "text-green-600"}>
        ${balance.toFixed(2)}
      </span>
    )
  },
}
```

### Pattern: Linked Cells

Make cells clickable to navigate:

```tsx
{
  accessorKey: "name",
  header: ({ column }) => (
    <AdvancedTableColumnHeader column={column} title="Name" />
  ),
  cell: ({ row }) => (
    <Link href={`/students/${row.original.id}`}>
      <a className="text-blue-600 hover:underline">
        {row.getValue("name")}
      </a>
    </Link>
  ),
}
```

## Testing

### Test List
- [ ] Columns display correctly
- [ ] Sorting works on clickable headers
- [ ] Filters apply correctly
- [ ] Pagination controls navigate properly
- [ ] Row selection works
- [ ] Bulk actions respond to selection
- [ ] Empty state displays when no data
- [ ] Loading state shows during fetch
- [ ] Error state shows when fetch fails
- [ ] Responsive design on mobile

### Example Test

```tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { AdvancedTable } from "@/components/shared/advanced-table"

describe("PaymentMethodsTable", () => {
  it("should display all columns", () => {
    render(
      <AdvancedTable
        columns={paymentColumns}
        data={mockData}
      />
    )
    expect(screen.getByText("Payment Method")).toBeInTheDocument()
    expect(screen.getByText("Type")).toBeInTheDocument()
  })

  it("should sort when header is clicked", () => {
    const { container } = render(
      <AdvancedTable columns={paymentColumns} data={mockData} />
    )
    const header = container.querySelector("[role='columnheader']")
    fireEvent.click(header)
    // Verify sort state changed
  })

  it("should apply filter when filter value is set", () => {
    render(
      <AdvancedTable columns={paymentColumns} data={mockData} />
    )
    // Interact with filter UI
    // Verify filtered results
  })
})
```

## Troubleshooting Migration Issues

### Issue: "Cannot find module" errors

**Solution:** Ensure barrel export import works
```tsx
// ✅ Correct
import { AdvancedTable, AdvancedTableColumnHeader } from "@/components/shared/advanced-table"

// ❌ Incorrect
import { AdvancedTable } from "@/components/shared/advanced-table/advanced-table"
```

### Issue: Filters not showing

**Solution:** Ensure meta object is properly defined
```tsx
// ✅ Must have meta properties
meta: {
  filterType: "select",
  filterOptions: [
    { label: "Option 1", value: "option-1" },
  ],
}
```

### Issue: Sorting not working

**Solution:** Use AdvancedTableColumnHeader, not plain text
```tsx
// ✅ Correct
header: ({ column }) => (
  <AdvancedTableColumnHeader column={column} title="Name" />
),

// ❌ Won't support sorting
header: "Name",
```

## Performance Considerations

### For Large Datasets (10k+ rows)

1. Implement server-side pagination:
```tsx
const [pageIndex, setPageIndex] = useState(0)
const [sorting, setSorting] = useState<SortingState>([])

const { data, isLoading } = useStudents({
  skip: pageIndex * pageSize,
  take: pageSize,
  sortBy: sorting[0]?.id,
  sortOrder: sorting[0]?.desc ? "desc" : "asc",
})
```

2. Consider virtual scrolling for better performance
3. Lazy load images in table cells
4. Cache filter/sort results

### For Small Datasets (<1000 rows)

Client-side filtering and sorting is fine (what AdvancedTable does).

## Next Steps

1. Choose a page to migrate (start with payment-methods or transaction-types)
2. Define column structure with sorts/filters
3. Replace existing table component with AdvancedTable
4. Test thoroughly
5. Deploy and monitor
6. Gather feedback before scaling to other pages

## Support & Questions

Refer to:
- [README.md](./README.md) - Feature documentation
- [USAGE_EXAMPLE.md](./USAGE_EXAMPLE.md) - Code examples
- TanStack React Table docs: https://react-table.tanstack.com/

