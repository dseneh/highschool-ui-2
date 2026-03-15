"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { DialogBox } from "@/components/ui/dialog-box";
import { SelectField } from "@/components/ui/select-field";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaffApi } from "@/lib/api2/staff/api";
import { getErrorMessage } from "@/lib/utils";
import { getQueryClient } from "@/lib/query-client";

interface AssignTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradebook: {
    id: string;
    section_subject: string;
    subject: { id: string; name: string };
    section: { id: string; name: string };
    grade_level: { id: string; name: string };
    teacher: { id: string; full_name: string; id_number?: string } | null;
  };
  onSuccess?: () => void;
}

type TeacherItem = {
  id: string;
  id_number: string;
  full_name: string;
  email?: string | null;
};

type TeacherSubjectRecord = {
  id: string;
  teacher: { id: string };
  section_subject: { id: string } | string;
};

function getList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) return results as T[];
  }
  return [];
}

export function AssignTeacherDialog(props: AssignTeacherDialogProps) {
  // Use key on inner component to reset state when gradebook changes
  return <AssignTeacherDialogInner key={props.gradebook.id} {...props} />;
}

function AssignTeacherDialogInner({
  open,
  onOpenChange,
  gradebook,
  onSuccess,
}: AssignTeacherDialogProps) {
  const staffApi = useStaffApi();
  const queryClient = getQueryClient();
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    gradebook.teacher?.id ?? ""
  );

  // Load all teachers
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers", "all"],
    queryFn: async () => {
      const res = await staffApi.getTeachersApi({ page_size: 500 });
      return res.data;
    },
    enabled: open,
  });

  // Load existing teacher-subject assignment for this section_subject
  const { data: existingAssignmentsData, isLoading: assignmentsLoading } =
    useQuery({
      queryKey: ["teacher-subjects", "section-subject", gradebook.section_subject],
      queryFn: async () => {
        const res = await staffApi.getTeacherSubjectsApi({
          section_subject: gradebook.section_subject,
          page_size: 10,
        });
        return res.data;
      },
      enabled: open && Boolean(gradebook.section_subject),
    });

  const teachers = useMemo<TeacherItem[]>(
    () => getList<TeacherItem>(teachersData),
    [teachersData]
  );

  const existingAssignments = useMemo<TeacherSubjectRecord[]>(
    () => getList<TeacherSubjectRecord>(existingAssignmentsData),
    [existingAssignmentsData]
  );

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTeacherId) throw new Error("Select a teacher.");

      // Delete existing assignments for this section_subject first
      for (const assignment of existingAssignments) {
        await staffApi.deleteTeacherSubjectApi(assignment.id);
      }

      // Create new assignment
      await staffApi.createTeacherSubjectApi({
        teacher: selectedTeacherId,
        section_subject: gradebook.section_subject,
      });
    },
    onSuccess: async () => {
      toast.success("Teacher assigned successfully.");
      onOpenChange(false);

      // Invalidate relevant queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["teacher-subjects", "section-subject", gradebook.section_subject],
        }),
        queryClient.invalidateQueries({ queryKey: ["gradebooks"] }),
        queryClient.invalidateQueries({ queryKey: ["teacher-gradebooks"] }),
      ]);

      onSuccess?.();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const isLoading = teachersLoading || assignmentsLoading;
  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const hasChanged = selectedTeacherId !== (gradebook.teacher?.id ?? "");

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={gradebook.teacher ? "Change Teacher" : "Assign Teacher"}
      description={`${gradebook.subject.name} · ${gradebook.section.name} · ${gradebook.grade_level.name}`}
      actionLabel={gradebook.teacher ? "Change Teacher" : "Assign Teacher"}
      onAction={() => assignMutation.mutate()}
      actionDisabled={!selectedTeacherId || !hasChanged || assignMutation.isPending}
      actionLoading={assignMutation.isPending}
      actionLoadingText="Saving..."
      roles={["admin", "registrar"]}
    >
      <div className="space-y-4 py-2">
        {/* Current teacher */}
        {gradebook.teacher && (
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground mb-1">Currently assigned</p>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{gradebook.teacher.full_name}</p>
                {gradebook.teacher.id_number && (
                  <p className="text-xs text-muted-foreground">
                    ID: {gradebook.teacher.id_number}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Teacher selector */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Search01Icon} className="h-3.5 w-3.5" />
            {gradebook.teacher ? "Select new teacher" : "Select teacher"}
          </Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <SelectField
              value={selectedTeacherId}
              onValueChange={(v) => setSelectedTeacherId(String(v ?? ""))}
              placeholder="Search teachers..."
              searchable
              items={teachers.map((t) => ({
                value: t.id,
                label: t.full_name,
                description: t.id_number ? `ID: ${t.id_number}` : undefined,
              }))}
            />
          )}
        </div>

        {/* Preview of selected teacher */}
        {currentTeacher && hasChanged && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">New</Badge>
              <p className="text-sm font-medium">{currentTeacher.full_name}</p>
              {currentTeacher.id_number && (
                <p className="text-xs text-muted-foreground">
                  ID: {currentTeacher.id_number}
                </p>
              )}
            </div>
          </div>
        )}

        {teachers.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">
            No teachers found. Make sure staff members with teaching roles are added to the system.
          </p>
        )}
      </div>
    </DialogBox>
  );
}
