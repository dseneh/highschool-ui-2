"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContent } from "@/components/dashboard/page-content";
import { SummaryCardGrid } from "@/components/dashboard/summary-card-grid";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountCharts } from "@/components/finance/account-charts";
import { getTransactionColumns } from "@/components/finance/transaction-columns";
import { TransactionDetailDialog } from "@/components/finance/transaction-detail-dialog";
import { getIconByKey } from "@/lib/icon-map";
import { formatCurrency, cn, getErrorMessage } from "@/lib/utils";
import { getStatusBadgeClass } from "@/lib/status-colors";
import {
  useBankAccount,
  useBankAccountMutations,
} from "@/hooks/use-finance";
import type {
  TransactionDto,
  UpdateBankAccountCommand,
} from "@/lib/api/finance-types";
import {
  ArrowLeft02Icon,
  Edit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import PageLayout from "@/components/dashboard/page-layout";
import { Pencil } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function BankAccountDetailSkeleton() {
  return (
    <PageContent>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border bg-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-3 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-32" />
              </div>
              <Skeleton className="size-10 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-4">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="border-b px-4 py-3 flex gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
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
    </PageContent>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BankAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const { data: account, isLoading, error, isFetching, refetch } = useBankAccount(accountId);
  const { update, remove } = useBankAccountMutations();

  const [showEdit, setShowEdit] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [detailTx, setDetailTx] = React.useState<TransactionDto | null>(null);

  // Edit form state
  const [editName, setEditName] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editBankNum, setEditBankNum] = React.useState("");

  React.useEffect(() => {
    if (showEdit && account) {
      setEditName(account.name);
      setEditDesc(account.description ?? "");
      setEditBankNum(account.bank_number ?? "");
    }
  }, [showEdit, account]);

  const columns = React.useMemo(
    () => getTransactionColumns({ onViewDetail: (tx) => setDetailTx(tx) }),
    []
  );

  if (isLoading) return <BankAccountDetailSkeleton />;
  if (!account) {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">Bank account not found</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </PageContent>
    );
  }

  const currency = account.currency?.symbol ?? "$";
  const ba = account.analysis;

  const summaryCards = [
    {
      title: "Total Income",
      value: formatCurrency(ba?.totals.total_income ?? 0, currency),
      subtitle: `${ba?.transaction_counts?.transaction_count ?? 0} total transactions`,
      icon: getIconByKey("income"),
    },
    {
      title: "Total Expenses",
      value: formatCurrency(ba?.totals.total_expense ?? 0, currency),
      subtitle: "All time",
      icon: getIconByKey("cancel"),
    },
    {
      title: "Current Balance",
      value: formatCurrency(ba?.totals.balance ?? 0, currency),
      subtitle: account.active ? "Active" : "Inactive",
      icon: getIconByKey("balance"),
    },
  ];

  async function handleUpdate() {
    try {
      await update.mutateAsync({
        id: accountId,
        payload: {
          name: editName,
          description: editDesc || undefined,
          bank_number: editBankNum || undefined,
        } satisfies UpdateBankAccountCommand,
      });
      setShowEdit(false);
      toast.success("Bank account updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      await remove.mutateAsync(accountId);
      setShowDelete(false);
      toast.success("Bank account deleted");
      router.push("../bank-accounts");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <PageLayout
    title={
      <div className="flex items-center gap-3 justify-between w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold tracking-tight truncate">
              {account.name}
            </div>
            <Badge
              className={cn(
                "text-xs capitalize shrink-0",
                getStatusBadgeClass(account.active ? "active" : "inactive")
              )}
            >
              {account.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {account.bank_number
              ? `Bank # ${account.bank_number} · `
              : ""}
            Account # {account.number}
            {account.description ? ` · ${account.description}` : ""}
          </p>
        </div>
      </div>
    }
    loading={isLoading}
    fetching={isFetching}
    refreshAction={refetch}
    error={error}
    actions={
      <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            iconLeft={<Pencil className="size-4" />}
            onClick={() => setShowEdit(true)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            iconLeft={<HugeiconsIcon icon={Delete02Icon} size={14} />}
            onClick={() => setShowDelete(true)}
          >
            Delete
          </Button>
        </div>
    }
    >
      

      {/* Summary Cards */}
      <SummaryCardGrid items={summaryCards} />

      {/* Charts */}
      {account.analysis && (
        <AccountCharts analysis={account.analysis} currency={currency} />
      )}

      {/* Transactions Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
        <DataTable
          columns={columns}
          data={account.transactions ?? []}
          searchKey="transaction_id"
          searchPlaceholder="Filter transactions…"
          onRowClick={(row) => setDetailTx(row)}
          pageSize={20}
        />
      </div>

      {/* Transaction Detail Dialog */}
      <TransactionDetailDialog
        open={Boolean(detailTx)}
        onOpenChange={(open) => {
          if (!open) setDetailTx(null);
        }}
        transaction={detailTx}
        currency={currency}
      />

      {/* Edit Dialog */}
      <DialogBox
        open={showEdit}
        onOpenChange={setShowEdit}
        title="Edit Bank Account"
        description="Update account details."
        actionLabel="Save Changes"
        onAction={handleUpdate}
        actionLoading={update.isPending}
        actionLoadingText="Saving…"
        actionDisabled={!editName.trim()}
        className="sm:max-w-md"
      >
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Account Name *</Label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-bank-num">Bank/Account Number</Label>
            <Input
              id="edit-bank-num"
              value={editBankNum}
              onChange={(e) => setEditBankNum(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </DialogBox>

      {/* Delete Confirmation */}
      <DialogBox
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Bank Account"
        description={`Are you sure you want to delete "${account.name}"? This action cannot be undone.`}
        actionLabel="Delete"
        actionVariant="destructive"
        onAction={handleDelete}
        actionLoading={remove.isPending}
        actionLoadingText="Deleting…"
      />
    </PageLayout>
  );
}
