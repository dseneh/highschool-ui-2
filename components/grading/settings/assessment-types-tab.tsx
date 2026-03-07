"use client";

import { useState } from "react";
import {
  useAssessmentTypes,
  useCreateAssessmentType,
  useUpdateAssessmentType,
  useDeleteAssessmentType,
} from "@/hooks/use-grading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Add01Icon, MoreVerticalIcon, Edit02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateAction } from "@/components/ui/empty-state";
import { AssessmentTypeDialog } from "./assessment-type-dialog";
import type { AssessmentTypeDto } from "@/lib/api/grading-types";

export function AssessmentTypesTab() {
  const { data: assessmentTypes, isLoading } = useAssessmentTypes();
  const deleteMutation = useDeleteAssessmentType();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AssessmentTypeDto | null>(null);

  const handleEdit = (type: AssessmentTypeDto) => {
    setEditingType(type);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this assessment type? This action cannot be undone."
      )
    ) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingType(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!assessmentTypes || assessmentTypes.length === 0) {
    return (
      <>
        <EmptyState>
          <EmptyStateIcon>
            <HugeiconsIcon icon={Add01Icon} className="h-12 w-12" />
          </EmptyStateIcon>
          <EmptyStateTitle>No assessment types</EmptyStateTitle>
          <EmptyStateDescription>Create assessment types like Quiz, Exam, Project, etc.</EmptyStateDescription>
          <EmptyStateAction onClick={() => setDialogOpen(true)}>Create Assessment Type</EmptyStateAction>
        </EmptyState>
        <AssessmentTypeDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          assessmentType={editingType}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
          Add Type
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessmentTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {type.code}
                  </code>
                </TableCell>
                <TableCell>{type.weight}%</TableCell>
                <TableCell>
                  {type.color && (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {type.color}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={type.is_active ? "default" : "secondary"}>
                    {type.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(type)}>
                        <HugeiconsIcon icon={Edit02Icon} className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(type.id)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AssessmentTypeDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        assessmentType={editingType}
      />
    </>
  );
}
