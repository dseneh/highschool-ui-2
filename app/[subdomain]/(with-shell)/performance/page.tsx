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
import type { PerformanceData, SummaryCardData } from "@/lib/api2/queries";
import { fetchPerformance } from "@/lib/api2/queries";
import { getIconByKey } from "@/lib/icon-map";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

const statusStyles: Record<string, string> = {
  Complete:
    "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  "In progress":
    "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  Awaiting:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
};

const ratingStyles: Record<string, string> = {
  Exceeds:
    "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900",
  Meets:
    "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  "Needs focus":
    "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
};

function toSummaryCards(items: SummaryCardData[]) {
  return items.map((item) => ({
    ...item,
    icon: getIconByKey(item.iconKey),
  }));
}

export default function PerformancePage() {
  const subdomain = useTenantSubdomain();
  const { data, isLoading } = useQuery<PerformanceData>({
    queryKey: ["performance", subdomain],
    queryFn: () => fetchPerformance(subdomain),
    enabled: Boolean(subdomain),
  });

  return (
    <PageLayout
      title="Performance"
      description="Monitor goals and performance reviews"
      loading={isLoading}
      noData={!data}
    >
      {data && (
        <>
          <SummaryCardGrid items={toSummaryCards(data.summaryCards)} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review pipeline</CardTitle>
          <p className="text-sm text-muted-foreground">
            Current quarter performance status
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.reviewRows.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/40 p-3"
            >
              <div>
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">
                  {row.team} • {row.cycle}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={ratingStyles[row.rating]}>
                  {row.rating}
                </Badge>
                <Badge variant="outline" className={statusStyles[row.status]}>
                  {row.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
        </>
      )}
    </PageLayout>
  );
}
