"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogBox } from "@/components/ui/dialog-box";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GradeLevelSelect } from "@/components/shared/data-reusable";
import { useSections } from "@/hooks/use-section";
import { useStaff } from "@/lib/api2/staff";
import { useStaffApi } from "@/lib/api2/staff/api";
import { getQueryClient } from "@/lib/query-client";
import { getErrorMessage } from "@/lib/utils";
import { Check, Circle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EmptyStateComponent from "../shared/empty-state";

interface AssignTeacherSectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  teacherName: string;
  onSuccess?: () => void;
}

interface TeacherSectionAssignmentItem {
  id: string;
  sectionId: string;
  sectionName: string;
  gradeLevelName: string;
}

function getList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) return results as T[];
  }
  return [];
}

function parseTeacherSectionAssignments(data: unknown): TeacherSectionAssignmentItem[] {
  const rows = getList<Record<string, unknown>>(data);

  return rows
    .map((row) => {
      const sectionRaw = row.section;
      const sectionObj =
        sectionRaw && typeof sectionRaw === "object"
          ? (sectionRaw as Record<string, unknown>)
          : null;

      const sectionId =
        typeof sectionObj?.id === "string"
          ? sectionObj.id
          : typeof row.section === "string"
            ? row.section
            : "";

      const sectionName =
        typeof sectionObj?.name === "string"
          ? sectionObj.name
          : "Unnamed Section";

      const gradeLevelRaw = sectionObj?.grade_level;
      const gradeLevelName =
        gradeLevelRaw && typeof gradeLevelRaw === "object"
          ? ((gradeLevelRaw as Record<string, unknown>).name as string | undefined) ??
            "-"
          : "-";

      const id = typeof row.id === "string" ? row.id : "";
      return {
        id,
        sectionId,
        sectionName,
        gradeLevelName,
      };
    })
    .filter((item) => item.id && item.sectionId);
}

export function AssignTeacherSectionsDialog({
  open,
  onOpenChange,
  teacherId,
  teacherName,
  onSuccess,
}: AssignTeacherSectionsDialogProps) {
  const [gradeLevelId, setGradeLevelId] = React.useState("");
  const [selectedSectionIds, setSelectedSectionIds] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [removeTarget, setRemoveTarget] = React.useState<TeacherSectionAssignmentItem | null>(
    null
  );

  const staffApi = useStaff();
  const rawApi = useStaffApi();
  const queryClient = getQueryClient();

  const { data: sections = [], isLoading: sectionsLoading } = useSections(
    gradeLevelId || undefined
  );

  const { data: currentAssignmentsData, isLoading: currentAssignmentsLoading } =
    staffApi.getTeacherSections(
      { teacher: teacherId, page_size: 1000 },
      { enabled: open && Boolean(teacherId) }
    );

  const currentAssignments = React.useMemo(
    () => parseTeacherSectionAssignments(currentAssignmentsData),
    [currentAssignmentsData]
  );

  const assignedSectionIds = React.useMemo(
    () => new Set(currentAssignments.map((item) => item.sectionId)),
    [currentAssignments]
  );

  const filteredAvailableSections = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return sections.filter((section) => {
      if (assignedSectionIds.has(section.id)) return false;
      if (!section.active) return false;

      if (!query) return true;
      return section.name.toLowerCase().includes(query);
    });
  }, [sections, search, assignedSectionIds]);

  const createAssignment = useMutation({
    mutationFn: (payload: { teacher: string; section: string }) =>
      rawApi.createTeacherSectionApi(payload).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teacher-sections"] });
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
      onSuccess?.();
    },
  });

  const removeAssignment = useMutation({
    mutationFn: (assignmentId: string) =>
      rawApi.deleteTeacherSectionApi(assignmentId).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teacher-sections"] });
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
      onSuccess?.();
    },
  });

  React.useEffect(() => {
    if (!open) {
      setGradeLevelId("");
      setSelectedSectionIds([]);
      setSearch("");
      setRemoveTarget(null);
    }
  }, [open]);

  const toggleSelection = (sectionId: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleAssignSelected = async () => {
    if (!teacherId) return;
    if (selectedSectionIds.length === 0) {
      toast.error("Select at least one section.");
      return;
    }

    const existing = assignedSectionIds;
    const toAssign = selectedSectionIds.filter((id) => !existing.has(id));
    const skipped = selectedSectionIds.length - toAssign.length;

    if (toAssign.length === 0) {
      toast.success(`No new assignments. Skipped ${skipped} existing assignment(s).`);
      return;
    }

    const results = await Promise.allSettled(
      toAssign.map((sectionId) =>
        createAssignment.mutateAsync({ teacher: teacherId, section: sectionId })
      )
    );

    const created = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - created;

    if (failed > 0) {
      toast.error(`Assigned ${created}. Failed ${failed}. ${skipped > 0 ? `Skipped ${skipped}.` : ""}`);
    } else {
      toast.success(`Assigned ${created} section(s). ${skipped > 0 ? `Skipped ${skipped} duplicate(s).` : ""}`);
    }

    setSelectedSectionIds([]);
  };

  const handleRemove = async () => {
    if (!removeTarget) return;

    try {
      await removeAssignment.mutateAsync(removeTarget.id);
      toast.success(`Removed ${removeTarget.sectionName} from teacher assignments.`);
      setRemoveTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <DialogBox
        open={open}
        onOpenChange={onOpenChange}
        title={`Assign Classes: ${teacherName}`}
        description="Add or remove section assignments for this teacher."
        className="max-w-6xl"
        cancelLabel="Close"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border">
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Current Class Assignments</span>
                <Badge variant="secondary">{currentAssignments.length}</Badge>
              </CardTitle>
              <CardDescription>Classes currently assigned</CardDescription>
            </CardHeader>

            <div className="max-h-95 space-y-2 overflow-auto p-3">
              {currentAssignmentsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-11 w-full" />
                  ))}
                </div>
              ) : currentAssignments.length === 0 ? (
                <EmptyStateComponent
                  title="No classes assigned"
                  description="Assign classes from the right panel."
                />
              ) : (
                currentAssignments.map((item) => {
                  const sectionName = typeof item.sectionName === 'string' ? item.sectionName : String(item.sectionName || 'Unknown');
                  const gradeLevelName = typeof item.gradeLevelName === 'string' ? item.gradeLevelName : String(item.gradeLevelName || '-');
                  
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{sectionName}</p>
                        <p className="text-xs text-muted-foreground">{gradeLevelName}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setRemoveTarget(item)}
                        disabled={removeAssignment.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-lg border">
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Add Classes</span>
                <Badge>{selectedSectionIds.length} selected</Badge>
              </CardTitle>
              <CardDescription>
                Pick a grade level, then select one or more sections.
              </CardDescription>
            </CardHeader>

            <div className="space-y-3 p-3">
              <GradeLevelSelect
                useUrlState={false}
                value={gradeLevelId}
                onChange={(value) => setGradeLevelId(String(value || ""))}
                placeholder="Select grade level"
                noTitle
              />

              {/* <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search sections"
                  className="pl-8"
                />
              </div> */}

              <div className="max-h-63.75 space-y-2 overflow-auto rounded-md border p-2">
                {!gradeLevelId ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    Select a grade level to view sections.
                  </p>
                ) : sectionsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-10 w-full" />
                    ))}
                  </div>
                ) : filteredAvailableSections.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    No available sections for this grade level.
                  </p>
                ) : (
                  filteredAvailableSections.map((section) => {
                    const selected = selectedSectionIds.includes(section.id);
                    const sectionName = typeof section.name === 'string' ? section.name : String(section.name || 'Unknown');
                    const studentCount = typeof section.students === 'number' ? section.students : 0;
                    
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => toggleSelection(section.id)}
                        className="flex w-full items-center gap-3 rounded-md border p-2 text-left transition hover:bg-muted"
                      >
                        {selected ? (
                          <Check className="size-4 text-primary" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{sectionName}</p>
                          <p className="text-xs text-muted-foreground">
                            {studentCount} students
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <Button
                onClick={handleAssignSelected}
                loading={createAssignment.isPending}
                disabled={selectedSectionIds.length === 0 || createAssignment.isPending}
                className="w-full"
              >
                Add Selected Classes
              </Button>
            </div>
          </div>
        </div>
      </DialogBox>

      <DialogBox
        open={Boolean(removeTarget)}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove class assignment"
        description={`Remove ${removeTarget?.sectionName ? String(removeTarget.sectionName) : "this class"} from ${teacherName}?`}
        actionLabel="Remove"
        cancelLabel="Cancel"
        actionVariant="destructive"
        actionLoading={removeAssignment.isPending}
        onAction={handleRemove}
      />
    </>
  );
}
