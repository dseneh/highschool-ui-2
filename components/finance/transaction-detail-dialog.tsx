"use client";

import * as React from "react";
import { DialogBox } from "@/components/ui/dialog-box";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { TransactionDto } from "@/lib/api2/finance-types";
import { getStatusBadgeClass } from "@/lib/status-colors";
import { formatCurrency, cn, getErrorMessage } from "@/lib/utils";
import { format } from "date-fns";

import { Check, MoreHorizontal, MoreVertical, Pencil, Trash2, Undo, XCircle } from "lucide-react";
import { useTransactionMutations } from "@/hooks/use-finance";
import { toast } from "sonner";
import { AuthButton } from "../auth/auth-button";
import { getQueryClient } from "@/lib/query-client";

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionDto | null;
  currency?: string;
  onEdit?: (tx: TransactionDto) => void;
}

interface TransactionActionButtonsProps {
  tx: TransactionDto;
  onEdit?: (tx: TransactionDto) => void;
  onActionSuccess?: () => void;
  compact?: boolean;
  mode?: "inline" | "dropdown";
  className?: string;
}

type PendingTxAction = "approve" | "cancel" | "reverse" | "delete" | "edit";

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

export function TransactionActionButtons({
  tx,
  onEdit,
  onActionSuccess,
  compact = true,
  mode = "inline",
  className,
}: TransactionActionButtonsProps) {
  const studentId = typeof tx.student === "string" ? tx.student : tx.student?.id;
  const { approve, cancel, update, remove } = useTransactionMutations(studentId);
  const [isApproving, setIsApproving] = React.useState(false);
  const [isCanceling, setIsCanceling] = React.useState(false);
  const [isReversing, setIsReversing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<PendingTxAction | null>(null);

  const queryClient = getQueryClient();

  const canApprove = tx.status === "pending";
  const canCancel = tx.status === "pending" || tx.status === "approved";
  const canReverse = tx.status === "canceled";
  const canDelete = tx.status === "pending" || tx.status === "canceled";
  const canEdit = tx.status === "pending";

  const actionMeta: Record<PendingTxAction, { title: string; description: string; actionLabel: string; actionVariant: "default" | "destructive" | "outline" }> = {
    approve: {
      title: "Approve Transaction?",
      description: "This will mark the transaction as approved and apply it to balances.",
      actionLabel: "Approve",
      actionVariant: "default",
    },
    cancel: {
      title: "Cancel Transaction?",
      description: "This will mark the transaction as canceled.",
      actionLabel: "Cancel",
      actionVariant: "destructive",
    },
    reverse: {
      title: "Reverse Transaction Cancellation?",
      description: "This will move the transaction back to pending status.",
      actionLabel: "Reverse",
      actionVariant: "outline",
    },
    delete: {
      title: "Delete Transaction?",
      description: "This action cannot be undone.",
      actionLabel: "Delete",
      actionVariant: "destructive",
    },
    edit: {
      title: "Edit Transaction?",
      description: "You are about to open this transaction in edit mode.",
      actionLabel: "Continue",
      actionVariant: "default",
    },
  };

  const invalidateAndNotify = async (message: string) => {
    toast.success(message);
    await queryClient.invalidateQueries({ queryKey: ["students"] });
    onActionSuccess?.();
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approve.mutateAsync(tx.id);
      await invalidateAndNotify("Transaction approved successfully");
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
      await invalidateAndNotify("Transaction canceled successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReverse = async () => {
    setIsReversing(true);
    try {
      await update.mutateAsync({ id: tx.id, payload: { status: "pending" } });
      await invalidateAndNotify("Transaction reversed to pending status");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsReversing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await remove.mutateAsync(tx.id);
      await invalidateAndNotify("Transaction deleted successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const btnSize = compact ? "xs" : "sm";

  const isActionLoading =
    (pendingAction === "approve" && isApproving) ||
    (pendingAction === "cancel" && isCanceling) ||
    (pendingAction === "reverse" && isReversing) ||
    (pendingAction === "delete" && isDeleting);

  const executePendingAction = async () => {
    if (!pendingAction) return;

    if (pendingAction === "approve") {
      await handleApprove();
      setPendingAction(null);
      return;
    }
    if (pendingAction === "cancel") {
      await handleCancel();
      setPendingAction(null);
      return;
    }
    if (pendingAction === "reverse") {
      await handleReverse();
      setPendingAction(null);
      return;
    }
    if (pendingAction === "delete") {
      await handleDelete();
      setPendingAction(null);
      return;
    }
    if (pendingAction === "edit") {
      onEdit?.(tx);
      setPendingAction(null);
    }
  };

  return (
    <>
      {mode === "dropdown" ? (
        <div className={cn("flex items-center", className)}>
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <AuthButton
                roles={["finance", "registrar", "accountant"]}
                size="icon-sm"
                variant="ghost"
                aria-label="Open transaction actions"
                icon={<MoreVertical size={16} />}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-50">
              {canApprove && (
                <DropdownMenuItem onClick={() => setPendingAction("approve")}> 
                  <Check size={14} className="mr-2" />
                  Approve Transaction
                </DropdownMenuItem>
              )}
              {canCancel && (
                <DropdownMenuItem onClick={() => setPendingAction("cancel")}>
                  <XCircle size={14} className="mr-2" />
                  Cancel Transaction
                </DropdownMenuItem>
              )}
              {canReverse && (
                <DropdownMenuItem onClick={() => setPendingAction("reverse")}>
                  <Undo size={14} className="mr-2" />
                  Reverse Cancellation
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={() => setPendingAction("edit")}>
                  <Pencil size={14} className="mr-2" />
                  Edit Transaction
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                <Separator className="my-1" />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 "
                  onClick={() => setPendingAction("delete")}
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete Transaction
                </DropdownMenuItem>
              </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className={cn("flex items-center gap-1 sm:gap-2 flex-wrap", className)}>
          {canApprove && (
            <AuthButton
              roles={["finance", "registrar", "accountant"]}
              size={btnSize}
              variant="success-outline"
              onClick={() => setPendingAction("approve")}
              tooltip="Approve Transaction"
              icon={<Check size={16} />}
            >
              Approve
            </AuthButton>
          )}
          {canCancel && (
            <AuthButton
              roles={["finance", "registrar", "accountant"]}
              size={btnSize}
              variant="destructive-outline"
              onClick={() => setPendingAction("cancel")}
              tooltip="Cancel Transaction"
              icon={<XCircle size={16} />}
            >
              Cancel 
            </AuthButton>
          )}
          {canReverse && (
            <AuthButton
              roles={["finance", "registrar", "accountant"]}
              size={btnSize}
              variant="warning-outline"
              onClick={() => setPendingAction("reverse")}
              tooltip="Reverse Cancellation"
              icon={<Undo size={16} />}
            >
              Reverse 
            </AuthButton>
          )}
          {canEdit && (
            <AuthButton
            roles={["finance", "registrar", "accountant"]}
            size={btnSize}
            variant="info-outline"
            onClick={() => setPendingAction("edit")}
            tooltip="Edit Transaction"
            icon={<Pencil size={16} />}
            >
              Edit 
            </AuthButton>
          )}
          {canDelete && (
            <AuthButton
              roles={["finance", "registrar", "accountant"]}
              size={btnSize}
              variant="destructive-outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setPendingAction("delete")}
              tooltip="Delete Transaction"
              icon={<Trash2 size={16} />}
            >
              Delete 
            </AuthButton>
          )}
        </div>
      )}

      <DialogBox
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={pendingAction ? actionMeta[pendingAction].title : "Confirm Action"}
        description={pendingAction ? actionMeta[pendingAction].description : undefined}
        actionLabel={pendingAction ? actionMeta[pendingAction].actionLabel : undefined}
        actionVariant={pendingAction ? actionMeta[pendingAction].actionVariant : "default"}
        actionLoading={isActionLoading}
        actionLoadingText="Processing..."
        onAction={() => {
          void executePendingAction();
        }}
        cancelLabel="Cancel"
      />
    </>
  );
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  transaction,
  currency = "USD",
  onEdit,
}: TransactionDetailDialogProps) {
  if (!transaction) return null;

  const tx = transaction;
  const isExpense = tx.transaction_type?.type === "expense";
  const isCanceled = tx.status === "canceled";

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
        (tx.status === "pending" || tx.status === "approved" || tx.status === "canceled") ? (
            <>
            <Separator />
          <div className="flex items-center justify-end gap-2 w-full">
            <TransactionActionButtons
              tx={tx}
              compact={false}
              onActionSuccess={() => onOpenChange(false)}
              onEdit={(txToEdit) => {
                onOpenChange(false);
                onEdit?.(txToEdit);
              }}
            />
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
