"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { BillingSummaryItemDto } from "@/lib/api2/finance-types";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface ColumnOptions {
  currency?: string;
  viewType: "grade_level" | "section" | "student";
  onDrillDown?: (item: BillingSummaryItemDto) => void;
  onStudentClick?: (item: BillingSummaryItemDto) => void;
}

export function getBillingSummaryColumns({
  currency = "USD",
  viewType,
  onDrillDown,
  onStudentClick,
}: ColumnOptions): ColumnDef<BillingSummaryItemDto>[] {
  const cols: ColumnDef<BillingSummaryItemDto>[] = [];

  /* Grade Level / Section / Student name column */
  if (viewType === "grade_level") {
    cols.push({
      accessorKey: "grade_level",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Grade Level" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.grade_level?.name ?? "—"}
        </span>
      ),
    });
  } else if (viewType === "section") {
    cols.push({
      accessorKey: "section",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Section" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.section?.name ?? "—"}
        </span>
      ),
    });
  } else {
    cols.push({
      accessorKey: "full_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <button
            type="button"
            className="text-left hover:underline text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onStudentClick?.(item);
            }}
          >
            <p className="font-medium text-sm">{item.full_name}</p>
            <p className="text-xs text-muted-foreground">{item.id_number}</p>
          </button>
        );
      },
    });
  }

  /* Enrolled As */
  cols.push({
    accessorKey: "enrolled_as_display",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs capitalize">
        {row.original.enrolled_as_display}
      </Badge>
    ),
    size: 100,
  });

  /* Student count (grade/section views only) */
  if (viewType !== "student") {
    cols.push({
      accessorKey: "student_count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Students" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.student_count}</span>
      ),
      size: 90,
    });
  }

  /* Tuition + Other fees (student view only) */
  if (viewType === "student" && true) {
    cols.push({
      id: "tuition",
      header: "Tuition",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {formatCurrency(Number(row.original.detailed_billing?.tuition_fees ?? 0), currency)}
        </span>
      ),
      size: 110,
    });
    cols.push({
      id: "others",
      header: "Others",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {formatCurrency(Number(row.original.detailed_billing?.other_fees ?? 0), currency)}
        </span>
      ),
      size: 110,
    });
  }

  /* Total Bills */
  cols.push({
    accessorKey: "total_bills",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total Bills"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-right block">
        {formatCurrency(Number(row.original.total_bills ?? 0), currency)}
      </span>
    ),
    size: 120,
  });

  /* Total Paid */
  cols.push({
    accessorKey: "total_paid",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Paid"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-right block text-green-600 dark:text-green-400">
        {formatCurrency(Number(row.original.total_paid ?? 0), currency)}
      </span>
    ),
    size: 120,
  });

  /* Balance */
  cols.push({
    accessorKey: "balance",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Balance"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const bal = Number(row.original.balance);
      return (
        <span
          className={cn(
            "tabular-nums text-sm text-right block font-medium",
            bal > 0
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          )}
        >
          {formatCurrency(bal, currency)}
        </span>
      );
    },
    size: 120,
  });

  /* % Paid */
  cols.push({
    accessorKey: "percent_paid",
    header: "% Paid",
    cell: ({ row }) => {
      const pct = parseFloat(String(row.original.percent_paid ?? "0"));
      return (
        <div className="flex items-center gap-2 min-w-20">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                pct >= 80
                  ? "bg-green-500"
                  : pct >= 50
                    ? "bg-yellow-500"
                    : pct >= 25
                      ? "bg-orange-500"
                      : "bg-red-500"
              )}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
            {pct.toFixed(0)}%
          </span>
        </div>
      );
    },
    size: 130,
  });

  /* Avg Bill per student (non-student views) */
  if (viewType !== "student") {
    cols.push({
      accessorKey: "avg_bill_per_student",
      header: "Avg/Student",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm text-muted-foreground">
          {formatCurrency(Number(row.original.avg_bill_per_student ?? 0), currency)}
        </span>
      ),
      size: 110,
    });
  }

  /* Drill-down action (grade/section views) */
  if (viewType !== "student" && onDrillDown) {
    cols.push({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDrillDown(row.original)}
          iconRight={<HugeiconsIcon icon={ArrowRight01Icon} size={14} />}
        >
          {viewType === "grade_level" ? "Sections" : "Students"}
        </Button>
      ),
      size: 110,
    });
  }

  return cols;
}
