"use client";

import { useState, useCallback, useMemo } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { FileTextIcon, ShieldAlertIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import PageLayout from "@/components/dashboard/page-layout";
import { AdvancedTable } from "@/components/shared/advanced-table/advanced-table";
import { Searchbar } from "@/components/shared/advanced-table/searchbar";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import type { AuditLogDto } from "@/lib/api2/audit-types";
import { AUDIT_ACTION_LABELS, AUTH_EVENT_LABELS } from "@/lib/api2/audit-types";
import { AuditLogDetailSheet } from "@/components/audit/audit-log-detail-sheet";
import { useIsAdmin } from "@/hooks/use-authorization";

/* ------------------------------------------------------------------ */
/* Filter options                                                      */
/* ------------------------------------------------------------------ */

const ACTION_OPTIONS = [
  { value: "all", label: "All actions" },
  { value: "0", label: "Created" },
  { value: "1", label: "Updated" },
  { value: "2", label: "Deleted" },
  { value: "3", label: "Auth Events" },
] as const;

const ENTITY_OPTIONS = [
  { value: "all", label: "All entities" },
  { value: "students.student", label: "Student" },
  { value: "students.enrollment", label: "Enrollment" },
  { value: "students.attendance", label: "Attendance" },
  { value: "staff.staff", label: "Staff" },
  { value: "academics.academicyear", label: "Academic Year" },
  { value: "academics.gradelevel", label: "Grade Level" },
  { value: "academics.section", label: "Section" },
  { value: "academics.subject", label: "Subject" },
  { value: "finance.transaction", label: "Transaction" },
  { value: "grading.grade", label: "Grade" },
  { value: "hr.employee", label: "Employee" },
  { value: "users.user", label: "User" },
] as const;

/* ------------------------------------------------------------------ */
/* Column definitions                                                  */
/* ------------------------------------------------------------------ */

const actionVariant: Record<number, "default" | "secondary" | "destructive" | "outline"> = {
  0: "default",
  1: "secondary",
  2: "destructive",
  3: "outline",
};

const columns: ColumnDef<AuditLogDto>[] = [
  {
    accessorKey: "timestamp",
    header: "When",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {format(new Date(row.original.timestamp), "MMM d, yyyy HH:mm")}
      </span>
    ),
  },
  {
    accessorKey: "actor_email",
    header: "User",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.actor_email ?? "System"}</span>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const entry = row.original;
      const eventType = entry.additional_data?.event_type as string | undefined;
      const label =
        eventType && AUTH_EVENT_LABELS[eventType]
          ? AUTH_EVENT_LABELS[eventType]
          : (AUDIT_ACTION_LABELS[entry.action] ?? "Unknown");
      return (
        <Badge variant={actionVariant[entry.action] ?? "outline"}>
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "content_type_name",
    header: "Entity Type",
    cell: ({ row }) => {
      const name = row.original.content_type_name;
      // "students.student" → "Student"
      const label = name.split(".").pop() ?? name;
      return (
        <span className="text-sm capitalize">{label.replace(/_/g, " ")}</span>
      );
    },
  },
  {
    accessorKey: "object_repr",
    header: "Record",
    cell: ({ row }) => (
      <span className="max-w-50 truncate text-sm">
        {row.original.object_repr}
      </span>
    ),
  },
  {
    accessorKey: "changes",
    header: "Changes",
    cell: ({ row }) => {
      const changes = row.original.changes;
      if (!changes || Object.keys(changes).length === 0)
        return <span className="text-muted-foreground text-sm">—</span>;
      const count = Object.keys(changes).length;
      return (
        <span className="text-sm text-muted-foreground">
          {count} field{count !== 1 ? "s" : ""}
        </span>
      );
    },
  },
];

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function ActivityLogsPage() {
  const isAdmin = useIsAdmin();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useQueryState("search");
  const [actionFilter, setActionFilter] = useQueryState("action");
  const [entityFilter, setEntityFilter] = useQueryState("entity");
  const [dateFrom, setDateFrom] = useQueryState("date_from");
  const [dateTo, setDateTo] = useQueryState("date_to");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("page_size", parseAsInteger.withDefault(25));
  const [selectedEntry, setSelectedEntry] = useState<AuditLogDto | null>(null);

  const dateRange = useMemo<DateRange | undefined>(() => {
    if (!dateFrom && !dateTo) return undefined;
    return {
      from: dateFrom ? new Date(dateFrom) : undefined,
      to: dateTo ? new Date(dateTo) : undefined,
    };
  }, [dateFrom, dateTo]);

  const handleSearch = useCallback(() => {
    const trimmed = searchInput.trim();
    setSearch(trimmed || null);
    setPage(1);
  }, [searchInput, setSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearch(null);
    setPage(1);
  }, [setSearch]);

  const handleDateChange = useCallback((range: DateRange | undefined) => {
    setDateFrom(range?.from ? format(range.from, "yyyy-MM-dd") : null);
    setDateTo(range?.to ? format(range.to, "yyyy-MM-dd") : null);
    setPage(1);
  }, [setDateFrom, setDateTo, setPage]);

  const { data, isLoading, error, refetch } = useAuditLogs({
    action: actionFilter ? Number(actionFilter) : undefined,
    content_type_name: entityFilter || undefined,
    search: search || undefined,
    timestamp_after: dateFrom
      ? new Date(dateFrom).toISOString()
      : undefined,
    timestamp_before: dateTo
      ? new Date(dateTo).toISOString()
      : undefined,
    page,
    page_size: pageSize,
  });

  if (!isAdmin) {
    return (
      <PageLayout title="Access Denied" description="You do not have permission to view this page.">
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <ShieldAlertIcon className="h-12 w-12" />
          <p className="text-sm">Only administrators can access the activity log.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Activity Log"
      description="Track all changes and actions across the system"
      loading={isLoading}
      error={error}
      refreshAction={refetch}
    >
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
        <Searchbar
          placeholder="Search records or users..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          className="flex-1"
        />
        <DateRangePicker
          value={dateRange}
          onChange={handleDateChange}
          placeholder="Filter by date"
          className="sm:w-64"
        />
        <Select
          value={actionFilter ?? "all"}
          onValueChange={(v) => {
            setActionFilter(v === "all" ? null : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            {ACTION_OPTIONS.find((o) => o.value === (actionFilter ?? "all"))?.label ?? "All actions"}
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={entityFilter ?? "all"}
          onValueChange={(v) => {
            setEntityFilter(v === "all" ? null : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            {ENTITY_OPTIONS.find((o) => o.value === (entityFilter ?? "all"))?.label ?? "All entities"}
          </SelectTrigger>
          <SelectContent>
            {ENTITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <AdvancedTable
        columns={columns}
        data={data?.results ?? []}
        loading={isLoading}
        totalCount={data?.count ?? 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        showRowSelection={false}
        showBulkActions={false}
        noData={!isLoading && (data?.results?.length ?? 0) === 0}
        emptyStateTitle="No activity yet"
        emptyStateDescription="Actions will appear here as users interact with the system."
        emptyStateIcon={<FileTextIcon className="h-10 w-10 text-muted-foreground" />}
        onRowClick={(row) => setSelectedEntry(row)}
      />

      <AuditLogDetailSheet
        open={selectedEntry !== null}
        onOpenChange={(open) => { if (!open) setSelectedEntry(null); }}
        entry={selectedEntry}
      />
    </PageLayout>
  );
}
