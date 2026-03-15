import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import type {
  SchoolCalendarEventDto,
  SchoolCalendarEventType,
  SchoolCalendarRecurrenceType,
  SchoolCalendarSettingsDto,
} from "@/lib/api2/school-calendar/types";

type SchoolCalendarSettingsEventsProps = {
  settings?: SchoolCalendarSettingsDto;
  events: SchoolCalendarEventDto[];
  settingsLoading: boolean;
  eventsLoading: boolean;
  savingSettings: boolean;
  savingEvent: boolean;
  deletingEventId?: string;
  onSaveSettings: (operatingDays: number[]) => void;
  onCreateEvent: (payload: Partial<SchoolCalendarEventDto>) => void;
  onUpdateEvent: (id: string, payload: Partial<SchoolCalendarEventDto>) => void;
  onDeleteEvent: (id: string) => void;
};

const DAY_CHOICES = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

function formatEventDates(startDate: string, endDate: string) {
  if (startDate === endDate) return startDate;
  return `${startDate} to ${endDate}`;
}

function isoDateToDate(isoDate: string) {
  if (!isoDate) return undefined;
  const [year, month, day] = isoDate.split("-").map((value) => Number(value));
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function dateToIsoDate(date: Date | undefined) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const EVENT_TYPE_ITEMS: { value: SchoolCalendarEventType; label: string }[] = [
  { value: "holiday", label: "Holiday" },
  { value: "non_school_day", label: "Non-school Day" },
  { value: "special_day", label: "Special Day" },
  { value: "schedule_override", label: "Schedule Override" },
];

const RECURRENCE_ITEMS: { value: SchoolCalendarRecurrenceType; label: string }[] = [
  { value: "none", label: "One-time" },
  { value: "yearly", label: "Yearly" },
];

export function SchoolCalendarSettingsEvents({
  settings,
  events,
  settingsLoading,
  eventsLoading,
  savingSettings,
  savingEvent,
  deletingEventId,
  onSaveSettings,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
}: SchoolCalendarSettingsEventsProps) {
  const [operatingDaysDraft, setOperatingDaysDraft] = useState<number[]>([]);
  const [operatingDaysDirty, setOperatingDaysDirty] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolCalendarEventDto | null>(null);

  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventType, setEventType] = useState<SchoolCalendarEventType>("holiday");
  const [recurrenceType, setRecurrenceType] = useState<SchoolCalendarRecurrenceType>("none");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const serverOperatingDays = useMemo(
    () =>
      settings?.operating_days?.length
        ? [...settings.operating_days].sort((a, b) => a - b)
        : [1, 2, 3, 4, 5],
    [settings]
  );
  const effectiveOperatingDays = operatingDaysDirty
    ? [...operatingDaysDraft].sort((a, b) => a - b)
    : serverOperatingDays;

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [events]
  );

  const hasSettingsChanges = useMemo(() => {
    return JSON.stringify(serverOperatingDays) !== JSON.stringify(effectiveOperatingDays);
  }, [serverOperatingDays, effectiveOperatingDays]);

  const resetEventForm = () => {
    setEditingEvent(null);
    setEventName("");
    setEventDescription("");
    setEventType("holiday");
    setRecurrenceType("none");
    setStartDate("");
    setEndDate("");
  };

  const openCreateEvent = () => {
    resetEventForm();
    setShowEventDialog(true);
  };

  const openEditEvent = (event: SchoolCalendarEventDto) => {
    setEditingEvent(event);
    setEventName(event.name);
    setEventDescription(event.description || "");
    setEventType(event.event_type);
    setRecurrenceType(event.recurrence_type);
    setStartDate(event.start_date);
    setEndDate(event.end_date);
    setShowEventDialog(true);
  };

  const handleSaveEvent = () => {
    const payload: Partial<SchoolCalendarEventDto> = {
      name: eventName.trim(),
      description: eventDescription.trim() || null,
      event_type: eventType,
      recurrence_type: recurrenceType,
      start_date: startDate,
      end_date: endDate,
      all_day: true,
      applies_to_all_sections: true,
      sections: [],
    };

    if (editingEvent) {
      onUpdateEvent(editingEvent.id, payload);
    } else {
      onCreateEvent(payload);
    }
    setShowEventDialog(false);
    resetEventForm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Calendar Settings & Events</CardTitle>
        <CardDescription>
          Choose operating weekdays and manage school-wide holidays, meetings, and non-school days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold">Operating Weekdays</h4>
            <Button
              size="sm"
              onClick={() => onSaveSettings(effectiveOperatingDays)}
              disabled={settingsLoading || savingSettings || !hasSettingsChanges || effectiveOperatingDays.length === 0}
              loading={savingSettings}
              loadingText="Saving..."
            >
              Save Days
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAY_CHOICES.map((day) => {
              const active = effectiveOperatingDays.includes(day.value);
              return (
                <Button
                  key={day.value}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => {
                    setOperatingDaysDirty(true);
                    setOperatingDaysDraft((prev) => {
                      const base = operatingDaysDirty ? prev : effectiveOperatingDays;
                      if (base.includes(day.value)) {
                        return base.filter((value) => value !== day.value);
                      }
                      return [...base, day.value].sort((a, b) => a - b);
                    });
                  }}
                >
                  {day.label}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Non-selected weekdays are hidden in setup board/cards and excluded from slot validation.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold">Calendar Events</h4>
            <Button size="sm" onClick={openCreateEvent}>Add Event</Button>
          </div>

          {eventsLoading ? (
            <p className="text-sm text-muted-foreground">Loading events...</p>
          ) : sortedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events added yet.</p>
          ) : (
            <div className="space-y-2">
              {sortedEvents.map((event) => (
                <div key={event.id} className="rounded-lg border bg-muted/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold truncate">{event.name}</p>
                        <Badge variant="outline" className="text-[10px]">
                          {event.event_type.replaceAll("_", " ")}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {event.recurrence_type === "yearly" ? "Yearly" : "One-time"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatEventDates(event.start_date, event.end_date)}
                      </p>
                      {event.description ? (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEditEvent(event)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive-outline"
                        onClick={() => onDeleteEvent(event.id)}
                        loading={deletingEventId === event.id}
                        loadingText="Deleting..."
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <DialogBox
        open={showEventDialog}
        onOpenChange={(open) => {
          setShowEventDialog(open);
          if (!open) {
            resetEventForm();
          }
        }}
        title={editingEvent ? "Edit Calendar Event" : "Create Calendar Event"}
        description="Define holidays, non-school days, special days, or schedule overrides."
        onAction={handleSaveEvent}
        actionLabel={editingEvent ? "Save Changes" : "Create Event"}
        actionLoading={savingEvent}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Event Name</Label>
            <Input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g., Mid-Term Break" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Event Type</Label>
              <SelectField
                value={eventType}
                onValueChange={(value) => setEventType(String(value) as SchoolCalendarEventType)}
                items={EVENT_TYPE_ITEMS}
                placeholder="Select type"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Recurrence</Label>
              <SelectField
                value={recurrenceType}
                onValueChange={(value) => setRecurrenceType(String(value) as SchoolCalendarRecurrenceType)}
                items={RECURRENCE_ITEMS}
                placeholder="Select recurrence"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <DatePicker
                value={isoDateToDate(startDate)}
                onChange={(value) => setStartDate(dateToIsoDate(value))}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <DatePicker
                value={isoDateToDate(endDate)}
                onChange={(value) => setEndDate(dateToIsoDate(value))}
                placeholder="Select end date"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Optional details" />
          </div>
        </div>
      </DialogBox>
    </Card>
  );
}
