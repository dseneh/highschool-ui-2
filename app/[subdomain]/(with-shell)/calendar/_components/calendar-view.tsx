"use client";

import { Badge } from "@/components/ui/badge";
import { WeekGridShell } from "@/components/shared/week-grid-shell";
import { cn } from "@/lib/utils";
import type { SchoolCalendarEventDto } from "@/lib/api2/school-calendar/types";
import type { SectionScheduleDto } from "@/lib/api2/contacts-types";

type CalendarViewProps = {
  weekDates: Date[];
  today: Date;
  eventsByDate: Record<string, SchoolCalendarEventDto[]>;
  schedulesByDate?: Record<string, SectionScheduleDto[]>;
  sectionMode?: boolean;
  sectionScheduleLoading?: boolean;
  onEventClick?: (event: SchoolCalendarEventDto) => void;
};

const EVENT_TYPE_META: Record<
  SchoolCalendarEventDto["event_type"],
  { label: string; classes: string }
> = {
  holiday: {
    label: "Holiday",
    classes: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  non_school_day: {
    label: "Non-school Day",
    classes: "border-orange-300 bg-orange-100 text-orange-800",
  },
  special_day: {
    label: "Special Day",
    classes: "border-blue-300 bg-blue-100 text-blue-800",
  },
  schedule_override: {
    label: "Schedule Override",
    classes: "border-slate-300 bg-slate-100 text-slate-800",
  },
};

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toClock(value?: string | null) {
  if (!value) return "--:--";

  const [hRaw = "0", mRaw = "0"] = value.split(":");
  const hour24 = Number(hRaw);
  const minute = Number(mRaw);

  if (Number.isNaN(hour24) || Number.isNaN(minute)) return value;

  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function resolveTeacherName(schedule: SectionScheduleDto) {
  if (schedule.teacher?.full_name?.trim()) return schedule.teacher.full_name.trim();

  const row = schedule as unknown as Record<string, unknown>;
  const directTeacherName = row.teacher_name;
  if (typeof directTeacherName === "string" && directTeacherName.trim()) {
    return directTeacherName.trim();
  }

  const directAssignedTeacherName = row.assigned_teacher_name;
  if (typeof directAssignedTeacherName === "string" && directAssignedTeacherName.trim()) {
    return directAssignedTeacherName.trim();
  }

  return "Teacher not assigned";
}

export function CalendarView({
  weekDates,
  today,
  eventsByDate,
  schedulesByDate,
  sectionMode,
  sectionScheduleLoading,
  onEventClick,
}: CalendarViewProps) {
  return (
    <div className="h-full overflow-auto">
      <WeekGridShell
        weekDates={weekDates}
        today={today}
        className="min-w-275"
        renderDayContent={(date) => {
          const isoDate = toIsoDate(date);
          const events = eventsByDate[isoDate] || [];
          const schedules = schedulesByDate?.[isoDate] || [];

          if (sectionMode) {
            if (sectionScheduleLoading) {
              return (
                <div className="rounded-md border border-dashed bg-background/80 p-2 text-[11px] text-muted-foreground">
                  Loading classes...
                </div>
              );
            }

            if (schedules.length === 0) {
              return (
                <div className="rounded-md border border-dashed bg-background/80 p-2 text-[11px] text-muted-foreground">
                  No classes
                </div>
              );
            }

            return schedules.map((schedule) => {
              const start = schedule.period_time?.start_time ?? schedule.section_time_slot?.start_time;
              const end = schedule.period_time?.end_time ?? schedule.section_time_slot?.end_time;
              const isRecess = Boolean(schedule.is_recess || schedule.period?.period_type === "recess");
              const teacherName = resolveTeacherName(schedule);

              return (
                <div
                  key={`${isoDate}-${schedule.id}`}
                  className={cn(
                    "rounded-md border bg-background p-2 text-xs shadow-[0_1px_0_rgba(0,0,0,0.04)]",
                    isRecess && "border-orange-300/70 dark:border-orange-950/90 bg-orange-50/70 dark:bg-orange-950/50"
                  )}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="line-clamp-2 font-medium leading-snug">
                      {isRecess ? "Recess" : schedule.subject?.name ?? schedule.period?.name ?? "Class"}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 rounded-sm px-1.5 text-[10px]",
                        isRecess
                          ? "border-orange-300 bg-orange-100 text-orange-800"
                          : "border-emerald-300 bg-emerald-100 text-emerald-800"
                      )}
                    >
                      {isRecess ? "Recess" : "Class"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {toClock(start)} - {toClock(end)}
                  </p>
                  {!isRecess ? (
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                      {teacherName}
                    </p>
                  ) : null}
                </div>
              );
            });
          }

          if (events.length === 0) {
            return (
              <div className="rounded-md border border-dashed bg-background/80 p-2 text-[11px] text-muted-foreground">
                No events
              </div>
            );
          }

          return events.map((event) => (
            <button
              key={`${isoDate}-${event.id}`}
              type="button"
              onClick={() => onEventClick?.(event)}
              className="rounded-md border bg-background p-2 text-xs shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="line-clamp-2 font-medium leading-snug">{event.name}</p>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 rounded-sm px-1.5 text-[10px]", EVENT_TYPE_META[event.event_type].classes)}
                >
                  {EVENT_TYPE_META[event.event_type].label}
                </Badge>
              </div>
              {event.description ? (
                <p className="line-clamp-2 text-[11px] text-muted-foreground">{event.description}</p>
              ) : null}
            </button>
          ));
        }}
      />
    </div>
  );
}
