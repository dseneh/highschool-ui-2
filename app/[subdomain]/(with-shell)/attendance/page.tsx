"use client";

import { useMemo, useState } from "react";
import { useQueryState } from "nuqs";
import { CheckCheck, RefreshCcw, Save, Search, Undo2, UserX2 } from "lucide-react";
import { toast } from "sonner";

import PageLayout from "@/components/dashboard/page-layout";
import { AuthButton } from "@/components/auth/auth-button";
import {
  GradeLevelSelect,
  SectionSelect,
} from "@/components/shared/data-reusable";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectField } from "@/components/ui/select-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAttendanceMutations, useSectionAttendanceRoster } from "@/hooks/use-attendance";
import type {
  AttendanceRosterEntryDto,
  AttendanceStatusValue,
} from "@/lib/api2/attendance-types";
import { cn } from "@/lib/utils";

const ABSENCE_OPTIONS: Array<{ value: AttendanceStatusValue; label: string }> = [
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
  { value: "sick", label: "Sick" },
  { value: "on_leave", label: "On Leave" },
];

const STATUS_BADGE_CLASS: Record<AttendanceStatusValue, string> = {
  present: "border-emerald-300 bg-emerald-100 text-emerald-800",
  late: "border-amber-300 bg-amber-100 text-amber-800",
  absent: "border-destructive/40 bg-destructive/10 text-destructive",
  excused: "border-blue-300 bg-blue-100 text-blue-800",
  holiday: "border-violet-300 bg-violet-100 text-violet-800",
  sick: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-800",
  on_leave: "border-slate-300 bg-slate-100 text-slate-800",
};

type DraftEntry = {
  status: AttendanceStatusValue;
  notes: string;
};

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function AttendancePageSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 p-5 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-30 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-120 rounded-xl" />
    </div>
  );
}

export default function AttendancePage() {
  const [selectedGradeId, setSelectedGradeId] = useQueryState("gradeLevel");
  const [selectedSectionId, setSelectedSectionId] = useQueryState("section");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, DraftEntry>>({});

  const rosterDate = useMemo(() => toIsoDate(selectedDate), [selectedDate]);
  const { data: roster, isLoading, isFetching, refetch, error } = useSectionAttendanceRoster(
    selectedSectionId ?? undefined,
    {
      date: rosterDate,
    }
  );
  const { saveSectionRoster } = useAttendanceMutations();

  const displayedEntries = useMemo(() => {
    return (roster?.entries ?? []).map((entry) => ({
      ...entry,
      status: drafts[entry.enrollment_id]?.status ?? entry.status,
      notes: drafts[entry.enrollment_id]?.notes ?? entry.notes ?? "",
    }));
  }, [drafts, roster?.entries]);

  const summary = useMemo(() => {
    const total = displayedEntries.length;
    const present = displayedEntries.filter((entry) => entry.status === "present").length;
    const late = displayedEntries.filter((entry) => entry.status === "late").length;
    const absent = displayedEntries.filter((entry) => entry.status !== "present").length;
    const covered = present + late;
    const rate = total > 0 ? Math.round((covered / total) * 100) : 0;

    return { total, present, late, absent, rate };
  }, [displayedEntries]);

  const filteredEntries = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return displayedEntries;

    return displayedEntries.filter((entry) => {
      return (
        entry.student_name.toLowerCase().includes(term) ||
        entry.student_id.toLowerCase().includes(term)
      );
    });
  }, [displayedEntries, searchQuery]);

  const hasPendingChanges = useMemo(() => Object.keys(drafts).length > 0, [drafts]);

  function updateDraft(enrollmentId: string, next: Partial<DraftEntry>, base: AttendanceRosterEntryDto) {
    setDrafts((current) => {
      const existing = current[enrollmentId] ?? {
        status: base.status,
        notes: base.notes ?? "",
      };
      const updated = {
        ...existing,
        ...next,
      };

      if (updated.status === base.status && updated.notes === (base.notes ?? "")) {
        const { [enrollmentId]: _removed, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [enrollmentId]: updated,
      };
    });
  }

  function startRecordingAbsence(base: AttendanceRosterEntryDto) {
    updateDraft(base.enrollment_id, { status: "absent" }, base);
  }

  function clearAbsence(base: AttendanceRosterEntryDto) {
    updateDraft(base.enrollment_id, { status: "present", notes: "" }, base);
  }

  async function handleSave() {
    if (!selectedSectionId || !roster) return;

    try {
      const absenceEntries = displayedEntries
        .filter((entry) => entry.status !== "present")
        .map((entry) => ({
          enrollment_id: entry.enrollment_id,
          status: entry.status,
          notes: entry.notes || null,
        }));

      await saveSectionRoster.mutateAsync({
        sectionId: selectedSectionId,
        payload: {
          date: rosterDate,
          entries: absenceEntries,
        },
      });
      setDrafts({});
      toast.success("Attendance saved");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Failed to save attendance";
      toast.error(message);
    }
  }

  return (
    <PageLayout
      title="Attendance"
      description="Students are present by default. Record only absences with notes."
      loading={false}
      error={error ?? undefined}
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="xl:col-span-4 2xl:col-span-3">
          <Card className="xl:sticky xl:top-6">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-base">Section Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <GradeLevelSelect
                // searchable
                useUrlState={false}
                value={selectedGradeId ?? ""}
                onChange={(value) => {
                  setSelectedGradeId(value || null);
                  setSelectedSectionId(null);
                  setDrafts({});
                }}
                placeholder="Select grade level"
              />
              <SectionSelect
                // searchable
                useUrlState={false}
                value={selectedSectionId ?? ""}
                onChange={(value) => {
                  setSelectedSectionId(value || null);
                  setDrafts({});
                }}
                gradeLevelId={selectedGradeId ?? ""}
                disabled={!selectedGradeId}
                placeholder={selectedGradeId ? "Select section" : "Choose grade first"}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Date</p>
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => {
                    if (!date) return;
                    setSelectedDate(date);
                    setDrafts({});
                  }}
                  placeholder="Pick attendance date"
                />
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                All students are assumed present. Record only absences below.
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => void refetch()}
                  iconLeft={<RefreshCcw className="h-4 w-4" />}
                >
                  Refresh Roster
                </Button>
                <AuthButton
                  roles={["admin", "registrar", "data_entry"]}
                  onClick={handleSave}
                  disabled={!selectedSectionId || !hasPendingChanges}
                  loading={saveSectionRoster.isPending}
                  loadingText="Saving..."
                  iconLeft={<Save className="h-4 w-4" />}
                >
                  Save Absences
                </AuthButton>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6 xl:col-span-8 2xl:col-span-9">
          {!selectedSectionId ? (
            <Card>
              <CardContent className="p-10">
                <EmptyState>
                  <EmptyStateIcon>
                    <CheckCheck className="size-6" />
                  </EmptyStateIcon>
                  <EmptyStateTitle>Select a Section</EmptyStateTitle>
                  <EmptyStateDescription>
                    Use the sidebar to choose class context and date, then record only students who are absent.
                  </EmptyStateDescription>
                </EmptyState>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <AttendancePageSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card className="p-5">
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="mt-1 text-3xl font-semibold">{summary.total}</p>
                </Card>
                <Card className="p-5">
                  <p className="text-sm text-muted-foreground">Present (Default)</p>
                  <p className="mt-1 text-3xl font-semibold text-emerald-600">{summary.present}</p>
                </Card>
                <Card className="p-5">
                  <p className="text-sm text-muted-foreground">Recorded Absences</p>
                  <p className="mt-1 text-3xl font-semibold text-destructive">{summary.absent}</p>
                </Card>
                <Card className="p-5">
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="mt-1 text-3xl font-semibold">{summary.rate}%</p>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-muted/10 pb-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {roster?.section.name ?? "Section Attendance"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {rosterDate} • {roster?.marking_period?.name ?? "No marking period"}
                      </p>
                    </div>
                    <div className="relative w-full md:w-80">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search by student name or ID"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isFetching && !isLoading ? (
                    <div className="border-b bg-muted/20 px-4 py-2 text-sm text-muted-foreground">
                      Refreshing roster...
                    </div>
                  ) : null}

                  {!filteredEntries.length ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No students matched this search.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-30">Student ID</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead className="w-56">Absence Type</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="w-36 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEntries.map((entry) => {
                          const baseEntry = roster?.entries.find(
                            (candidate) => candidate.enrollment_id === entry.enrollment_id
                          );
                          if (!baseEntry) return null;

                          const changed = Boolean(drafts[entry.enrollment_id]);
                          const isAbsent = entry.status !== "present";

                          return (
                            <TableRow key={entry.enrollment_id} className={cn(changed && "bg-primary/5")}>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {entry.student_id}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{entry.student_name}</span>
                                  <Badge variant="outline" className={STATUS_BADGE_CLASS[entry.status]}>
                                    {entry.status === "present"
                                      ? "Present"
                                      : ABSENCE_OPTIONS.find((option) => option.value === entry.status)?.label ??
                                        entry.status}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                {isAbsent ? (
                                  <SelectField
                                    value={entry.status}
                                    onValueChange={(value) =>
                                      updateDraft(
                                        entry.enrollment_id,
                                        { status: value as AttendanceStatusValue },
                                        baseEntry
                                      )
                                    }
                                    items={ABSENCE_OPTIONS}
                                    placeholder="Select absence type"
                                  />
                                ) : (
                                  <span className="text-sm text-muted-foreground">No absence recorded</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {isAbsent ? (
                                  <Input
                                    value={entry.notes ?? ""}
                                    onChange={(event) =>
                                      updateDraft(
                                        entry.enrollment_id,
                                        { notes: event.target.value },
                                        baseEntry
                                      )
                                    }
                                    placeholder="Optional note"
                                  />
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {isAbsent ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => clearAbsence(baseEntry)}
                                    iconLeft={<Undo2 className="h-4 w-4" />}
                                  >
                                    Mark Present
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startRecordingAbsence(baseEntry)}
                                    iconLeft={<UserX2 className="h-4 w-4" />}
                                  >
                                    Record Absence
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </section>
      </div>
    </PageLayout>
  );
}