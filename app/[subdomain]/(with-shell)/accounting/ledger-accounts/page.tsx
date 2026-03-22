"use client";

import { useMemo, useState } from "react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import PageLayout from "@/components/dashboard/page-layout";
import { DialogBox } from "@/components/ui/dialog-box";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AccountingTableSkeleton } from "@/components/accounting/accounting-table-skeleton";
import { showToast } from "@/lib/toast";
import {
  useLedgerAccounts,
  useLedgerAccountMutations,
} from "@/hooks/use-accounting";
import type { AccountingLedgerAccountDto } from "@/lib/api2/accounting-types";
import { LedgerAccountsTable } from "./_components/ledger-accounts-table";
import {
  LedgerAccountDialog,
  type LedgerAccountDialogValues,
} from "./_components/ledger-account-dialog";
import { getErrorMessage } from "@/lib/utils/error-handler";

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function LedgerAccountsPage() {
  const { data: accounts = [], isLoading, error, refetch } = useLedgerAccounts();
  const { create, update, remove } = useLedgerAccountMutations();
  const [createSessionKey, setCreateSessionKey] = useState(0);

  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    record?: AccountingLedgerAccountDto;
  }>({ open: false, mode: "create" });

  const [deleteTarget, setDeleteTarget] = useState<AccountingLedgerAccountDto | null>(null);
  const [deleteChildren, setDeleteChildren] = useState(false);

  const deleteTargetDescendantCount = useMemo(() => {
    if (!deleteTarget) return 0;

    const childrenByParent = new Map<string, string[]>();
    for (const account of accounts) {
      if (!account.parent_account) continue;
      const siblings = childrenByParent.get(account.parent_account) ?? [];
      siblings.push(account.id);
      childrenByParent.set(account.parent_account, siblings);
    }

    let count = 0;
    let frontier = [deleteTarget.id];
    while (frontier.length > 0) {
      const next: string[] = [];
      for (const parentId of frontier) {
        const childIds = childrenByParent.get(parentId) ?? [];
        count += childIds.length;
        next.push(...childIds);
      }
      frontier = next;
    }

    return count;
  }, [accounts, deleteTarget]);

  function openCreate() {
    setCreateSessionKey((previous) => previous + 1);
    setDialog({ open: true, mode: "create" });
  }

  function openEdit(record: AccountingLedgerAccountDto) {
    setDialog({ open: true, mode: "edit", record });
  }

  async function handleSubmit(values: LedgerAccountDialogValues) {
    try {
      if (dialog.mode === "create") {
        const createPayload = {
          code: values.code?.trim() || undefined,
          name: values.name,
          account_type: values.account_type,
          category: values.category,
          parent_account: values.parent_account,
          normal_balance: values.normal_balance,
          is_header: values.is_header,
          description: values.description,
          template_key: values.template_key !== "manual" ? values.template_key : undefined,
        };
        await create.mutateAsync(createPayload);
        showToast.success("Ledger account created");
      } else {
        const { template_key, ...updatePayload } = values;
        void template_key;
        await update.mutateAsync({ id: dialog.record!.id, payload: updatePayload });
        showToast.success("Ledger account updated");
      }
      setDialog({ open: false, mode: "create" });
    } catch {
      showToast.error("Failed to save ledger account");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync({
        id: deleteTarget.id,
        deleteChildren: deleteTarget.is_header && deleteChildren,
      });
      showToast.success("Ledger account deleted");
    } catch (e) {
      showToast.error("Failed to delete ledger account", getErrorMessage(e));
    } finally {
      setDeleteTarget(null);
      setDeleteChildren(false);
    }
  }

  return (
    <>
      <PageLayout
        title="Chart of Accounts"
        description="Define ledger accounts used for double-entry bookkeeping"
        actions={
          <Button icon={<HugeiconsIcon icon={PlusSignIcon} />} onClick={openCreate}>
            Add Account
          </Button>
        }
        skeleton={<AccountingTableSkeleton columns={6} />}
        loading={isLoading}
        error={error}
        refreshAction={refetch}
      >
        <LedgerAccountsTable
          accounts={accounts}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={(record) => {
            setDeleteChildren(false);
            setDeleteTarget(record);
          }}
        />
      </PageLayout>

      <LedgerAccountDialog
        key={dialog.mode === "create" ? `create-${createSessionKey}` : `edit-${dialog.record?.id ?? "new"}`}
        open={dialog.open}
        mode={dialog.mode}
        record={dialog.record}
        accounts={accounts}
        isSubmitting={create.isPending || update.isPending}
        onOpenChange={(open) => setDialog((state) => ({ ...state, open }))}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation */}
      <DialogBox
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteChildren(false);
          }
        }}
        title="Delete Ledger Account"
        // description=
        actionLabel="Delete"
        actionVariant="destructive"
        actionLoading={remove.isPending}
        onAction={handleDelete}
      >
        Delete &quot;{deleteTarget?.code} - {deleteTarget?.name}&quot;? Accounts linked to transactions cannot be deleted.
        {deleteTarget?.is_header && deleteTargetDescendantCount > 0 && (
          <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
            <label className="flex items-start gap-2">
              <Checkbox
                checked={deleteChildren}
                onCheckedChange={(checked) => setDeleteChildren(Boolean(checked))}
              />
              <span className="text-sm">
                Also delete {deleteTargetDescendantCount} child account{deleteTargetDescendantCount === 1 ? "" : "s"} under this header.
              </span>
            </label>
          </div>
        )}
       
        <div className="text-destructive text-sm pt-2">
          Please make the account inactive instead if you do not want it to be used for future transactions.
          Because this cannot be undone.
        </div>
      </DialogBox>
    </>
  );
}
