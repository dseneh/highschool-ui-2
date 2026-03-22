"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import PageLayout from "@/components/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AccountingTableSkeleton } from "@/components/accounting/accounting-table-skeleton";
import { StudentPaymentDialog } from "@/components/accounting/student-payment-dialog";
import { DialogBox } from "@/components/ui/dialog-box";
import { showToast } from "@/lib/toast";
import {
  useCashTransactions,
  useCashTransactionMutations,
  useTransactionTypes,
  useAccountingBankAccounts,
} from "@/hooks/use-accounting";
import type { AccountingCashTransactionDto } from "@/lib/api2/accounting-types";
import { useCashTransactionFilterParams } from "@/components/accounting/cash-transaction-filters";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { getQueryClient } from "@/lib/query-client";
import { CashTransactionsTable } from "../cash-transactions/_components/cash-transactions-table";
import { CashTransactionDetailSheet } from "../cash-transactions/_components/cash-transaction-detail-sheet";

type ActionTarget = {
  action: "approve" | "reject" | "post" | "delete";
  record: AccountingCashTransactionDto;
} | null;

export default function StudentPaymentsPage() {
  const filterState = useCashTransactionFilterParams();
  const params = useMemo(
    () => ({ ...filterState.params, transaction_type_code: "TUITION" as const }),
    [filterState.params]
  );

  const { data: transactionsData, isLoading, error, refetch } = useCashTransactions(params);
  const {
    approve,
    reject,
    post: postToJournal,
    remove,
  } = useCashTransactionMutations();
  const { data: txTypes = [] } = useTransactionTypes();
  const { data: bankAccounts = [] } = useAccountingBankAccounts();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTx, setEditTx] = useState<AccountingCashTransactionDto | null>(null);
  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const [deleteConfirmChecked, setDeleteConfirmChecked] = useState(false);
  const [detailTx, setDetailTx] = useState<AccountingCashTransactionDto | null>(null);
  const queryClient = getQueryClient();

  const transactions = useMemo(() => transactionsData?.results ?? [], [transactionsData?.results]);
  const totalCount = transactionsData?.count ?? transactions.length;

  useEffect(() => {
    if (actionTarget?.action !== "delete") {
      setDeleteConfirmChecked(false);
    }
  }, [actionTarget]);

  useEffect(() => {
    if (!detailTx) return;
    const refreshed = transactions.find((item) => item.id === detailTx.id) ?? null;
    if (!refreshed) {
      setDetailTx(null);
      return;
    }
    if (refreshed !== detailTx) {
      setDetailTx(refreshed);
    }
  }, [detailTx, transactions]);

  async function handleAction() {
    if (!actionTarget) return;

    try {
      const { action, record } = actionTarget;
      if (action === "approve") {
        await approve.mutateAsync(record.id);
        showToast.success("Payment approved");
      } else if (action === "reject") {
        await reject.mutateAsync({ id: record.id, reason: "Rejected from student payments page" });
        showToast.success("Payment rejected");
      } else if (action === "post") {
        await postToJournal.mutateAsync(record.id);
        showToast.success("Payment posted to journal");
      } else if (action === "delete") {
        await remove.mutateAsync(record.id);
        showToast.success("Payment deleted");
      }

      await queryClient.invalidateQueries({ queryKey: ["accounting"] });

      if (action === "delete" && detailTx?.id === record.id) {
        setDetailTx(null);
      }
    } catch (error) {
      showToast.error("Action failed", getErrorMessage(error));
    } finally {
      setActionTarget(null);
    }
  }

  const ACTION_LABELS = {
    approve: {
      title: "Approve Payment",
      description: "Mark this student payment as approved.",
      label: "Approve",
      variant: "default" as const,
    },
    reject: {
      title: "Reject Payment",
      description: "This will reject this student payment and stop posting.",
      label: "Reject",
      variant: "destructive" as const,
    },
    post: {
      title: "Post to Journal",
      description: "This will create a journal entry from this payment. This action cannot be undone.",
      label: "Post to Journal",
      variant: "default" as const,
    },
    delete: {
      title: "Delete Payment",
      description: "This will permanently delete this payment and any linked posted journal entry with all journal lines.",
      label: "Delete",
      variant: "destructive" as const,
    },
  };

  const isActionLoading = approve.isPending || reject.isPending || postToJournal.isPending || remove.isPending;

  return (
    <>
      <PageLayout
        title="Student Payments"
        description="Track, approve, and post student payment transactions"
        actions={
          <Button icon={<HugeiconsIcon icon={PlusSignIcon} />} onClick={() => setCreateOpen(true)}>
            Record Payment
          </Button>
        }
        skeleton={<AccountingTableSkeleton columns={8} />}
        loading={isLoading}
        error={error}
        refreshAction={refetch}
      >
        <CashTransactionsTable
          transactions={transactions}
          txTypes={txTypes}
          bankAccounts={bankAccounts}
          filterState={filterState}
          totalCount={totalCount}
          isLoading={isLoading}
          onRowClick={setDetailTx}
          onApprove={(row) => setActionTarget({ action: "approve", record: row })}
          onReject={(row) => setActionTarget({ action: "reject", record: row })}
          onPost={(row) => setActionTarget({ action: "post", record: row })}
          onEdit={setEditTx}
          onDelete={(row) => setActionTarget({ action: "delete", record: row })}
        />
      </PageLayout>

      <StudentPaymentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["accounting"] })}
      />

      <StudentPaymentDialog
        open={Boolean(editTx)}
        onOpenChange={(open) => {
          if (!open) setEditTx(null);
        }}
        transaction={editTx}
        isEdit
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["accounting"] })}
      />

      <CashTransactionDetailSheet
        transaction={detailTx}
        open={Boolean(detailTx)}
        isActionLoading={isActionLoading}
        onApprove={(row) => setActionTarget({ action: "approve", record: row })}
        onReject={(row) => setActionTarget({ action: "reject", record: row })}
        onPost={(row) => setActionTarget({ action: "post", record: row })}
        onOpenChange={(open) => {
          if (!open) setDetailTx(null);
        }}
      />

      <DialogBox
        open={Boolean(actionTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setActionTarget(null);
            setDeleteConfirmChecked(false);
          }
        }}
        title={actionTarget ? ACTION_LABELS[actionTarget.action].title : "Confirm Action"}
        description={actionTarget ? ACTION_LABELS[actionTarget.action].description : undefined}
        actionLabel={actionTarget ? ACTION_LABELS[actionTarget.action].label : undefined}
        actionVariant={actionTarget ? ACTION_LABELS[actionTarget.action].variant : "default"}
        actionDisabled={Boolean(actionTarget && actionTarget.action === "delete" && !deleteConfirmChecked)}
        actionLoading={isActionLoading}
        actionLoadingText="Processing..."
        cancelDisabled={isActionLoading}
        onAction={() => {
          void handleAction();
        }}
        onCancel={() => {
          setActionTarget(null);
          setDeleteConfirmChecked(false);
        }}
        contentClassName="py-5"
        showCloseButton={false}
      >
        {actionTarget ? (
          <div className="space-y-3 bg-muted/20">
            <p className="text-sm text-foreground">
              You are about to <span className="font-semibold lowercase">{ACTION_LABELS[actionTarget.action].label}</span> this payment.
            </p>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Reference:</span>{" "}
                <span className="font-mono">{actionTarget.record.reference_number ?? actionTarget.record.id}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Student Ref:</span>{" "}
                <span className="font-mono">{actionTarget.record.source_reference ?? "-"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Amount:</span>{" "}
                <span className="font-semibold text-foreground">
                  {actionTarget.record.currency?.symbol ?? actionTarget.record.currency?.code ?? ""} {actionTarget.record.amount}
                </span>
              </p>
            </div>

            <p className="text-xs text-muted-foreground">Please confirm to continue.</p>

            {actionTarget.action === "delete" ? (
              <label className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <Checkbox
                  checked={deleteConfirmChecked}
                  onCheckedChange={(checked) => setDeleteConfirmChecked(checked === true)}
                  aria-label="Confirm permanent deletion"
                />
                <span className="text-xs text-foreground">
                  I understand this will permanently delete this payment and any linked posted journal entry with all related journal lines.
                </span>
              </label>
            ) : null}
          </div>
        ) : null}
      </DialogBox>
    </>
  );
}
