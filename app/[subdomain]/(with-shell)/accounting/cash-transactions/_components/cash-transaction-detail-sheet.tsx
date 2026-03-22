"use client";

import { format } from "date-fns";
import { ActionSheet } from "@/components/shared/action-sheet";
import StatusBadge from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthButton } from "@/components/auth/auth-button";
import {
  Cancel01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { AccountingCashTransactionDto } from "@/lib/api2/accounting-types";
import { cn, formatCurrency } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

function getTransactionTypeCode(value: unknown): string {
  if (value && typeof value === "object" && "code" in value) {
    return String((value as { code?: string }).code ?? "").toUpperCase();
  }
  return "";
}

function getSignedAmount(transaction: AccountingCashTransactionDto, amount: number): number {
  const txCode = getTransactionTypeCode(transaction.transaction_type);

  if (txCode === "TRANSFER_OUT") {
    return -Math.abs(amount);
  }

  if (txCode === "TRANSFER_IN") {
    return Math.abs(amount);
  }

  return amount;
}

function getRefLabel(
  value: unknown,
  field: "name" | "account_name" | "reference_number" = "name"
) {
  if (value && typeof value === "object" && field in value) {
    return String((value as Record<string, unknown>)[field] ?? "-");
  }
  return typeof value === "string" ? value : "-";
}

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-sm border border-border/70 bg-card p-5 fshadow-sm ${className ?? ""}`}>
      <div className="mb-4 space-y-1 border-b pb-2">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-xs -mt-1 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-2 border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start">
      <span className="ftext-[11px] font-semibold fuppercase ftracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className={mono ? "font-mono text-sm text-foreground" : "text-sm leading-6 text-foreground"}>
        {value}
      </span>
    </div>
  );
}

interface CashTransactionDetailSheetProps {
  transaction: AccountingCashTransactionDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  isActionLoading?: boolean;
  onApprove?: (transaction: AccountingCashTransactionDto) => void;
  onReject?: (transaction: AccountingCashTransactionDto) => void;
  onPost?: (transaction: AccountingCashTransactionDto) => void;
}


export function CashTransactionDetailSheet({
  transaction,
  open,
  onOpenChange,
  isLoading,
  isActionLoading,
  onApprove,
  onReject,
  onPost,
}: CashTransactionDetailSheetProps) {
  const canApprove = transaction?.status === "pending";
  const canReject = transaction?.status === "pending";
  const canPost = transaction?.status === "approved" && !transaction?.journal_entry;
  const signedAmount = transaction
    ? getSignedAmount(transaction, Number(transaction.amount || 0))
    : 0;
  const signedBaseAmount = transaction
    ? getSignedAmount(transaction, Number(transaction.base_amount || 0))
    : 0;

  const amountDisplay = transaction
    ? formatCurrency(signedAmount, transaction.currency?.symbol)
    : "-";
  const baseAmountDisplay = transaction
    ? formatCurrency(signedBaseAmount, transaction.currency?.symbol)
    : "-";
  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Cash Transaction Details"
      description={
        <>
            Ref Number: <span className="font-mono uppercase">{transaction?.reference_number || "-"}</span>
        </>
      }
      className="sm:max-w-3xl!"
      footer={
        transaction ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>

            <div className="flex items-center gap-2">
              {canApprove && (
                <AuthButton
                  roles={["finance", "registrar", "accountant"]}
                  size="sm"
                  variant="success-outline"
                  loading={Boolean(isActionLoading)}
                  loadingText="Processing..."
                  iconLeft={<HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />}
                  onClick={() => onApprove?.(transaction)}
                >
                  Approve
                </AuthButton>
              )}
              {canReject && (
                <AuthButton
                  roles={["finance", "registrar", "accountant"]}
                  size="sm"
                  variant="destructive-outline"
                  loading={Boolean(isActionLoading)}
                  loadingText="Processing..."
                  iconLeft={<HugeiconsIcon icon={Cancel01Icon} className="size-4" />}
                  onClick={() => onReject?.(transaction)}
                >
                  Reject
                </AuthButton>
              )}
              {canPost && (
                <AuthButton
                  roles={["finance", "registrar", "accountant"]}
                  size="sm"
                //   variant="info"
                  loading={Boolean(isActionLoading)}
                  loadingText="Processing..."
                  iconLeft={<CheckCircle  className="size-4" />}
                  onClick={() => onPost?.(transaction)}
                >
                  Post to Journal
                </AuthButton>
              )}
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        )
      }
    >
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      ) : transaction ? (
        <div className="space-y-4 divide-y-2 divide-primary">
          <SectionCard
            title="Transaction Summary"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between frounded-2xl border border-border/70 bg-muted/20 p-5">
              <div className="">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Transaction Amount
                </p>
                <p
                  className={cn(
                    "mt-2 text-2xl font-semibold tracking-tight sm:text-3xl",
                    signedAmount < 0 ? "text-red-600" : "text-foreground"
                  )}
                >
                  {amountDisplay}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={transaction.status} className="capitalize px-3 py-3" />
              </div>
              </div>

              <div className="space-y-1">
              <DetailRow
                label="Transaction Date"
                value={transaction.transaction_date ? format(new Date(transaction.transaction_date), "PPP") : "—"}
              />
              <DetailRow label="Transaction Type" value={getRefLabel(transaction.transaction_type, "name")} />
              <DetailRow label="Reference" value={transaction.reference_number || "—"} mono />
              <DetailRow label="Base Amount" value={baseAmountDisplay} />
              <DetailRow
                label="Exchange Rate"
                value={transaction.exchange_rate ? Number(transaction.exchange_rate).toFixed(4) : "—"}
              />
              <DetailRow label="Posting" value={transaction.journal_entry ? "Posted" : "Pending"} />
              <DetailRow
                label="Journal Entry"
                value={getRefLabel(transaction.journal_entry, "reference_number")}
                mono
              />
              </div>
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard
              title="Transaction Information"
            //   description="Core references and operational details for this cash movement."
            >
              <div className="space-y-1">
                <DetailRow label="Bank Account" value={getRefLabel(transaction.bank_account, "account_name")} />
                <DetailRow label="Payment Method" value={getRefLabel(transaction.payment_method, "name")} />
                <DetailRow label="Ledger Account" value={getRefLabel(transaction.ledger_account, "name")} />
                <DetailRow label="Payer / Payee" value={transaction.payer_payee || "—"} />
                <DetailRow label="Source Reference" value={transaction.source_reference || "—"} mono />
                <DetailRow label="Description" value={transaction.description || "—"} />
                {transaction.rejection_reason ? (
                  <DetailRow label="Rejection Reason" value={transaction.rejection_reason} />
                ) : null}
              </div>
            </SectionCard>

            <SectionCard
              title="Accounting Summary"
              description="Amounts and accounting linkage used for posting."
            >
              <div className="space-y-1">
                <DetailRow label="Currency" value={transaction.currency?.code || "—"} />
                <DetailRow label="Journal Entry" value={getRefLabel(transaction.journal_entry, "reference_number")} mono />
              </div>
            </SectionCard>

            <SectionCard
              title="Activity Timeline"
            //   description="Important timestamps and approval metadata."
            >
              <div className="space-y-1">
                <DetailRow label="Created" value={transaction.created_at ? format(new Date(transaction.created_at), "PPpp") : "-"} />
                <DetailRow label="Updated" value={transaction.updated_at ? format(new Date(transaction.updated_at), "PPpp") : "-"} />
                {/* <DetailRow label="Approved At" value={transaction.approved_at ? format(new Date(transaction.approved_at), "PPpp") : "-"} />
                <DetailRow label="Approved By" value={transaction.approved_by || "-"} /> */}
              </div>
            </SectionCard>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground">No transaction details available</div>
      )}
    </ActionSheet>
  );
}
