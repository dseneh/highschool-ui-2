"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getSectionSubjects } from "@/lib/api2/section-subject-service";
import { useStaff } from "@/lib/api2/staff";
import { useStaffApi } from "@/lib/api2/staff/api";
import { getQueryClient } from "@/lib/query-client";
import { getErrorMessage } from "@/lib/utils";
import { Check, Circle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AssignTeacherSubjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  teacherName: string;
  sectionId?: string;
  sectionLabel?: string;
  onSuccess?: () => void;
}

interface TeacherSubjectAssignmentItem {
  id: string;
  sectionSubjectId: string;
  sectionId: string;
  sectionName: string;
  gradeLevelName: string;
  subjectName: string;
}

interface SectionSubjectOption {
  id: string;
  subjectId: string;
  subjectName: string;
}

function getList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) return results as T[];
  }
  return [];
}

function parseTeacherSectionIds(data: unknown): string[] {
  const rows = getList<Record<string, unknown>>(data);
  return rows
    .map((row) => {
      const sectionRaw = row.section;
      if (sectionRaw && typeof sectionRaw === "object") {
        const sectionObj = sectionRaw as Record<string, unknown>;
        return typeof sectionObj.id === "string" ? sectionObj.id : "";
      }
      return typeof sectionRaw === "string" ? sectionRaw : "";
    })
    .filter(Boolean);
}

function parseTeacherSubjectAssignments(data: unknown): TeacherSubjectAssignmentItem[] {
  const rows = getList<Record<string, unknown>>(data);

  return rows
    .map((row) => {
      const sectionSubjectRaw = row.section_subject;
      const sectionSubjectObj =
        sectionSubjectRaw && typeof sectionSubjectRaw === "object"
          ? (sectionSubjectRaw as Record<string, unknown>)
          : null;

      const sectionRaw = sectionSubjectObj?.section;
      const sectionObj =
        sectionRaw && typeof sectionRaw === "object"
          ? (sectionRaw as Record<string, unknown>)
          : null;

      const gradeLevelRaw = sectionObj?.grade_level;
      const gradeLevelObj =
        gradeLevelRaw && typeof gradeLevelRaw === "object"
          ? (gradeLevelRaw as Record<string, unknown>)
          : null;

      const subjectRaw = row.subject;
      const subjectObj =
        subjectRaw && typeof subjectRaw === "object"
          ? (subjectRaw as Record<string, unknown>)
          : null;

      const sectionSubjectSubjectRaw = sectionSubjectObj?.subject;
      const sectionSubjectSubjectObj =
        sectionSubjectSubjectRaw && typeof sectionSubjectSubjectRaw === "object"
          ? (sectionSubjectSubjectRaw as Record<string, unknown>)
          : null;

      const sectionSubjectId =
        typeof sectionSubjectObj?.id === "string" ? sectionSubjectObj.id : "";

      const sectionId = typeof sectionObj?.id === "string" ? sectionObj.id : "";
      const sectionName =
        typeof sectionObj?.name === "string" && sectionObj.name.trim().length > 0
          ? sectionObj.name
          : "Section";
      const gradeLevelName =
        typeof gradeLevelObj?.name === "string" && gradeLevelObj.name.trim().length > 0
          ? gradeLevelObj.name
          : "Grade Level";

      const subjectName =
        typeof sectionSubjectSubjectObj?.name === "string"
          ? sectionSubjectSubjectObj.name
          : typeof subjectObj?.name === "string"
            ? subjectObj.name
            : "Unnamed Subject";

      const id = typeof row.id === "string" ? row.id : "";
      return {
        id,
        sectionSubjectId,
        sectionId,
        sectionName,
        gradeLevelName,
        subjectName,
      };
    })
    .filter((item) => item.id && item.sectionSubjectId);
}

export function AssignTeacherSubjectsDialog({
  open,
  onOpenChange,
  teacherId,
  teacherName,
  sectionId,
  sectionLabel,
  onSuccess,
}: AssignTeacherSubjectsDialogProps) {
  const [selectedSectionSubjectIds, setSelectedSectionSubjectIds] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [removeTarget, setRemoveTarget] = React.useState<TeacherSubjectAssignmentItem | null>(
    null
  );

  const subdomain = useTenantSubdomain();
  const staffApi = useStaff();
  const rawApi = useStaffApi();
  const queryClient = getQueryClient();

  const { data: teacherSectionsData } = staffApi.getTeacherSections(
    { teacher: teacherId, page_size: 1000 },
    { enabled: open && Boolean(teacherId) }
  );

  const { data: teacherSubjectsData, isLoading: teacherSubjectsLoading } =
    staffApi.getTeacherSubjects(
      { teacher: teacherId, page_size: 1000 },
      { enabled: open && Boolean(teacherId) }
    );

  const teacherSectionIds = React.useMemo(
    () => parseTeacherSectionIds(teacherSectionsData),
    [teacherSectionsData]
  );

  const teacherSubjectAssignments = React.useMemo(
    () => parseTeacherSubjectAssignments(teacherSubjectsData),
    [teacherSubjectsData]
  );

  const filteredAssignments = React.useMemo(
    () =>
      sectionId
        ? teacherSubjectAssignments.filter((item) => item.sectionId === sectionId)
        : teacherSubjectAssignments,
    [teacherSubjectAssignments, sectionId]
  );

  const assignedSectionSubjectIds = React.useMemo(
    () => new Set(filteredAssignments.map((item) => item.sectionSubjectId)),
    [filteredAssignments]
  );

  const { data: sectionSubjectOptions = [], isLoading: sectionSubjectsLoading } = useQuery({
    queryKey: ["teacher-allowed-section-subjects", subdomain, teacherId, sectionId, teacherSectionIds],
    queryFn: async () => {
      if (!teacherSectionIds.length) return [];

      const targetSectionIds = sectionId ? [sectionId] : teacherSectionIds;
      const sectionSubjects = await Promise.all(
        targetSectionIds.map((targetSectionId) => getSectionSubjects(subdomain, targetSectionId))
      );

      const options = new Map<string, SectionSubjectOption>();
      sectionSubjects.forEach((entries) => {
        entries.forEach((entry) => {
          if (!entry?.id || !entry?.subject?.id || !entry?.subject?.name) return;
          options.set(entry.id, {
            id: entry.id,
            subjectId: entry.subject.id,
            subjectName: entry.subject.name,
          });
        });
      });

      return Array.from(options.values());
    },
    enabled: open && Boolean(subdomain) && Boolean(teacherId) && teacherSectionIds.length > 0,
  });

  const availableSectionSubjects = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return sectionSubjectOptions.filter((item) => {
      if (assignedSectionSubjectIds.has(item.id)) return false;

      if (!query) return true;
      return item.subjectName.toLowerCase().includes(query);
    });
  }, [assignedSectionSubjectIds, search, sectionSubjectOptions]);

  const createAssignment = useMutation({
    mutationFn: (payload: { teacher: string; section_subject: string }) =>
      rawApi.createTeacherSubjectApi(payload).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
      onSuccess?.();
    },
  });

  const removeAssignment = useMutation({
    mutationFn: (assignmentId: string) =>
      rawApi.deleteTeacherSubjectApi(assignmentId).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
      onSuccess?.();
    },
  });

  React.useEffect(() => {
    if (!open) {
      setSelectedSectionSubjectIds([]);
      setSearch("");
      setRemoveTarget(null);
    }
  }, [open]);

  const toggleSelection = (sectionSubjectId: string) => {
    setSelectedSectionSubjectIds((prev) =>
      prev.includes(sectionSubjectId)
        ? prev.filter((id) => id !== sectionSubjectId)
        : [...prev, sectionSubjectId]
    );
  };

  const handleAssignSelected = async () => {
    if (!teacherId) return;
    if (selectedSectionSubjectIds.length === 0) {
      toast.error("Select at least one subject.");
      return;
    }

    const existing = assignedSectionSubjectIds;
    const toAssign = selectedSectionSubjectIds.filter((id) => !existing.has(id));
    const skipped = selectedSectionSubjectIds.length - toAssign.length;

    if (toAssign.length === 0) {
      toast.success(`No new assignments. Skipped ${skipped} existing assignment(s).`);
      return;
    }

    const results = await Promise.allSettled(
      toAssign.map((sectionSubjectId) =>
        createAssignment.mutateAsync({ teacher: teacherId, section_subject: sectionSubjectId })
      )
    );

    const created = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - created;

    if (failed > 0) {
      toast.error(`Assigned ${created}. Failed ${failed}. ${skipped > 0 ? `Skipped ${skipped}.` : ""}`);
    } else {
      toast.success(`Assigned ${created} subject(s). ${skipped > 0 ? `Skipped ${skipped} duplicate(s).` : ""}`);
    }

    setSelectedSectionSubjectIds([]);
  };

  const handleRemove = async () => {
    if (!removeTarget) return;

    try {
      await removeAssignment.mutateAsync(removeTarget.id);
      toast.success(`Removed ${removeTarget.subjectName} from teacher assignments.`);
      setRemoveTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const noSectionAssignments = teacherSectionIds.length === 0;
  const dialogScopeLabel = sectionLabel ? ` (${sectionLabel})` : "";

  return (
    <>
      <DialogBox
        open={open}
        onOpenChange={onOpenChange}
        title={`Assign Subjects${dialogScopeLabel}: ${teacherName}`}
        description="Assign subjects based on the teacher's class assignments."
        className="max-w-6xl"
        contentClassName="overflow-hidden!"
        // size="xl"
        cancelLabel="Close"
        actionLabel={`Add Subjects (${selectedSectionSubjectIds.length})`}
        onAction={handleAssignSelected}
        actionLoading={createAssignment.isPending}
        actionDisabled={
          selectedSectionSubjectIds.length === 0 ||
          createAssignment.isPending ||
          noSectionAssignments
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-1">
          <div className="rounded-lg border">
            <CardHeader className="border-b bg-muted/30 py-3 gap-0 space-y-0">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Current Subject Assignments</span>
                <Badge variant="secondary">{filteredAssignments.length}</Badge>
              </CardTitle>
              <CardDescription>Subjects currently assigned</CardDescription>
            </CardHeader>

            <div className="fmax-h-[60vh] space-y-2 max-h-[calc(100vh-400px)] overflow-auto p-3">
              {teacherSubjectsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-11 w-full" />
                  ))}
                </div>
              ) : filteredAssignments.length === 0 ? (
                <EmptyState className="border-none py-5">
                  <EmptyStateTitle>No subjects assigned</EmptyStateTitle>
                  <EmptyStateDescription>
                    Assign subjects from the right panel.
                  </EmptyStateDescription>
                </EmptyState>
              ) : (
                filteredAssignments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border p-2 "
                  >
                    <div>
                      <p className="text-sm font-medium">{item.subjectName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.gradeLevelName} - {item.sectionName}
                      </p>
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
                ))
              )}
            </div>
          </div>

          <div className="flex max-h-full flex-col rounded-lg border">
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Add Subjects</span>
                <Badge variant="secondary">{selectedSectionSubjectIds.length} selected</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Only section subjects from the selected class group are available.
              </CardDescription>

              <div className="relative pt-2">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search subjects"
                  className="pl-8"
                />
              </div>
            </CardHeader>

            <div className="flex min-h-0 flex-1 flex-col gap-3 fp-3">
              <div className="min-h-0 max-h-[calc(100vh-400px)] flex-1 space-y-2 overflow-auto">
                {noSectionAssignments ? (
                  <EmptyState className="border-none py-10">
                    <EmptyStateTitle>Assign classes first</EmptyStateTitle>
                    <EmptyStateDescription>
                      This teacher must have at least one class assignment before subjects can be assigned.
                    </EmptyStateDescription>
                  </EmptyState>
                ) : sectionSubjectsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-10 w-full" />
                    ))}
                  </div>
                ) : availableSectionSubjects.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    No available subjects based on current class assignments.
                  </p>
                ) : (
                  <div className="pb-1 space-y-1">
                    {availableSectionSubjects.map((sectionSubject) => {
                    const selected = selectedSectionSubjectIds.includes(sectionSubject.id);
                    return (
                      <button
                        key={sectionSubject.id}
                        type="button"
                        onClick={() => toggleSelection(sectionSubject.id)}
                        className="flex w-full items-center gap-3 rounded-md border p-2 text-left transition hover:bg-muted"
                      >
                        {selected ? (
                          <Check className="size-4 text-primary" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{sectionSubject.subjectName}</p>
                        </div>
                      </button>
                    );
                  })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </DialogBox>

      <DialogBox
        open={Boolean(removeTarget)}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove subject assignment"
        // description={`Remove ${removeTarget?.subjectName ?? "this subject"} from ${teacherName}?`}
        actionLabel="Remove"
        cancelLabel="Cancel"
        actionVariant="destructive"
        actionLoading={removeAssignment.isPending}
        onAction={handleRemove}
      >
        Remove {removeTarget?.subjectName ?? "this subject"} from {teacherName}?
      </DialogBox>

    </>
  );
}
