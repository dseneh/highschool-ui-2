"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { CalendarDays, Clock3, UserCheck, UserX } from "lucide-react";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployeeAttendance } from "@/hooks/use-employee-attendance";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EmployeeAttendanceDetailPage() {
  const params = useParams<{ id_number: string }>();
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const employeeId = params.id_number;
  const { data: records = [] } = useEmployeeAttendance({ employeeId });

  const stats = React.useMemo<StatsCardItem[]>(() => {
    const present = records.filter((record) => record.status.toLowerCase() === "present").length;
    const late = records.filter((record) => record.status.toLowerCase() === "late").length;
    const absent = records.filter((record) => record.status.toLowerCase() === "absent").length;
    const avgHours = records.length > 0
      ? records.reduce((sum, record) => sum + record.hoursWorked, 0) / records.length
      : 0;

    return [
      { title: "Present", value: String(present), subtitle: "Attendance records", icon: UserCheck },
      { title: "Late", value: String(late), subtitle: "Late clock-ins", icon: Clock3 },
      { title: "Absent", value: String(absent), subtitle: "Marked absent", icon: UserX },
      { title: "Avg Hours", value: avgHours.toFixed(1), subtitle: "Hours worked per record", icon: CalendarDays },
    ];
  }, [records]);

  return (
    <EmployeeSubpageShell
      title="Attendance"
      description="Review attendance activity and work-hour records for this employee."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(subdomain ? `/${subdomain}/employee-attendance` : "/employee-attendance")}
        >
          Open Attendance Registry
        </Button>
      }
    >
      {() => (
        <div className="space-y-6">
          <StatsCards items={stats} className="xl:grid-cols-4" />

          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {records.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance has been recorded for this employee yet.</p>
              ) : (
                records.slice(0, 8).map((record) => (
                  <div key={record.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{formatDate(record.attendanceDate)}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.checkInTime || "--:--"} to {record.checkOutTime || "--:--"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{record.status}</p>
                      <p className="text-sm text-muted-foreground">{record.hoursWorked.toFixed(2)} hrs</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </EmployeeSubpageShell>
  );
}
