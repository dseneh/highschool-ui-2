"use client";

import * as React from "react";
import PageLayout from "@/components/dashboard/page-layout";
import { StatsCards } from "@/components/shared/stats-cards";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getIconByKey } from "@/lib/icon-map";
import { formatCurrency } from "@/lib/utils";
import {
  useTransactions,
  useTransactionMutations,
  useTransactionTypes,
  usePaymentMethods,
  useBankAccounts,
} from "@/hooks/use-finance";
import { useAcademicYears } from "@/hooks/use-academic-year";
import type {
  TransactionDto,
  CreateTransactionCommand,
  BulkTransactionType,
  BulkTransactionCommand,
} from "@/lib/api2/finance-types";
import { getTransactionColumns } from "@/components/finance/transaction-columns";
import { TransactionFormDialog } from "@/components/finance/transaction-form-dialog";
import { TransactionDetailDialog } from "@/components/finance/transaction-detail-dialog";
import { AccountTransferDialog } from "@/components/finance/account-transfer-dialog";
import { TuitionPaymentDialog } from "@/components/finance/tuition-payment-dialog";
import { GeneralTransactionDialog } from "@/components/finance/general-transaction-dialog";
import { UploadTransactionsDialog } from "@/components/finance/upload-transactions-dialog";
import { useTransactionFilterParams } from "@/components/finance/transaction-filters";
import { TransactionsTable } from "@/components/finance/transactions-table";
import { DialogBox } from "@/components/ui/dialog-box";
import {
  Add01Icon,
  ArrowDown01Icon,
  SchoolIcon,
  ArrowDataTransferHorizontalIcon,
  Invoice02Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/utils";
import { exportTransactionsToCSV } from "@/lib/export-utils";
import { Download, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { FloatingSelectionPanel } from "@/components/shared/floating-selection-panel";

/* ------------------------------------------------------------------ */
/*  Summary helpers                                                    */
/* ------------------------------------------------------------------ */

function buildSummaryCards(transactions: TransactionDto[], totalTransactions: number) {
  const approved = transactions.filter((t) => t.status === "approved");
  const totalIncome = approved
    .filter((t) => t.transaction_type?.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = approved
    .filter((t) => t.transaction_type?.type === "expense")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const pending = transactions.filter((t) => t.status === "pending").length;

  return [
    {
      title: "Total Transactions",
      value: totalTransactions.toLocaleString(),
      subtitle: `${pending} pending`,
      icon: getIconByKey("transactions"),
    },
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      subtitle: `${approved.filter((t) => t.transaction_type?.type === "income").length} transactions`,
      icon: getIconByKey("income"),
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpense),
      subtitle: `${approved.filter((t) => t.transaction_type?.type === "expense").length} transactions`,
      icon: getIconByKey("cancel"),
    },
    {
      title: "Balance",
      value: formatCurrency(totalIncome - totalExpense),
      subtitle: `${pending} pending`,
      icon: getIconByKey("balance"),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TransactionsPage() {
  // Filter state from URL via nuqs
  const filterState = useTransactionFilterParams();
  const { params } = filterState;

  // Row selection state
  const [selectedTransactions, setSelectedTransactions] = React.useState<TransactionDto[]>([]);
  const [clearSelectionSignal, setClearSelectionSignal] = React.useState(0);

  // Dialog state
  const [showCreate, setShowCreate] = React.useState(false);
  const [editingTx, setEditingTx] = React.useState<TransactionDto | null>(null);
  const [detailTx, setDetailTx] = React.useState<TransactionDto | null>(null);
  const [showTransfer, setShowTransfer] = React.useState(false);
  const [showTuition, setShowTuition] = React.useState(false);
  const [showGeneral, setShowGeneral] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<{
    type: "approve" | "cancel" | "delete";
    transaction: TransactionDto;
  } | null>(null);
  
  // Bulk action dialogs
  const [bulkApproveDialog, setBulkApproveDialog] = React.useState(false);
  const [bulkCancelDialog, setBulkCancelDialog] = React.useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = React.useState(false);

  // Data hooks
  const { data: txData, isLoading, error, isFetching, refetch  } = useTransactions(params);
  const { data: typesData } = useTransactionTypes();
  const { data: methodsData } = usePaymentMethods();
  const { data: accountsData } = useBankAccounts();
  const { data: academicYearsData } = useAcademicYears();
  const { create, update, approve, cancel, remove, transfer, bulkCreate, bulkApprove, bulkCancel, bulkDelete } =
    useTransactionMutations();

  const transactions = txData?.results ?? [];
  const transactionTypes = typesData ?? [];
  const paymentMethods = methodsData ?? [];
  const bankAccounts = accountsData?.results ?? [];
  const academicYears = academicYearsData ?? [];
  const isEmpty = transactions.length === 0;

  const visibleTypes = React.useMemo(
    () => transactionTypes.filter((type) => !type.is_hidden).map((type) => ({ value: type.id, label: type.name })),
    [transactionTypes]
  );
  const accountFilterOptions = React.useMemo(
    () => bankAccounts.map((account) => ({ value: account.id, label: account.number || account.name })),
    [bankAccounts]
  );
  const academicYearFilterOptions = React.useMemo(
    () => academicYears.map((year) => ({ value: year.id, label: year.name })),
    [academicYears]
  );

  // Column definition
  const columns = React.useMemo(
    () =>
      getTransactionColumns({
        onViewDetail: (tx) => setDetailTx(tx),
        onEdit: (tx) => setEditingTx(tx),
        onApprove: (tx) => setConfirmAction({ type: "approve", transaction: tx }),
        onCancel: (tx) => setConfirmAction({ type: "cancel", transaction: tx }),
        onDelete: (tx) => setConfirmAction({ type: "delete", transaction: tx }),
        enableSelection: true,
        typeFilterOptions: visibleTypes,
        accountFilterOptions,
        academicYearFilterOptions,
      }),
    [visibleTypes, accountFilterOptions, academicYearFilterOptions]
  );

  /* ---- Handlers ---- */

  async function handleCreateSubmit(payload: CreateTransactionCommand) {
    try {
      await create.mutateAsync(payload);
      setShowCreate(false);
      toast.success("Transaction created");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleEditSubmit(payload: CreateTransactionCommand) {
    if (!editingTx) return;
    try {
      await update.mutateAsync({ id: editingTx.id, payload });
      setEditingTx(null);
      toast.success("Transaction updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleApprove(id: string) {
    try {
      await approve.mutateAsync(id);
      setConfirmAction(null);
      toast.success("Transaction approved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancel.mutateAsync(id);
      setConfirmAction(null);
      toast.success("Transaction canceled");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove.mutateAsync(id);
      setConfirmAction(null);
      toast.success("Transaction deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleTransfer(payload: Parameters<typeof transfer.mutateAsync>[0]) {
    try {
      await transfer.mutateAsync(payload);
      setShowTransfer(false);
      toast.success("Transfer completed");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleTuitionSubmit(payload: CreateTransactionCommand) {
    try {
      await create.mutateAsync(payload);
      setShowTuition(false);
      toast.success("Tuition payment recorded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleGeneralSubmit(payload: CreateTransactionCommand) {
    try {
      await create.mutateAsync(payload);
      setShowGeneral(false);
      toast.success("Transaction created");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleBulkUpload(
    type: BulkTransactionType,
    payload: BulkTransactionCommand
  ) {
    try {
      await bulkCreate.mutateAsync({ type, payload });
      setShowUpload(false);
      toast.success("Bulk transactions uploaded successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  /* ---- Bulk Actions ---- */

  // Computed filtered transactions for bulk actions
  const pendingTxs = selectedTransactions.filter((t) => t.status === "pending");
  const cancelableTxs = selectedTransactions.filter(
    (t) => t.status === "approved" && t.transaction_type?.type !== "transfer"
  );
  const deletableTxs = selectedTransactions.filter(
    (t) => t.status !== "approved" && t.transaction_type?.type !== "transfer"
  );

  async function executeBulkApprove() {
    try {
      await bulkApprove.mutateAsync(pendingTxs.map((t) => t.id));
      toast.success(`${pendingTxs.length} transaction(s) approved`);
      setClearSelectionSignal((value) => value + 1);
      setBulkApproveDialog(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function executeBulkCancel() {
    try {
      await bulkCancel.mutateAsync(cancelableTxs.map((t) => t.id));
      toast.success(`${cancelableTxs.length} transaction(s) canceled`);
      setClearSelectionSignal((value) => value + 1);
      setBulkCancelDialog(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function executeBulkDelete() {
    try {
      await bulkDelete.mutateAsync(deletableTxs.map((t) => t.id));
      toast.success(`${deletableTxs.length} transaction(s) deleted`);
      setClearSelectionSignal((value) => value + 1);
      setBulkDeleteDialog(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
    <PageLayout
      title="Transactions"
      description="Record and manage financial transactions"
      actions={
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <AuthButton
                  roles="accountant"
                  iconLeft={<HugeiconsIcon icon={Add01Icon} size={16} />}
                  iconRight={<HugeiconsIcon icon={ArrowDown01Icon} size={14} />}
                >
                  New Transaction
                </AuthButton>
              }
            />
            <DropdownMenuContent align="end" sideOffset={6}>
              <DropdownMenuItem onClick={() => setShowTuition(true)}>
                <HugeiconsIcon icon={SchoolIcon} size={16} />
                Tuition Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTransfer(true)}>
                <HugeiconsIcon
                  icon={ArrowDataTransferHorizontalIcon}
                  size={16}
                />
                Account Transfer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowGeneral(true)}>
                <HugeiconsIcon icon={Invoice02Icon} size={16} />
                General Transaction
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowUpload(true)}>
                <HugeiconsIcon icon={Upload04Icon} size={16} />
                Upload Transactions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AuthButton
            roles="accountant"
            disable
            variant="outline"
            size="sm"
            onClick={() => {
              exportTransactionsToCSV(transactions);
              toast.success(`${transactions.length} transactions exported to CSV`);
            }}
            icon={<Download className="size-4" />}
          >
            Export
          </AuthButton>
        </div>
      }
      // loading={isLoading}
      error={error}
      fetching={isFetching}
      refreshAction={refetch}
      skeleton={
        <>
          {/* Summary cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative p-5 rounded-xl border bg-card overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-3 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="size-10 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Filters skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-36" />
          </div>

          {/* Table skeleton */}
          <div className="rounded-md border">
            <div className="border-b px-4 py-3 flex gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-b px-4 py-3 flex items-center gap-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </>
      }
      // noData={isEmpty}
      emptyState={<div className="text-center text-muted-foreground py-8">No transactions found</div>}
    >
      {/* Summary Cards */}
      <StatsCards
        items={buildSummaryCards(transactions, txData?.count ?? transactions.length)}
        className="xl:grid-cols-4"
      />

      {/* Table */}
      <TransactionsTable
        columns={columns}
        data={transactions}
        loading={isFetching}
        filterState={filterState}
        onRowClick={(row) => setDetailTx(row)}
        onSelectedRowsChange={setSelectedTransactions}
        clearSelectionSignal={clearSelectionSignal}
        totalCount={txData?.count ?? transactions.length}
      />

      {/* Floating Selection Panel */}
      <FloatingSelectionPanel
        count={selectedTransactions.length}
        onClear={() => setClearSelectionSignal((value) => value + 1)}
        actions={[
          {
            label: "Export",
            icon: <Download className="size-3.5" />,
            variant: "outline",
            onClick: () => {
              exportTransactionsToCSV(
                selectedTransactions,
                `transactions-selected-${new Date().toISOString().slice(0, 10)}.csv`
              );
              toast.success(`${selectedTransactions.length} transactions exported`);
            },
            shortcut: "E",
          },
          {
            label: `Approve (${pendingTxs.length})`,
            icon: <CheckCircle className="size-3.5" />,
            variant: "default",
            onClick: () => {
              if (pendingTxs.length === 0) {
                toast.error("No pending transactions selected");
                return;
              }
              setBulkApproveDialog(true);
            },
            disabled: pendingTxs.length === 0,
            shortcut: "A",
            hidden: pendingTxs.length === 0,
          },
          {
            label: `Cancel (${cancelableTxs.length})`,
            icon: <XCircle className="size-3.5" />,
            variant: "secondary",
            onClick: () => {
              if (cancelableTxs.length === 0) {
                toast.error("No cancelable transactions selected (only approved non-transfers)");
                return;
              }
              setBulkCancelDialog(true);
            },
            disabled: cancelableTxs.length === 0,
            shortcut: "C",
            hidden: cancelableTxs.length === 0,
          },
          {
            label: `Delete (${deletableTxs.length})`,
            icon: <Trash2 className="size-3.5" />,
            variant: "destructive",
            onClick: () => {
              if (deletableTxs.length === 0) {
                toast.error("No deletable transactions selected (only pending/canceled non-transfers)");
                return;
              }
              setBulkDeleteDialog(true);
            },
            disabled: deletableTxs.length === 0,
            shortcut: "D",
            hidden: deletableTxs.length === 0,
          },
        ]}
      />
    </PageLayout>

    {/* Create Dialog */}
    <TransactionFormDialog
      open={showCreate}
      onOpenChange={setShowCreate}
      transactionTypes={transactionTypes}
      paymentMethods={paymentMethods}
      bankAccounts={bankAccounts}
      onSubmit={handleCreateSubmit}
      submitting={create.isPending}
    />

    {/* Edit Dialog */}
    <TransactionFormDialog
      open={Boolean(editingTx)}
      onOpenChange={(open) => {
        if (!open) setEditingTx(null);
      }}
      transaction={editingTx}
      transactionTypes={transactionTypes}
      paymentMethods={paymentMethods}
      bankAccounts={bankAccounts}
      onSubmit={handleEditSubmit}
      submitting={update.isPending}
    />

    {/* Detail Dialog */}
    <TransactionDetailDialog
      open={Boolean(detailTx)}
      onOpenChange={(open) => {
        if (!open) setDetailTx(null);
      }}
      transaction={detailTx}
      onEdit={(tx) => {
        setDetailTx(null);
        setEditingTx(tx);
      }}
    />

    {/* Transfer Dialog */}
    <AccountTransferDialog
      open={showTransfer}
      onOpenChange={setShowTransfer}
      bankAccounts={bankAccounts}
      paymentMethods={paymentMethods}
      onSubmit={handleTransfer}
      submitting={transfer.isPending}
    />

    {/* Tuition Payment Dialog */}
    <TuitionPaymentDialog
      open={showTuition}
      onOpenChange={setShowTuition}
      transactionTypes={transactionTypes}
      paymentMethods={paymentMethods}
      bankAccounts={bankAccounts}
      onSubmit={handleTuitionSubmit}
      submitting={create.isPending}
    />

    {/* General Transaction Dialog */}
    <GeneralTransactionDialog
      open={showGeneral}
      onOpenChange={setShowGeneral}
      transactionTypes={transactionTypes}
      paymentMethods={paymentMethods}
      bankAccounts={bankAccounts}
      onSubmit={handleGeneralSubmit}
      submitting={create.isPending}
    />

    {/* Upload Transactions Dialog */}
    <UploadTransactionsDialog
      open={showUpload}
      onOpenChange={setShowUpload}
      transactionTypes={transactionTypes}
      paymentMethods={paymentMethods}
      bankAccounts={bankAccounts}
      onSubmit={handleBulkUpload}
      submitting={bulkCreate.isPending}
    />

    {/* Confirmation Dialog */}
    <DialogBox
      open={!!confirmAction}
      onOpenChange={(open) => !open && setConfirmAction(null)}
      title={
        confirmAction?.type === "approve"
          ? "Approve Transaction"
          : confirmAction?.type === "cancel"
          ? "Cancel Transaction"
          : "Delete Transaction"
      }
      description={
        confirmAction?.type === "approve"
          ? "Are you sure you want to approve this transaction? This action cannot be easily undone."
          : confirmAction?.type === "cancel"
          ? "Are you sure you want to cancel this transaction? This will reverse the transaction."
          : "Are you sure you want to delete this transaction? This action cannot be undone."
      }
      actionLabel={
        confirmAction?.type === "approve"
          ? "Approve"
          : confirmAction?.type === "cancel"
          ? "Cancel Transaction"
          : "Delete"
      }
      onAction={() => {
        if (!confirmAction) return;
        if (confirmAction.type === "approve") {
          void handleApprove(confirmAction.transaction.id);
        } else if (confirmAction.type === "cancel") {
          void handleCancel(confirmAction.transaction.id);
        } else if (confirmAction.type === "delete") {
          void handleDelete(confirmAction.transaction.id);
        }
      }}
      cancelLabel="No, keep it"
      actionVariant={confirmAction?.type === "delete" ? "destructive" : "default"}
      actionLoading={approve.isPending || cancel.isPending || remove.isPending}
    />

    {/* Bulk Approve Dialog */}
    <DialogBox
      open={bulkApproveDialog}
      onOpenChange={setBulkApproveDialog}
      title="Approve Transactions"
      description={
        <>
          Are you sure you want to approve <strong>{pendingTxs.length}</strong> pending transaction(s)?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            This action will mark these transactions as approved and update account balances.
          </span>
        </>
      }
      actionLabel={`Approve ${pendingTxs.length} Transaction${pendingTxs.length !== 1 ? 's' : ''}`}
      actionVariant="default"
      actionLoading={bulkApprove.isPending}
      onAction={executeBulkApprove}
    />

    {/* Bulk Cancel Dialog */}
    <DialogBox
      open={bulkCancelDialog}
      onOpenChange={setBulkCancelDialog}
      title="Cancel Transactions"
      description={
        <>
          Are you sure you want to cancel <strong>{cancelableTxs.length}</strong> approved transaction(s)?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            This action will reverse these transactions and adjust account balances accordingly.
          </span>
        </>
      }
      actionLabel={`Cancel ${cancelableTxs.length} Transaction${cancelableTxs.length !== 1 ? 's' : ''}`}
      actionVariant="secondary"
      actionLoading={bulkCancel.isPending}
      onAction={executeBulkCancel}
    />

    {/* Bulk Delete Dialog */}
    <DialogBox
      open={bulkDeleteDialog}
      onOpenChange={setBulkDeleteDialog}
      title="Delete Transactions"
      description={
        <>
          Are you sure you want to delete <strong>{deletableTxs.length}</strong> transaction(s)?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            This action cannot be undone. All transaction records will be permanently removed.
          </span>
        </>
      }
      actionLabel={`Delete ${deletableTxs.length} Transaction${deletableTxs.length !== 1 ? 's' : ''}`}
      actionVariant="destructive"
      actionLoading={bulkDelete.isPending}
      onAction={executeBulkDelete}
    />
    </>

  );
}
