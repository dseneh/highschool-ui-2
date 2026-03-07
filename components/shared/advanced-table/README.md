# Advanced Table System

Professional-grade data table component with filtering, sorting, pagination, and row selection capabilities.

## Overview

The Advanced Table System provides a complete solution for displaying and interacting with tabular data. It's built on **TanStack React Table** (formerly React Table) and **shadcn/ui** components.

### When to Use

- **Use AdvancedTable when you need:**
  - Multiple filter types (select, checkbox, number ranges)
  - Column sorting with visual indicators
  - Pagination with navigation controls
  - Multi-row selection with bulk actions
  - Drag-and-drop column reordering
  - Global search functionality
  - Professional dashboard-style tables

- **Use simple DataTable when you need:**
  - Keyword search only
  - Basic list display
  - No sorting/filtering complexity
  - Minimal setup/configuration

## Architecture

### Component Hierarchy

```
AdvancedTable (main orchestrator)
├── Toolbar (optional, for filters/actions)
├── Table (with headers)
│   ├── AdvancedTableColumnHeader (per sortable column)
│   ├── AdvancedTableFilter (per filterable column)
│   └── Row rendering with flexRender
└── AdvancedTablePagination (footer)
```

### State Management

The AdvancedTable manages four main state pieces:
- **sorting**: Column sort order and direction
- **columnFilters**: Active filters for each column
- **columnVisibility**: Show/hide columns
- **rowSelection**: Selected rows for bulk actions

All state changes are handled automatically with optional callbacks for parent component integration.

## Features

### 1. Sorting

**Enabled by default** on most columns. Click column headers to toggle sort direction.

```tsx
header: ({ column }) => (
  <AdvancedTableColumnHeader column={column} title="Name" />
),
```

**Visual Indicators:**
- ↑ Ascending sort
- ↓ Descending sort
- ↕️ No sort (default)

**Disable sorting:**
```tsx
{ 
  accessorKey: "email",
  enableSorting: false,
  header: "Email", // Plain text header instead
}
```

### 2. Filtering

Three filter types are supported:

#### Select Filter (Single Selection)
For picking one value from a list.

```tsx
{
  accessorKey: "status",
  meta: {
    filterType: "select",
    filterOptions: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
}
```

#### Checkbox Filter (Multi-Selection)
For picking multiple values.

```tsx
{
  accessorKey: "role",
  meta: {
    filterType: "checkbox",
    filterOptions: [
      { label: "Admin", value: "admin" },
      { label: "User", value: "user" },
      { label: "Guest", value: "guest" },
    ],
  },
  filterFn: "arrIncludesSome", // Use this filter function
}
```

#### Number Filter (Conditional)
For numeric comparisons: equals, greater than, less than, between.

```tsx
{
  accessorKey: "age",
  meta: {
    filterType: "number",
    filterConditions: [
      { label: "Is equal to", value: "is-equal-to" },
      { label: "Is greater than", value: "is-greater-than" },
      { label: "Is less than", value: "is-less-than" },
      { label: "Is between", value: "is-between" },
    ],
  },
}
```

### 3. Pagination

Displays:
- Row count: "Showing 1 to 10 of 50 results"
- Rows per page selector: 10, 20, 30, 40, 50
- Page indicator: "Page 1 of 5"
- Navigation: First, Previous, Next, Last buttons

**Enable/disable pagination:**
```tsx
<AdvancedTable
  data={data}
  columns={columns}
  showPagination={true}  // Toggle pagination display
  pageSize={20}          // Rows per page
/>
```

### 4. Row Selection

Multi-select with checkboxes. Selected rows are highlighted with a muted background and have a visual indicator (blue left border).

**Enable selection:**
```tsx
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
}
```

**Handle selection changes:**
```tsx
<AdvancedTable
  data={data}
  columns={columns}
  showRowSelection={true}
  onRowSelectionChange={(selection) => {
    console.log("Selected row IDs:", Object.keys(selection))
  }}
/>
```

### 5. Bulk Actions

Floating command bar appears when rows are selected, providing bulk actions with keyboard shortcuts.

**Enable bulk actions:**
```tsx
<AdvancedTable
  data={data}
  columns={columns}
  showBulkActions={true}
  onBulkEdit={() => {
    // Handle bulk edit
  }}
  onBulkDelete={() => {
    // Handle bulk delete
  }}
  customBulkActions={[
    {
      label: "Archive",
      action: "archive",
      variant: "ghost",
      shortcut: "⌘A",
    },
    {
      label: "Export",
      action: "export",
      variant: "ghost",
      shortcut: "⌘E",
    },
  ]}
  onCustomBulkAction={(action) => {
    if (action === "archive") {
      // Handle archive
    } else if (action === "export") {
      // Handle export
    }
  }}
/>
```

**Built-in Actions:**
- Edit (⌘E or Ctrl+E): Edit selected items
- Delete (⌘⌫ or Ctrl+Del): Delete selected items
- Cancel (Esc): Clear selection

### 6. View Options

Drag-and-drop column reordering and visibility control.

**Enable view options:**
```tsx
import { ViewOptions } from "@/components/shared/advanced-table"

<div className="flex items-center gap-2">
  <ViewOptions table={table} />
  {/* Other toolbar items */}
</div>
```

**Features:**
- Toggle column visibility with checkboxes
- Drag-and-drop to reorder columns
- "All" and "None" quick actions
- Visual feedback during drag operations
- Keyboard accessible

### 7. Searchbar

Global search across all columns with debounced input.

**Enable search:**
```tsx
import { Searchbar } from "@/components/shared/advanced-table"

<div className="flex items-center gap-2">
  <Searchbar
    value={globalFilter}
    onChange={setGlobalFilter}
    placeholder="Search products..."
  />
  {/* Other toolbar items */}
</div>
```

**Features:**
- Debounced search (300ms delay)
- Search icon indicator
- Customizable placeholder
- Clears on Escape key

## Usage Examples

### Basic Table with Filters

```tsx
import {
  AdvancedTable,
  AdvancedTableColumnHeader,
  type ColumnDef,
} from "@/components/shared/advanced-table"

interface Product {
  id: string
  name: string
  category: string
  price: number
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Product Name" />
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Category" />
    ),
    meta: {
      filterType: "select",
      filterOptions: [
        { label: "Electronics", value: "electronics" },
        { label: "Clothing", value: "clothing" },
        { label: "Food", value: "food" },
      ],
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Price" />
    ),
    meta: {
      filterType: "number",
      filterConditions: [
        { label: "Equals", value: "is-equal-to" },
        { label: "Greater than", value: "is-greater-than" },
      ],
    },
  },
]

export function ProductTable() {
  return (
    <AdvancedTable
      columns={columns}
      data={products}
      showPagination={true}
      pageSize={20}
    />
  )
}
```

### Table with Toolbar and Actions

```tsx
<AdvancedTable
  columns={columns}
  data={data}
  showPagination={true}
  showRowSelection={true}
  toolbar={
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport}>
        Export CSV
      </Button>
      <Button onClick={handleAddNew}>
        Add New
      </Button>
    </div>
  }
  onRowSelectionChange={(selection) => {
    const selectedRows = Object.keys(selection)
    if (selectedRows.length > 0) {
      console.log("Bulk delete:", selectedRows)
    }
  }}
/>
```

### Table with Custom Formatters

```tsx
{
  accessorKey: "joinDate",
  header: "Joined",
  cell: ({ row }) => {
    const date = row.getValue<Date>("joinDate")
    return date.toLocaleDateString()
  },
  meta: {
    filterType: "number",
    formatter: (value) => {
      const date = new Date(value as string)
      return date.toLocaleDateString()
    },
  },
}
```

## Type Definitions

```tsx
// Available filter types
type FilterType = "select" | "checkbox" | "number"

// Option for select/checkbox filters
interface FilterOption {
  label: string
  value: string
}

// Condition for number filters
interface NumberCondition {
  label: string
  value: string
}

// Filter value can be different types
type FilterValue = string | string[] | ConditionFilter | undefined

// For number conditional filters
interface ConditionFilter {
  condition: string // "is-equal-to" | "is-greater-than" | "is-less-than" | "is-between"
  value: [number | string, number | string]
}

// Main table props
interface AdvancedTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  pageSize?: number
  onRowSelectionChange?: (selection: RowSelectionState) => void
  showPagination?: boolean
  showRowSelection?: boolean
  toolbar?: React.ReactNode
}
```

## Best Practices

### 1. Column Definitions

Always use **AdvancedTableColumnHeader** for sortable columns:

```tsx
// ✅ Good
header: ({ column }) => (
  <AdvancedTableColumnHeader column={column} title="Name" />
),

// ❌ Avoid
header: "Name", // No sorting UI
```

### 2. Filter Options

Keep filter options organized and consistent:

```tsx
// ✅ Good
const statusOptions: FilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

// Then reuse in multiple columns
meta: {
  filterType: "select",
  filterOptions: statusOptions,
}
```

### 3. Custom Styling

Use column meta for styling:

```tsx
{
  accessorKey: "email",
  meta: {
    className: "text-muted-foreground",
  },
}
```

### 4. Row Selection Bulk Actions

Always check row count before enabling bulk actions:

```tsx
onRowSelectionChange={(selection) => {
  const selectedCount = Object.keys(selection).length
  
  // Show action buttons only if rows selected
  if (selectedCount > 0) {
    // Bulk delete, export, etc.
  }
}}
```

### 5. Loading States

Wrap table in loading state during data fetch:

```tsx
if (isLoading) {
  return <TableSkeleton columns={columns} />
}

return <AdvancedTable columns={columns} data={data} />
```

## Common Patterns

### Pattern 1: Date Range Filter

```tsx
{
  accessorKey: "createdAt",
  header: "Created",
  meta: {
    filterType: "number",
    filterConditions: [
      { label: "On", value: "is-equal-to" },
      { label: "Between", value: "is-between" },
    ],
    formatter: (value) => new Date(value as string).toLocaleDateString(),
  },
}
```

### Pattern 2: Status Badge Column

```tsx
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
}
```

### Pattern 3: Action Buttons Column

```tsx
{
  id: "actions",
  header: "Actions",
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
  enableHiding: false,
}
```

## Extending the System

### Add New Filter Type

1. Add to `FilterType` in types.ts
2. Update `AdvancedTableFilter.tsx` with rendering logic
3. Update column meta configuration

### Add Column Visibility Toggle

Use TanStack's `getVisibleLeafColumns()`:

```tsx
const visibleColumns = table.getVisibleLeafColumns()
// Render checkboxes to toggle visibility
```

### Add Export Functionality

```tsx
function handleExport(data: any[], filename: string) {
  const csv = generateCSV(data)
  downloadFile(csv, `${filename}.csv`)
}
```

## Troubleshooting

### Filters Not Working

1. Ensure `filterFn` is set appropriately
   - Use `"arrIncludesSome"` for checkbox multi-select
   - Use custom function for complex logic
2. Check `filterType` matches data type
3. Verify `filterOptions` are provided

### Sorting Not Working

1. Ensure column has `header: ({ column }) => AdvancedTableColumnHeader`
2. Check `enableSorting: true` (default)
3. Verify data is sortable type (string, number, date)

### Pagination Not Updating

1. Pass `showPagination={true}`
2. Ensure `pageSize` prop is set
3. Check data array is being updated

## Related Components

- **Simple DataTable**: [data-table.tsx](../data-table.tsx) - For basic lists with keyword search
- **shadcn/ui Table**: Core table component used internally
- **TanStack React Table**: [react-table.tanstack.com](https://react-table.tanstack.com)

## File Structure

```
advanced-table/
├── README.md                          (this file)
├── USAGE_EXAMPLE.md                   (code examples)
├── types.ts                           (TypeScript types)
├── advanced-table.tsx                 (main component)
├── advanced-table-column-header.tsx   (sortable headers)
├── advanced-table-filter.tsx          (filter component)
├── advanced-table-pagination.tsx      (pagination controls)
└── index.ts                           (barrel export)
```

## Performance Tips

1. **Memoize columns** - Columns arrays should be stable
2. **Use proper filterFn** - Match operation to data type
3. **Limit page size** - Don't show 100+ rows per page
4. **Virtual scrolling** - For 1000+ rows, consider virtualization

## License

MIT - Part of ezyschool-ui project
