"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { AccountingAdvancedTable } from "@/components/accounting/accounting-advanced-table";
import { AdvancedTableColumnHeader } from "@/components/shared/advanced-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEmployeeAttendanceMutations } from "@/hooks/use-employee-attendance";
import type { EmployeeDto } from "@/lib/api2/employee-types";
import type {
  CreateEmployeeAttendanceCommand,
  EmployeeAttendanceDto,
} from "@/lib/api2/employee-attendance-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { EmployeeAttendanceFormModal } from "./employee-attendance-form-modal";
import AlertDialogBox from "@/components/shared/alert-dialogbox";

interface EmployeeAttendanceTableProps {
  records: EmployeeAttendanceDto[];
  employees: EmployeeDto[];
  onRefresh: () => void;
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string | null) {
  if (!value) return "--";
  return value.slice(0, 5);
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === "present") return <Badge>Present</Badge>;
  if (normalized === "late") return <Badge variant="secondary">Late</Badge>;
  if (normalized === "absent") return <Badge variant="destructive">Absent</Badge>;
  if (normalized === "remote") return <Badge variant="outline">Remote</Badge>;
  return <Badge variant="outline">On Leave</Badge>;
}

export function EmployeeAttendanceTable({ records, employees, onRefresh }: EmployeeAttendanceTableProps) {
  const { remove, update } = useEmployeeAttendanceMutations();
  const [editingRecord, setEditingRecord] = React.useState<EmployeeAttendanceDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget);
      showToast.success("Deleted", "Attendance record removed successfully");
      onRefresh();
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    }
  };

  const employeeFilterOptions = React.useMemo(
    () =>
      Array.from(new Map(records.map((record) => [record.employeeId, record.employeeName])).entries()).map(
        ([value, label]) => ({ value, label })
      ),
    [records]
  );

  const handleEditSubmit = async (payload: CreateEmployeeAttendanceCommand) => {
    if (!editingRecord) return;

    setIsSubmitting(true);
    try {
      await update.mutateAsync({ id: editingRecord.id, payload });
      showToast.success("Updated", "Attendance record updated successfully");
      setEditingRecord(null);
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<EmployeeAttendanceDto>[] = [
    {
      accessorKey: "employeeName",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Employee" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          <p className="text-sm text-muted-foreground">{row.original.employeeNumber || "No employee number"}</p>
        </div>
      ),
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;
        return value.includes(row.original.employeeId);
      },
      meta: {
        displayName: "Employee",
        filterType: "checkbox",
        filterOptions: employeeFilterOptions,
        filterSummaryMode: "count",
      } as never,
    },
    {
      accessorKey: "attendanceDate",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => formatDate(row.original.attendanceDate),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Status",
        filterType: "select",
        filterOptions: [
          { label: "Present", value: "Present" },
          { label: "Late", value: "Late" },
          { label: "Absent", value: "Absent" },
          { label: "Remote", value: "Remote" },
          { label: "On Leave", value: "On Leave" },
        ],
      } as never,
    },
    {
      id: "timeRange",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Time" />,
      cell: ({ row }) => `${formatTime(row.original.checkInTime)} - ${formatTime(row.original.checkOutTime)}`,
    },
    {
      accessorKey: "hoursWorked",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Hours" />,
      cell: ({ row }) => row.original.hoursWorked.toFixed(2),
    },
    {
      accessorKey: "notes",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Notes" />,
      cell: ({ row }) => row.original.notes || "--",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" icon={<MoreVertical />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={editingRecord?.id === row.original.id}
              onClick={() => setEditingRecord(row.original)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={false}
              onClick={() => setDeleteTarget(row.original.id)}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <AccountingAdvancedTable
        columns={columns}
        data={records}
        noData={records.length === 0}
        emptyStateTitle="No Attendance Records"
        emptyStateDescription="There are no attendance records to display."
        pageSize={10}
        searchPlaceholder="Search attendance records..."
        searchPredicate={(row, normalizedSearch) =>
          row.employeeName.toLowerCase().includes(normalizedSearch) ||
          (row.employeeNumber || "").toLowerCase().includes(normalizedSearch) ||
          row.status.toLowerCase().includes(normalizedSearch) ||
          (row.notes || "").toLowerCase().includes(normalizedSearch)
        }
      />

      <EmployeeAttendanceFormModal
        open={Boolean(editingRecord)}
        onOpenChange={(open) => {
          if (!open) setEditingRecord(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        employees={employees}
        initialData={editingRecord ?? undefined}
      />

      <AlertDialogBox
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Attendance Record"
        description="Are you sure you want to delete this attendance record? This action cannot be undone."
        actionLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
