"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { UserAdd01Icon, UserEdit01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GradebookDto } from "@/lib/api2/grading-types";
import type { GradebookScheduleProjectionDto } from "@/lib/api2/schedule-projection";

interface GradebookDetailsTabProps {
  gradebook: GradebookDto;
  scheduleProjection?: GradebookScheduleProjectionDto[];
  scheduleProjectionLoading: boolean;
  onAssignTeacher: () => void;
}

export function GradebookDetailsTab({
  gradebook,
  scheduleProjection,
  scheduleProjectionLoading,
  onAssignTeacher,
}: GradebookDetailsTabProps) {
  return (
    <div className="space-y-4">
      <Card className="gap-0">
        <CardContent className="pb-3 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Teacher</p>
                {gradebook.teacher ? (
                  <p className="text-sm font-semibold">{gradebook.teacher.full_name}</p>
                ) : (
                  <p className="text-sm font-medium text-orange-500">No teacher assigned</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconLeft={
                <HugeiconsIcon
                  icon={gradebook.teacher ? UserEdit01Icon : UserAdd01Icon}
                  className="h-3.5 w-3.5"
                />
              }
              onClick={onAssignTeacher}
            >
              {gradebook.teacher ? "Change Teacher" : "Assign Teacher"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-1">
        <CardHeader>
          <CardTitle className="text-base">Class Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleProjectionLoading ? (
            <div className="text-sm text-muted-foreground">Loading schedule...</div>
          ) : !scheduleProjection || scheduleProjection.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No schedule entries projected for this gradebook yet.
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {scheduleProjection.map((slot) => (
                <div key={slot.id} className="rounded-md border p-2 text-sm">
                  <div className="font-medium">{slot.period.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Day {slot.day_of_week} • {slot.start_time} - {slot.end_time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
