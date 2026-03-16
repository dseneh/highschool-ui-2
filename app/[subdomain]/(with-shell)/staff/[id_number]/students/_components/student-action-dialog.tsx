"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Pencil } from "lucide-react";
import {
    Calendar03Icon,
    BookOpen02Icon,
    UserIcon, Delete02Icon,
    CheckmarkCircle01Icon,
    AlertCircleIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectField } from "@/components/ui/select-field";
import StatusBadge from "@/components/ui/status-badge";
import {
    EmptyState,
    EmptyStateDescription,
    EmptyStateIcon,
    EmptyStateTitle,
} from "@/components/ui/empty-state";

import {
    useStudentAttendance,
    useStudentAttendanceMutations,
} from "@/hooks/use-billing";
import { useStudentFinalGrades } from "@/hooks/use-grading";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import { useAllMarkingPeriods } from "@/hooks/use-marking-period";
import { cn, getGradeTextColorClass } from "@/lib/utils";
import type { StudentAttendanceDto } from "@/lib/api2/billing-types";
import type { GradeBookRecord } from "@/lib/api2/grading-types";
import type { Student } from "./types";
import moment from 'moment';
import AvatarImg from "@/components/shared/avatar-img";
import { AuthButton } from "@/components/auth/auth-button";

type AttendanceFormPayload = {
  date: string;
  status: StudentAttendanceDto["status"];
  notes: string | null;
};


const STATUS_OPTIONS = [
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
  { value: "sick", label: "Sick" },
  { value: "on_leave", label: "On Leave" },
  { value: "holiday", label: "Holiday" },
] as const;

const ATTENDANCE_BADGE_VARIANT: Record<
  StudentAttendanceDto["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  present: "default",
  absent: "destructive",
  late: "secondary",
  excused: "outline",
  holiday: "outline",
  sick: "secondary",
  on_leave: "outline",
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function dateFromIso(value: string) {
  return new Date(`${value}T00:00:00`);
}

function dateToIso(value: Date | undefined) {
  return value ? value.toLocaleDateString("en-CA") : new Date().toLocaleDateString("en-CA");
}

function AnimatedDialogTabPanel({
  animKey,
  direction,
  children,
}: {
  animKey: string;
  direction: "forward" | "backward";
  children: React.ReactNode;
}) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | "auto">("auto");

  React.useEffect(() => {
    if (!innerRef.current) return;

    const node = innerRef.current;
    setHeight(node.getBoundingClientRect().height);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [animKey]);

  const animationClass =
    direction === "forward" ? "animate-step-forward" : "animate-step-backward";

  return (
    <div
      className="overflow-hidden transition-[height] duration-300 ease-out"
      style={{ height: typeof height === "number" ? `${height}px` : "auto" }}
    >
      <div ref={innerRef} key={animKey} className={animationClass}>
        {children}
      </div>
    </div>
  );
}

interface AttendanceRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: StudentAttendanceDto | null;
  existingRecords: StudentAttendanceDto[];
  onSubmit: (payload: AttendanceFormPayload) => Promise<void>;
  isPending: boolean;
}

function AttendanceRecordDialog({
  open,
  onOpenChange,
  record,
  existingRecords,
  onSubmit,
  isPending,
}: AttendanceRecordDialogProps) {
  const isEdit = Boolean(record);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [status, setStatus] =
    React.useState<StudentAttendanceDto["status"]>("absent");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (!open) return;

    if (record) {
      setDate(dateFromIso(record.date));
      setStatus(record.status);
      setNotes(record.notes ?? "");
      return;
    }

    const nextDate = new Date();
    nextDate.setHours(0, 0, 0, 0);
    setDate(nextDate);
    setStatus("absent");
    setNotes("");
  }, [open, record]);

  const duplicateRecord = React.useMemo(() => {
    if (isEdit || !date) return null;

    const isoDate = dateToIso(date);
    return existingRecords.find((existingRecord) => existingRecord.date === isoDate) ?? null;
  }, [date, existingRecords, isEdit]);

  const handleSubmit = async () => {
    await onSubmit({
      date: dateToIso(date),
      status,
      notes: notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Attendance Record" : "Add Attendance Record"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this attendance record for the student."
              : "Record a new attendance entry for the student."}
          </DialogDescription>
        </DialogHeader>

        {!isEdit && duplicateRecord ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            A record already exists for this date. Saving will update the existing entry instead of creating a duplicate.
          </div>
        ) : null}

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Date</p>
              <DatePicker
                value={date}
                onChange={setDate}
                allowFutureDates={false}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Status</p>
              <SelectField
                value={status}
                onValueChange={(value) =>
                  setStatus(value as StudentAttendanceDto["status"])
                }
                items={STATUS_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                placeholder="Select status"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Notes</p>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <AuthButton
            onClick={() => void handleSubmit()}
            loading={isPending}
            loadingText="Saving..."
            roles={["admin", "teacher"]}
          >
            {isEdit ? "Save Changes" : duplicateRecord ? "Update Existing" : "Add Record"}
          </AuthButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Details Tab                                                        */
/* ------------------------------------------------------------------ */

function DetailsTab({ student }: { student: Student }) {

  const infoRows: { label: string; value: React.ReactNode }[] = [
    { label: "ID Number", value: <span className="font-mono">{student.id_number}</span> },
    ...(student.email ? [{ label: "Email", value: student.email }] : []),
    ...(student.gender
      ? [{ label: "Gender", value: <span className="capitalize">{student.gender}</span> }]
      : []),
    ...(student.status
      ? [{ label: "Status", value: <StatusBadge status={student.status} /> }]
      : []),
    ...(student.grade_average != null
      ? [
          {
            label: "Grade Average",
            value: (
              <span
                className={cn(
                  "font-semibold",
                  getGradeTextColorClass(student.grade_average)
                )}
              >
                {student.grade_average.toFixed(1)}%
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4 p-2">
      {/* Avatar + name hero */}
      <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
        <AvatarImg src={student.photo} name={student.full_name} className="size-16" />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{student.full_name}</h3>
          {student.status && (
            <div className="mt-1">
              <StatusBadge status={student.status} />
            </div>
          )}
        </div>
      </div>

      {/* Info grid */}
      <Card className="divide-y">
        {infoRows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="text-sm text-right min-w-0 truncate">{value}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Attendance Tab                                                     */
/* ------------------------------------------------------------------ */

function AttendanceTab({ student }: { student: Student }) {
  const { data, isLoading, error } = useStudentAttendance(student.id_number);
  const { create, update, remove } = useStudentAttendanceMutations(student.id_number);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<StudentAttendanceDto | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<StudentAttendanceDto | null>(null);

  const summary = data?.summary;
  const records = React.useMemo(
    () =>
      [...(data?.records ?? [])].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [data?.records]
  );

  const openAddDialog = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEditDialog = (record: StudentAttendanceDto) => {
    setEditTarget(record);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload: AttendanceFormPayload) => {
    const duplicateRecord = records.find(
      (record) => record.date === payload.date && record.id !== editTarget?.id
    );

    try {
      if (editTarget) {
        if (duplicateRecord) {
          toast.error("An attendance record already exists for this date. Edit that record instead.");
          return;
        }

        await update.mutateAsync({
          attendanceId: editTarget.id,
          payload,
        });
        toast.success("Attendance record updated");
      } else if (duplicateRecord) {
        await update.mutateAsync({
          attendanceId: duplicateRecord.id,
          payload,
        });
        toast.success("Attendance record for this date already existed, so it was updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Attendance record added");
      }

      setFormOpen(false);
      setEditTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await remove.mutateAsync(deleteTarget.id);
      toast.success("Attendance record deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <HugeiconsIcon icon={AlertCircleIcon} className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Failed to load attendance data.</p>
      </div>
    );
  }

  const attendanceRate = summary?.attendance_rate ?? 0;

  return (
    <div className="space-y-4 p-2">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 space-y-0 gap-0">
          <p className="text-xs text-muted-foreground">School Days</p>
          <p className="mt-0.5 text-2xl font-bold">
            {summary?.school_days_elapsed ?? 0}
          </p>
        </Card>
        <Card className="p-3 space-y-0 gap-0">
          <p className="text-xs text-muted-foreground">Present</p>
          <p className="mt-0.5 text-2xl font-bold text-emerald-600">
            {summary?.present_days ?? 0}
          </p>
        </Card>
        <Card className="p-3 space-y-0 gap-0">
          <p className="text-xs text-muted-foreground">Absences</p>
          <p className="mt-0.5 text-2xl font-bold text-destructive">
            {summary?.recorded_absences ?? 0}
          </p>
        </Card>
        <Card className="p-3 space-y-0 gap-0">
          <p className="text-xs text-muted-foreground">Rate</p>
          <p className="mt-0.5 text-2xl font-bold">
            {attendanceRate.toFixed(1)}%
          </p>
        </Card>
      </div>

      <Card className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Need to record an absence?</p>
            <p className="text-xs text-muted-foreground">
              Add a dated attendance record for this student directly from the dialog.
            </p>
          </div>
          <AuthButton 
          size="sm" onClick={openAddDialog}
          roles={["admin", "teacher"]}
          >
            Add Record
          </AuthButton>
        </div>
      </Card>

      {/* Records */}
      <div>
        <p className="text-sm font-medium mb-2">
          Recorded Absences ({records.length})
        </p>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {records.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon className="p-3 [&_svg]:size-6">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} />
              </EmptyStateIcon>
              <EmptyStateTitle>No Recorded Absences</EmptyStateTitle>
              <EmptyStateDescription>
                Student is considered present for all elapsed school days.
              </EmptyStateDescription>
            </EmptyState>
          ) : (
            records.map((record) => {

              return (
                <div key={record.id} className="rounded-lg border p-3 hover:bg-muted/40 transition-colors duration-150">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-medium">
                                                    {moment(record.date).isSame(new Date(), "day")
                                                      ? "Today"
                                                      : moment(record.date).isSame(moment().subtract(1, "day"), "day")
                                                      ? "Yesterday"
                                                      : moment(record.date).format("DD MMMM YYYY")}
                                                  </p>
                        <Badge
                          variant={ATTENDANCE_BADGE_VARIANT[record.status]}
                        >
                          {formatStatus(record.status)}
                        </Badge>
                      </div>
                        {record.marking_period && (
                          <div className="text-xs">
                            {record.marking_period}
                          </div>
                        )}
                      {record.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {record.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => openEditDialog(record)}
                        icon={
                          <Pencil
                            className="size-3.5"
                          />
                        }
                        tooltip="Edit record"
                      />
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(record)}
                        icon={
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            className="size-3.5"
                          />
                        }
                        tooltip="Delete record"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AttendanceRecordDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditTarget(null);
        }}
        record={editTarget}
        existingRecords={records}
        onSubmit={handleFormSubmit}
        isPending={create.isPending || update.isPending}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleDelete()}
              loading={remove.isPending}
              loadingText="Deleting..."
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Grades Tab                                                         */
/* ------------------------------------------------------------------ */

function GradesTab({ student }: { student: Student }) {
  const { data: currentYear } = useCurrentAcademicYear();
  const { data: markingPeriods = [] } = useAllMarkingPeriods();
  const [selectedMPId, setSelectedMPId] = React.useState("");

  const {
    data: gradesData,
    isLoading,
    error,
  } = useStudentFinalGrades(
    student.id,
    currentYear?.id,
    selectedMPId || undefined
  );

  const gradebooks: GradeBookRecord[] = gradesData?.gradebooks ?? [];
  const overallAvg = gradesData?.overall_averages?.final_average;

  const mpOptions = markingPeriods.map((mp) => ({
    value: mp.id,
    label: mp.name,
  }));

  return (
    <div className="space-y-4">
      {/* Marking period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-sm font-medium text-nowrap">Marking Period:</span>
        <SelectField
          items={mpOptions}
          value={selectedMPId}
          onValueChange={(v) => setSelectedMPId(String(v ?? ""))}
          placeholder="Select a marking period"
          className="w-full"
          triggerClassName="w-full sm:max-w-xs"
        />
      </div>

      {!selectedMPId && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <HugeiconsIcon
            icon={BookOpen02Icon}
            className="size-8 mx-auto text-muted-foreground mb-2"
          />
          <p className="text-sm text-muted-foreground">
            Select a marking period above to view grades.
          </p>
        </div>
      )}

      {selectedMPId && isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 frounded-xl" />
          ))}
        </div>
      )}

      {selectedMPId && error && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">Failed to load grades.</p>
        </div>
      )}

      {selectedMPId && !isLoading && !error && (
        <div className="space-y-3">
          {/* Overall average */}
          {overallAvg != null && (
            <Card className="flex items-center justify-between p-3">
              <span className="text-sm font-medium">Overall Average</span>
              <span
                className={cn(
                  "text-lg font-bold tabular-nums",
                  getGradeTextColorClass(overallAvg)
                )}
              >
                {overallAvg.toFixed(1)}%
              </span>
            </Card>
          )}

          {/* Subject list */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {gradebooks.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon className="p-3 [&_svg]:size-6">
                  <HugeiconsIcon icon={BookOpen02Icon} />
                </EmptyStateIcon>
                <EmptyStateTitle>No Grades Found</EmptyStateTitle>
                <EmptyStateDescription>
                  No approved grades recorded for this marking period.
                </EmptyStateDescription>
              </EmptyState>
            ) : (
              <div className="border divide-y cursor-pointer">
                {
                    gradebooks.map((gb) => {
                const avg =
                  gb.marking_period.final_percentage ??
                  gb.averages?.final_average;
                return (
                  <div
                    key={gb.id ?? gb.subject.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {gb.subject.name}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-base font-semibold tabular-nums",
                        getGradeTextColorClass(avg)
                      )}
                    >
                      {avg != null ? `${avg.toFixed(1)}%` : "—"}
                    </span>
                  </div>
                );
              })
                }
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main dialog                                                        */
/* ------------------------------------------------------------------ */

interface StudentActionDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentActionDialog({
  student,
  open,
  onOpenChange,
}: StudentActionDialogProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("details");
  const [tabDirection, setTabDirection] = React.useState<"forward" | "backward">("forward");

  // Reset to the details tab whenever a different student is shown
  React.useEffect(() => {
    if (open) {
      setActiveTab("details");
      setTabDirection("forward");
    }
  }, [student?.id_number, open]);

  if (!student) return null;

  const headerActions = [
    { label: "Details", href: `/students/${student.id_number}/details`, tooltip: "Go to student details" },
    { label: "Attendance", href: `/students/${student.id_number}/attendance`, tooltip: "Go to student attendance record" },
    { label: "Grades", href: `/students/${student.id_number}/grades`, tooltip: "Go to student grades" },
  ];

  const tabs = [
    {
      value: "details",
      label: "Details",
      icon: UserIcon,
      content: <DetailsTab student={student} />,
    },
    {
      value: "attendance",
      label: "Attendance",
      icon: Calendar03Icon,
      content: <AttendanceTab student={student} />,
    },
    {
      value: "grades",
      label: "Grades",
      icon: BookOpen02Icon,
      content: <GradesTab student={student} />,
    },
  ];

  const handleTabChange = (nextTab: string) => {
    const currentIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const nextIndex = tabs.findIndex((tab) => tab.value === nextTab);

    if (currentIndex >= 0 && nextIndex >= 0) {
      setTabDirection(nextIndex >= currentIndex ? "forward" : "backward");
    }

    setActiveTab(nextTab);
  };

  const activeTabConfig = tabs.find((tab) => tab.value === activeTab) ?? tabs[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl overflow-hidden p-0 sm:max-h-[90vh]">
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-0">
          <DialogHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <DialogTitle className="flex items-center gap-2.5 text-base">
                  <AvatarImg src={student.photo} name={student.full_name} className="size-10" />
                  <div>
                  <div className="flex items-center gap-2">
                  <div className="truncate">{student.full_name}</div>
                  {student.status && (
                    <StatusBadge status={student.status} className="shrink-0 text-xs" />
                  )}
                  </div>
                  <div className="font-medium font-mono text-xs text-muted-foreground">{student.id_number}</div>

                  </div>
                  
                </DialogTitle>
              </div>
              <div className="flex flex-wrap fgap-1 sm:justify-end pe-5">
                {headerActions.map((action) => (
                  <Button
                    key={action.href}
                    size="sm"
                    variant="link"
                    onClick={() => router.push(action.href)}
                    iconRight={<ExternalLink className="size-4" />}
                    tooltip={action.tooltip}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </DialogHeader>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="px-6 ">
            <TabsList className="grid h-auto w-full grid-cols-3">
              {tabs.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="px-3 fpy-2"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div
            className="overflow-y-auto px-6 pb-6 pt-2"
            style={{ maxHeight: "calc(90vh - 11rem)" }}
          >
            <AnimatedDialogTabPanel
              animKey={activeTabConfig.value}
              direction={tabDirection}
            >
              <TabsContent value={activeTabConfig.value} className="mt-0">
                {activeTabConfig.content}
              </TabsContent>
            </AnimatedDialogTabPanel>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
