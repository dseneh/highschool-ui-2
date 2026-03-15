"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar03Icon, Delete02Icon, Edit02Icon, PlusSignIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import PageLayout from "@/components/dashboard/page-layout";
import { useStudentAttendance, useStudentAttendanceMutations } from "@/hooks/use-billing";
import { useResolvedStudentIdNumber } from "@/hooks/use-resolved-student-id-number";
import { AuthButton } from "@/components/auth/auth-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { StudentAttendanceDto } from "@/lib/api2/billing-types";
import { Calendar, Pencil } from "lucide-react";
import moment from "moment";

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
  { value: "sick", label: "Sick" },
  { value: "on_leave", label: "On Leave" },
  { value: "holiday", label: "Holiday" },
] as const;

const STATUS_BADGE_VARIANT: Record<StudentAttendanceDto["status"], "default" | "secondary" | "destructive" | "outline"> = {
  present: "default",
  absent: "destructive",
  late: "secondary",
  excused: "outline",
  holiday: "outline",
  sick: "secondary",
  on_leave: "outline",
};

function AttendanceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-110 rounded-xl" />
    </div>
  );
}

function statusLabel(status: StudentAttendanceDto["status"]) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

function DeleteConfirmDialog({ open, onOpenChange, onConfirm, loading }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Attendance Record</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this attendance record? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <AuthButton
            roles={["admin", "teacher"]}
            variant="destructive"
            onClick={onConfirm}
            loading={loading}
            loadingText="Deleting..."
          >
            Delete
          </AuthButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AttendanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: StudentAttendanceDto | null; // null/undefined = add mode
  onSubmit: (payload: { date: string; status: StudentAttendanceDto["status"]; notes: string | null }) => Promise<void>;
  isPending: boolean;
}

function AttendanceFormDialog({ open, onOpenChange, record, onSubmit, isPending }: AttendanceFormDialogProps) {
  const isEdit = Boolean(record);

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<StudentAttendanceDto["status"]>("absent");
  const [notes, setNotes] = useState("");

  // Sync fields whenever the dialog opens or switches to a different record
  useEffect(() => {
    if (open) {
      setDate(record?.date ? new Date(record.date + "T00:00:00") : (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })());
      setStatus(record?.status ?? "absent");
      setNotes(record?.notes ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, record?.id]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const dateStr = date ? date.toLocaleDateString("en-CA") : new Date().toLocaleDateString("en-CA");
    await onSubmit({ date: dateStr, status, notes: notes || null });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Attendance Record" : "Add Attendance Record"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details for this attendance entry." : "Record an attendance event for this student."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid gap-4 sm:grid-cols-2">
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
                onValueChange={(v) => setStatus(v as StudentAttendanceDto["status"])}
                items={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                placeholder="Select status"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Notes</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <AuthButton
            roles={["admin", "teacher"]}
            onClick={handleSubmit}
            loading={isPending}
            loadingText="Saving..."
          >
            {isEdit ? "Save Changes" : "Add Record"}
          </AuthButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StudentAttendancePage() {
  const idNumber = useResolvedStudentIdNumber();
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useStudentAttendance(idNumber || undefined);
  const { create, update, remove } = useStudentAttendanceMutations(idNumber || undefined);

  // Add/edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentAttendanceDto | null>(null);

  // Delete dialog
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const summary = data?.summary;
  const records = useMemo(() => {
    return [...(data?.records ?? [])].sort(
      (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
    );
  }, [data?.records]);

  const openAddDialog = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEditDialog = (record: StudentAttendanceDto) => {
    setEditTarget(record);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload: {
    date: string;
    status: StudentAttendanceDto["status"];
    notes: string | null;
  }) => {
    if (editTarget) {
      await update.mutateAsync({ attendanceId: editTarget.id, payload });
      toast.success("Attendance record updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Attendance record added");
    }
    setFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await remove.mutateAsync(deleteTargetId);
      toast.success("Attendance record deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete attendance record";
      toast.error(message);
    } finally {
      setDeleteTargetId(null);
    }
  };

  const attendanceRate = summary?.attendance_rate ?? 0;

  return (
    <PageLayout
      title="Student Attendance"
      description="Present is implied by default. Only recorded absences are stored."
      actions={
        <div className="flex items-center gap-2">
          <AuthButton
            roles={["admin", "teacher"]}
            variant="default"
            size="sm"
            onClick={openAddDialog}
            iconLeft={<HugeiconsIcon icon={PlusSignIcon} className="size-4" />}
          >
            Add Record
          </AuthButton>
        </div>
      }
      loading={isLoading}
      error={error}
      noData={false}
      skeleton={<AttendanceSkeleton />}
      fetching={isFetching}
      refreshAction={refetch}
    >
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">School Days Elapsed</p>
            <p className="mt-1 text-2xl font-semibold">{summary?.school_days_elapsed ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data?.academic_year?.name ?? "Current academic year"}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Present Days</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600">{summary?.present_days ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Calculated from school days</p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Recorded Absences</p>
            <p className="mt-1 text-2xl font-semibold text-destructive">{summary?.recorded_absences ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Saved attendance records</p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
            <p className="mt-1 text-2xl font-semibold">{attendanceRate.toFixed(2)}%</p>
            <p className="mt-1 text-xs text-muted-foreground">Present days / school days</p>
          </Card>
        </div>

        {/* Records list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recorded Attendance Entries ({records.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon className="p-4 [&_svg]:size-8">
                  <HugeiconsIcon icon={Calendar03Icon} />
                </EmptyStateIcon>
                <EmptyStateTitle>No Recorded Absences</EmptyStateTitle>
                <EmptyStateDescription>
                  This student is considered present for all elapsed school days until an absence is recorded.
                </EmptyStateDescription>
              </EmptyState>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="rounded-lg border p-4 hover:bg-muted/40 transition-colors duration-150 cursor-pointer">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">
                            {moment(record.date).isSame(new Date(), "day")
                              ? "Today"
                              : moment(record.date).isSame(moment().subtract(1, "day"), "day")
                              ? "Yesterday"
                              : moment(record.date).format("DD MMMM YYYY")}
                          </p>
                          <Badge variant={STATUS_BADGE_VARIANT[record.status]}>
                            {statusLabel(record.status)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {record.marking_period && (
                            <div className="flex items-center gap-1">
                              <Calendar className="size-4" />
                            <span>{record.marking_period}</span>
                            </div>
                          )}
                        </div>
                        {record.notes && (
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>{record.notes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <AuthButton
                          roles={["admin", "teacher"]}
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(record)}
                          iconLeft={<Pencil className="size-4" />}
                          tooltip="Edit attendance"
                        />
                         
                        <AuthButton
                          roles={["admin", "teacher"]}
                          variant="destructive"
                          size="icon"
                          onClick={() => setDeleteTargetId(record.id)}
                          iconLeft={<HugeiconsIcon icon={Delete02Icon} className="size-4" />}
                          tooltip="Delete attendance"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AttendanceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editTarget}
        onSubmit={handleFormSubmit}
        isPending={create.isPending || update.isPending}
      />

      <DeleteConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
        onConfirm={handleDeleteConfirm}
        loading={remove.isPending}
      />
    </PageLayout>
  );
}
