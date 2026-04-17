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
import { useEmployeeWorkflowTaskMutations } from "@/hooks/use-employee-workflow";
import type { EmployeeDto } from "@/lib/api2/employee-types";
import type {
  CreateEmployeeWorkflowTaskCommand,
  EmployeeWorkflowTaskDto,
} from "@/lib/api2/employee-workflow-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { EmployeeWorkflowFormModal } from "./employee-workflow-form-modal";

interface EmployeeWorkflowTableProps {
  tasks: EmployeeWorkflowTaskDto[];
  employees: EmployeeDto[];
  onRefresh: () => void;
}

function formatDate(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function WorkflowBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  if (normalized === "offboarding") return <Badge variant="destructive">Offboarding</Badge>;
  return <Badge variant="outline">Onboarding</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return <Badge>Completed</Badge>;
  if (normalized === "in progress") return <Badge variant="secondary">In Progress</Badge>;
  if (normalized === "blocked") return <Badge variant="destructive">Blocked</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}

export function EmployeeWorkflowTable({ tasks, employees, onRefresh }: EmployeeWorkflowTableProps) {
  const { remove, update } = useEmployeeWorkflowTaskMutations();
  const [editingTask, setEditingTask] = React.useState<EmployeeWorkflowTaskDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const employeeFilterOptions = React.useMemo(
    () =>
      Array.from(new Map(tasks.map((task) => [task.employeeId, task.employeeName])).entries()).map(
        ([value, label]) => ({ value, label })
      ),
    [tasks]
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this workflow task?")) {
      return;
    }

    try {
      await remove.mutateAsync(id);
      showToast.success("Deleted", "Workflow task removed successfully");
      onRefresh();
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    }
  };

  const handleEditSubmit = async (payload: CreateEmployeeWorkflowTaskCommand) => {
    if (!editingTask) return;

    setIsSubmitting(true);
    try {
      await update.mutateAsync({ id: editingTask.id, payload });
      showToast.success("Updated", "Workflow task updated successfully");
      setEditingTask(null);
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<EmployeeWorkflowTaskDto>[] = [
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
      accessorKey: "title",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Task" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-sm text-muted-foreground">{row.original.category}</p>
        </div>
      ),
    },
    {
      accessorKey: "workflowType",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Workflow" />,
      cell: ({ row }) => <WorkflowBadge value={row.original.workflowType} />,
      filterFn: (row, id, value) => {
        if (!value) return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
      meta: {
        displayName: "Workflow",
        filterType: "select",
        filterOptions: [
          { label: "Onboarding", value: "Onboarding" },
          { label: "Offboarding", value: "Offboarding" },
        ],
      } as never,
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Due" />,
      cell: ({ row }) => (
        <div>
          <p>{formatDate(row.original.dueDate)}</p>
          {row.original.isOverdue ? <p className="text-xs text-red-500">Overdue</p> : null}
        </div>
      ),
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
          { label: "Pending", value: "Pending" },
          { label: "In Progress", value: "In Progress" },
          { label: "Completed", value: "Completed" },
          { label: "Blocked", value: "Blocked" },
        ],
      } as never,
    },
    {
      accessorKey: "assignedToName",
      header: ({ column }) => <AdvancedTableColumnHeader column={column} title="Assigned To" />,
      cell: ({ row }) => row.original.assignedToName || "--",
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
              checked={editingTask?.id === row.original.id}
              onClick={() => setEditingTask(row.original)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={false}
              onClick={() => handleDelete(row.original.id)}
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
        data={tasks}
        pageSize={10}
        searchPlaceholder="Search workflow tasks..."
        searchPredicate={(row, normalizedSearch) =>
          row.employeeName.toLowerCase().includes(normalizedSearch) ||
          (row.employeeNumber || "").toLowerCase().includes(normalizedSearch) ||
          row.title.toLowerCase().includes(normalizedSearch) ||
          row.workflowType.toLowerCase().includes(normalizedSearch) ||
          row.category.toLowerCase().includes(normalizedSearch) ||
          row.status.toLowerCase().includes(normalizedSearch) ||
          (row.assignedToName || "").toLowerCase().includes(normalizedSearch)
        }
      />

      <EmployeeWorkflowFormModal
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        employees={employees}
        initialData={editingTask ?? undefined}
      />
    </>
  );
}
