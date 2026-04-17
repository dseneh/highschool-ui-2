"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Trash } from "lucide-react";
import type {
  CreateEmployeeDepartmentCommand,
  EmployeeDepartmentDto,
} from "@/lib/api2/employee-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { DepartmentFormModal } from "@/components/departments/department-form-modal";
import { DataTable } from "@/components/shared/data-table";
import { useEmployeeMutations } from "@/hooks/use-employee";
import AlertDialogBox from "@/components/shared/alert-dialogbox";

interface DepartmentsTableProps {
  departments: EmployeeDepartmentDto[];
  onRefresh: () => void;
}

export const DepartmentsTable = ({ departments, onRefresh }: DepartmentsTableProps) => {
  const { removeDepartment, updateDepartment } = useEmployeeMutations();
  const [editingDepartment, setEditingDepartment] = React.useState<EmployeeDepartmentDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeDepartment.mutateAsync(deleteTarget);
      showToast.success("Deleted", "Department has been removed");
      onRefresh();
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    }
  };

  const handleEditSubmit = async (data: CreateEmployeeDepartmentCommand) => {
    if (!editingDepartment) return;
    setIsSubmitting(true);
    try {
      await updateDepartment.mutateAsync({
        id: editingDepartment.id,
        payload: data,
      });
      showToast.success("Updated", "Department updated successfully");
      setEditingDepartment(null);
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<EmployeeDepartmentDto>[] = [
    {
      accessorKey: "name",
      header: "Department Name",
      cell: ({ getValue }) => (
        <p className="font-medium">{getValue<string>()}</p>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ getValue }) => getValue<string | null | undefined>() || "-",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }) => getValue<string | null | undefined>() || "-",
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
              checked={editingDepartment?.id === row.original.id}
              onClick={() => setEditingDepartment(row.original)}
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
              <Trash className="h-4 w-4" />
              Delete
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={departments}
        searchKey="name"
        searchPlaceholder="Search departments..."
        pageSize={10}
        showPagination={departments.length > 10}
      />

      <DepartmentFormModal
        open={Boolean(editingDepartment)}
        onOpenChange={(open) => {
          if (!open) setEditingDepartment(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        initialData={editingDepartment ?? undefined}
      />

      <AlertDialogBox
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Department"
        description="Are you sure you want to delete this department? This action cannot be undone."
        actionLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
};
