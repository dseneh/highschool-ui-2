"use client";

import { useParams, useRouter } from "next/navigation";
import { BarChart3, ReceiptText, Wallet } from "lucide-react";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployeeCompensations } from "@/hooks/use-payroll";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

function formatCurrency(value: number | null | undefined, currency = "USD") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function EmployeeCompensationDetailPage() {
  const params = useParams<{ id_number: string }>();
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const employeeId = params.id_number;
  const { data: compensations = [] } = useEmployeeCompensations();
  const compensation = compensations.find((item) => item.employeeId === employeeId) ?? null;

  const stats: StatsCardItem[] = [
    {
      title: "Base Pay",
      value: formatCurrency(compensation?.baseSalary, compensation?.currency || "USD"),
      subtitle: "Base salary amount",
      icon: Wallet,
    },
    {
      title: "Gross Pay",
      value: formatCurrency(compensation?.grossPay, compensation?.currency || "USD"),
      subtitle: "Total earnings before deductions",
      icon: BarChart3,
    },
    {
      title: "Net Pay",
      value: formatCurrency(compensation?.netPay, compensation?.currency || "USD"),
      subtitle: "Take-home estimate",
      icon: ReceiptText,
    },
  ];

  return (
    <EmployeeSubpageShell
      title="Compensation"
      description="Review salary package, allowance details, and payroll summary for this employee."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(subdomain ? `/${subdomain}/payroll` : "/payroll")}
        >
          Open Payroll
        </Button>
      }
    >
      {() => (
        <div className="space-y-6">
          <StatsCards items={stats} className="xl:grid-cols-3" />

          <Card>
            <CardHeader>
              <CardTitle>Compensation Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {compensation ? (
                <>
                  <BreakdownRow label="Pay frequency" value={compensation.payFrequency} />
                  <BreakdownRow label="Currency" value={compensation.currency} />
                  <BreakdownRow
                    label="Allowances"
                    value={formatCurrency(compensation.totalAllowances, compensation.currency)}
                  />
                  <BreakdownRow
                    label="Deductions"
                    value={formatCurrency(compensation.totalDeductions, compensation.currency)}
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No compensation record is available for this employee yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </EmployeeSubpageShell>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
