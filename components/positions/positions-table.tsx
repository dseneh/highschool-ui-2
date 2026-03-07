"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Trash, ChevronDown } from "lucide-react";
import type { Position } from "@/lib/api2/staff/types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { useStaffApi } from "@/lib/api2/staff/api";
import { useApiMutation } from "@/lib/api2/utils";
import { PositionFormModal } from "@/components/positions/position-form-modal";
import { DataTable } from "@/components/shared/data-table";

interface PositionsTableProps {
  positions: Position[];
  onRefresh: () => void;
}

export const PositionsTable = ({ positions, onRefresh }: PositionsTableProps) => {
  const api = useStaffApi();
  const deletePositionMutation = useApiMutation((positionId: string) =>
    api.deletePositionApi(positionId).then((res: { data: unknown }) => res.data)
  );
  const updatePositionMutation = useApiMutation(
    ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updatePositionApi(id, data).then((res: { data: unknown }) => res.data)
  );
  const [editingPosition, setEditingPosition] = React.useState<Position | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [teacherFilter, setTeacherFilter] = React.useState("all");

  const departmentOptions = React.useMemo(() => {
    const departments = new Set<string>();
    positions.forEach((pos) => {
      if (pos.department?.name) departments.add(pos.department.name);
    });
    return Array.from(departments).sort();
  }, [positions]);

  const categoryOptions = React.useMemo(() => {
    const categories = new Set<string>();
    positions.forEach((pos) => {
      if (pos.category?.name) categories.add(pos.category.name);
    });
    return Array.from(categories).sort();
  }, [positions]);

  const filteredPositions = React.useMemo(() => {
    return positions.filter((position) => {
      const matchesDepartment =
        departmentFilter === "all" || position.department?.name === departmentFilter;

      const matchesCategory =
        categoryFilter === "all" || position.category?.name === categoryFilter;

      const matchesTeacher =
        teacherFilter === "all" ||
        (teacherFilter === "teacher" ? position.teaching_role : !position.teaching_role);

      return matchesDepartment && matchesCategory && matchesTeacher;
    });
  }, [positions, departmentFilter, categoryFilter, teacherFilter]);

  const handleDelete = async (positionId: string) => {
    if (window.confirm("Are you sure you want to delete this position?")) {
      try {
        await deletePositionMutation.mutateAsync(positionId);
        showToast.success("Deleted", "Position has been removed");
        onRefresh();
      } catch (error) {
        showToast.error("Delete failed", getErrorMessage(error));
      }
    }
  };

  const handleEditSubmit = async (data: {
    title: string;
    description?: string;
    department?: string;
    category?: string;
    teaching_role?: boolean;
  }) => {
    if (!editingPosition) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        department: data.department || null,
        category: data.category || null,
      };
      await updatePositionMutation.mutateAsync({
        id: editingPosition.id,
        data: payload,
      });
      showToast.success("Updated", "Position updated successfully");
      setEditingPosition(null);
      onRefresh();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Position>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ getValue, row }) => (
        <div>
          <p className="font-medium">{getValue<string>()}</p>
          {row.original.description && (
            <p className="text-sm text-muted-foreground">{row.original.description}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "department.name",
      header: "Department",
      cell: ({ row }) => row.original.department?.name || "-",
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => row.original.category?.name || "-",
    },
    {
      accessorKey: "teaching_role",
      header: "Teacher",
      cell: ({ getValue }) => {
        const isTeacher = getValue<boolean>() ?? false;
        return (
          <span className={isTeacher ? "text-green-600 font-medium" : "text-muted-foreground"}>
            {isTeacher ? "Yes" : "No"}
          </span>
        );
      },
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
              checked={editingPosition?.id === row.original.id}
              onClick={() => setEditingPosition(row.original)}
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

  const filters = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors">
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
          {departmentOptions.map((dept) => (
            <DropdownMenuCheckboxItem
              key={dept}
              checked={departmentFilter === dept}
              onCheckedChange={() => setDepartmentFilter(dept)}
            >
              {dept}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors">
          <span className="truncate">
            {categoryFilter === "all" ? "All Categories" : categoryFilter}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuCheckboxItem
            checked={categoryFilter === "all"}
            onCheckedChange={() => setCategoryFilter("all")}
          >
            All Categories
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {categoryOptions.map((cat) => (
            <DropdownMenuCheckboxItem
              key={cat}
              checked={categoryFilter === cat}
              onCheckedChange={() => setCategoryFilter(cat)}
            >
              {cat}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 border border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs text-sm font-medium inline-flex items-center justify-between transition-colors">
          <span className="truncate">
            {teacherFilter === "all"
              ? "All Roles"
              : teacherFilter === "teacher"
                ? "Teachers"
                : "Non-teachers"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuCheckboxItem
            checked={teacherFilter === "all"}
            onCheckedChange={() => setTeacherFilter("all")}
          >
            All Roles
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={teacherFilter === "teacher"}
            onCheckedChange={() => setTeacherFilter("teacher")}
          >
            Teachers
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={teacherFilter === "staff"}
            onCheckedChange={() => setTeacherFilter("staff")}
          >
            Non-teachers
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
  return (
    <>
      <DataTable
        columns={columns}
        data={filteredPositions}
        searchKey="title"
        searchPlaceholder="Search positions..."
        filters={filters}
        pageSize={10}
      />

      <PositionFormModal
        open={Boolean(editingPosition)}
        onOpenChange={(open) => {
          if (!open) setEditingPosition(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        initialData={editingPosition ?? undefined}
      />
    </>
  );
};

