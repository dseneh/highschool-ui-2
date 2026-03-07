"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import type { TransactionTypeDto } from "@/lib/api/finance-types";

export function columns(
  onEdit: (type: TransactionTypeDto) => void,
  onDelete: (type: TransactionTypeDto) => void
): ColumnDef<TransactionTypeDto>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const isIncome = row.original.type === "income";
        return (
          <Badge variant={isIncome ? "default" : "secondary"}>
            {isIncome ? "Income" : "Expense"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description || "-"}
        </span>
      ),
    },
    {
      accessorKey: "is_hidden",
      header: "Hidden",
      cell: ({ row }) => (
        <Badge variant={row.original.is_hidden ? "outline" : "ghost"}>
          {row.original.is_hidden ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
            icon={<Edit2 className="h-4 w-4" />}
          >
            Edit
          </Button>
          {row.original.is_editable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.original)}
              icon={<Trash2 className="h-4 w-4" />}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];
}
