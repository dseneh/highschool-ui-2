"use client";

import * as React from "react";
import PageLayout from "@/components/dashboard/page-layout";
import { SummaryCardGrid } from "@/components/dashboard/summary-card-grid";
import { DataTable } from "@/components/shared/data-table";
import { AuthButton } from "@/components/auth/auth-button";
import { Badge } from "@/components/ui/badge";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getIconByKey } from "@/lib/icon-map";
import { formatCurrency, cn } from "@/lib/utils";
import {
  useBankAccounts,
  useBankAccountMutations,
} from "@/hooks/use-finance";
import type {
  BankAccountDto,
  CreateBankAccountCommand,
  UpdateBankAccountCommand,
} from "@/lib/api/finance-types";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { getStatusBadgeClass } from "@/lib/status-colors";
import { Add01Icon, Edit02Icon, Delete02Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getColumns } from "./_components/columns";
import { buildSummary } from "./_components/utils";

/* ------------------------------------------------------------------ */
/*  Summary helpers                                                    */
/* ------------------------------------------------------------------ */


  

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/*  Bank Account Form Dialog                                           */
/* ------------------------------------------------------------------ */

function BankAccountFormDialog({
  open,
  onOpenChange,
  account,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: BankAccountDto | null;
  onSubmit: (payload: CreateBankAccountCommand | UpdateBankAccountCommand) => void;
  submitting?: boolean;
}) {
  const isEdit = Boolean(account);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [bankNumber, setBankNumber] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName(account?.name ?? "");
      setDescription(account?.description ?? "");
      setBankNumber(account?.bank_number ?? "");
    }
  }, [open, account]);

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Bank Account" : "New Bank Account"}
      description={isEdit ? "Update account details." : "Add a new bank account."}
      actionLabel={isEdit ? "Save Changes" : "Create Account"}
      onAction={() =>
        onSubmit({
          name,
          description: description || undefined,
          bank_number: bankNumber || undefined,
        })
      }
      actionLoading={submitting}
      actionLoadingText={isEdit ? "Saving…" : "Creating…"}
      actionDisabled={!name.trim()}
      className="sm:max-w-md"
    >
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="acct-name">Account Name *</Label>
          <Input
            id="acct-name"
            placeholder="e.g. Main Operating Account"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="acct-number">Bank/Account Number</Label>
          <Input
            id="acct-number"
            placeholder="e.g. 1234567890"
            value={bankNumber}
            onChange={(e) => setBankNumber(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="acct-desc">Description</Label>
          <Textarea
            id="acct-desc"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </DialogBox>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BankAccountsPage() {
  const router = useRouter();
  const [showCreate, setShowCreate] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<BankAccountDto | null>(null);
  const [deletingAccount, setDeletingAccount] = React.useState<BankAccountDto | null>(null);

  const { data: accountsData, isLoading, error, isFetching, refetch } = useBankAccounts({
    include_basic_analysis: true,
  });
  const { create, update, remove } = useBankAccountMutations();

  const accounts = accountsData?.results ?? [];
  const isEmpty = accounts.length === 0;

  const columns = React.useMemo(
    () =>
      getColumns({
        currency: "USD",
        onView: (a) => router.push(`bank-accounts/${a.id}`),
        onEdit: (a) => setEditingAccount(a),
        onDelete: (a) => setDeletingAccount(a),
      }),
    [router]
  );

  async function handleCreate(payload: CreateBankAccountCommand) {
    try {
      await create.mutateAsync(payload);
      setShowCreate(false);
      toast.success("Bank account created");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleUpdate(payload: UpdateBankAccountCommand) {
    if (!editingAccount) return;
    try {
      await update.mutateAsync({ id: editingAccount.id, payload });
      setEditingAccount(null);
      toast.success("Bank account updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleDelete() {
    if (!deletingAccount) return;
    try {
      await remove.mutateAsync(deletingAccount.id);
      setDeletingAccount(null);
      toast.success("Bank account deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
      <PageLayout
        title="Bank Accounts"
        description="Manage your school's bank accounts"
        actions={
          <AuthButton
            roles="accountant"
            disabled={isFetching || isLoading}
            iconLeft={<HugeiconsIcon icon={Add01Icon} size={16} />}
            onClick={() => setShowCreate(true)}
          >
            Add Account
          </AuthButton>
        }
        fetching={isFetching}
        refreshAction={refetch}
        loading={isLoading}
        error={error}
        skeleton={
          <>
            {/* Summary cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
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

          {/* Table skeleton */}
          <div className="rounded-md border">
            <div className="border-b px-4 py-3 flex gap-8">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b px-4 py-3 flex items-center gap-8">
                <Skeleton className="h-4 w-20 font-mono" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </>
      }
      noData={isEmpty}
      emptyState={<div className="text-center text-muted-foreground py-8">No bank accounts found</div>}
      globalChildren={
        <>
        <BankAccountFormDialog
        open={Boolean(editingAccount)}
        onOpenChange={(open) => {
          if (!open) setEditingAccount(null);
        }}
        account={editingAccount}
        onSubmit={(p) => handleUpdate(p as UpdateBankAccountCommand)}
        submitting={update.isPending}
      />

      {/* Delete Confirmation */}
      <DialogBox
        open={Boolean(deletingAccount)}
        onOpenChange={(open) => {
          if (!open) setDeletingAccount(null);
        }}
        title="Delete Bank Account"
        description={`Are you sure you want to delete "${deletingAccount?.name}"? This action cannot be undone.`}
        actionLabel="Delete"
        actionVariant="destructive"
        onAction={handleDelete}
        actionLoading={remove.isPending}
        actionLoadingText="Deleting…"
      />
        </>
      }
    >
      <SummaryCardGrid items={buildSummary(accounts)} />
      <DataTable
        columns={columns}
        data={accounts}
        searchKey="name"
        searchPlaceholder="Search accounts…"
        onRowClick={(row) => router.push(`bank-accounts/${row.id}`)}
        pageSize={20}
      />

      {/* Create Dialog */}
      <BankAccountFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={(p) => handleCreate(p as CreateBankAccountCommand)}
        submitting={create.isPending}
      />
    </PageLayout>
  );
}
