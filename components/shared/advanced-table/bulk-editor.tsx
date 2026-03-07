// Bulk editor with keyboard shortcuts for selected rows
"use client"

import {
  CommandBar,
  CommandBarBar,
  CommandBarCommand,
  CommandBarSeparator,
  CommandBarValue,
} from "./command-bar"
import { RowSelectionState, Table } from "@tanstack/react-table"

interface BulkEditorProps<TData> {
  table: Table<TData>
  rowSelection: RowSelectionState
  onEdit?: () => void
  onDelete?: () => void
  onCustomAction?: (action: string) => void
  customActions?: Array<{
    label: string
    action: string
    shortcut?: string
  }>
}

export function BulkEditor<TData>({
  table,
  rowSelection,
  onEdit,
  onDelete,
  onCustomAction,
  customActions,
}: BulkEditorProps<TData>) {
  const hasSelectedRows = Object.keys(rowSelection).length > 0

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      console.log("Edit action:", Object.keys(rowSelection).length, "rows")
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    } else {
      console.log("Delete action:", Object.keys(rowSelection).length, "rows")
    }
  }

  return (
    <CommandBar open={hasSelectedRows}>
      <CommandBarBar>
        <CommandBarValue>
          {Object.keys(rowSelection).length} selected
        </CommandBarValue>
        
        <CommandBarSeparator />
        
        <CommandBarCommand
          label="Edit"
          action={handleEdit}
        />
        
        <CommandBarSeparator />
        
        <CommandBarCommand
          label="Delete"
          action={handleDelete}
        />
        
        {customActions?.map((customAction) => (
          <span key={customAction.action} className="flex items-center">
            <CommandBarSeparator />
            <CommandBarCommand
              label={customAction.label}
              action={() => onCustomAction?.(customAction.action)}
              shortcut={customAction.shortcut ? { shortcut: customAction.shortcut } : undefined}
            />
          </span>
        ))}
        
        <CommandBarSeparator />
        
        <CommandBarCommand
          label="Clear"
          action={() => table.resetRowSelection()}
          shortcut={{ shortcut: "Escape", label: "esc" }}
        />
      </CommandBarBar>
    </CommandBar>
  )
}
