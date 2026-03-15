"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type WeekGridShellProps = {
  weekDates: Date[];
  today: Date;
  renderDayContent: (date: Date, isToday: boolean) => ReactNode;
  className?: string;
  gridClassName?: string;
  minBodyHeightClassName?: string;
};

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const GRID_COLUMNS_CLASS = "grid-cols-[repeat(7,minmax(145px,1fr))]";

export function WeekGridShell({
  weekDates,
  today,
  renderDayContent,
  className,
  gridClassName,
  minBodyHeightClassName = "min-h-140",
}: WeekGridShellProps) {
  const todayIso = toIsoDate(today);

  return (
    <div className={cn("min-h-full w-max min-w-full", className)}>
      <div className={cn("sticky top-0 z-10 grid border-b bg-background/95 backdrop-blur", GRID_COLUMNS_CLASS, gridClassName)}>
        {weekDates.map((date) => {
          const isoDate = toIsoDate(date);
          const isToday = isoDate === todayIso;

          return (
            <div key={`head-${isoDate}`} className="border-r px-2 py-2 last:border-r-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{format(date, "EEE")}</p>
              <p className={cn("text-sm font-semibold", isToday && "text-primary")}>{format(date, "MMM d")}</p>
            </div>
          );
        })}
      </div>

      <div className={cn("grid", minBodyHeightClassName, GRID_COLUMNS_CLASS, gridClassName)}>
        {weekDates.map((date) => {
          const isoDate = toIsoDate(date);
          const isToday = isoDate === todayIso;

          return (
            <div
              key={`day-${isoDate}`}
              className={cn(
                "border-r px-2 py-2 align-top last:border-r-0",
                "bg-[repeating-linear-gradient(to_bottom,transparent,transparent_52px,rgba(120,120,120,0.08)_53px)]",
                isToday && "bg-primary/4",
              )}
            >
              <div className="space-y-2">{renderDayContent(date, isToday)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}