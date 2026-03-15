"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Search } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WeekGridShell } from "@/components/shared/week-grid-shell";
import { cn } from "@/lib/utils";

export type WeeklyScheduleItem = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  subtitle?: string;
  badge?: string;
  muted?: boolean;
  cardClassName?: string;
};

type WeeklyScheduleCalendarProps = {
  items: WeeklyScheduleItem[];
  searchPlaceholder?: string;
  emptyDayText?: string;
  showMutedToggle?: boolean;
  defaultShowMuted?: boolean;
  mutedLabel?: string;
};

function ScheduleCard({ item }: { item: WeeklyScheduleItem }) {
  const duration = formatDuration(item.startTime, item.endTime);

  return (
    <div
      key={item.id}
      className={cn(
        "rounded-md border bg-background p-2 text-xs shadow-[0_1px_0_rgba(0,0,0,0.04)]",
        item.muted && "bg-muted text-muted-foreground border-border",
        item.cardClassName,
      )}
    >
      <div className="mb-1 flex flex-col items-start justify-between">
        <p className="line-clamp-2 font-medium leading-snug">{item.title}</p>
        {item.badge ? (
          <div  className="shrink-0 font-semibold rounded-sm text-[10px]">
            {item.badge}
          </div>
        ) : null}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {formatTime(item.startTime)} - {formatTime(item.endTime)}
        {duration ? ` • ${duration}` : ""}
      </p>
      {item.subtitle ? (
        <p className="whitespace-pre-line text-[11px] text-muted-foreground">{item.subtitle}</p>
      ) : null}
    </div>
  );
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

function toDayOfWeek(date: Date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = Number.parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function formatDuration(startTime: string, endTime: string) {
  const [startH, startM] = startTime.split(":").map((part) => Number.parseInt(part, 10));
  const [endH, endM] = endTime.split(":").map((part) => Number.parseInt(part, 10));

  if (
    Number.isNaN(startH) ||
    Number.isNaN(startM) ||
    Number.isNaN(endH) ||
    Number.isNaN(endM)
  ) {
    return null;
  }

  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const minutes = endTotal - startTotal;

  if (minutes <= 0) return null;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) return `${hours}h ${remainingMinutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${remainingMinutes}m`;
}

export function WeeklyScheduleCalendar({
  items,
  searchPlaceholder = "Search schedule",
  emptyDayText = "No classes",
  showMutedToggle = false,
  defaultShowMuted = true,
  mutedLabel = "Recess",
}: WeeklyScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showMuted, setShowMuted] = useState(defaultShowMuted);

  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const visibleItems = showMuted ? items : items.filter((item) => !item.muted);
    if (!q) return visibleItems;

    return visibleItems.filter((item) => {
      const haystack = `${item.title} ${item.subtitle ?? ""} ${item.badge ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, searchQuery, showMuted]);

  const hasMutedItems = useMemo(() => items.some((item) => item.muted), [items]);

  const groupedByDay = useMemo(() => {
    const map = new Map<number, WeeklyScheduleItem[]>();

    for (const item of filteredItems) {
      if (!map.has(item.dayOfWeek)) map.set(item.dayOfWeek, []);
      map.get(item.dayOfWeek)?.push(item);
    }

    for (const [, dayItems] of map) {
      dayItems.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return map;
  }, [filteredItems]);

  const selectedDayOfWeek = useMemo(() => toDayOfWeek(selectedDate), [selectedDate]);
  const selectedDayItems = groupedByDay.get(selectedDayOfWeek) ?? [];

  return (
    <div className="h-full w-full min-w-0 max-w-full overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="border-b px-3 py-3 md:px-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full min-w-0 flex-1 md:min-w-60">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-8"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>

          <div className="w-full md:w-auto md:min-w-44">
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              placeholder="Pick date"
            />
          </div>

          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:ml-auto md:w-auto md:flex-nowrap">
            {showMutedToggle && hasMutedItems ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMuted((prev) => !prev)}
                iconLeft={showMuted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              >
                {showMuted ? `Hide ${mutedLabel}` : `Show ${mutedLabel}`}
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => setSelectedDate(new Date())}>Today</Button>
            <div className="flex items-center gap-1 rounded-md border bg-muted/20 p-0.5 md:ml-auto">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                onClick={() => setSelectedDate((prev) => addDays(prev, -7))}
                iconLeft={<ChevronLeft className="h-4 w-4" />}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                onClick={() => setSelectedDate((prev) => addDays(prev, 7))}
                iconRight={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b bg-muted/20 px-2 py-2 md:hidden">
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((date) => {
            const dayOfWeek = toDayOfWeek(date);
            const isSelected = dayOfWeek === selectedDayOfWeek;
            const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

            return (
              <Button
                key={`mobile-day-${dayOfWeek}-${format(date, "yyyy-MM-dd")}`}
                type="button"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                className={cn("h-auto w-full min-w-0 px-1 py-1", isToday && !isSelected && "border-primary/40")}
                onClick={() => setSelectedDate(date)}
              >
                <span className="block text-[10px] uppercase leading-none">{format(date, "EEEEE")}</span>
                <span className="block text-xs font-semibold leading-tight">{format(date, "d")}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="h-full overflow-y-auto overflow-x-hidden md:hidden">
        <div className="space-y-2 p-3">
          {selectedDayItems.length === 0 ? (
            <div className="rounded-md border border-dashed bg-background/80 p-3 text-sm text-muted-foreground">
              {emptyDayText}
            </div>
          ) : (
            selectedDayItems.map((item) => <ScheduleCard key={item.id} item={item} />)
          )}
        </div>
      </div>

      <div className="hidden h-full min-w-0 overflow-x-auto overflow-y-auto md:block">
        <WeekGridShell
          weekDates={weekDates}
          today={new Date()}
          renderDayContent={(date) => {
            const dayItems = groupedByDay.get(toDayOfWeek(date)) ?? [];

            if (dayItems.length === 0) {
              return (
                <div className="rounded-md border border-dashed bg-background/80 p-2 text-[11px] text-muted-foreground">
                  {emptyDayText}
                </div>
              );
            }

            return dayItems.map((item) => <ScheduleCard key={item.id} item={item} />);
          }}
        />
      </div>
    </div>
  );
}
