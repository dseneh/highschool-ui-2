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
import { useStaff } from "@/lib/api2/staff";
import { useStaffApi } from "@/lib/api2/staff/api";
import type { StaffListItem } from "@/lib/api2/staff/types";
import { getQueryClient } from "@/lib/query-client";
import { getErrorMessage } from "@/lib/utils";
import { Check, Circle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AssignSectionTeachersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionName: string;
  onSuccess?: () => void;
}

interface SectionTeacherAssignmentItem {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherIdNumber: string;
}

function getList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) return results as T[];
  }
  return [];
}

function parseTeacherAssignments(data: unknown): SectionTeacherAssignmentItem[] {
  const rows = getList<Record<string, unknown>>(data);

  return rows
    .map((row) => {
      const teacherRaw = row.teacher;
      const teacherObj =
        teacherRaw && typeof teacherRaw === "object"
          ? (teacherRaw as Record<string, unknown>)
          : null;

      const teacherId =
        typeof teacherObj?.id === "string"
          ? teacherObj.id
          : typeof teacherRaw === "string"
            ? teacherRaw
            : "";

      const teacherName =
        typeof teacherObj?.full_name === "string"
          ? teacherObj.full_name
          : "Unknown Teacher";

      const teacherIdNumber =
        typeof teacherObj?.id_number === "string" ? teacherObj.id_number : "-";

      const id = typeof row.id === "string" ? row.id : "";
      return { id, teacherId, teacherName, teacherIdNumber };
    })
    .filter((item) => item.id && item.teacherId);
}

function parseTeachers(data: unknown): StaffListItem[] {
  const rows = getList<StaffListItem>(data);
  return rows.filter((item) => item.is_teacher);
}

export function AssignSectionTeachersDialog({
  open,
  onOpenChange,
  sectionId,
  sectionName,
  onSuccess,
}: AssignSectionTeachersDialogProps) {
  const [selectedTeacherIds, setSelectedTeacherIds] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [removeTarget, setRemoveTarget] = React.useState<SectionTeacherAssignmentItem | null>(
    null
  );

  const staffApi = useStaff();
  const rawApi = useStaffApi();
  const queryClient = getQueryClient();

  const { data: teachersData, isLoading: teachersLoading } = staffApi.getStaff(
    { is_teacher: true, page_size: 1000 },
    { enabled: open }
  );

  const { data: assignmentsData, isLoading: assignmentsLoading } =
    staffApi.getTeacherSections(
      { section: sectionId, page_size: 1000 },
      { enabled: open && Boolean(sectionId) }
    );

  const teacherAssignments = React.useMemo(
    () => parseTeacherAssignments(assignmentsData),
    [assignmentsData]
  );

  const assignedTeacherIds = React.useMemo(
    () => new Set(teacherAssignments.map((item) => item.teacherId)),
    [teacherAssignments]
  );

  const teachers = React.useMemo(() => parseTeachers(teachersData), [teachersData]);

  const availableTeachers = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return teachers.filter((teacher) => {
      if (assignedTeacherIds.has(teacher.id)) return false;

      if (!query) return true;
      return (
        teacher.full_name.toLowerCase().includes(query) ||
        teacher.id_number.toLowerCase().includes(query)
      );
    });
  }, [teachers, assignedTeacherIds, search]);

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
      setSelectedTeacherIds([]);
      setSearch("");
      setRemoveTarget(null);
    }
  }, [open]);

  const toggleSelection = (teacherId: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleAssignSelected = async () => {
    if (!sectionId) return;
    if (selectedTeacherIds.length === 0) {
      toast.error("Select at least one teacher.");
      return;
    }

    const existing = assignedTeacherIds;
    const toAssign = selectedTeacherIds.filter((id) => !existing.has(id));
    const skipped = selectedTeacherIds.length - toAssign.length;

    if (toAssign.length === 0) {
      toast.success(`No new assignments. Skipped ${skipped} existing assignment(s).`);
      return;
    }

    const results = await Promise.allSettled(
      toAssign.map((teacherId) =>
        createAssignment.mutateAsync({ teacher: teacherId, section: sectionId })
      )
    );

    const created = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - created;

    if (failed > 0) {
      toast.error(`Assigned ${created}. Failed ${failed}. ${skipped > 0 ? `Skipped ${skipped}.` : ""}`);
    } else {
      toast.success(`Assigned ${created} teacher(s). ${skipped > 0 ? `Skipped ${skipped} duplicate(s).` : ""}`);
    }

    setSelectedTeacherIds([]);
  };

  const handleRemove = async () => {
    if (!removeTarget) return;

    try {
      await removeAssignment.mutateAsync(removeTarget.id);
      toast.success(`Removed ${removeTarget.teacherName} from this section.`);
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
        title={`Assign Teachers: ${sectionName}`}
        description="Add or remove teachers assigned to this section."
        className="max-w-6xl"
        cancelLabel="Close"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border">
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Assigned Teachers</span>
                <Badge variant="secondary">{teacherAssignments.length}</Badge>
              </CardTitle>
              <CardDescription>Teachers currently linked to this section</CardDescription>
            </CardHeader>

            <div className="max-h-95 space-y-2 overflow-auto p-3">
              {assignmentsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-11 w-full" />
                  ))}
                </div>
              ) : teacherAssignments.length === 0 ? (
                <EmptyState className="border-none py-10">
                  <EmptyStateTitle>No teachers assigned</EmptyStateTitle>
                  <EmptyStateDescription>
                    Assign teachers from the right panel.
                  </EmptyStateDescription>
                </EmptyState>
              ) : (
                teacherAssignments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.teacherName}</p>
                      <p className="text-xs text-muted-foreground">{item.teacherIdNumber}</p>
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

          <div className="rounded-lg border">
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Add Teachers</span>
                <Badge>{selectedTeacherIds.length} selected</Badge>
              </CardTitle>
              <CardDescription>Select one or more teachers to assign</CardDescription>
            </CardHeader>

            <div className="space-y-3 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search teachers"
                  className="pl-8"
                />
              </div>

              <div className="max-h-80 space-y-2 overflow-auto rounded-md border p-2">
                {teachersLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-10 w-full" />
                    ))}
                  </div>
                ) : availableTeachers.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    No available teachers to assign.
                  </p>
                ) : (
                  availableTeachers.map((teacher) => {
                    const selected = selectedTeacherIds.includes(teacher.id);
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => toggleSelection(teacher.id)}
                        className="flex w-full items-center gap-3 rounded-md border p-2 text-left transition hover:bg-muted"
                      >
                        {selected ? (
                          <Check className="size-4 text-primary" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{teacher.full_name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.id_number}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <Button
                onClick={handleAssignSelected}
                loading={createAssignment.isPending}
                disabled={selectedTeacherIds.length === 0 || createAssignment.isPending}
                className="w-full"
              >
                Add Selected Teachers
              </Button>
            </div>
          </div>
        </div>
      </DialogBox>

      <DialogBox
        open={Boolean(removeTarget)}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove teacher assignment"
        description={`Remove ${removeTarget?.teacherName ?? "this teacher"} from ${sectionName}?`}
        actionLabel="Remove"
        cancelLabel="Cancel"
        actionVariant="destructive"
        actionLoading={removeAssignment.isPending}
        onAction={handleRemove}
      />
    </>
  );
}
