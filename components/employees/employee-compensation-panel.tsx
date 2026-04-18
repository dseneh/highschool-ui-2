"use client";

import * as React from "react";
import {
  Coins01Icon,
  Delete01Icon,
  MoneyAdd01Icon,
  MoneyRemove01Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EmptyStateComponent from "@/components/shared/empty-state";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import type {
  EmployeeCompensationDto,
  PayrollComponentDto,
} from "@/lib/api2/payroll-types";

interface EmployeeCompensationPanelProps {
  compensation: EmployeeCompensationDto | undefined;
  components: PayrollComponentDto[];
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function EmployeeCompensationPanel({
  compensation,
  components: _components,
  onEdit,
  onDelete,
  loading,
}: EmployeeCompensationPanelProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!compensation) {
    return (
      <EmptyStateComponent
        title="No Compensation Package"
        description="This employee does not have a compensation package yet. Add one to track salary, earnings, and deductions."
        icon={<HugeiconsIcon icon={Coins01Icon} />}
      />
    );
  }

  const currency = compensation.currency || "USD";

  const stats: StatsCardItem[] = [
    {
      title: "Base Salary",
      value: formatCurrency(compensation.baseSalary, currency),
      subtitle: compensation.paymentFrequency,
      icon: Coins01Icon,
    },
    {
      title: "Gross Pay",
      value: formatCurrency(compensation.grossPay, currency),
      subtitle: "Total earnings",
      icon: MoneyAdd01Icon,
    },
    {
      title: "Deductions",
      value: formatCurrency(compensation.totalDeductions, currency),
      subtitle: "Total deductions",
      icon: MoneyRemove01Icon,
    },
    {
      title: "Net Pay",
      value: formatCurrency(compensation.netPay, currency),
      subtitle: "Take-home pay",
      icon: Coins01Icon,
    },
  ];

  const earnings = compensation.items.filter(
    (item) => item.componentType.toLowerCase() === "earning",
  );
  const deductions = compensation.items.filter(
    (item) => item.componentType.toLowerCase() === "deduction",
  );

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Effective {compensation.effectiveDate} · {compensation.paymentFrequency} · {currency}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onEdit ? (
            <Button
              variant="outline"
              size="sm"
              icon={<HugeiconsIcon icon={PencilEdit01Icon} size={16} />}
              onClick={onEdit}
            >
              Edit
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              variant="outline"
              size="sm"
              icon={<HugeiconsIcon icon={Delete01Icon} size={16} />}
              onClick={onDelete}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <StatsCards items={stats} />

      {/* Component breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Earnings */}
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <HugeiconsIcon icon={MoneyAdd01Icon} size={18} className="text-emerald-600" />
            <h3 className="text-sm font-semibold">Earnings</h3>
            <Badge variant="secondary" className="ml-auto">
              {earnings.length}
            </Badge>
          </div>
          {earnings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No earnings components</p>
          ) : (
            <div className="space-y-2">
              {earnings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{item.componentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.calculationMethod}
                      {item.overrideValue != null ? ` · Override: ${item.overrideValue}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    +{formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Deductions */}
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <HugeiconsIcon icon={MoneyRemove01Icon} size={18} className="text-red-600" />
            <h3 className="text-sm font-semibold">Deductions</h3>
            <Badge variant="secondary" className="ml-auto">
              {deductions.length}
            </Badge>
          </div>
          {deductions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deduction components</p>
          ) : (
            <div className="space-y-2">
              {deductions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{item.componentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.calculationMethod}
                      {item.overrideValue != null ? ` · Override: ${item.overrideValue}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    −{formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Notes */}
      {compensation.notes ? (
        <Card className="p-4">
          <h3 className="mb-1 text-sm font-semibold">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{compensation.notes}</p>
        </Card>
      ) : null}
    </div>
  );
}
