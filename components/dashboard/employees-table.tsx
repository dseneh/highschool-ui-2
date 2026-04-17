"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AdvancedTable,
  AdvancedTableColumnHeader,
  Searchbar,
  TableFilters,
  TableFiltersInline,
  ViewOptions,
} from "@/components/shared/advanced-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { EmployeeDto } from "@/lib/api2/employee-types";
import { cn } from "@/lib/utils";
import { getStatusPillClass } from "@/lib/status-colors";
import { useRouter } from "next/navigation";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

function getDisplayName(employee: EmployeeDto) {
  const fullName = employee.fullName ?? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
  return fullName || "Unnamed";
}

function getInitials(employee: EmployeeDto) {
  const initials = [employee.firstName, employee.lastName]
    .filter((value): value is string => Boolean(value))
    .map((value) => value[0])
    .join("");

  return initials || "?";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "--";

  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function matchesOptionFilter(cellValue: unknown, filterValue: unknown) {
  const normalizedCellValue = String(cellValue ?? "").trim().toLowerCase();

  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) return true;
    return filterValue.some((value) => String(value).trim().toLowerCase() === normalizedCellValue);
  }

  if (typeof filterValue === "string") {
    if (!filterValue.trim()) return true;
    return filterValue.trim().toLowerCase() === normalizedCellValue;
  }

  return true;
}

function toFilterOptions(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))
  )
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }));
}

export function EmployeeTable({ employees = [] }: { employees?: EmployeeDto[] }) {
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const [searchValue, setSearchValue] = React.useState("");

  const departmentOptions = React.useMemo(
    () => toFilterOptions(employees.map((employee) => employee.departmentName)),
    [employees]
  );

  const statusOptions = React.useMemo(
    () => toFilterOptions(employees.map((employee) => employee.employmentStatus)),
    [employees]
  );

  const typeOptions = React.useMemo(
    () => toFilterOptions(employees.map((employee) => employee.employmentType)),
    [employees]
  );

  const filteredEmployees = React.useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) => {
      const haystacks = [
        getDisplayName(employee),
        employee.employeeNumber ?? "",
        employee.email ?? "",
        employee.departmentName ?? "",
        employee.jobTitle ?? "",
      ];

      return haystacks.some((value) => value.toLowerCase().includes(query));
    });
  }, [employees, searchValue]);

  const columns = React.useMemo<ColumnDef<EmployeeDto>[]>(
    () => [
      {
        accessorKey: "employeeNumber",
        header: ({ column }) => (
          <AdvancedTableColumnHeader column={column} title="Emp #" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-muted-foreground">
            {row.original.employeeNumber ?? "--"}
          </span>
        ),
      },
      {
        id: "fullName",
        accessorFn: (row) => getDisplayName(row),
        header: ({ column }) => (
          <AdvancedTableColumnHeader column={column} title="Employee" />
        ),
        cell: ({ row }) => {
          const employee = row.original;

          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9 border border-border/60">
                <AvatarImage src={employee.photoUrl ?? undefined} alt={getDisplayName(employee)} />
                <AvatarFallback className="text-xs font-semibold">
                  {getInitials(employee)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{getDisplayName(employee)}</p>
                <p className="truncate text-xs text-muted-foreground">{employee.email ?? "No email"}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "departmentName",
        header: ({ column }) => (
          <AdvancedTableColumnHeader column={column} title="Department" />
        ),
        cell: ({ row }) => row.original.departmentName ?? "--",
        filterFn: (row, id, filterValue) => matchesOptionFilter(row.getValue(id), filterValue),
        meta: {
          displayName: "Department",
          filterType: "checkbox",
          filterOptions: departmentOptions,
          filterSummaryMode: "count",
        },
      },
      {
        accessorKey: "jobTitle",
        header: ({ column }) => (
          <AdvancedTableColumnHeader column={column} title="Job Title" />
        ),
        cell: ({ row }) => row.original.jobTitle ?? "--",
      },
      {
        accessorKey: "employmentType",
        header: ({ column }) => (
          <AdvancedTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => row.original.employmentType ?? "--",
        filterFn: (row, id, filterValue) => matchesOptionFilter(row.getValue(id), filterValue),
        meta: {
          displayName: "Employment Type",
          filterType: "checkbox",
          filterOptions: typeOptions,
          filterSummaryMode: "count",
        },
      },
      {
        accessorKey: "hireDate",
        header: ({ column }) => (
          <AdvancedTableColumnHeader column={column} title="Hire Date" />
        ),
        cell: ({ row }) => formatDate(row.original.hireDate),
      },
      {
        accessorKey: "employmentStatus",
        header: ({ column }) => (
          <AdvancedTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original.employmentStatus ?? "Unknown";

          return (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                getStatusPillClass(status)
              )}
            >
              {status}
            </span>
          );
        },
        filterFn: (row, id, filterValue) => matchesOptionFilter(row.getValue(id), filterValue),
        meta: {
          displayName: "Status",
          filterType: "checkbox",
          filterOptions: statusOptions,
          filterSummaryMode: "count",
        },
      },
    ],
    [departmentOptions, statusOptions, typeOptions]
  );

  const handleRowClick = React.useCallback(
    (employee: EmployeeDto) => {
      const href = subdomain
        ? `/${subdomain}/employees/${employee.id}`
        : `/employees/${employee.id}`;

      router.push(href);
    },
    [router, subdomain]
  );

  return (
    <AdvancedTable
      columns={columns}
      data={filteredEmployees}
      noData={filteredEmployees.length === 0}
      emptyStateTitle="No Employees Found"
      emptyStateDescription="There are no employees to display at the moment."
      onRowClick={handleRowClick}
      showPagination={true}
      showRowSelection={false}
      showBulkActions={false}
      toolbar={(table) => (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Searchbar
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search employees..."
                className="w-full max-w-sm"
              />
              <div className="md:hidden">
                <TableFilters table={table} />
              </div>
              <div className="hidden md:block">
                <TableFiltersInline table={table} />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <ViewOptions table={table} />
            </div>
          </div>
        </div>
      )}
    />
  );
}

export const EmployeesTable = EmployeeTable;
