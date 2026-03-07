"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { GeneralFeeDto } from "@/lib/api/finance-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { AmountCellPopover } from "@/components/finance/amount-cell-popover";
import { StudentTargetCellPopover } from "@/components/finance/student-target-cell-popover";
import { cn } from "@/lib/utils";
import {
  MoreHorizontalIcon,
  Edit02Icon,
  Delete02Icon,
  Copy01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { STUDENT_TARGET_LABELS, TARGET_COLORS } from "./utils";


interface GeneralFeeColumnsContext {
  onEdit?: (fee: GeneralFeeDto) => void;
  onDelete?: (fee: GeneralFeeDto) => void;
  onDuplicate?: (fee: GeneralFeeDto) => void;
  onToggleActive?: (id: string, active: boolean) => void;
  onSyncToSections?: (fee: GeneralFeeDto) => void;
  onUpdateAmount?: (id: string, amount: number, applyToAllSections: boolean) => void;
  onUpdateTarget?: (id: string, studentTarget: string, applyToAllSections: boolean) => void;
  syncingFeeId?: string | null;
  isUpdating?: boolean;
}

export function getGeneralFeeColumns(
  context: GeneralFeeColumnsContext
): ColumnDef<GeneralFeeDto>[] {
  const {
    onEdit,
    onDelete,
    onDuplicate,
    onToggleActive,
    onSyncToSections,
    onUpdateAmount,
    onUpdateTarget,
    isUpdating,
    syncingFeeId,
  } = context;

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fee Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            {row.original.description && (
              <span className="text-xs text-muted-foreground truncate max-w-md">
                {row.original.description}
              </span>
            )}
          </div>
        );
      },
      size: 250,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Amount"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const fee = row.original;
        if (onUpdateAmount) {
          return (
            <AmountCellPopover
              feeId={fee.id}
              amount={fee.amount}
              active={fee.active}
              onUpdateAmount={onUpdateAmount}
              isUpdating={isUpdating}
            />
          );
        }
        return (
          <span className="text-sm font-medium tabular-nums text-right block">
            ${fee.amount.toFixed(2)}
          </span>
        );
      },
      size: 150,
    },
    {
      accessorKey: "student_target",
      header: "Target Students",
      maxSize: 200,
      cell: ({ row }) => {
        const fee = row.original;
        const target = fee.student_target || "";
        const label = STUDENT_TARGET_LABELS[target] || target || "All Students";
        const colorClass = TARGET_COLORS[target] || TARGET_COLORS[""];
        
        // if (onUpdateTarget) {
        //   return (
        //     <StudentTargetCellPopover
        //       feeId={fee.id}
        //       studentTarget={target}
        //       active={fee.active}
        //       onUpdateTarget={onUpdateTarget}
        //       isUpdating={isUpdating}
        //     />
        //   );
        // }
        
        return (
          <Badge className={cn("text-xs font-normal", colorClass)}>
            {label}
          </Badge>
        );
      },
      size: 150,
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => {
        const fee = row.original;
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={fee.active ? "default" : "secondary"}
              className="text-xs"
            >
              {fee.active ? "Active" : "Inactive"}
            </Badge>
            {onToggleActive && (
              <Switch
                checked={fee.active}
                onCheckedChange={(checked) => onToggleActive(fee.id, checked)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        );
      },
      size: 130,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const fee = row.original;
        const isSyncing = syncingFeeId === fee.id;

        return (
          <div className="flex justify-end items-center gap-2">
            {onSyncToSections && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onSyncToSections(fee);
                }}
                disabled={isSyncing || !fee.active}
                tooltip="Sync amount to all active sections"
                icon={<HugeiconsIcon
                  icon={RefreshIcon}
                  className={cn("h-4 w-4", isSyncing && "animate-spin")}
                />}
              >
                
                <span className="sr-only">Sync</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HugeiconsIcon
                    icon={MoreHorizontalIcon}
                    className="h-4 w-4"
                  />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(fee)}>
                    <HugeiconsIcon icon={Edit02Icon} className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(fee)}>
                    <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(fee)}
                      className="text-destructive focus:text-destructive"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 100,
    },
  ];
}
