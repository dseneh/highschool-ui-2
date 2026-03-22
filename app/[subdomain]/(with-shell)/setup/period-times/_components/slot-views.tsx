import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import type { SectionTimeSlotDto, SlotViewMode } from "./types";
import DropDownMenuButton from "./dropdown-menu";
import { cn } from "@/lib/utils";

type SlotViewsProps = {
  slotViewMode: SlotViewMode;
  orderedDays: number[];
  dayNames: Record<number, string>;
  groupedSlots: Map<number, SectionTimeSlotDto[]>;
  maxSlotsPerDay: number;
  onEditSlot: (slot: SectionTimeSlotDto) => void;
  onDeleteSlot: (slotId: string) => void;
};

type TimeSlotCardProps = {
  slot: SectionTimeSlotDto;
  minHeightClass?: string;
  onEditSlot: (slot: SectionTimeSlotDto) => void;
  onDeleteSlot: (slotId: string) => void;
};

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map((value) => parseInt(value, 10));
  return hours * 60 + minutes;
}

function formatDuration(startTime: string, endTime: string) {
  const diff = toMinutes(endTime) - toMinutes(startTime);
  const safeDiff = diff > 0 ? diff : 0;
  const hours = Math.floor(safeDiff / 60);
  const minutes = safeDiff % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function TimeSlotCard({ slot, minHeightClass, onEditSlot, onDeleteSlot }: TimeSlotCardProps) {
  return (
    <div
      className={cn(
        minHeightClass, 
        "rounded-md border bg-background p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        slot.period.period_type === "recess" && "border-orange-300 hover:border-orange-400"
      )}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-medium">
            <span>{slot.period.name} </span>
            <Badge variant="outline" className={cn(
              "ms-0.5 text-[10px]",
              slot.period.period_type === "recess" ? "bg-orange-500 text-white" : "bg-blue-100 text-blue-800"
              )}>
            {slot.period.period_type || "class"}
            </Badge>
        </p>
          {/* <Badge variant="outline" className="shrink-0 text-[10px]">
            #{slot.sort_order}
          </Badge> */}
          <DropDownMenuButton
            onEditSlot={onEditSlot}
            onDeleteSlot={onDeleteSlot}
            slot={slot}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
          <span className="mx-1">•</span>
          {formatDuration(slot.start_time, slot.end_time)}
        </p>
      </div>
      {/* <div className="mt-3 flex items-center justify-between gap-2">
        <Badge variant="outline" className="text-[10px]">
          {slot.period.period_type || "class"}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost" tooltip="Slot actions">
              <MoreVertical className="size-4" />
              <span className="sr-only">Open slot actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuItem onClick={() => onEditSlot(slot)}>Edit</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDeleteSlot(slot.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div> */}
    </div>
  );
}

export function SlotViews({
  slotViewMode,
  orderedDays,
  dayNames,
  groupedSlots,
  maxSlotsPerDay,
  onEditSlot,
  onDeleteSlot,
}: SlotViewsProps) {
  if (slotViewMode === "compact") {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {orderedDays.map((day) => {
          const slots = groupedSlots.get(day) ?? [];
          return (
            <section
              key={day}
              className="rounded-lg border bg-muted/10 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-muted/60 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{dayNames[day]}</h3>
                <Badge variant="secondary" className="text-[10px]">
                  {slots.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {slots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No slots</p>
                ) : (
                  slots.map((slot) => (
                    <TimeSlotCard
                      key={slot.id}
                      slot={slot}
                      onEditSlot={onEditSlot}
                      onDeleteSlot={onDeleteSlot}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto pb-2">
      <div className="inline-flex w-max min-w-max gap-3 align-top">
        {orderedDays.map((day) => {
          const slots = groupedSlots.get(day) ?? [];
          return (
            <div
              key={day}
              className="w-64 min-w-64 rounded-lg border bg-muted/10 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
            >
              <div className="border-b px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{dayNames[day]}</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {slots.length}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 p-2">
                {Array.from({ length: maxSlotsPerDay }).map((_, index) => {
                  const slot = slots[index];
                  if (!slot) {
                    return (
                      <div
                        key={`${day}-${index}`}
                        className="min-h-16 rounded-md border border-dashed bg-background/60 p-2"
                      />
                    );
                  }

                  return (
                    <TimeSlotCard
                      key={slot.id}
                      slot={slot}
                      minHeightClass="min-h-20"
                      onEditSlot={onEditSlot}
                      onDeleteSlot={onDeleteSlot}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
