"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryState } from "nuqs";

import PageLayout from "@/components/dashboard/page-layout";
import { AuthButton } from "@/components/auth/auth-button";
import { DialogBox } from "@/components/ui/dialog-box";
import {
  useCreateSchoolCalendarEvent,
  useDeleteSchoolCalendarEvent,
  useSchoolCalendarEvents,
  useSectionCalendarProjection,
  useUpdateSchoolCalendarEvent,
} from "@/hooks/use-school-calendar";
import type { SchoolCalendarEventDto } from "@/lib/api2/school-calendar/types";
import type { SectionScheduleDto } from "@/lib/api2/contacts-types";
import { useSectionTimeSlots } from "@/lib/api2/section-time-slot";

import { CalendarControls } from "./_components/calendar-controls";
import { CalendarView } from "./_components/calendar-view";
import { EventDetailSheet } from "./_components/event-detail-sheet";
import { CalendarEventDialog } from "./_components/create-calendar-event-dialog";
import { SectionFilterSheet } from "./_components/section-filter-sheet";

type SectionTimeSlotRow = {
  id: string;
  section: { id: string; name: string };
  period: { id: string; name: string; period_type?: "class" | "recess" };
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recess?: boolean;
};

type EventFilter = "all" | "holiday" | "non_school_day" | "special_day" | "schedule_override";

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function getWeekStart(dateInput: Date) {
  const date = new Date(dateInput);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function normalizeRecurringStart(event: SchoolCalendarEventDto, year: number) {
  const parts = event.start_date.split("-").map(Number);
  const month = parts[1];
  const day = parts[2];

  if (month === 2 && day === 29) {
    const leapDate = new Date(year, 1, 29);
    if (leapDate.getMonth() === 1) return leapDate;
    return new Date(year, 1, 28);
  }

  return new Date(year, month - 1, day);
}

function getEventDatesInRange(event: SchoolCalendarEventDto, rangeStart: Date, rangeEnd: Date) {
  const dates: string[] = [];
  const start = new Date(`${event.start_date}T00:00:00`);
  const end = new Date(`${event.end_date}T00:00:00`);

  if (event.recurrence_type === "none") {
    const cursor = new Date(Math.max(start.getTime(), rangeStart.getTime()));
    const stop = new Date(Math.min(end.getTime(), rangeEnd.getTime()));
    while (cursor <= stop) {
      dates.push(toIsoDate(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  const durationDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
  for (let year = rangeStart.getFullYear() - 1; year <= rangeEnd.getFullYear() + 1; year++) {
    const occurrenceStart = normalizeRecurringStart(event, year);
    const occurrenceEnd = addDays(occurrenceStart, durationDays);
    if (occurrenceStart > rangeEnd || occurrenceEnd < rangeStart) continue;

    const cursor = new Date(Math.max(occurrenceStart.getTime(), rangeStart.getTime()));
    const stop = new Date(Math.min(occurrenceEnd.getTime(), rangeEnd.getTime()));
    while (cursor <= stop) {
      dates.push(toIsoDate(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return dates;
}

export default function CalendarPage() {
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<EventFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<SchoolCalendarEventDto | null>(null);
  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionFilterOpen, setSectionFilterOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useQueryState("section");

  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const range = useMemo(
    () => ({ start: toIsoDate(weekStart), end: toIsoDate(weekEnd) }),
    [weekStart, weekEnd]
  );
  const { data: events = [] } = useSchoolCalendarEvents(range);
  const {
    data: sectionProjection,
    isFetching: sectionProjectionFetching,
  } = useSectionCalendarProjection(selectedSectionId ?? undefined, range);
  const sectionTimeSlotApi = useSectionTimeSlots();
  const { data: sectionTimeSlots = [] } = sectionTimeSlotApi.getSectionTimeSlots(
    selectedSectionId ?? "",
    { enabled: Boolean(selectedSectionId) }
  );
  const createEvent = useCreateSchoolCalendarEvent();
  const updateEvent = useUpdateSchoolCalendarEvent();
  const deleteEvent = useDeleteSchoolCalendarEvent();

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      const matchesType = eventTypeFilter === "all" || event.event_type === eventTypeFilter;
      if (!matchesType) return false;
      if (selectedSectionId) {
        const matchesSection =
          event.applies_to_all_sections || event.sections.includes(selectedSectionId);
        if (!matchesSection) return false;
      }
      if (!query) return true;
      const haystack = `${event.name} ${event.description || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [events, eventTypeFilter, searchQuery, selectedSectionId]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, SchoolCalendarEventDto[]> = {};
    for (const event of filteredEvents) {
      const dates = getEventDatesInRange(event, weekStart, weekEnd);
      for (const isoDate of dates) {
        if (!map[isoDate]) map[isoDate] = [];
        map[isoDate].push(event);
      }
    }
    return map;
  }, [filteredEvents, weekStart, weekEnd]);

  const schedulesByDate = useMemo(() => {
    if (!selectedSectionId || !sectionProjection?.days?.length) return {};

    const slots = sectionTimeSlots as SectionTimeSlotRow[];
    const recessSlotsByDay: Record<number, SectionTimeSlotRow[]> = {};
    for (const slot of slots) {
      const isRecess = slot.is_recess || slot.period?.period_type === "recess";
      if (!isRecess || !slot.day_of_week) continue;
      if (!recessSlotsByDay[slot.day_of_week]) recessSlotsByDay[slot.day_of_week] = [];
      recessSlotsByDay[slot.day_of_week].push(slot);
    }

    const map: Record<string, SectionScheduleDto[]> = {};
    for (const day of sectionProjection.days) {
      const dailySchedules = [...(day.schedules ?? [])];

      if (!day.is_blocked_by_event && day.is_operating_day) {
        const recessSlots = recessSlotsByDay[day.day_of_week] ?? [];

        for (const slot of recessSlots) {
          const alreadyExists = dailySchedules.some((schedule) => {
            const start = schedule.period_time?.start_time ?? schedule.section_time_slot?.start_time;
            const end = schedule.period_time?.end_time ?? schedule.section_time_slot?.end_time;
            return start === slot.start_time && end === slot.end_time;
          });

          if (alreadyExists) continue;

          dailySchedules.push({
            id: `recess-${slot.id}-${day.date}`,
            section: slot.section,
            subject: null,
            teacher: null,
            period: {
              id: slot.period.id,
              name: slot.period.name,
              period_type: "recess",
            },
            period_time: {
              id: slot.id,
              day_of_week: slot.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
            },
            section_time_slot: {
              id: slot.id,
              day_of_week: slot.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
            },
            is_recess: true,
          });
        }
      }

      dailySchedules.sort((a, b) => {
        const aStart = a.period_time?.start_time ?? a.section_time_slot?.start_time ?? "";
        const bStart = b.period_time?.start_time ?? b.section_time_slot?.start_time ?? "";
        return aStart.localeCompare(bStart);
      });

      map[day.date] = dailySchedules;
    }

    return map;
  }, [selectedSectionId, sectionProjection, sectionTimeSlots]);

  const selectedSectionLabel = useMemo(() => {
    if (!selectedSectionId) return null;
    return sectionProjection?.section?.name ?? "Selected section";
  }, [selectedSectionId, sectionProjection]);

  const handleCreateEvent = async (payload: Partial<SchoolCalendarEventDto>) => {
    await createEvent.mutateAsync(payload, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["school-calendar-events"] });
      },
    });
  };

  const handleUpdateEvent = async (payload: Partial<SchoolCalendarEventDto>) => {
    if (!selectedEvent) throw new Error("No event selected");

    await updateEvent.mutateAsync(
      { id: selectedEvent.id, payload },
      {
        onSuccess: async (updated) => {
          setSelectedEvent(updated);
          await queryClient.invalidateQueries({ queryKey: ["school-calendar-events"] });
        },
      }
    );
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await deleteEvent.mutateAsync(selectedEvent.id, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["school-calendar-events"] });
        },
      });
      toast.success("Event deleted");
      setDeleteDialogOpen(false);
      setEventSheetOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete event";
      toast.error(message);
    }
  };

  const handleEventClick = (event: SchoolCalendarEventDto) => {
    setSelectedEvent(event);
    setEventSheetOpen(true);
  };

  useEffect(() => {
    if (!eventSheetOpen || !selectedEvent) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingInInput = Boolean(
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      );
      if (isTypingInInput || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key.toLowerCase() === "e") {
        event.preventDefault();
        setEditDialogOpen(true);
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        setDeleteDialogOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [eventSheetOpen, selectedEvent]);

  return (
    <>
      <PageLayout
        title="Calendar"
        description="School-wide weekly calendar with event details"
        actions={
          <AuthButton
            roles="admin"
            disable
            iconLeft={<Plus className="h-4 w-4" />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Event
          </AuthButton>
        }
      >
        <div className=" w-full overflow-hidden">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
            <CalendarControls
              selectedDate={selectedDate}
              onSelectedDateChange={setSelectedDate}
              onToday={() => setSelectedDate(new Date())}
              onPrevWeek={() => setSelectedDate((prev) => addDays(prev, -7))}
              onNextWeek={() => setSelectedDate((prev) => addDays(prev, 7))}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              eventTypeFilter={eventTypeFilter}
              onEventTypeFilterChange={setEventTypeFilter}
              selectedSectionName={selectedSectionLabel}
              onSectionFilterClick={() => setSectionFilterOpen(true)}
              onClearSection={() => {
                setSelectedSectionId(null);
              }}
            />
            <div className="min-h-0 flex-1 overflow-hidden">
              <CalendarView
                weekDates={weekDates}
                today={new Date()}
                eventsByDate={eventsByDate}
                schedulesByDate={schedulesByDate}
                sectionMode={Boolean(selectedSectionId)}
                sectionScheduleLoading={sectionProjectionFetching}
                onEventClick={handleEventClick}
              />
            </div>
          </div>
        </div>
      </PageLayout>

      <SectionFilterSheet
        open={sectionFilterOpen}
        onOpenChange={setSectionFilterOpen}
        selectedSectionId={selectedSectionId ?? null}
        onSectionChange={(id) => {
          setSelectedSectionId(id);
        }}
      />

      <EventDetailSheet
        open={eventSheetOpen}
        onOpenChange={setEventSheetOpen}
        event={selectedEvent}
        onEdit={() => setEditDialogOpen(true)}
        onDelete={() => setDeleteDialogOpen(true)}
        deleting={deleteEvent.isPending}
      />

      <CalendarEventDialog
        key={`create-${createDialogOpen ? "open" : "closed"}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        saving={createEvent.isPending}
        mode="create"
        onSubmit={handleCreateEvent}
      />

      <CalendarEventDialog
        key={`edit-${selectedEvent?.id ?? "none"}-${editDialogOpen ? "open" : "closed"}`}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        saving={updateEvent.isPending}
        mode="edit"
        initialEvent={selectedEvent}
        onSubmit={handleUpdateEvent}
      />

      <DialogBox
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Event"
        description="This action cannot be undone."
        actionLabel="Delete"
        actionVariant="destructive"
        actionLoading={deleteEvent.isPending}
        actionLoadingText="Deleting..."
        onAction={handleDeleteEvent}
        roles={["admin"]}
      >
        <div className="p-1 text-sm text-muted-foreground">
          {selectedEvent ? (
            <p>
              Delete <span className="font-medium text-foreground">{selectedEvent.name}</span> from the school calendar?
            </p>
          ) : (
            <p>No event selected.</p>
          )}
        </div>
      </DialogBox>
    </>
  );
}
