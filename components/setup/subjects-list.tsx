/**
 * SubjectsList Component
 * Displays subjects assigned to a section with grid/list view toggle
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import { useSectionSubjects, useRemoveSectionSubject } from "@/hooks/use-section-subjects";
import type { SectionDto } from "@/lib/api/section-types";
import { toast } from "sonner";
import { Trash2, Plus, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogBox } from "@/components/ui/dialog-box";
import { getErrorMessage } from "@/lib/utils";

interface SubjectsListProps {
  section: SectionDto;
  onAddSubject: (sectionId: string, sectionName: string) => void;
}

export function SubjectsList({ section, onAddSubject }: SubjectsListProps) {
  const [deletingSubject, setDeletingSubject] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: sectionSubjects, isLoading } = useSectionSubjects(section.id);
  const removeSubject = useRemoveSectionSubject();

  const handleDeleteSubject = () => {
    if (!deletingSubject) return;

    removeSubject.mutate(
      {
        sectionId: section.id,
        subjectId: deletingSubject.id,
      },
      {
        onSuccess: () => {
          toast.success("Subject removed from section");
          setDeletingSubject(null);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4 border-l-2 border-muted">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-l-2 border-muted">
        <div className="flex items-center justify-between mb-4">
          <h6 className="text-sm font-semibold">
            Subjects ({sectionSubjects?.length || 0})
          </h6>
          <Button
            size="sm"
            variant="outline"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => onAddSubject(section.id, section.name)}
          >
            Add Subjects
          </Button>
        </div>

        {!sectionSubjects || sectionSubjects.length === 0 ? (
          <EmptyState className="py-8">
            <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <EmptyStateTitle>No subjects assigned</EmptyStateTitle>
            <EmptyStateDescription>
              Add subjects to this section to start tracking grades.
            </EmptyStateDescription>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectionSubjects.map((sectionSubject) => (
              <Card
                key={sectionSubject.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h6 className="font-medium text-sm mb-1">
                      {sectionSubject.subject.name}
                    </h6>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="h-3 w-3" />}
                    onClick={() =>
                      setDeletingSubject({
                        id: sectionSubject.id,
                        name: sectionSubject.subject.name,
                      })
                    }
                    className="text-destructive hover:text-destructive"
                  />
                </div>
                {/* {sectionSubject.subject.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {sectionSubject.subject.description}
                  </p>
                )} */}
              </Card>
            ))}
          </div>
        )}
      </div>

      <DialogBox
        open={!!deletingSubject}
        onOpenChange={(open: boolean) => !open && setDeletingSubject(null)}
        title="Remove Subject"
        description={`Are you sure you want to remove "${deletingSubject?.name}" from this section?`}
        onAction={handleDeleteSubject}
        actionVariant="destructive"
        actionLoading={removeSubject.isPending}
        actionLabel="Remove"
      />
    </>
  );
}
