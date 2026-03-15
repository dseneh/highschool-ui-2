"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarPlus, PencilLine, Plus } from "lucide-react";

import { DialogBox } from "@/components/ui/dialog-box";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import type {
  SchoolCalendarEventDto,
  SchoolCalendarEventType,
  SchoolCalendarRecurrenceType,
} from "@/lib/api2/school-calendar/types";

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

const createEventSchema = z
  .object({
    name: z.string().trim().min(2, "Event name must be at least 2 characters"),
    description: z.string().trim().optional(),
    event_type: z.enum(["holiday", "non_school_day", "special_day", "schedule_override"]),
    recurrence_type: z.enum(["none", "yearly"]),
    start_date: z.date({ message: "Start date is required" }),
    end_date: z.date({ message: "End date is required" }),
  })
  .refine((payload) => payload.end_date >= payload.start_date, {
    message: "End date must be on or after start date",
    path: ["end_date"],
  });

type CalendarEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  mode?: "create" | "edit";
  initialEvent?: SchoolCalendarEventDto | null;
  onSubmit: (payload: Partial<SchoolCalendarEventDto>) => Promise<void>;
};

function dateToIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarEventDialog({
  open,
  onOpenChange,
  saving,
  mode = "create",
  initialEvent,
  onSubmit,
}: CalendarEventDialogProps) {
  const initialName = mode === "edit" ? initialEvent?.name || "" : "";
  const initialDescription = mode === "edit" ? initialEvent?.description || "" : "";
  const initialEventType = mode === "edit" ? initialEvent?.event_type || "holiday" : "holiday";
  const initialRecurrenceType = mode === "edit" ? initialEvent?.recurrence_type || "none" : "none";
  const initialStartDate =
    mode === "edit" && initialEvent?.start_date
      ? new Date(`${initialEvent.start_date}T00:00:00`)
      : undefined;
  const initialEndDate =
    mode === "edit" && initialEvent?.end_date
      ? new Date(`${initialEvent.end_date}T00:00:00`)
      : undefined;

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [eventType, setEventType] = useState<SchoolCalendarEventType>(initialEventType);
  const [recurrenceType, setRecurrenceType] = useState<SchoolCalendarRecurrenceType>(initialRecurrenceType);
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);

  const isFormReady = useMemo(() => {
    return Boolean(name.trim() && startDate && endDate);
  }, [name, startDate, endDate]);

  const resetForm = () => {
    setName(initialName);
    setDescription(initialDescription);
    setEventType(initialEventType);
    setRecurrenceType(initialRecurrenceType);
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
  };

  const handleSubmit = async () => {
    const result = createEventSchema.safeParse({
      name,
      description,
      event_type: eventType,
      recurrence_type: recurrenceType,
      start_date: startDate,
      end_date: endDate,
    });

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Please fix the event form fields.";
      toast.error(message);
      return;
    }

    try {
      await onSubmit({
        name: result.data.name,
        description: result.data.description?.trim() ? result.data.description.trim() : null,
        event_type: result.data.event_type,
        recurrence_type: result.data.recurrence_type,
        start_date: dateToIsoDate(result.data.start_date),
        end_date: dateToIsoDate(result.data.end_date),
        all_day: true,
        applies_to_all_sections: true,
        sections: [],
      });
      toast.success(mode === "edit" ? "Event updated" : "Event created");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${mode === "edit" ? "update" : "create"} event`;
      toast.error(message);
    }
  };

  const actionLabel = mode === "edit" ? "Save Changes" : "Create Event";

  return (
    <DialogBox
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetForm();
      }}
      title={mode === "edit" ? "Edit Calendar Event" : "Create Calendar Event"}
      description={
        mode === "edit"
          ? "Update this event details and schedule."
          : "Add a school-wide event directly from the calendar."
      }
      actionLabel={actionLabel}
      actionIcon={mode === "edit" ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      actionLoading={saving}
      actionLoadingText={mode === "edit" ? "Saving..." : "Creating..."}
      actionDisabled={!isFormReady}
      onAction={handleSubmit}
      roles={["admin"]}
    >
      <div className="space-y-4 p-1">
        <div className="space-y-1.5">
          <Label>Event Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Independence Day" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Start Date</Label>
            <DatePicker value={startDate} onChange={setStartDate} placeholder="Pick start date" />
          </div>
          <div className="space-y-1.5">
            <Label>End Date</Label>
            <DatePicker value={endDate} onChange={setEndDate} placeholder="Pick end date" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description (optional)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context for this event"
          />
        </div>

        <div className="rounded-md border border-dashed bg-muted/20 p-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4" />
            Events here are school-wide and visible in section calendars.
          </div>
        </div>
      </div>
    </DialogBox>
  );
}

export const CreateCalendarEventDialog = CalendarEventDialog;
