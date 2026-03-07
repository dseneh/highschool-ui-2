# DataTable2 Component

Source: [Tremor Template Dashboard](https://github.com/tremorlabs/template-dashboard)

A feature-rich, customizable data table component built with TanStack Table v8 and adapted for use with Shadcn UI components.

## Features

- ✅ **Sorting**: Click column headers to sort data
- ✅ **Filtering**: Multiple filter types (select, checkbox, number range)
- ✅ **Pagination**: Navigate through pages of data
- ✅ **Row Selection**: Select single or multiple rows with bulk actions
- ✅ **Column Visibility**: Show/hide columns with drag-and-drop reordering
- ✅ **Search**: Debounced search functionality
- ✅ **Responsive**: Mobile-friendly design
- ✅ **Customizable**: Easy to adapt to your data structure

## Installation

Dependencies are already installed:
- `@tanstack/react-table` - Table functionality
- `@atlaskit/pragmatic-drag-and-drop` - Drag and drop for column reordering
- `tiny-invariant` - Runtime assertions
- `use-debounce` - Debounced search

## Basic Usage

```tsx
import { DataTable } from "@/components/shared/data-table2/DataTable"
import { ColumnDef } from "@tanstack/react-table"

// Define your data type
type User = {
  id: string
  name: string
  email: string
  status: string
}

// Define your columns
const columns: ColumnDef<User>[] = [
  // ... column definitions
]

// Use the component
export function UsersTable() {
  const data: User[] = [...] // Your data

  return (
    <DataTable 
      columns={columns} 
      data={data}
      pageSize={20}
    />
  )
}
```

## Creating Columns

See [columns.tsx](./columns.tsx) for a complete example. Key patterns:

### Selection Column
```tsx
columnHelper.display({
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={() => table.toggleAllPageRowsSelected()}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={() => row.toggleSelected()}
    />
  ),
  enableSorting: false,
  enableHiding: false,
  meta: {
    displayName: "Select",
  },
})
```

### Data Column with Sorting
```tsx
columnHelper.accessor("name", {
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Name" />
  ),
  enableSorting: true,
  meta: {
    className: "text-left",
    displayName: "Name",
  },
})
```

### Custom Cell Rendering
```tsx
columnHelper.accessor("amount", {
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Amount" />
  ),
  cell: ({ getValue }) => {
    return <span className="font-medium">${getValue().toLocaleString()}</span>
  },
  meta: {
    className: "text-right",
    displayName: "Amount",
  },
})
```

## Advanced Features

### Filters

The component supports three filter types:

1. **Select Filter**: Single selection dropdown
2. **Checkbox Filter**: Multiple selection with checkboxes
3. **Number Filter**: Numeric range with conditions (equals, between, greater than, less than)

Configure filters in the DataTable component:
```tsx
<DataTable 
  columns={columns} 
  data={data}
  statuses={[
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]}
  regions={[
    { label: "North", value: "north" },
    { label: "South", value: "south" },
  ]}
  conditions={[
    { label: "Equal to", value: "is-equal-to" },
    { label: "Between", value: "is-between" },
    { label: "Greater than", value: "is-greater-than" },
    { label: "Less than", value: "is-less-than" },
  ]}
  formatters={{
    currency: (value) => `$${value.toLocaleString()}`
  }}
/>
```

### Column Ordering

Users can reorder columns by dragging them in the "View" dropdown.

### Bulk Actions

When rows are selected, a command bar appears at the bottom with bulk actions:
- Edit (keyboard shortcut: `e`)
- Delete (keyboard shortcut: `d`)
- Reset selection (keyboard shortcut: `Esc`)

Customize actions in [DataTableBulkEditor.tsx](./DataTableBulkEditor.tsx).

## Customization

### Styling

All components use Tailwind CSS classes and respect your theme configuration (light/dark mode).

### Adapting for Your Use Case

1. Replace the example type in `columns.tsx` with your data type
2. Define columns matching your data structure
3. Update filter configuration as needed
4. Customize bulk actions in `DataTableBulkEditor.tsx`
5. Adjust the search field in `DataTableFilterbar.tsx` to search the correct column

## Components

- `DataTable.tsx` - Main table component
- `DataTableColumnHeader.tsx` - Sortable column headers
- `DataTableFilter.tsx` - Filter popover component
- `DataTableFilterbar.tsx` - Top toolbar with filters and search
- `DataTablePagination.tsx` - Pagination controls
- `DataTableBulkEditor.tsx` - Bulk action command bar
- `DataTableViewOptions.tsx` - Column visibility and reordering
- `DataTableRowActions.tsx` - Row action dropdown
- `columns.tsx` - Example column definitions

## License

Original component from Tremor template dashboard (open source).
Adapted for use with Shadcn UI components.
