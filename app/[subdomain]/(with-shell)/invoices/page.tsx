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
import type { InvoiceData, SummaryCardData } from "@/lib/api2/queries";
import { fetchInvoices } from "@/lib/api2/queries";
import { getIconByKey } from "@/lib/icon-map";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

const statusStyles: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  Pending: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  Overdue: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  Approved: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  Review: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
};

function toSummaryCards(items: SummaryCardData[]) {
  return items.map((item) => ({
    ...item,
    icon: getIconByKey(item.iconKey),
  }));
}

export default function InvoicesPage() {
  const subdomain = useTenantSubdomain();
  const { data, isLoading } = useQuery<InvoiceData>({
    queryKey: ["invoices", subdomain],
    queryFn: () => fetchInvoices(subdomain),
    enabled: Boolean(subdomain),
  });

  return (
    <PageLayout
      title="Invoices"
      description="Manage and track invoices"
      loading={isLoading}
      noData={!data}
    >
      {data && (
        <>
          <SummaryCardGrid items={toSummaryCards(data.summaryCards)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Invoice activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Current payment status by vendor
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/40 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{invoice.vendor}</p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.id} • Due {invoice.due}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{invoice.amount}</span>
                  <Badge variant="outline" className={statusStyles[invoice.status]}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Approvals</CardTitle>
            <p className="text-sm text-muted-foreground">
              Invoices awaiting finance approval
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.approvals.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{item.invoice}</p>
                  <p className="text-xs text-muted-foreground">{item.owner}</p>
                </div>
                <Badge variant="outline" className={statusStyles[item.status]}>
                  {item.status}
                </Badge>
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
