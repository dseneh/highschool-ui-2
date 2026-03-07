"use client";

import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/components/dashboard/page-content";
import { SummaryCardGrid } from "@/components/dashboard/summary-card-grid";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick01Icon } from "@hugeicons/core-free-icons";
import { fetchNotifications } from "@/lib/api/queries";
import type { NotificationData, SummaryCardData } from "@/lib/api/queries";
import { getIconByKey } from "@/lib/icon-map";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

const statusStyles: Record<string, string> = {
  New: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900",
  Action:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  Scheduled:
    "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  Read: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
};

function toSummaryCards(items: SummaryCardData[]) {
  return items.map((item) => ({
    ...item,
    icon: getIconByKey(item.iconKey),
  }));
}

export default function NotificationPage() {
  const subdomain = useTenantSubdomain();
  const { data } = useQuery<NotificationData>({
    queryKey: ["notifications", subdomain],
    queryFn: () => fetchNotifications(subdomain),
    enabled: Boolean(subdomain),
  });

  if (!data) return null;

  const summaryCards = toSummaryCards(data.summaryCards);

  return (
    <PageContent>
      <SummaryCardGrid items={summaryCards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Recent notifications</CardTitle>
              <p className="text-sm text-muted-foreground">
                Prioritized by urgency and team impact
              </p>
            </div>
            <Button variant="outline" size="sm" icon={<HugeiconsIcon icon={Tick01Icon} />}>
              Mark all read
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-4 p-3 rounded-lg border bg-background/40 hover:bg-muted/50 transition"
              >
                <div className="mt-2 size-2 rounded-full bg-primary" />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={statusStyles[notification.status]}
                    >
                      {notification.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{notification.type}</span>
                    <span>•</span>
                    <span>{notification.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tasks recommended for today
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.quickActions.map((action) => (
              <div
                key={action.title}
                className="rounded-lg border bg-muted/30 p-3"
              >
                <p className="text-sm font-medium">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
