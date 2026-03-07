"use client";

import * as React from "react";
import { PageContent } from "@/components/dashboard/page-content";
import { SummaryCardGrid } from "@/components/dashboard/summary-card-grid";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AcademicYearSelect from "@/components/shared/data-reusable/academic-year-select";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getIconByKey } from "@/lib/icon-map";
import { formatCurrency, cn } from "@/lib/utils";
import { usePaymentStatus } from "@/hooks/use-finance";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import type {
  StudentPaymentStatusDto,
  PaymentStatusParams,
} from "@/lib/api2/finance-types";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { useRouter } from "next/navigation";
import { FileExportIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Summary metrics                                                    */
/* ------------------------------------------------------------------ */

function buildMetrics(students: StudentPaymentStatusDto[]) {
  const totalFees = students.reduce(
    (s, st) => s + (st.billing_summary?.total_bill ?? 0),
    0
  );
  const totalPaid = students.reduce(
    (s, st) => s + (st.billing_summary?.paid ?? 0),
    0
  );
  const totalBalance = students.reduce(
    (s, st) => s + (st.billing_summary?.balance ?? 0),
    0
  );
  const overdueCount = students.filter(
    (st) => st.billing_summary?.payment_status?.overdue_count > 0
  ).length;

  return [
    {
      title: "Total Billed",
      value: formatCurrency(totalFees),
      subtitle: `${students.length} students`,
      icon: getIconByKey("invoices"),
    },
    {
      title: "Total Collected",
      value: formatCurrency(totalPaid),
      subtitle: totalFees > 0
        ? `${((totalPaid / totalFees) * 100).toFixed(0)}% collected`
        : "0% collected",
      icon: getIconByKey("check"),
    },
    {
      title: "Outstanding",
      value: formatCurrency(totalBalance),
      subtitle: `${overdueCount} overdue`,
      icon: getIconByKey("cancel"),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

function getPaymentStatusColumns({
  currency = "USD",
  onStudentClick,
}: {
  currency?: string;
  onStudentClick?: (st: StudentPaymentStatusDto) => void;
}): ColumnDef<StudentPaymentStatusDto>[] {
  return [
    {
      accessorKey: "id_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-mono text-xs text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onStudentClick?.(row.original);
          }}
        >
          {row.original.id_number}
        </button>
      ),
      size: 100,
    },
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.full_name}</span>
      ),
      size: 180,
    },
    {
      accessorKey: "grade_level",
      header: "Grade",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.grade_level}</span>
      ),
      size: 80,
    },
    {
      accessorKey: "section",
      header: "Section",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.section}</span>
      ),
      size: 100,
    },
    {
      id: "total_bill",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Total Bill"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-sm text-right block">
          {formatCurrency(Number(row.original.billing_summary?.total_bill ?? 0), currency)}
        </span>
      ),
      size: 110,
    },
    {
      id: "paid",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Paid"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-sm text-green-600 dark:text-green-400 text-right block">
          {formatCurrency(Number(row.original.billing_summary?.paid ?? 0), currency)}
        </span>
      ),
      size: 110,
    },
    {
      id: "balance",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Balance"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const bal = row.original.billing_summary?.balance ?? 0;
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
      size: 110,
    },
    {
      id: "paid_pct",
      header: "% Paid",
      cell: ({ row }) => {
        const pct =
          row.original.billing_summary?.payment_status?.paid_percentage ?? 0;
        return (
          <div className="flex items-center gap-2 min-w-20">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
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
      size: 120,
    },
    {
      id: "status",
      header: "Payment Status",
      cell: ({ row }) => {
        const ps = row.original.billing_summary?.payment_status;
        if (!ps) return "—";
        if (ps.is_paid_in_full) {
          return (
            <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Paid in Full
            </Badge>
          );
        }
        if (ps.overdue_count > 0) {
          return (
            <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
              Overdue ({ps.overdue_count})
            </Badge>
          );
        }
        if (ps.is_on_time) {
          return (
            <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              On Time
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="text-xs">
            Pending
          </Badge>
        );
      },
      size: 130,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Status filter options                                              */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS = [
  { label: "All Students", value: "all" },
  { label: "On Time", value: "on_time" },
  { label: "Overdue", value: "delinquent" },
  { label: "Paid in Full", value: "paid_in_full" },
] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  const router = useRouter();
  const { data: currentYear } = useCurrentAcademicYear();

  const [yearId, setYearId] = React.useState("");
  const [paymentFilter, setPaymentFilter] = React.useState<string>("all");

  React.useEffect(() => {
    if (currentYear && !yearId) {
      setYearId(currentYear.id);
    }
  }, [currentYear, yearId]);

  const queryParams: PaymentStatusParams = {
    academic_year_id: yearId || undefined,
    payment_status:
      paymentFilter === "all" ? undefined : (paymentFilter as PaymentStatusParams["payment_status"]),
    include_payment_status: true,
    include_payment_plan: false,
  };

  const { data: statusData, isLoading } = usePaymentStatus(
    yearId ? queryParams : undefined
  );
  const students = statusData?.results ?? [];

  const columns = React.useMemo(
    () =>
      getPaymentStatusColumns({
        onStudentClick: (st) =>
          router.push(`/students/${st.id_number}/billing`),
      }),
    [router]
  );

  return (
    <PageContent>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Payment Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Track student payment status and collection rates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AcademicYearSelect
            noTitle
            selectClassName="w-48"
            autoSelectCurrent
            value={yearId}
            onChange={setYearId}
            useUrlState={false}
          />
          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v ?? "all")}>
            <SelectTrigger className="w-37.5">
              <SelectValue placeholder="All Students" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            iconLeft={<HugeiconsIcon icon={FileExportIcon} size={16} />}
            disabled
          >
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <>
          {/* Summary cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative p-5 rounded-xl border bg-card overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-3 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="size-10 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Table skeleton */}
          <div className="rounded-md border">
            <div className="border-b px-4 py-3 flex gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-b px-4 py-3 flex items-center gap-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-1.5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <SummaryCardGrid items={buildMetrics(students)} />
          <DataTable
            columns={columns}
            data={students}
            searchKey="full_name"
            searchPlaceholder="Search students…"
            showPagination={students.length > 20}
            pageSize={30}
          />
        </>
      )}
    </PageContent>
  );
}
