"use client";

import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/dashboard/page-layout";
import { SummaryCardGrid } from "@/components/dashboard/summary-card-grid";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AttendanceData, SummaryCardData } from "@/lib/api/queries";
import { fetchAttendance } from "@/lib/api/queries";
import { getIconByKey } from "@/lib/icon-map";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

const statusStyles: Record<string, string> = {
  Present:
    "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  Late: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  Remote:
    "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  Leave:
    "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  Pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  Approved:
    "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
};

function toSummaryCards(items: SummaryCardData[]) {
  return items.map((item) => ({
    ...item,
    icon: getIconByKey(item.iconKey),
  }));
}

export default function AttendancePage() {
  const subdomain = useTenantSubdomain();
  const { data, isLoading } = useQuery<AttendanceData>({
    queryKey: ["attendance", subdomain],
    queryFn: () => fetchAttendance(subdomain),
    enabled: Boolean(subdomain),
  });

  return (
    <PageLayout
      title="Attendance"
      description="Track student and staff attendance"
      loading={isLoading}
      noData={!data}
    >
      {data && (
        <>
          <SummaryCardGrid items={toSummaryCards(data.summaryCards)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s attendance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest check-ins across all departments
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.attendanceRows.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/40 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.team} • {row.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {row.hours}
                  </span>
                  <Badge variant="outline" className={statusStyles[row.status]}>
                    {row.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Time-off requests</CardTitle>
            <p className="text-sm text-muted-foreground">
              Approvals scheduled this month
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.requestRows.map((row) => (
              <div key={row.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{row.name}</p>
                  <Badge variant="outline" className={statusStyles[row.status]}>
                    {row.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{row.type}</p>
                <p className="text-xs text-muted-foreground">{row.days}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </PageLayout>
  );
}
