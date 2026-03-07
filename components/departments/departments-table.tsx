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
import type { Department } from "@/lib/api2/staff/types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { useStaffApi } from "@/lib/api2/staff/api";
import { useApiMutation } from "@/lib/api2/utils";
import { DepartmentFormModal } from "@/components/departments/department-form-modal";
import { DataTable } from "@/components/shared/data-table";

interface DepartmentsTableProps {
  departments: Department[];
  onRefresh: () => void;
}

export const DepartmentsTable = ({ departments, onRefresh }: DepartmentsTableProps) => {
  const api = useStaffApi();
  const deleteDepartmentMutation = useApiMutation((departmentId: string) =>
    api.deleteDepartmentApi(departmentId).then((res: { data: unknown }) => res.data)
  );
  const updateDepartmentMutation = useApiMutation(
    ({ id, data }: { id: string; data: { name: string; code?: string; description?: string } }) =>
      api.updateDepartmentApi(id, data).then((res: { data: unknown }) => res.data)
  );
  const [editingDepartment, setEditingDepartment] = React.useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDelete = async (departmentId: string) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartmentMutation.mutateAsync(departmentId);
        showToast.success("Deleted", "Department has been removed");
        onRefresh();
      } catch (error) {
        showToast.error("Delete failed", getErrorMessage(error));
      }
    }
  };

  const handleEditSubmit = async (data: {
    name: string;
    code?: string;
    description?: string;
  }) => {
    if (!editingDepartment) return;
    setIsSubmitting(true);
    try {
      await updateDepartmentMutation.mutateAsync({
        id: editingDepartment.id,
        data,
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

  const columns: ColumnDef<Department>[] = [
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
              onClick={() => handleDelete(row.original.id)}
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
    </>
  );
};
