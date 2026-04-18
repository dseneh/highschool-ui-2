"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PayrollRunDto } from "@/lib/api2/payroll-types";
import StatusBadge from "../ui/status-badge";
import { ActionSheet } from "../shared/action-sheet";
import { AuthButton } from "@/components/auth/auth-button";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

interface PayrollRunDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollRun: PayrollRunDto | null;
  onEdit?: (run: PayrollRunDto) => void;
  onProcess?: (id: string) => void;
  onMarkPaid?: (id: string) => void;
}

export function PayrollRunDetailSheet({
  open,
  onOpenChange,
  payrollRun,
  onEdit,
  onProcess,
  onMarkPaid,
}: PayrollRunDetailSheetProps) {
  return (
    <ActionSheet 
    open={open} 
    onOpenChange={onOpenChange}
    title={
        <div>
            <StatusBadge status={payrollRun?.status ?? "Draft"} className="p-2" />
            <span className="ml-2">{payrollRun?.name ?? "Payroll Run"}</span>
        </div>
    }
    description={payrollRun?.periodStart && payrollRun?.periodEnd ? `Period: ${payrollRun.periodStart} to ${payrollRun.periodEnd}` : "View full details of this payroll run."}
    footer={
        <div>
            {payrollRun ? (
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
            {onEdit ? (
              <AuthButton
                roles="admin"
                disable
                variant="outline"
                className="w-full"
                onClick={() => {
                  onEdit(payrollRun);
                  onOpenChange(false);
                }}
              >
                Edit
              </AuthButton>
            ) : null}
            {onProcess && payrollRun.status.toLowerCase() === "draft" ? (
              <AuthButton
                roles="admin"
                disable
                variant="outline"
                className="w-full"
                onClick={() => {
                  onProcess(payrollRun.id);
                  onOpenChange(false);
                }}
              >
                Process
              </AuthButton>
            ) : null}
            {onMarkPaid && payrollRun.status.toLowerCase() === "completed" ? (
              <AuthButton
                roles="admin"
                disable
                className="w-full"
                onClick={() => {
                  onMarkPaid(payrollRun.id);
                  onOpenChange(false);
                }}
              >
                Mark Paid
              </AuthButton>
            ) : null}
            <Button variant="secondary" className="w-full" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : null}
        </div>
    }
    >
     

        {payrollRun ? (
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Dates Section */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Run Date</p>
                <p className="mt-1 text-sm font-medium">{payrollRun.runDate || "Not set"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Payment Date</p>
                <p className="mt-1 text-sm font-medium">{payrollRun.paymentDate || "Not set"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Period Start</p>
                <p className="mt-1 text-sm font-medium">{payrollRun.periodStart || "Not set"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Period End</p>
                <p className="mt-1 text-sm font-medium">{payrollRun.periodEnd || "Not set"}</p>
              </div>
            </div>

            <Separator />

            {/* Financial Summary */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Financial Summary</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="text-sm font-medium">{payrollRun.employeeCount}</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="text-sm font-medium">{payrollRun.currency}</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Gross Pay</p>
                  <p className="text-sm font-medium">{formatMoney(payrollRun.grossPay, payrollRun.currency)}</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Total Deductions</p>
                  <p className="text-sm font-medium text-red-600">
                    -{formatMoney(payrollRun.totalDeductions, payrollRun.currency)}
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
                  <p className="text-sm font-medium">Net Pay</p>
                  <p className="text-sm font-semibold">{formatMoney(payrollRun.netPay, payrollRun.currency)}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {payrollRun.notes ? (
              <>
                <Separator />
                <div className="rounded-lg border bg-muted/15 p-3">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm">{payrollRun.notes}</p>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        
    </ActionSheet>
  );
}
