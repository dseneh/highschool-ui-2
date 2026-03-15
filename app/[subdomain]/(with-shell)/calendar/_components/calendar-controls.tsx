"use client";

import { ChevronLeft, ChevronRight, Search, Settings, SlidersHorizontal, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelectField } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";

type EventFilter = "all" | "holiday" | "non_school_day" | "special_day" | "schedule_override";

type CalendarControlsProps = {
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  onToday: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  canGoPrevWeek?: boolean;
  canGoNextWeek?: boolean;
  dateValidate?: (date: Date) => boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  eventTypeFilter: EventFilter;
  onEventTypeFilterChange: (value: EventFilter) => void;
  selectedSectionName: string | null;
  onSectionFilterClick: () => void;
  onClearSection: () => void;
};

export function CalendarControls({
  selectedDate,
  onSelectedDateChange,
  onToday,
  onPrevWeek,
  onNextWeek,
  canGoPrevWeek = true,
  canGoNextWeek = true,
  dateValidate,
  searchQuery,
  onSearchQueryChange,
  eventTypeFilter,
  onEventTypeFilterChange,
  selectedSectionName,
  onSectionFilterClick,
  onClearSection,
}: CalendarControlsProps) {
  return (
    <div className="border-b px-3 py-3 md:px-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-8"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search events"
          />
        </div>

        <div className="min-w-44">
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && onSelectedDateChange(date)}
            placeholder="Pick date"
            validate={dateValidate}
          />
        </div>

        <div className="relative min-w-44">
          <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <SelectField
            triggerClassName="pl-8"
            value={eventTypeFilter}
            onValueChange={(value) => onEventTypeFilterChange(value as EventFilter)}
            items={[
              { value: "all", label: "All events" },
              { value: "holiday", label: "Holiday" },
              { value: "non_school_day", label: "Non-school Day" },
              { value: "special_day", label: "Special Day" },
              { value: "schedule_override", label: "Schedule Override" },
            ]}
            placeholder="Filter events"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative flex items-center gap-1.5">
            <Button
              size="sm"
              variant={selectedSectionName ? "default" : "outline"}
              className={cn("gap-2 pr-2.5", selectedSectionName && "shadow-sm")}
              onClick={onSectionFilterClick}
              iconLeft={<Settings className="h-3.5 w-3.5" />}
            >
              <span className="max-w-28 truncate">
                {selectedSectionName ?? "All Sections"}
              </span>
            </Button>
            {selectedSectionName ? (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full border border-border/60 p-0 text-muted-foreground hover:border-border hover:bg-muted"
                onClick={onClearSection}
                icon={<X className="size-3.5" />}
                aria-label="Clear section filter"
              />
            ) : null}
            {selectedSectionName && (
              <Badge className="absolute -right-1 -top-1.5 h-4 min-w-4 px-1 text-[10px]">
                1
              </Badge>
            )}
          </div>

          <Button size="sm" variant="outline" onClick={onToday}>Today</Button>
          <div className="flex items-center gap-1 rounded-md border bg-muted/20 p-0.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={onPrevWeek}
              disabled={!canGoPrevWeek}
              iconLeft={<ChevronLeft className="h-4 w-4" />}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={onNextWeek}
              disabled={!canGoNextWeek}
              iconRight={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
