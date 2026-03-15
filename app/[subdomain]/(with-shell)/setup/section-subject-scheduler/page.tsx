"use client";

import { useMemo, useState } from "react";
import { useQueryState } from "nuqs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  UserIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

import PageLayout from "@/components/dashboard/page-layout";
import { AuthButton } from "@/components/auth/auth-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogBox } from "@/components/ui/dialog-box";
import { cn } from "@/lib/utils";

import { useGradeLevels } from "@/hooks/use-grade-level";
import { useSectionSubjects } from "@/hooks/use-section-subjects";

import { useStaffApi } from "@/lib/api2/staff/api";
import { usePeriodsApi } from "@/lib/api2/period/api";
import { useSectionTimeSlotsApi } from "@/lib/api2/section-time-slot/api";
import { useSectionSchedulesApi } from "@/lib/api2/section-schedule/api";
import { useTeacherScheduleProjection } from "@/lib/api2/schedule-projection";
import type { TeacherScheduleProjectionDto } from "@/lib/api2/schedule-projection";
import { getErrorMessage } from "@/lib/utils";
import {Tooltip, TooltipTrigger, TooltipContent} from '@/components/ui/tooltip';

/* ─── Types ──────────────────────────────────────────────────────────────── */

type PeriodType = "class" | "recess";
type PeriodDto = { id: string; name: string; period_type?: PeriodType };
type SectionTimeSlotDto = {
  id: string; day_of_week: number; start_time: string; end_time: string;
  sort_order: number; period: { id: string; name: string; period_type?: PeriodType };
};
type SectionScheduleDto = {
  id: string; section: { id: string; name: string };
  subject: { id: string; name: string } | null;
  teacher?: { id: string; id_number: string; full_name: string } | null;
  period: { id: string; name: string; period_type?: PeriodType };
  section_time_slot?: { id: string; day_of_week: number; start_time: string; end_time: string; sort_order: number } | null;
  period_time?: { id: string | null; day_of_week: number; start_time: string; end_time: string } | null;
  is_recess?: boolean;
};
type TeacherSubjectAssignment = {
  id: string; teacher: { id: string; id_number: string; full_name: string };
  section_subject: { id: string; subject: { id: string; name: string } };
};

/* ─── Constants ──────────────────────────────────────────────────────────── */

const DAY_NAMES: Record<number, string> = {
  1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday",
  5: "Friday",  6: "Saturday", 7: "Sunday",
};

const DAY_COLORS: Record<number, string> = {
  1: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  2: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
  3: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
  4: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
  5: "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800",
  6: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800",
  7: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
};

const DAY_BADGE_COLORS: Record<number, string> = {
  1: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  2: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  3: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  4: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  5: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  6: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  7: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatTime(value?: string | null) {
  if (!value) return "--";
  const [h, m] = value.split(":");
  const hour = Number.parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${normalizedHour}:${m} ${ampm}`;
}

function rangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return startA < endB && endA > startB;
}

function getList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    const r = (data as { results?: unknown }).results;
    if (Array.isArray(r)) return r as T[];
  }
  return [];
}

function parseTeacherAssignments(data: unknown): TeacherSubjectAssignment[] {
  const rows = getList<Record<string, unknown>>(data);
  return rows
    .map((row) => {
      const id = typeof row.id === "string" ? row.id : "";
      const tObj = row.teacher && typeof row.teacher === "object" ? (row.teacher as Record<string, unknown>) : null;
      const ssObj = row.section_subject && typeof row.section_subject === "object" ? (row.section_subject as Record<string, unknown>) : null;
      const subjectObj = ssObj?.subject && typeof ssObj.subject === "object" ? (ssObj.subject as Record<string, unknown>) : null;
      const teacherId = typeof tObj?.id === "string" ? tObj.id : "";
      const sectionSubjectId = typeof ssObj?.id === "string" ? ssObj.id : "";
      if (!id || !teacherId || !sectionSubjectId) return null;
      return {
        id,
        teacher: {
          id: teacherId,
          id_number: typeof tObj?.id_number === "string" ? tObj.id_number : "",
          full_name: typeof tObj?.full_name === "string" ? tObj.full_name : "",
        },
        section_subject: {
          id: sectionSubjectId,
          subject: {
            id: typeof subjectObj?.id === "string" ? subjectObj.id : "",
            name: typeof subjectObj?.name === "string" ? subjectObj.name : "",
          },
        },
      };
    })
    .filter((row): row is TeacherSubjectAssignment => row !== null);
}

/* ────────────────────────────────────────────────────────────────────────── */

export default function SectionSubjectSchedulerPage() {
  const queryClient = useQueryClient();
  const staffApi = useStaffApi();
  const periodsApi = usePeriodsApi();
  const sectionSlotApi = useSectionTimeSlotsApi();
  const sectionScheduleApi = useSectionSchedulesApi();

  const [, setGradeLevelId] = useQueryState("gradeLevel", { defaultValue: "" });
  const [sectionId, setSectionId] = useQueryState("section", { defaultValue: "" });

  const { data: gradeLevels = [], isLoading: gradeLevelsLoading } = useGradeLevels();

  // Build flat section list from grade-levels (avoids extra API call)
  const allSections = useMemo(
    () => gradeLevels.flatMap((gl) => gl.sections.map((s) => ({ ...s, gradeLevelId: gl.id, gradeLevelName: gl.name }))),
    [gradeLevels],
  );
  const effectiveSectionId = (sectionId && allSections.some((s) => s.id === sectionId) ? sectionId : (allSections[0]?.id ?? ""));

  const [panelOpen, setPanelOpen] = useState(false);
  const [clickedFromCell, setClickedFromCell] = useState(false);
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState<SectionScheduleDto | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [selectedSectionSubjectId, setSelectedSectionSubjectId] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const { data: sectionSubjects = [], isLoading: sectionSubjectsLoading } =
    useSectionSubjects(effectiveSectionId || undefined);

  const { data: periods = [], isLoading: periodsLoading } = useQuery<PeriodDto[]>({
    queryKey: ["periods"],
    queryFn: async () => { const res = await periodsApi.getPeriodsApi(); return res.data as PeriodDto[]; },
  });

  const { data: sectionSlots = [], isLoading: sectionSlotsLoading } = useQuery<SectionTimeSlotDto[]>({
    queryKey: ["section-time-slots", effectiveSectionId],
    enabled: Boolean(effectiveSectionId),
    queryFn: async () => {
      const res = await sectionSlotApi.getSectionTimeSlotsApi(effectiveSectionId);
      return res.data as SectionTimeSlotDto[];
    },
  });

  const {
    data: sectionSchedules = [],
    isLoading: sectionSchedulesLoading,
    refetch: refetchSchedules,
  } = useQuery<SectionScheduleDto[]>({
    queryKey: ["section-schedules", effectiveSectionId],
    enabled: Boolean(effectiveSectionId),
    queryFn: async () => {
      const res = await sectionScheduleApi.getSectionSchedulesBySectionApi(effectiveSectionId);
      return res.data as SectionScheduleDto[];
    },
  });

  const { data: teacherAssignmentsData, isLoading: teacherAssignmentsLoading } = useQuery({
    queryKey: ["teacher-subjects", "section-subject", selectedSectionSubjectId],
    enabled: Boolean(selectedSectionSubjectId),
    queryFn: async () => {
      const res = await staffApi.getTeacherSubjectsApi({ section_subject: selectedSectionSubjectId, page_size: 100 });
      return res.data;
    },
  });

  const teacherAssignments = useMemo(() => parseTeacherAssignments(teacherAssignmentsData), [teacherAssignmentsData]);
  const previewTeacher = useMemo(() => {
    const map = new Map<string, TeacherSubjectAssignment["teacher"]>();
    for (const a of teacherAssignments) { if (!map.has(a.teacher.id)) map.set(a.teacher.id, a.teacher); }
    return Array.from(map.values())[0] ?? null;
  }, [teacherAssignments]);

  const { data: teacherProjection = [] } = useTeacherScheduleProjection(previewTeacher?.id);

  const selectedSlot = useMemo(() => sectionSlots.find((s) => s.id === selectedSlotId) ?? null, [sectionSlots, selectedSlotId]);
  const selectablePeriods = useMemo(() => periods.filter((p) => p.period_type !== "recess"), [periods]);
  const filteredSlots = useMemo(() => {
    const base = selectedPeriodId ? sectionSlots.filter((s) => s.period.id === selectedPeriodId) : sectionSlots;
    return base.slice().sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.start_time.localeCompare(b.start_time);
    });
  }, [sectionSlots, selectedPeriodId]);

  const teacherConflict = useMemo(() => {
    if (!selectedSlot || !previewTeacher) return null;
    const { day_of_week: day, start_time: slotStart, end_time: slotEnd } = selectedSlot;
    return (teacherProjection as TeacherScheduleProjectionDto[]).find((row) => {
      const { day_of_week: rowDay, start_time: rowStart, end_time: rowEnd } = row.time_window;
      if (!rowDay || !rowStart || !rowEnd || rowDay !== day) return false;
      return rangesOverlap(slotStart, slotEnd, rowStart, rowEnd);
    }) ?? null;
  }, [previewTeacher, selectedSlot, teacherProjection]);

  const sectionConflict = useMemo(() => {
    if (!selectedSlot) return null;
    const { day_of_week: day, start_time: slotStart, end_time: slotEnd } = selectedSlot;
    return sectionSchedules.find((entry) => {
      const entDay = entry.section_time_slot?.day_of_week ?? entry.period_time?.day_of_week;
      const entStart = entry.section_time_slot?.start_time ?? entry.period_time?.start_time;
      const entEnd = entry.section_time_slot?.end_time ?? entry.period_time?.end_time;
      if (!entDay || !entStart || !entEnd || entDay !== day) return false;
      return rangesOverlap(slotStart, slotEnd, entStart, entEnd);
    }) ?? null;
  }, [sectionSchedules, selectedSlot]);

  const uniqueDays = useMemo(() => {
    const days = new Set<number>();
    for (const slot of sectionSlots) days.add(slot.day_of_week);
    return Array.from(days).sort((a, b) => a - b);
  }, [sectionSlots]);

  const uniqueTimeBands = useMemo(() => {
    const byOrder = new Map<number, { start_time: string; end_time: string; sort_order: number }>();
    for (const slot of sectionSlots) {
      if (!byOrder.has(slot.sort_order)) {
        byOrder.set(slot.sort_order, {
          start_time: slot.start_time,
          end_time: slot.end_time,
          sort_order: slot.sort_order,
        });
      }
    }
    return Array.from(byOrder.values()).sort((a, b) => a.sort_order - b.sort_order);
  }, [sectionSlots]);

  const scheduleBySlot = useMemo(() => {
    const map = new Map<string, SectionScheduleDto>();
    for (const entry of sectionSchedules) {
      const slotId = entry.section_time_slot?.id;
      if (slotId) map.set(slotId, entry);
    }
    return map;
  }, [sectionSchedules]);

  const slotLookup = useMemo(() => {
    const map = new Map<string, SectionTimeSlotDto>();
    for (const slot of sectionSlots) {
      map.set(`${slot.day_of_week}|${slot.sort_order}`, slot);
    }
    return map;
  }, [sectionSlots]);

  const createScheduleMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveSectionId || !selectedPeriodId || !selectedSlotId || !selectedSectionSubjectId)
        throw new Error("All fields are required.");
      const res = await sectionScheduleApi.createSectionScheduleApi(
        effectiveSectionId,
        { subject: selectedSectionSubjectId, period: selectedPeriodId, section_time_slot: selectedSlotId },
      );
      return res.data as SectionScheduleDto;
    },
    onSuccess: async () => {
      toast.success("Schedule entry added.");
      resetForm();
      setPanelOpen(false);
      setClickedFromCell(false);
      await queryClient.invalidateQueries({ queryKey: ["section-schedules", effectiveSectionId] });
      if (previewTeacher?.id)
        await queryClient.invalidateQueries({ queryKey: ["schedule-projections", "teacher", previewTeacher.id] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => { await sectionScheduleApi.deleteSectionScheduleApi(id); },
    onSuccess: async () => {
      toast.success("Schedule entry removed.");
      await queryClient.invalidateQueries({ queryKey: ["section-schedules", effectiveSectionId] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const generateSlotsMutation = useMutation({
    mutationFn: async () => sectionSlotApi.generateSectionTimeSlotsApi(effectiveSectionId),
    onSuccess: async () => {
      toast.success("Time slots generated successfully.");
      await queryClient.invalidateQueries({ queryKey: ["section-time-slots", effectiveSectionId] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  function resetForm() {
    setSelectedSectionSubjectId("");
    setSelectedPeriodId("");
    setSelectedSlotId("");
  }

  const canSave =
    Boolean(effectiveSectionId) && Boolean(selectedSectionSubjectId) &&
    Boolean(selectedPeriodId) && Boolean(selectedSlotId) &&
    !sectionConflict && !teacherConflict &&
    !createScheduleMutation.isPending;

  const selectedSectionName = allSections.find((s) => s.id === effectiveSectionId)?.name ?? "–";
  const isDataLoading = periodsLoading || sectionSlotsLoading || sectionSchedulesLoading || sectionSubjectsLoading;

  const filteredGradeLevels = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    if (!q) return gradeLevels;
    return gradeLevels
      .map((gl) => ({
        ...gl,
        sections: gl.sections.filter((s) => s.name.toLowerCase().includes(q) || gl.name.toLowerCase().includes(q)),
      }))
      .filter((gl) => gl.sections.length > 0 || gl.name.toLowerCase().includes(q));
  }, [gradeLevels, sidebarSearch]);

  return (
    <PageLayout
      title="Section Scheduler"
      description="Build the weekly class schedule for each section."
      loading={false}
      refreshAction={() => {
        refetchSchedules();
        queryClient.invalidateQueries({ queryKey: ["section-time-slots", effectiveSectionId] });
      }}
      actions={
        effectiveSectionId ? (
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => { resetForm(); setClickedFromCell(false); setPanelOpen(true); }}
          >
            Add Entry
          </Button>
        ) : undefined
      }
    >
      <div className="flex gap-0 -mx-1" style={{ height: "calc(100vh - 160px)" }}>
        {/* ── Left sidebar: section list ── */}
        <div className="w-56 shrink-0 border-r flex flex-col">
          {/* Search */}
          <div className="px-2 pb-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Find section…"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto pr-1">
          {gradeLevelsLoading ? (
            <div className="space-y-2 pt-1 px-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
            </div>
          ) : filteredGradeLevels.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 pt-3">
              {sidebarSearch ? "No sections match your search." : "No grade levels found."}
            </p>
          ) : (
            <div className="space-y-4 pt-1">
              {filteredGradeLevels.map((gl) => (
                <div key={gl.id}>
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    {gl.name}
                  </p>
                  <div className="space-y-0.5">
                    {gl.sections.length === 0 ? (
                      <p className="px-2 text-xs text-muted-foreground italic">No sections</p>
                    ) : (
                      gl.sections.map((sec) => {
                        const isActive = sec.id === effectiveSectionId;
                        return (
                          <button
                            key={sec.id}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "hover:bg-muted text-foreground",
                            )}
                            onClick={() => {
                              setSectionId(sec.id);
                              setGradeLevelId(gl.id);
                              resetForm();
                              setPanelOpen(false);
                            }}
                          >
                            {sec.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* ── Right: timetable ── */}
        <div className="flex-1 min-w-0 pl-5 overflow-y-auto">
          {!effectiveSectionId ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed py-16 text-center text-muted-foreground">
              <div className="space-y-2">
                <HugeiconsIcon icon={Calendar03Icon} className="mx-auto h-10 w-10 opacity-30" />
                <p className="font-medium">Select a section to view its schedule</p>
              </div>
            </div>
          ) : (
            <div>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h2 className="font-semibold text-base">{selectedSectionName}</h2>
                  <p className="text-xs text-muted-foreground">
                    {allSections.find((s) => s.id === effectiveSectionId)?.gradeLevelName}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Badge variant="secondary">{sectionSchedules.length} scheduled</Badge>
                  {sectionSlots.length === 0 && !isDataLoading && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      No time slots configured
                    </Badge>
                  )}
                </div>
              </div>
            {isDataLoading ? (
              <div className="overflow-hidden rounded-xl border">
                <div className="border-b bg-muted/40 px-4 py-3">
                  <div className="grid grid-cols-6 gap-3 items-center">
                    <Skeleton className="h-4 w-14" />
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-center">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divide-y">
                  {[...Array(6)].map((_, row) => (
                    <div key={row} className="grid grid-cols-6 gap-3 px-4 py-3">
                      <div className="space-y-1.5 pt-1">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-2.5 w-10" />
                      </div>

                      {[...Array(5)].map((__, col) => {
                        const showFilledCard = (row + col) % 3 === 0;
                        return showFilledCard ? (
                          <div key={col} className="rounded-lg border px-2.5 py-2.5 space-y-2 bg-muted/20">
                            <Skeleton className="h-3 w-3/4" />
                            <div className="flex items-center justify-between gap-2">
                              <Skeleton className="h-2.5 w-16" />
                              <Skeleton className="h-4 w-4 rounded" />
                            </div>
                          </div>
                        ) : (
                          <div key={col} className="rounded-lg border border-dashed border-muted-foreground/20 py-5 px-2 flex items-center justify-center">
                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : sectionSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center gap-4">
                <HugeiconsIcon icon={Calendar03Icon} className="h-10 w-10 text-muted-foreground/40" />
                <div>
                  <p className="font-medium">No time slots configured yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate default time slots for <span className="font-medium">{selectedSectionName}</span> to get started.
                  </p>
                </div>
                <Button
                  onClick={() => generateSlotsMutation.mutate()}
                  loading={generateSlotsMutation.isPending}
                  loadingText="Generating…"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Generate Time Slots
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                {sectionSchedules.length === 0 && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 border-b text-xs text-muted-foreground">
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>Click any <strong>empty cell</strong> in the grid to add a class for that time slot</span>
                  </div>
                )}
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap w-28">Time</th>
                      {uniqueDays.map((day) => (
                        <th key={day} className="px-3 py-3 text-center min-w-37">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                            DAY_BADGE_COLORS[day] ?? "bg-muted text-muted-foreground"
                          )}>
                            {DAY_NAMES[day] ?? `Day ${day}`}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueTimeBands.map((band, rowIdx) => (
                      <tr
                        key={`row-${band.sort_order}`}
                        className={cn("border-b last:border-0", rowIdx % 2 !== 0 && "bg-muted/20")}
                      >
                        <td className="px-4 py-3 whitespace-nowrap align-middle">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold leading-none">{formatTime(band.start_time)}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">{formatTime(band.end_time)}</span>
                          </div>
                        </td>
                        {uniqueDays.map((day) => {
                          const slot = slotLookup.get(`${day}|${band.sort_order}`);
                          if (!slot) {
                            return (
                              <td key={day} className="px-3 py-3 text-center align-middle">
                                <span
                                  className="text-muted-foreground/25 text-xs cursor-help"
                                >
                                    <Tooltip>
                                        <TooltipTrigger>
                                         — 
                                        </TooltipTrigger>
                                        <TooltipContent className="text-orange-300">
                                        No time slot configured for this section on this day/time — set up time slots in the Time Slots settings first
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                              </td>
                            );
                          }
                          const entry = scheduleBySlot.get(slot.id);
                          if (entry) {
                            return (
                              <td key={day} className="p-1.5 align-top">
                                <div className={cn(
                                  "rounded-lg px-2.5 py-2.5 border",
                                  DAY_COLORS[day] ?? "border-border bg-muted/40"
                                )}>
                                  <p className="text-xs font-semibold leading-snug text-foreground">
                                    {entry.subject?.name ?? <span className="italic font-normal text-muted-foreground">Recess</span>}
                                  </p>
                                  <div className="flex items-center justify-between gap-1 mt-1.5">
                                    <div className="flex items-center gap-1 min-w-0">
                                      <HugeiconsIcon icon={UserIcon} className="h-3 w-3 text-muted-foreground shrink-0" />
                                      {entry.teacher?.full_name ? (
                                        <span className="text-[10px] text-muted-foreground truncate">{entry.teacher.full_name}</span>
                                      ) : (
                                        <span className="text-[10px] text-orange-500 font-medium">No teacher</span>
                                      )}
                                    </div>
                                    <AuthButton
                                      roles={["admin", "registrar", "data_entry"]}
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
                                      loading={deleteScheduleMutation.isPending}
                                      onClick={() => setConfirmDeleteEntry(entry)}
                                      tooltip="Remove"
                                    >
                                      <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" />
                                    </AuthButton>
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          if (slot.period.period_type === "recess") {
                            return (
                              <td key={day} className="p-1.5 align-top">
                                <div className="w-full md:h-15 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 flex items-center justify-center py-5">
                                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Recess</span>
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td key={day} className="p-1.5 align-top">
                              <AuthButton
                                roles={["admin", "registrar", "data_entry"]}
                                variant="ghost"
                                className="w-full md:h-15 rounded-lg border border-dashed border-primary flex items-center justify-center py-5 opacity-30 hover:opacity-100 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                onClick={() => {
                                  resetForm();
                                  setSelectedSlotId(slot.id);
                                  setSelectedPeriodId(slot.period.id);
                                  setClickedFromCell(true);
                                  setPanelOpen(true);
                                }}
                                tooltip={`Add class on ${DAY_NAMES[day] ?? `Day ${day}`} at ${formatTime(slot.start_time)}`}
                              >
                                <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                              </AuthButton>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Add Schedule Entry Dialog */}
      <DialogBox
        open={panelOpen}
        onOpenChange={(open) => { if (!open) { setPanelOpen(false); setClickedFromCell(false); resetForm(); } }}
        title="Add Schedule Entry"
        description={effectiveSectionId ? selectedSectionName : undefined}
        actionLabel="Save Entry"
        onAction={() => createScheduleMutation.mutate()}
        actionDisabled={!canSave}
        actionLoading={createScheduleMutation.isPending}
        actionLoadingText="Saving…"
        roles={["admin", "registrar", "data_entry"]}
      >
        <div className="space-y-4 py-1">
          {/* Pre-selected time slot banner (when opened from timetable cell) */}
          {clickedFromCell && selectedSlot && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 border px-3 py-2.5">
              <HugeiconsIcon icon={Calendar03Icon} className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-semibold">{DAY_NAMES[selectedSlot.day_of_week] ?? `Day ${selectedSlot.day_of_week}`}</p>
                <p className="text-[10px] text-muted-foreground">{formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}</p>
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-xs">Subject</Label>
            <SelectField
              value={selectedSectionSubjectId}
              onValueChange={(v) => {
                setSelectedSectionSubjectId(String(v ?? ""));
                if (!clickedFromCell) setSelectedSlotId("");
              }}
              searchable
              disabled={sectionSubjects.length === 0}
              placeholder={sectionSubjects.length ? "Search subject…" : "No subjects assigned"}
              items={sectionSubjects.map((s) => ({ value: s.id, label: s.subject.name }))}
            />
          </div>

          {/* Teacher preview */}
          {selectedSectionSubjectId && (
            <div className={cn(
              "rounded-lg border px-3 py-2.5 text-sm",
              teacherAssignmentsLoading ? "border-border"
                : previewTeacher
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                  : "border-muted-foreground/20 bg-muted/40"
            )}>
              {teacherAssignmentsLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : previewTeacher ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-medium text-xs">{previewTeacher.full_name}</p>
                    <p className="text-[10px] text-muted-foreground">Assigned teacher</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    No teacher assigned yet — you can still schedule this subject.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Period — hidden when time slot is pre-selected from timetable */}
          {!clickedFromCell && (
            <div className="space-y-1.5">
              <Label className="text-xs">Period</Label>
              <SelectField
                value={selectedPeriodId}
                onValueChange={(v) => {
                  const next = String(v ?? "");
                  setSelectedPeriodId(next);
                  const isSlotFromPeriod = sectionSlots.find((s) => s.id === selectedSlotId)?.period.id === next;
                  if (!isSlotFromPeriod) setSelectedSlotId("");
                }}
                searchable
                placeholder="Select period"
                items={selectablePeriods.map((p) => ({ value: p.id, label: p.name }))}
              />
            </div>
          )}

          {/* Time slot — hidden when pre-selected from timetable */}
          {!clickedFromCell && (
            <div className="space-y-1.5">
              <Label className="text-xs">Time Slot</Label>
              <SelectField
                value={selectedSlotId}
                onValueChange={(v) => {
                  const next = String(v ?? "");
                  setSelectedSlotId(next);
                  const slot = sectionSlots.find((s) => s.id === next);
                  if (slot) setSelectedPeriodId(slot.period.id);
                }}
                searchable
                disabled={filteredSlots.length === 0}
                placeholder={filteredSlots.length ? "Select time slot…" : "No slots available"}
                items={filteredSlots.map((slot) => ({
                  value: slot.id,
                  label: `${DAY_NAMES[slot.day_of_week] ?? `Day ${slot.day_of_week}`} · ${formatTime(slot.start_time)}–${formatTime(slot.end_time)}`,
                }))}
              />
            </div>
          )}

          {/* Conflict indicators — only shown when there's a teacher and a slot */}
          {selectedSlot && previewTeacher && (
            <div className="space-y-1.5">
              <div className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                teacherConflict
                  ? "bg-destructive/10 text-destructive border border-destructive/30"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              )}>
                {teacherConflict ? (
                  <><AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>Teacher already has <strong>{teacherConflict.subject?.name ?? "a class"}</strong> in {teacherConflict.section.name} at this time</span>
                  </>
                ) : (
                  <><CheckCircle className="h-3 w-3 shrink-0" /><span>Teacher is free at this time</span></>
                )}
              </div>
            </div>
          )}

          {selectedSlot && !previewTeacher && selectedSectionSubjectId && (
            <div className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
              sectionConflict
                ? "bg-destructive/10 text-destructive border border-destructive/30"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
            )}>
              {sectionConflict ? (
                <><AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>This section already has <strong>{sectionConflict.subject?.name ?? "another class"}</strong> at this time</span>
                </>
              ) : (
                <><CheckCircle className="h-3 w-3 shrink-0" /><span>No scheduling conflict for this section</span></>
              )}
            </div>
          )}

          {selectedSlot && previewTeacher && (
            <div className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
              sectionConflict
                ? "bg-destructive/10 text-destructive border border-destructive/30"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
            )}>
              {sectionConflict ? (
                <><AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>This section already has <strong>{sectionConflict.subject?.name ?? "another class"}</strong> at this time</span>
                </>
              ) : (
                <><CheckCircle className="h-3 w-3 shrink-0" /><span>No scheduling conflict for this section</span></>
              )}
            </div>
          )}
        </div>
      </DialogBox>

      {/* Delete Confirmation */}
      <DialogBox
        open={Boolean(confirmDeleteEntry)}
        onOpenChange={(open) => { if (!open) setConfirmDeleteEntry(null); }}
        title="Remove Schedule Entry"
        description={`Remove "${confirmDeleteEntry?.subject?.name ?? "this entry"}" from the schedule? This cannot be undone.`}
        actionLabel="Remove"
        actionVariant="destructive"
        onAction={() => {
          if (confirmDeleteEntry) {
            deleteScheduleMutation.mutate(confirmDeleteEntry.id);
            setConfirmDeleteEntry(null);
          }
        }}
        actionLoading={deleteScheduleMutation.isPending}
        actionLoadingText="Removing…"
      />
    </PageLayout>
  );
}
