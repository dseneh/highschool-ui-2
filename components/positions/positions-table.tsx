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
import type {
  CreateEmployeePositionCommand,
  EmployeePositionDto,
} from "@/lib/api2/employee-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { PositionFormModal } from "@/components/positions/position-form-modal";
import { DataTable } from "@/components/shared/data-table";
import { useEmployeeMutations } from "@/hooks/use-employee";

interface PositionsTableProps {
  positions: EmployeePositionDto[];
  onRefresh: () => void;
}

export const PositionsTable = ({ positions, onRefresh }: PositionsTableProps) => {
  const { removePosition, updatePosition } = useEmployeeMutations();
  const [editingPosition, setEditingPosition] = React.useState<EmployeePositionDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [teacherFilter, setTeacherFilter] = React.useState("all");

  const departmentOptions = React.useMemo(() => {
    const departments = new Set<string>();
    positions.forEach((position) => {
      if (position.departmentName) {
        departments.add(position.departmentName);
      }
    });
    return Array.from(departments).sort();
  }, [positions]);

  const typeOptions = React.useMemo(() => {
    const types = new Set<string>();
    positions.forEach((position) => {
      if (position.employmentType) {
        types.add(position.employmentType);
      }
    });
    return Array.from(types).sort();
  }, [positions]);

  const filteredPositions = React.useMemo(() => {
    return positions.filter((position) => {
      const matchesDepartment =
        departmentFilter === "all" || position.departmentName === departmentFilter;

      const matchesType =
        typeFilter === "all" || position.employmentType === typeFilter;

      const matchesTeacher =
        teacherFilter === "all" ||
        (teacherFilter === "teacher" ? position.canTeach : !position.canTeach);

      return matchesDepartment && matchesType && matchesTeacher;
    });
  }, [positions, departmentFilter, typeFilter, teacherFilter]);

  const handleDelete = async (positionId: string) => {
    if (!window.confirm("Are you sure you want to delete this position?")) {
      return;
    }

    try {
      await removePosition.mutateAsync(positionId);
      showToast.success("Deleted", "Position has been removed");
      onRefresh();
    } catch (error) {
      showToast.error("Delete failed", getErrorMessage(error));
    }
  };

  const handleEditSubmit = async (data: CreateEmployeePositionCommand) => {
    if (!editingPosition) return;

    setIsSubmitting(true);
    try {
      await updatePosition.mutateAsync({
        id: editingPosition.id,
        payload: data,
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

  const columns: ColumnDef<EmployeePositionDto>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          {row.original.code && (
            <p className="text-sm text-muted-foreground">{row.original.code}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "departmentName",
      header: "Department",
      cell: ({ row }) => row.original.departmentName || "-",
    },
    {
      accessorKey: "employmentType",
      header: "Employment Type",
      cell: ({ row }) => row.original.employmentType || "-",
    },
    {
      accessorKey: "canTeach",
      header: "Teaching",
      cell: ({ getValue }) => {
        const isTeacher = getValue<boolean>() ?? false;
        return (
          <span className={isTeacher ? "font-medium text-green-600" : "text-muted-foreground"}>
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
        <DropdownMenuTrigger className="inline-flex h-9 items-center justify-between gap-1 rounded-[min(var(--radius-md),10px)] border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-colors hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
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
        <DropdownMenuTrigger className="inline-flex h-9 items-center justify-between gap-1 rounded-[min(var(--radius-md),10px)] border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-colors hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
          <span className="truncate">
            {typeFilter === "all" ? "All Types" : typeFilter}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuCheckboxItem
            checked={typeFilter === "all"}
            onCheckedChange={() => setTypeFilter("all")}
          >
            All Types
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {typeOptions.map((employmentType) => (
            <DropdownMenuCheckboxItem
              key={employmentType}
              checked={typeFilter === employmentType}
              onCheckedChange={() => setTypeFilter(employmentType)}
            >
              {employmentType}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-9 items-center justify-between gap-1 rounded-[min(var(--radius-md),10px)] border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-colors hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
          <span className="truncate">
            {teacherFilter === "all"
              ? "All Roles"
              : teacherFilter === "teacher"
                ? "Teaching"
                : "Non-teaching"}
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
            Teaching
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={teacherFilter === "staff"}
            onCheckedChange={() => setTeacherFilter("staff")}
          >
            Non-teaching
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

