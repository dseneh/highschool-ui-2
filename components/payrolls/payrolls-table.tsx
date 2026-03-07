"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Search,
  Calendar,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  FileInput,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleDot,
} from "@/components/payrolls/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePayrollsStore, DateFilter } from "@/store/payrolls-store";
import { cn } from "@/lib/utils";
import { getStatusTextClass, getStatusPillClass } from "@/lib/status-colors";
import type {
  Payroll,
  PayrollStatus,
  PaymentMethod,
} from "@/mock-data/payrolls";

const dateFilterLabels: Record<DateFilter, string> = {
  all: "All Dates",
  today: "Today",
  yesterday: "Yesterday",
  last7days: "Last 7 days",
  last30days: "Last 30 days",
};

const paymentMethods: PaymentMethod[] = [
  "Bank Transfer",
  "Direct Deposit",
  "Wire Transfer",
];

const statusConfig: Record<
  PayrollStatus,
  { label: string; icon: React.ElementType }
> = {
  received: {
    label: "Received",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    icon: Clock,
  },
  processed: {
    label: "Processed",
    icon: Loader2,
  },
  failed: {
    label: "Failed",
    icon: XCircle,
  },
};

export const columns: ColumnDef<Payroll>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
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
    accessorKey: "payrollId",
    header: "Payroll ID",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-muted-foreground">
        {row.getValue("payrollId")}
      </span>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">$</span>
          <span className="text-sm font-medium text-muted-foreground">
            {amount.toLocaleString()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "employeeName",
    header: "Employees",
    cell: ({ row }) => {
      const payroll = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-6">
            {payroll.employeeAvatar ? (
              <AvatarImage
                src={payroll.employeeAvatar}
                alt={payroll.employeeName}
              />
            ) : null}
            <AvatarFallback className="text-xs bg-muted">
              {payroll.employeeInitials || payroll.employeeName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{payroll.employeeName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "payPeriod",
    header: "Pay Period",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("payPeriod")}
      </span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => (
      <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-muted rounded text-muted-foreground">
        {row.getValue("paymentMethod")}
      </span>
    ),
  },
  {
    accessorKey: "processedDate",
    header: "Processed Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("processedDate") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: (row, id, value) => {
      const status = row.getValue(id) as PayrollStatus;
      return value.includes(status);
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as PayrollStatus;
      const config = statusConfig[status];
      const Icon = config.icon;
      return (
        <div
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-medium",
            getStatusPillClass(status)
          )}
        >
          <Icon className={cn("size-3.5", getStatusTextClass(status))} />
          <span className={getStatusTextClass(status)}>{config.label}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payroll = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payroll.payrollId)}
              >
                Copy Payroll ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Download Slip</DropdownMenuItem>
              <DropdownMenuItem>Edit Payroll</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface PayrollsTableProps {
  showFilters?: boolean;
}

export function PayrollsTable({ showFilters = true }: PayrollsTableProps) {
  const searchQuery = usePayrollsStore((state) => state.searchQuery);
  const setSearchQuery = usePayrollsStore((state) => state.setSearchQuery);
  const statusFilter = usePayrollsStore((state) => state.statusFilter);
  const setStatusFilter = usePayrollsStore((state) => state.setStatusFilter);
  const dateFilter = usePayrollsStore((state) => state.dateFilter);
  const setDateFilter = usePayrollsStore((state) => state.setDateFilter);
  const paymentMethodFilter = usePayrollsStore(
    (state) => state.paymentMethodFilter
  );
  const setPaymentMethodFilter = usePayrollsStore(
    (state) => state.setPaymentMethodFilter
  );
  const clearAllFilters = usePayrollsStore((state) => state.clearAllFilters);
  const allPayrolls = usePayrollsStore((state) => state.payrolls);

  const payrolls = React.useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    return allPayrolls.filter((payroll) => {
      const matchesSearch =
        searchQuery === "" ||
        payroll.payrollId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payroll.employeeName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || payroll.status === statusFilter;

      const matchesPaymentMethod =
        paymentMethodFilter === "all" ||
        payroll.paymentMethod === paymentMethodFilter;

      let matchesDate = true;
      if (dateFilter !== "all" && payroll.processedTimestamp) {
        const timestamp = payroll.processedTimestamp;
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const startOfYesterday = startOfToday - day;

        switch (dateFilter) {
          case "today":
            matchesDate = timestamp >= startOfToday;
            break;
          case "yesterday":
            matchesDate =
              timestamp >= startOfYesterday && timestamp < startOfToday;
            break;
          case "last7days":
            matchesDate = timestamp >= now - 7 * day;
            break;
          case "last30days":
            matchesDate = timestamp >= now - 30 * day;
            break;
        }
      } else if (dateFilter !== "all" && !payroll.processedTimestamp) {
        matchesDate = false;
      }

      return (
        matchesSearch && matchesStatus && matchesPaymentMethod && matchesDate
      );
    });
  }, [allPayrolls, searchQuery, statusFilter, paymentMethodFilter, dateFilter]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: payrolls,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="rounded-xl border border-border bg-card">
      {showFilters && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payroll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 w-full md:w-[200px]"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="w-[150px] h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors">
                <Calendar className="size-5 shrink-0" />
                {dateFilterLabels[dateFilter]}
                <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {(Object.keys(dateFilterLabels) as DateFilter[]).map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={dateFilter === key}
                    onCheckedChange={() => setDateFilter(key)}
                  >
                    {dateFilterLabels[key]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors">
                <CircleDot className="size-5 shrink-0" />
                {statusFilter === "all"
                  ? "All Status"
                  : statusConfig[statusFilter].label}
                <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuCheckboxItem
                  checked={statusFilter === "all"}
                  onCheckedChange={() => setStatusFilter("all")}
                >
                  All Status
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {Object.entries(statusConfig).map(([key, config]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={statusFilter === key}
                    onCheckedChange={() =>
                      setStatusFilter(key as PayrollStatus)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <config.icon
                        className={cn("size-3.5", getStatusTextClass(key))}
                      />
                      {config.label}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors" >
                {paymentMethodFilter === "all" ? "More" : paymentMethodFilter}
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">
                    Payment Method
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={paymentMethodFilter === "all"}
                    onCheckedChange={() => setPaymentMethodFilter("all")}
                  >
                    All Methods
                  </DropdownMenuCheckboxItem>
                  {paymentMethods.map((method) => (
                    <DropdownMenuCheckboxItem
                      key={method}
                      checked={paymentMethodFilter === method}
                      onCheckedChange={() => setPaymentMethodFilter(method)}
                    >
                      {method}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearAllFilters}>
                    Clear all filters
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button variant="outline" size="sm" 
          className="h-9"
          icon={<FileInput className="size-4" />}
          >
            Import
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronsLeft />}
            tooltip="First page"
          />
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronLeft />}
            tooltip="Previous page"
          />

          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(5, table.getPageCount()) },
              (_, i) => {
                const pageIndex = i;
                const isActive =
                  table.getState().pagination.pageIndex === pageIndex;
                return (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(pageIndex)}
                    className={cn(
                      "size-8 rounded-lg text-sm font-semibold",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {pageIndex + 1}
                  </button>
                );
              }
            )}
            {table.getPageCount() > 5 && (
              <>
                <span className="px-2 text-muted-foreground">...</span>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  className="size-8 rounded-lg text-sm font-semibold text-foreground hover:bg-muted"
                >
                  {table.getPageCount()}
                </button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            icon={<ChevronRight className="size-4" />}
          />
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            icon={<ChevronsRight className="size-4" />}
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-center">
              Show {table.getState().pagination.pageSize}
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[5, 8, 10, 20, 50].map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => table.setPageSize(size)}
                >
                  Show {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
