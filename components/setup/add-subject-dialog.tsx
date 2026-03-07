/**
 * AddSubjectDialog Component
 * Full-screen dialog for managing section subjects
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSubjects } from "@/hooks/use-subject";
import { useSectionSubjects, useAssignSubjects, useRemoveSectionSubject } from "@/hooks/use-section-subjects";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { Search, BookOpen, Plus, Trash2, Check, Circle, Info } from "lucide-react";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogBox } from "@/components/ui/dialog-box";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionName: string;
}

export function AddSubjectDialog({
  open,
  onOpenChange,
  sectionId,
  sectionName,
}: AddSubjectDialogProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: allSubjects, isLoading: subjectsLoading } = useSubjects();
  const { data: sectionSubjects, isLoading: sectionSubjectsLoading } =
    useSectionSubjects(sectionId);
  const assignSubjects = useAssignSubjects();
  const removeSubject = useRemoveSectionSubject();

  // Debug logging
  useEffect(() => {
    if (open) {
      console.log("AddSubjectDialog opened", {
        sectionId,
        sectionName,
        allSubjects: allSubjects?.length || 0,
        allSubjectsData: allSubjects,
        sectionSubjects: sectionSubjects?.length || 0,
        sectionSubjectsData: sectionSubjects,
        subjectsLoading,
        sectionSubjectsLoading,
      });
    }
  }, [open, sectionId, sectionName, allSubjects, sectionSubjects, subjectsLoading, sectionSubjectsLoading]);

  const handleRemoveSubject = () => {
    if (!deleteTarget) return;

    removeSubject.mutate(
      { sectionId, sectionSubjectId: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success(`${deleteTarget.name} removed from section`);
          setDeleteTarget(null);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const getDeleteConfirmationText = () => {
    if (!deleteTarget) return "";
    const subject = sectionSubjects?.find((ss) => ss.id === deleteTarget.id);
    if (subject && !subject.can_delete) {
      return `Cannot delete "${deleteTarget.name}" - grades have been entered for this subject. You must remove all grades first.`;
    }
    return `Remove "${deleteTarget.name}" from this section? Associated gradebook entries will be deleted.`;
  };

  // Get available subjects (excluding already assigned ones)
  const availableSubjects = useMemo(() => {
    if (!allSubjects) {
      console.log("No allSubjects available");
      return [];
    }
    
    if (!sectionSubjects) {
      console.log("No sectionSubjects data yet, showing all subjects");
      // If section subjects haven't loaded yet, show all active subjects
      return allSubjects.filter((subject) => {
        const matchesSearch =
          !searchTerm ||
          subject.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && subject.active;
      });
    }

    const assignedSubjectIds = sectionSubjects.map((ss) => ss.subject.id);
    console.log("Assigned subject IDs:", assignedSubjectIds);

    const filtered = allSubjects.filter((subject) => {
      const notAssigned = !assignedSubjectIds.includes(subject.id);
      const matchesSearch =
        !searchTerm ||
        subject.name.toLowerCase().includes(searchTerm.toLowerCase());

      return notAssigned && matchesSearch && subject.active;
    });
    
    console.log("Available subjects after filtering:", filtered.length);
    return filtered;
  }, [allSubjects, sectionSubjects, searchTerm]);

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleAssign = () => {
    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    assignSubjects.mutate(
      {
        sectionId,
        payload: { subjects: selectedSubjects },
      },
      {
        onSuccess: (response) => {
          const count = response.created_count ?? response.section_subjects?.length ?? 0;
          const gradebooksCreated = response.gradebooks?.created || 0;

          const fallbackMessage =
            count > 0
              ? `${count} subject${count !== 1 ? "s" : ""} added successfully${
                  gradebooksCreated > 0
                    ? ` with ${gradebooksCreated} gradebook${
                        gradebooksCreated !== 1 ? "s" : ""
                      } created`
                    : ""
                }`
              : response.message || "No new subjects were added";

          toast.success(fallbackMessage);
          
          setSelectedSubjects([]);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedSubjects([]);
    setSearchTerm("");
    onOpenChange(false);
  };

  const hasCurrentSubjects = sectionSubjects && sectionSubjects.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 gap-y-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b bg-linear-to-r from-primary/5 to-transparent">
          <DialogTitle className="text-md font-bold">Manage Subjects for {sectionName}</DialogTitle>
          <DialogDescription className="">
            Add or remove subjects taught in this section. Grade books are automatically created when you add subjects.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
            {/* Left Column: Currently Assigned Subjects */}
            <div className="border-r">
              <CardHeader className="border-b bg-muted/30 gap-0 mb-0 pt-3 pb-2! rounded-none">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Active Subjects
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {sectionSubjects?.length || 0}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Currently being taught in this section
                </CardDescription>
              </CardHeader>
              <div className="p-4 overflow-auto" style={{ height: 'calc(85vh - 220px)' }}>
                {sectionSubjectsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : !hasCurrentSubjects ? (
                  <EmptyState className="border-none py-16">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <EmptyStateTitle className="text-base">No subjects yet</EmptyStateTitle>
                    <EmptyStateDescription className="text-sm">
                      Add subjects from the right panel
                    </EmptyStateDescription>
                  </EmptyState>
                ) : (
                  <TooltipProvider>
                    <div className="rounded-lg border border-green-200 bg-white overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-green-50/50 border-b border-green-200">
                          <tr>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-green-900">Subject Name</th>
                            <th className="text-center py-2 px-3 text-xs font-semibold text-green-900 w-20">Info</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-green-900 w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectionSubjects.map((ss) => (
                            <tr key={ss.id} className="group border-b border-green-100 last:border-b-0 hover:bg-green-50/50 transition-colors">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                    <Check className="h-3.5 w-3.5 text-green-600" strokeWidth={3} />
                                  </div>
                                  <span className="font-medium text-sm text-foreground truncate">
                                    {ss.subject.name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                {ss.subject.description ? (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="h-4 w-4 text-muted-foreground inline-block cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                      <p className="text-xs">{ss.subject.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null}
                              </td>
                              <td className="py-3 px-3 text-right">
                                {!ss.can_delete ? (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 text-destructive/50 cursor-not-allowed opacity-50 hover:bg-transparent hover:text-destructive/50"
                                        disabled
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="bg-destructive text-destructive-foreground">
                                      <p className="text-xs">Cannot delete: grades have been entered for this subject</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setDeleteTarget({ id: ss.id, name: ss.subject.name })}
                                    disabled={removeSubject.isPending}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* Right Column: Available Subjects to Add */}
            <div>
              <CardHeader className="border-b bg-muted/30 gap-0 mb-0 pt-3 pb-2! rounded-none">
                <CardTitle className="flex items-center justify-between ">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Subjects
                  </span>
                  {selectedSubjects.length > 0 && (
                    <Badge variant="default" className="ml-2">
                      {selectedSubjects.length} selected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Click to select subjects to add
                </CardDescription>
              </CardHeader>
              <div className="p-4 space-y-3" style={{ height: 'calc(85vh - 220px)', overflow: 'auto' }}>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Subject List */}
                <div className="space-y-1">
                  {subjectsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : availableSubjects.length === 0 ? (
                    <EmptyState className="border-none py-16">
                      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <EmptyStateTitle className="text-base">
                        {searchTerm ? "No matches found" : "No subjects available"}
                      </EmptyStateTitle>
                      <EmptyStateDescription className="text-sm">
                        {searchTerm
                          ? "Try different search terms"
                          : "All subjects have been added"}
                      </EmptyStateDescription>
                    </EmptyState>
                  ) : (
                    <TooltipProvider>
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/30 border-b">
                            <tr>
                              <th className="text-center py-2 px-3 text-xs font-semibold text-foreground w-16">Select</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-foreground">Subject Name</th>
                              <th className="text-center py-2 px-3 text-xs font-semibold text-foreground w-20">Info</th>
                            </tr>
                          </thead>
                          <tbody>
                            {availableSubjects.map((subject) => {
                              const isSelected = selectedSubjects.includes(subject.id);
                              return (
                                <tr 
                                  key={subject.id}
                                  className={cn(
                                    "group border-b last:border-b-0 cursor-pointer transition-all duration-200",
                                    isSelected
                                      ? "bg-primary/5 border-primary/20"
                                      : "hover:bg-accent border-border"
                                  )}
                                  onClick={() => handleToggleSubject(subject.id)}
                                >
                                  <td className="py-3 px-3 text-center">
                                    <div className="inline-flex items-center justify-center">
                                      <div className="h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all"
                                        style={{
                                          borderColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                                          backgroundColor: isSelected ? 'hsl(var(--primary))' : 'transparent'
                                        }}
                                      >
                                        {isSelected ? (
                                          <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
                                        ) : (
                                          <Circle className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={cn(
                                      "font-medium text-sm truncate block",
                                      isSelected ? "text-primary" : "text-foreground"
                                    )}>
                                      {subject.name}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    {subject.description ? (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-4 w-4 text-muted-foreground inline-block cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-xs">
                                          <p className="text-xs">{subject.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : null}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-linear-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {selectedSubjects.length === 0 ? (
                <span className="text-muted-foreground">Select subjects from the right panel to add them</span>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-semibold">
                    {selectedSubjects.length}
                  </Badge>
                  <span className="text-muted-foreground">
                    subject{selectedSubjects.length !== 1 ? "s" : ""} selected •
                  </span>
                  <span className="text-foreground font-medium">
                    {selectedSubjects.length} gradebook{selectedSubjects.length !== 1 ? "s" : ""} will be created
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                onClick={handleAssign}
                disabled={selectedSubjects.length === 0 || assignSubjects.isPending}
                loading={assignSubjects.isPending}
                icon={<Plus className="h-4 w-4" />}
                className="min-w-32"
              >
                Add {selectedSubjects.length > 0 ? `${selectedSubjects.length} ` : ""}Subject{selectedSubjects.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>

        <DialogBox
          open={!!deleteTarget}
          onOpenChange={(nextOpen) => !nextOpen && setDeleteTarget(null)}
          title="Remove Subject"
          description={getDeleteConfirmationText()}
          onAction={handleRemoveSubject}
          actionVariant="destructive"
          actionLabel="Remove"
          actionLoading={removeSubject.isPending}
          cancelLabel="Cancel"
          actionDisabled={deleteTarget ? !sectionSubjects?.find((ss) => ss.id === deleteTarget.id)?.can_delete : false}
        />
      </DialogContent>
    </Dialog>
  );
}
