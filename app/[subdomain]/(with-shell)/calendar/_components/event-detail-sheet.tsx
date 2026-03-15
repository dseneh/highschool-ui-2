"use client";

import { Badge } from "@/components/ui/badge";
import { AuthButton } from "@/components/auth/auth-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SchoolCalendarEventDto } from "@/lib/api2/school-calendar/types";

const EVENT_TYPE_LABELS: Record<SchoolCalendarEventDto["event_type"], string> = {
  holiday: "Holiday",
  non_school_day: "Non-school Day",
  special_day: "Special Day",
  schedule_override: "Schedule Override",
};

type EventDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: SchoolCalendarEventDto | null;
  onEdit?: (event: SchoolCalendarEventDto) => void;
  onDelete?: (event: SchoolCalendarEventDto) => void;
  deleting?: boolean;
};

export function EventDetailSheet({
  open,
  onOpenChange,
  event,
  onEdit,
  onDelete,
  deleting,
}: EventDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{event ? EVENT_TYPE_LABELS[event.event_type] : "Event"}</Badge>
            {event?.recurrence_type === "yearly" ? (
              <Badge variant="secondary">Yearly</Badge>
            ) : (
              <Badge variant="secondary">One-time</Badge>
            )}
          </div>
          <SheetTitle className="text-base">{event?.name ?? "Event details"}</SheetTitle>
          <SheetDescription>
            {event ? `${event.start_date} to ${event.end_date}` : "Select an event to view details."}
          </SheetDescription>
        </SheetHeader>

        {event ? (
          <div className="space-y-4 p-4">
            <div className="rounded-lg border bg-muted/15 p-3">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="mt-1 text-sm">
                {event.description?.trim() ? event.description : "No description added."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="mt-1 text-sm font-medium">{event.start_date}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="mt-1 text-sm font-medium">{event.end_date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="mt-1 text-sm font-medium">{EVENT_TYPE_LABELS[event.event_type]}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Scope</p>
                <p className="mt-1 text-sm font-medium">
                  {event.applies_to_all_sections ? "School-wide" : "Section specific"}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-dashed p-2 text-[11px] text-muted-foreground">
              <span className="font-medium">Shortcuts:</span> <span className="ml-1">E to edit, Delete/Backspace to delete</span>
            </div>
          </div>
        ) : null}

        {event ? (
          <SheetFooter className="flex-row gap-2 border-t p-4">
            <AuthButton
              roles="admin"
              disable
              variant="outline"
              className="w-full"
              onClick={() => onEdit?.(event)}
            >
              Edit
            </AuthButton>
            <AuthButton
              roles="admin"
              disable
              variant="destructive-outline"
              className="w-full"
              onClick={() => onDelete?.(event)}
              loading={deleting}
              loadingText="Deleting..."
            >
              Delete
            </AuthButton>
            <Button variant="secondary" className="w-full" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
