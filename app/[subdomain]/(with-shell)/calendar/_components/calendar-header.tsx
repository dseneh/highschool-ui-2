"use client";

import { format } from "date-fns";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

type CalendarHeaderProps = {
  weekStart: Date;
  weekEnd: Date;
  eventCount: number;
};

export function CalendarHeader({ weekStart, weekEnd, eventCount }: CalendarHeaderProps) {
  return (
    <div className="border-b bg-background/95 px-3 py-2.5 backdrop-blur md:px-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <SidebarTrigger className="-ml-1 h-8 w-8" />
          <div>
            <h1 className="text-sm font-semibold leading-tight md:text-base">Main School Calendar</h1>
            <p className="text-[11px] text-muted-foreground md:text-xs">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="h-6 rounded-md px-2 text-[11px] font-medium">
          {eventCount} event{eventCount === 1 ? "" : "s"}
        </Badge>
      </div>
    </div>
  );
}
