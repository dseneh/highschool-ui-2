"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@/components/ui/empty-state";
import {
  Search,
  ChevronDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Filter,
  Circle,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { cn } from "@/lib/utils";
import { getStatusTextClass } from "@/lib/status-colors";
import { StaffListItem, StaffListResponse } from "@/lib/api2/staff/types";
import { staffColumns, type StaffTableMeta } from "./staff-columns";
import { useStaff } from "@/lib/api2/staff";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { AddStaffDropdown } from "./add-staff-dropdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  active: {
    label: "Active",
    icon: CheckCircle2,
  },
  inactive: {
    label: "Inactive",
    icon: XCircle,
  },
  on_leave: {
    label: "On Leave",
    icon: Circle,
  },
  retired: {
    label: "Retired",
    icon: Circle,
  },
};

interface StaffTableProps {
  data?: StaffListResponse;
  isLoading?: boolean;
  onAddClick?: () => void;
  onUploadBulk?: () => void;
}

export function StaffTable({
  data,
  isLoading = false,
  onAddClick,
  onUploadBulk,
}: StaffTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [positionFilter, setPositionFilter] = React.useState("all");
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [deleteStaff, setDeleteStaff] = React.useState<StaffListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const staffApi = useStaff();
  const { deleteStaff: deleteStaffMutation } = staffApi;
  const { mutateAsync: performDelete, isPending: isDeleting } =
    deleteStaffMutation(deleteStaff?.id || "");

  const handleDelete = (staff: StaffListItem) => {
    setDeleteStaff(staff);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteStaff) return;

    try {
      await performDelete(undefined);
      showToast.success("Staff member deleted successfully");
      setDeleteDialogOpen(false);
      setDeleteStaff(null);
      // The list will be refetched by parent component
    } catch (error) {
      showToast.error(getErrorMessage(error));
    }
  };

  const staffList = React.useMemo<StaffListItem[]>(
    () => data?.results || [],
    [data]
  );

  const positionOptions = React.useMemo(() => {
    const positions = new Set<string>();
    staffList.forEach((staff) => {
      const label = getPositionLabel(staff);
      if (label) positions.add(label);
    });
    return Array.from(positions).sort();
  }, [staffList]);

  const departmentOptions = React.useMemo(() => {
    const departments = new Set<string>();
    staffList.forEach((staff) => {
      const label = getDepartmentLabel(staff);
      if (label) departments.add(label);
    });
    return Array.from(departments).sort();
  }, [staffList]);

  const filteredStaff = React.useMemo(() => {
    return staffList.filter((staff) => {
      const matchesSearch =
        searchQuery === "" ||
        staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.id_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (staff.phone_number || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (staff.status || "").toLowerCase() === statusFilter;

      const matchesPosition =
        positionFilter === "all" || getPositionLabel(staff) === positionFilter;

      const matchesDepartment =
        departmentFilter === "all" ||
        getDepartmentLabel(staff) === departmentFilter;

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "teacher" ? staff.is_teacher : !staff.is_teacher);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPosition &&
        matchesDepartment &&
        matchesRole
      );
    });
  }, [staffList, searchQuery, statusFilter, positionFilter, departmentFilter, roleFilter]);

  const tableMeta = React.useMemo<StaffTableMeta>(
    () => ({ onDelete: handleDelete }),
    []
  );

  const table = useReactTable({
    data: filteredStaff,
    columns: staffColumns,
    meta: tableMeta,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  

  return (
    <>
      <div className="rounded-xl border border-border bg-card">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 w-full md:w-62.5"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="w-42.5 h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors">
                <span className="truncate">
                  {positionFilter === "all" ? "All Positions" : positionFilter}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuCheckboxItem
                  checked={positionFilter === "all"}
                  onCheckedChange={() => setPositionFilter("all")}
                >
                  All Positions
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {positionOptions.map((position) => (
                  <DropdownMenuCheckboxItem
                    key={position}
                    checked={positionFilter === position}
                    onCheckedChange={() => setPositionFilter(position)}
                  >
                    {position}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="w-42.5 h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors">
                <span className="truncate">
                  {departmentFilter === "all" ? "All Departments" : departmentFilter}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuCheckboxItem
                  checked={departmentFilter === "all"}
                  onCheckedChange={() => setDepartmentFilter("all")}
                >
                  All Departments
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {departmentOptions.map((department) => (
                  <DropdownMenuCheckboxItem
                    key={department}
                    checked={departmentFilter === department}
                    onCheckedChange={() => setDepartmentFilter(department)}
                  >
                    {department}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors">
                <Filter className="size-4 shrink-0" />
                {statusFilter === "all"
                  ? "All Status"
                  : (statusConfig[statusFilter]?.label || statusFilter)}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-auto overflow-y-auto">
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
                    onCheckedChange={() => setStatusFilter(key)}
                  >
                    <div className="flex items-center gap-2">
                      <config.icon className={cn("size-3.5", getStatusTextClass(key))} />
                      {config.label}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors">
                <Users className="size-4 shrink-0" />
                {roleFilter === "all"
                  ? "All Roles"
                  : roleFilter === "teacher"
                    ? "Teachers"
                    : "Non-teachers"}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuCheckboxItem
                  checked={roleFilter === "all"}
                  onCheckedChange={() => setRoleFilter("all")}
                >
                  All Roles
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={roleFilter === "teacher"}
                  onCheckedChange={() => setRoleFilter("teacher")}
                >
                  Teachers
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={roleFilter === "staff"}
                  onCheckedChange={() => setRoleFilter("staff")}
                >
                  Non-teachers
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* <AddStaffDropdown
            onAddIndividual={onAddClick || (() => {})}
            onUploadBulk={onUploadBulk || (() => {})}
          /> */}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground font-medium whitespace-nowrap"
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
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/staff/${row.original.id_number}`)}
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
                  <TableCell colSpan={staffColumns.length} className="h-48">
                    <EmptyState className="border-none py-6">
                      <EmptyStateIcon>
                        <Search className="size-5" />
                      </EmptyStateIcon>
                      <EmptyStateTitle className="text-base">No staff found</EmptyStateTitle>
                      <EmptyStateDescription>
                        Try adjusting your search or filters to find what you&apos;re looking for.
                      </EmptyStateDescription>
                    </EmptyState>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
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
            </div>

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

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                icon={<ChevronRight />}
                tooltip="Next page"
              />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                icon={<ChevronsRight />}
                tooltip="Last page"
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} entries
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteStaff?.full_name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function getPositionLabel(staff: StaffListItem) {
  if (!staff.position) return "";
  if (typeof staff.position === "string") return staff.position;
  return staff.position.title || "";
}

function getDepartmentLabel(staff: StaffListItem) {
  if (!staff.primary_department) return "";
  if (typeof staff.primary_department === "string") return staff.primary_department;
  return staff.primary_department.name || "";
}
