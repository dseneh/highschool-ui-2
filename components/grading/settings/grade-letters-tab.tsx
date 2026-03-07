"use client";

import { useState } from "react";
import {
  useGradeLetters,
  useDeleteGradeLetter,
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
import { GradeLetterDialog } from "./grade-letter-dialog";
import type { GradeLetterDto } from "@/lib/api/grading-types";

export function GradeLettersTab() {
  const { data: gradeLetters, isLoading } = useGradeLetters();
  const deleteMutation = useDeleteGradeLetter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<GradeLetterDto | null>(null);

  const handleEdit = (letter: GradeLetterDto) => {
    setEditingLetter(letter);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this grade letter? This action cannot be undone."
      )
    ) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingLetter(null);
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

  if (!gradeLetters || gradeLetters.length === 0) {
    return (
      <>
        <EmptyState>
          <EmptyStateIcon>
            <HugeiconsIcon icon={Add01Icon} className="h-12 w-12" />
          </EmptyStateIcon>
          <EmptyStateTitle>No grade letters</EmptyStateTitle>
          <EmptyStateDescription>
            Define your grading scale (A, B, C, etc.)
          </EmptyStateDescription>
          <EmptyStateAction onClick={() => setDialogOpen(true)}>
            Create Grade Letter
          </EmptyStateAction>
        </EmptyState>
        <GradeLetterDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          gradeLetter={editingLetter}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
          Add Grade Letter
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Letter</TableHead>
              <TableHead>Range</TableHead>
              <TableHead>GPA Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gradeLetters.map((letter) => (
              <TableRow key={letter.id}>
                <TableCell className="font-semibold text-lg">
                  {letter.letter}
                </TableCell>
                <TableCell>
                  {letter.min_score} - {letter.max_score}%
                </TableCell>
                <TableCell>
                  {letter.gpa_value !== null ? (
                    <span className="font-medium">{letter.gpa_value.toFixed(2)}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={letter.is_passing ? "default" : "destructive"}>
                    {letter.is_passing ? "Passing" : "Failing"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {letter.description || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(letter)}>
                        <HugeiconsIcon icon={Edit02Icon} className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(letter.id)}
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

      <GradeLetterDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        gradeLetter={editingLetter}
      />
    </>
  );
}
