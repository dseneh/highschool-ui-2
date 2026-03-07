"use client";

import * as React from "react";
import { DialogBox } from "@/components/ui/dialog-box";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import type { TransactionDto } from "@/lib/api2/finance-types";
import { getStatusBadgeClass } from "@/lib/status-colors";
import { formatCurrency, cn, getErrorMessage } from "@/lib/utils";
import { format } from "date-fns";

import { ArrowBigLeft, Pencil, Undo } from "lucide-react";
import { useTransactionMutations } from "@/hooks/use-finance";
import { toast } from "sonner";
import { AuthButton } from "../auth/auth-button";

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionDto | null;
  currency?: string;
  onEdit?: (tx: TransactionDto) => void;
}

function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!children || children === "—") return null;
  return (
    <div
      className={cn(
        "grid grid-cols-2 items-start gap-3 py-2.5 px-3 rounded-md transition-colors hover:bg-muted/50",
        className
      )}
    >
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-right">{children}</span>
    </div>
  );
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  transaction,
  currency = "USD",
  onEdit,
}: TransactionDetailDialogProps) {
  const studentId = typeof transaction?.student === "string" ? transaction.student : transaction?.student?.id;
  const { approve, cancel, update } = useTransactionMutations(studentId);
  const [isApproving, setIsApproving] = React.useState(false);
  const [isCanceling, setIsCanceling] = React.useState(false);
  const [isReversing, setIsReversing] = React.useState(false);

  if (!transaction) return null;

  const tx = transaction;
  const isExpense = tx.transaction_type?.type === "expense";
  const isCanceled = tx.status === "canceled";
  const canApprove = tx.status === "pending";
  const canCancel = tx.status === "pending" || tx.status === "approved";

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approve.mutateAsync(tx.id);
      toast.success("Transaction approved successfully");
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsApproving(false);
    }
  };

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      await cancel.mutateAsync(tx.id);
      toast.success("Transaction canceled successfully");
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReverse = async () => {
    setIsReversing(true);
    try {
      await update.mutateAsync({
        id: tx.id,
        payload: { status: "pending" },
      });
      toast.success("Transaction reversed to pending status");
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsReversing(false);
    }
  };

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={
        <>
         <div className="flex items-center justify-between gap-4 pb-2">
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {tx.transaction_type?.name}
          </p>
        
          <p className="text-xs text-muted-foreground">
            {tx.date
              ? format(new Date(tx.date), "MMMM d, yyyy")
              : "—"}
          </p>
        </div>
        <div>
        <Badge
          className={cn(
            "text-xs capitalize shrink-0 mt-1 me-4",
            getStatusBadgeClass(tx.status)
          )}
        >
          {tx.status}
        </Badge>
              <p
            className={cn(
              "text-xl font-bold tabular-nums tracking-tight",
              isExpense
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400",
              isCanceled && "line-through opacity-60"
            )}
          >
            {isExpense ? "−" : "+"}
            {formatCurrency(Math.abs(tx.amount), currency)}
          </p>
        </div>
      </div>
         <Separator />
      </>
      }
      cancelLabel={false}
      footer={
        (canApprove || canCancel || tx.status === "pending" || tx.status === "canceled") ? (
            <>
            <Separator />
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              {canApprove && (
                <AuthButton
                  roles={["finance", "registrar", "accountant"]}
                  size="sm"
                  variant="success-outline"
                  onClick={handleApprove}
                  loading={isApproving}
                  loadingText="Approving…"
                >
                  Approve Transaction
                </AuthButton>
              )}
              {canCancel && (
                <AuthButton
                  roles={["finance", "registrar", "accountant"]}
                  size="sm"
                  variant="destructive-outline"
                  onClick={handleCancel}
                  loading={isCanceling}
                  loadingText="Canceling…"
                >
                  Cancel Transaction
                </AuthButton>
              )}
              {tx.status === "canceled" && (
                <AuthButton
                  roles={["finance", "registrar", "accountant"]}
                  size="sm"
                  variant="warning-outline"
                  onClick={handleReverse}
                  loading={isReversing}
                  loadingText="Reversing…"
                  icon={<Undo size={16} />}
                >
                  Reverse Cancellation
                </AuthButton>
              )}
            </div>
            {tx.status === "pending" && (
              <AuthButton
                roles={["finance", "registrar", "accountant"]}
                size="sm"
                variant="ghost"
                icon={<Pencil size={16} />}
                onClick={() => {
                  onOpenChange(false);
                  onEdit?.(tx);
                }}
              >
                Edit
              </AuthButton>
            )}
          </div>
          </>
        ) : undefined
      }
      className="sm:max-w-lg"
    >

      {/* ---- Details Grid ---- */}
      <div className="-mx-1">
        <DetailRow label="Transaction ID">
          <span className="font-mono text-xs uppercase">{tx.transaction_id}</span>
        </DetailRow>

        {tx.student && (
          <DetailRow label="Student">
            <div className="text-right">
              <p className="font-medium text-primary">{tx.student.full_name}</p>
              <p className="text-xs text-muted-foreground">{tx.student.id_number}</p>
            </div>
          </DetailRow>
        )}

        <DetailRow label="Bank Account">
          {tx.account ? (
            <span>
              {tx.account.name}
              <span className="text-muted-foreground ml-1 text-xs">
                ({tx.account.number})
              </span>
            </span>
          ) : (
            "—"
          )}
        </DetailRow>

        <DetailRow label="Payment Method">
          {tx.payment_method?.name ?? "—"}
        </DetailRow>

        <DetailRow label="Reference">
          {tx.reference ?? "—"}
        </DetailRow>

        <DetailRow label="Academic Year">
          {tx.academic_year?.name ?? "—"}
        </DetailRow>

        {tx.description && (
          <div className="py-2.5 px-3 rounded-md hover:bg-muted/50 transition-colors">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Description
            </p>
            <p className="text-sm text-foreground">{tx.description}</p>
          </div>
        )}

        {tx.notes && (
          <div className="py-2.5 px-3 rounded-md hover:bg-muted/50 transition-colors">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Notes
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {tx.notes}
            </p>
          </div>
        )}
      </div>

      {/* ---- Meta ---- */}
      {tx.meta && (
        <>
          <Separator />
          <div className="-mx-1 text-xs">
            <DetailRow label="Created By" className="py-1.5">
              <span className="text-xs">
                {tx.meta.created_by?.username ?? "—"}
              </span>
            </DetailRow>
            <DetailRow label="Updated By" className="py-1.5">
              <span className="text-xs">
                {tx.meta.updated_by?.username ?? "—"}
              </span>
            </DetailRow>
            <DetailRow label="Last Updated" className="py-1.5">
              <span className="text-xs">
                {tx.meta.updated_at
                  ? format(
                      new Date(tx.meta.updated_at),
                      "MMM d, yyyy h:mm a"
                    )
                  : "—"}
              </span>
            </DetailRow>
          </div>
        </>
      )}
    </DialogBox>
  );
}
