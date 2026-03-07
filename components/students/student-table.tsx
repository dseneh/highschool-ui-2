"use client";

import * as React from "react";
import {
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
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
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
  Download,
  Trash2,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FloatingSelectionPanel } from "@/components/shared/floating-selection-panel";
import { WithdrawStudentDialog } from "@/components/students/withdraw-student-dialog";
import { DialogBox } from "@/components/ui/dialog-box";
import { useStudents as useStudentsApi } from "@/lib/api2/student";
import { useStudentMutations } from "@/hooks/use-student";
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
import { exportStudentsToCSV } from "@/lib/export-utils";
import { showToast } from "@/lib/toast";
import { StudentDto } from "@/lib/api2/student-types";
import { studentColumns, type StudentTableMeta } from "./student-columns";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

// Define status config for filter dropdown
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
  graduated: {
    label: "Graduated",
    icon: Circle,
  },
  dropped: {
    label: "Dropped",
    icon: Circle,
  },
  enrolled: {
    label: "Enrolled",
    icon: CheckCircle2,
  },
  'not enrolled': {
    label: "Not Enrolled",
    icon: Circle,
  }
};

interface StudentTableProps {
  data: StudentDto[];
  onEnroll?: (student: StudentDto) => void;
  onFixEnrollment?: (student: StudentDto) => void;
  onDelete?: (student: StudentDto) => void;
}

export function StudentTable({ data, onEnroll, onFixEnrollment, onDelete }: StudentTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [gradeFilter, setGradeFilter] = React.useState<string>("all");
  
  // Extract unique grade levels for filter
  const gradeLevels = React.useMemo(() => {
    const grades = new Set<string>();
    data.forEach(student => {
      if (student.current_grade_level?.name) {
        grades.add(student.current_grade_level.name);
      }
    });
    return Array.from(grades).sort();
  }, [data]);

  // Filter logic
  const filteredStudents = React.useMemo(() => {
    return data.filter((student) => {
      const matchesSearch =
        searchQuery === "" ||
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id_number.toLowerCase().includes(searchQuery.toLowerCase());

      const status = student.status || "active";
      const matchesStatus =
        statusFilter === "all" ||
        status.toLowerCase() === statusFilter;

      const matchesGrade =
        gradeFilter === "all" ||
        student.current_grade_level?.name === gradeFilter;

      return matchesSearch && matchesStatus && matchesGrade;
    });
  }, [data, searchQuery, statusFilter, gradeFilter]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [studentsToDelete, setStudentsToDelete] = React.useState<StudentDto[]>([]);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = React.useState(false);
  const [studentsToWithdraw, setStudentsToWithdraw] = React.useState<StudentDto[]>([]);
  
  const studentsApi = useStudentsApi();
  const { withdraw } = useStudentMutations();
  const user = useAuthStore((state) => state.user);

  const tableMeta = React.useMemo<StudentTableMeta>(
    () => ({ onEnroll, onFixEnrollment, onDelete, user }),
    [onEnroll, onFixEnrollment, onDelete, user]
  );

  const table = useReactTable({
    data: filteredStudents,
    columns: studentColumns,
    meta: tableMeta,
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
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 w-full md:w-[250px]"
            />
          </div>

          {/* Grade Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="w-[150px] h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors">
              <span className="truncate">
                {gradeFilter === "all" ? "All Grades" : gradeFilter}
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuCheckboxItem
                checked={gradeFilter === "all"}
                onCheckedChange={() => setGradeFilter("all")}
              >
                All Grades
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {gradeLevels.map((grade) => (
                <DropdownMenuCheckboxItem
                  key={grade}
                  checked={gradeFilter === grade}
                  onCheckedChange={() => setGradeFilter(grade)}
                >
                  {grade}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
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
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9"
          icon={<Download />}
          onClick={() => {
            exportStudentsToCSV(filteredStudents)
            showToast.success("Exported", `${filteredStudents.length} students exported to CSV`)
          }}
        >
            Export
        </Button>
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
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/students/${row.original.id_number}`)}
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
                  colSpan={studentColumns.length}
                  className="h-48"
                >
                  <EmptyState className="border-none py-6">
                    <EmptyStateIcon>
                      <Search className="size-5" />
                    </EmptyStateIcon>
                    <EmptyStateTitle className="text-base">No students found</EmptyStateTitle>
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
        
        {/* Pagination Info */}
        <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} entries
        </div>
      </div>

      {/* Floating Selection Panel */}
      <FloatingSelectionPanel
        count={Object.keys(rowSelection).length}
        onClear={() => setRowSelection({})}
        actions={[
          // Export action - always available
          {
            label: "Export",
            icon: <Download className="size-3.5" />,
            variant: "outline",
            onClick: () => {
              const selectedStudents = table.getSelectedRowModel().rows.map((r) => r.original);
              exportStudentsToCSV(
                selectedStudents,
                `students-selected-${new Date().toISOString().slice(0, 10)}.csv`
              );
              showToast.success("Exported", `${selectedStudents.length} students exported`);
            },
            shortcut: "E",
          },
          // Enroll action - only for admin, registrar, superadmin
          {
            label: `Enroll (${table.getSelectedRowModel().rows.filter((r) => !r.original.is_enrolled).length})`,
            icon: <CheckCircle2 className="size-3.5" />,
            variant: "default",
            onClick: () => {
              const selectedStudents = table.getSelectedRowModel().rows.map((r) => r.original);
              const enrollable = selectedStudents.filter((s) => !s.is_enrolled);
              if (enrollable.length === 0) {
                showToast.error("Cannot enroll", "All selected students are already enrolled");
                return;
              }
              enrollable.forEach((student) => onEnroll?.(student));
              setRowSelection({});
              showToast.success("Success", `${enrollable.length} student(s) enrolled`);
            },
            shortcut: "N",
            hidden: 
              !["admin", "registrar", "superadmin"].includes(user?.role as any) ||
              table.getSelectedRowModel().rows.filter((r) => !r.original.is_enrolled).length === 0,
          },
          // Withdraw action - only for admin, registrar, superadmin
          {
            label: `Withdraw (${table.getSelectedRowModel().rows.filter((r) => r.original.is_enrolled).length})`,
            icon: <UserX className="size-3.5" />,
            variant: "secondary",
            onClick: () => {
              const selectedStudents = table.getSelectedRowModel().rows.map((r) => r.original);
              const withdrawable = selectedStudents.filter((s) => s.is_enrolled);
              if (withdrawable.length === 0) {
                showToast.error("Cannot withdraw", "None of the selected students are enrolled");
                return;
              }
              setStudentsToWithdraw(withdrawable);
              setWithdrawDialogOpen(true);
            },
            shortcut: "W",
            hidden: 
              !["admin", "registrar", "superadmin"].includes(user?.role as any) ||
              table.getSelectedRowModel().rows.filter((r) => r.original.is_enrolled).length === 0,
          },
          // Delete action - only for admin, superadmin
          {
            label: `Delete (${table.getSelectedRowModel().rows.filter((r) => r.original.can_delete).length})`,
            icon: <Trash2 className="size-3.5" />,
            variant: "destructive",
            onClick: () => {
              const selectedStudents = table.getSelectedRowModel().rows.map((r) => r.original);
              const deletable = selectedStudents.filter((s) => s.can_delete);
              if (deletable.length === 0) {
                showToast.error("Cannot delete", "None of the selected students can be deleted");
                return;
              }
              setStudentsToDelete(deletable);
              setDeleteDialogOpen(true);
            },
            shortcut: "D",
            hidden: 
              !["admin", "superadmin"].includes(user?.role as any) ||
              table.getSelectedRowModel().rows.filter((r) => r.original.can_delete).length === 0,
          },
        ]}
      />

      {/* Withdraw Dialog */}
      {studentsToWithdraw.length === 1 ? (
        <WithdrawStudentDialog
          open={withdrawDialogOpen}
          onOpenChange={setWithdrawDialogOpen}
          student={studentsToWithdraw[0]}
          loading={withdraw.isPending}
          onConfirm={(data: { withdrawal_date: string; withdrawal_reason: string }) => {
            withdraw.mutate(
              { id: studentsToWithdraw[0].id, payload: data },
              {
                onSuccess: () => {
                  showToast.success("Success", "Student withdrawn successfully");
                  setWithdrawDialogOpen(false);
                  setRowSelection({});
                  setStudentsToWithdraw([]);
                },
                onError: (error: Error) => {
                  showToast.error("Error", error.message || "Failed to withdraw student");
                },
              }
            );
          }}
        />
      ) : studentsToWithdraw.length > 1 ? (
        <DialogBox
          open={withdrawDialogOpen}
          onOpenChange={setWithdrawDialogOpen}
          title="Bulk Withdraw Not Supported"
          description="Please withdraw students one at a time to specify individual withdrawal dates and reasons."
          actionLabel="OK"
          onAction={() => {
            setWithdrawDialogOpen(false);
            setStudentsToWithdraw([]);
          }}
          cancelLabel={false}
        />
      ) : null}

      {/* Delete Confirmation Dialog */}
      <DialogBox
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Students"
        description={
          <>
            Are you sure you want to delete <strong>{studentsToDelete.length}</strong> student(s)?
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              This action cannot be undone. All associated data will be permanently removed.
            </span>
          </>
        }
        actionLabel={`Delete ${studentsToDelete.length} Student${studentsToDelete.length !== 1 ? 's' : ''}`}
        actionVariant="destructive"
        actionLoading={false}
        onAction={() => {
          studentsToDelete.forEach((student) => {
            const deleteMutation = studentsApi.deleteStudent(student.id);
            deleteMutation.mutate(
              false,
              {
                onSuccess: () => {
                  onDelete?.(student);
                },
                onError: (error: Error) => {
                  showToast.error("Error", `Failed to delete ${student.full_name}: ${error.message}`);
                },
              }
            );
          });
          setDeleteDialogOpen(false);
          setRowSelection({});
          setStudentsToDelete([]);
          showToast.success("Success", `${studentsToDelete.length} student(s) deleted`);
        }}
      />
    </div>
  );
}
