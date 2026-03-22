"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import PageLayout from "@/components/dashboard/page-layout";
import { DialogBox } from "@/components/ui/dialog-box";
import { Button } from "@/components/ui/button";
import {
  AccountingCurrencySelect,
  AccountingLedgerAccountSelect,
} from "@/components/shared/data-reusable";
import { Form } from "@/components/ui/form";
import { AccountingTableSkeleton } from "@/components/accounting/accounting-table-skeleton";
import { ReusableFormField } from "@/components/shared/reusable-form-field";
import { showToast } from "@/lib/toast";
import {
  useAccountingBankAccountsWithSummary,
  useAccountingBankAccountMutations,
  useLedgerAccounts,
  useLedgerAccountMutations,
} from "@/hooks/use-accounting";
import type {
  AccountingBankAccountDto,
  BankAccountType,
  CreateAccountingBankAccountCommand,
  UpdateAccountingBankAccountCommand,
} from "@/lib/api2/accounting-types";
import { BankAccountsTable } from "./_components/bank-accounts-table";
import { getErrorMessage } from "@/lib/utils";
import {
  LedgerAccountDialog,
  type LedgerAccountDialogValues,
} from "../ledger-accounts/_components/ledger-account-dialog";

/* ------------------------------------------------------------------ */
/*  Options                                                             */
/* ------------------------------------------------------------------ */

const ACCOUNT_TYPE_OPTIONS: { value: BankAccountType; label: string }[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "closed", label: "Closed" },
];

/* ------------------------------------------------------------------ */
/*  Schema                                                              */
/* ------------------------------------------------------------------ */

const schema = z.object({
  account_number: z.string().min(1, "Account number is required"),
  account_name: z.string().min(1, "Account name is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  account_type: z.enum(["checking", "savings", "cash", "other"]),
  currency: z.string().min(1, "Currency is required"),
  ledger_account: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "closed"]),
  opening_balance: z.coerce.number(),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

const emptyForm: FormValues = {
  account_number: "",
  account_name: "",
  bank_name: "",
  account_type: "checking",
  currency: "",
  ledger_account: null,
  status: "active",
  opening_balance: 0,
  notes: "",
};

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function BankAccountsPage() {
  const router = useRouter();
  const { data, isLoading, isFetching, error, refetch } = useAccountingBankAccountsWithSummary();
  const { create, update, remove } = useAccountingBankAccountMutations();
  const { data: ledgerAccounts = [] } = useLedgerAccounts();
  const { create: createLedgerAccount } = useLedgerAccountMutations();
  const accounts = data?.results ?? [];
  const summary = data?.summary;

  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    record?: AccountingBankAccountDto;
  }>({ open: false, mode: "create" });

  const [deleteTarget, setDeleteTarget] = useState<AccountingBankAccountDto | null>(null);
  const [openLedgerDialog, setOpenLedgerDialog] = useState(false);
  const [ledgerDialogSessionKey, setLedgerDialogSessionKey] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
  });

  function openCreate() {
    form.reset(emptyForm);
    setDialog({ open: true, mode: "create" });
  }

  function openEdit(record: AccountingBankAccountDto) {
    const currencyId = typeof record.currency === "string" ? record.currency : record.currency.id;

    form.reset({
      account_number: record.account_number,
      account_name: record.account_name,
      bank_name: record.bank_name,
      account_type: record.account_type,
      currency: currencyId,
      ledger_account: record.ledger_account,
      status: record.status,
      opening_balance: record.opening_balance ?? 0,
      notes: record.notes ?? record.description ?? "",
    });
    setDialog({ open: true, mode: "edit", record });
  }

  async function handleSubmit(values: FormValues) {
    const payload: CreateAccountingBankAccountCommand | UpdateAccountingBankAccountCommand = {
      account_number: values.account_number,
      account_name: values.account_name,
      bank_name: values.bank_name,
      account_type: values.account_type,
      currency: { id: values.currency },
      ledger_account: values.ledger_account ?? null,
      opening_balance: values.opening_balance,
      status: values.status,
      description: values.notes ?? null,
    };

    try {
      if (dialog.mode === "create") {
        await create.mutateAsync(payload as CreateAccountingBankAccountCommand);
        showToast.success("Bank account created");
      } else {
        await update.mutateAsync({
          id: dialog.record!.id,
          payload: payload as UpdateAccountingBankAccountCommand,
        });
        showToast.success("Bank account updated");
      }
      setDialog({ open: false, mode: "create" });
    } catch (e) {
      showToast.error("Failed to save bank account", getErrorMessage(e));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget.id);
      showToast.success("Bank account deleted");
    } catch (e) {
      showToast.error("Failed to delete bank account", getErrorMessage(e));
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleOpenCreateLedgerAccount() {
    setLedgerDialogSessionKey((previous) => previous + 1);
    setOpenLedgerDialog(true);
  }

  async function handleCreateLedgerAccount(values: LedgerAccountDialogValues) {
    const payload = {
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

    const created = await createLedgerAccount.mutateAsync(payload);
    form.setValue("ledger_account", created.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setOpenLedgerDialog(false);
    showToast.success("Ledger account created");
  }

  function handleOpenDetails(record: AccountingBankAccountDto) {
    router.push(`/accounting/bank-accounts/${record.id}`);
  }

  return (
    <>
      <PageLayout
        title="Bank Accounts"
        description="Manage bank and cash accounts for transaction recording"
        actions={
          <Button icon={<HugeiconsIcon icon={PlusSignIcon} />} onClick={openCreate}>
            Add Account
          </Button>
        }
        skeleton={<AccountingTableSkeleton columns={7} />}
        loading={isLoading}
        error={error}
        refreshAction={refetch}
        fetching={isFetching}
      >
        <BankAccountsTable
          accounts={accounts}
          summary={summary}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onOpenDetails={handleOpenDetails}
        />
      </PageLayout>

      {/* Create / Edit Dialog */}
      <DialogBox
        open={dialog.open}
        onOpenChange={(open) => setDialog((s) => ({ ...s, open }))}
        title={dialog.mode === "create" ? "Add Bank Account" : "Edit Bank Account"}
        description="Configure account details, currency, and linked ledger account."
        actionLabel={dialog.mode === "create" ? "Create" : "Save"}
        actionLoading={create.isPending || update.isPending}
        formId="bank-account-form"
      >
        <Form {...form}>
          <form
            id="bank-account-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ReusableFormField
                control={form.control}
                name="account_number"
                label="Account Number"
                placeholder="1234567890"
              />
              <ReusableFormField
                control={form.control}
                name="account_name"
                label="Account Name"
                placeholder="Main Operating Account"
              />
              <ReusableFormField
                control={form.control}
                name="bank_name"
                label="Bank Name"
                placeholder="First National Bank"
              />
              <ReusableFormField
                control={form.control}
                name="account_type"
                label="Account Type"
                type="select"
                selectItems={ACCOUNT_TYPE_OPTIONS}
                placeholder="Select type"
              />
              <ReusableFormField
                control={form.control}
                name="currency"
                label="Currency"
                type="custom"
                customRender={({ field }) => (
                      <AccountingCurrencySelect
                        useUrlState={false}
                        noTitle
                        value={(field.value as string) ?? ""}
                        onChange={field.onChange}
                        placeholder="Select currency"
                      />
                )}
              />
              <ReusableFormField
                control={form.control}
                name="ledger_account"
                label="Linked Ledger Account"
                type="custom"
                customRender={({ field }) => (
                      <AccountingLedgerAccountSelect
                        useUrlState={false}
                        noTitle
                        includeAddNewOption
                        addNewLabel="+ Add New Account"
                        value={(field.value as string) ?? ""}
                        onChange={(value) => field.onChange(value || null)}
                        onAddNewAccount={handleOpenCreateLedgerAccount}
                        placeholder="Select ledger account"
                      />
                )}
              />
              <ReusableFormField
                control={form.control}
                name="opening_balance"
                label="Opening Balance"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
              <ReusableFormField
                control={form.control}
                name="status"
                label="Status"
                type="select"
                selectItems={STATUS_OPTIONS}
                placeholder="Select status"
              />
            </div>
            <ReusableFormField
              control={form.control}
              name="notes"
              label="Notes"
              placeholder="Optional notes..."
            />
          </form>
        </Form>
      </DialogBox>

      <LedgerAccountDialog
        key={`bank-ledger-create-${ledgerDialogSessionKey}`}
        open={openLedgerDialog}
        mode="create"
        accounts={ledgerAccounts}
        createTemplateKey="bank_account"
        isSubmitting={createLedgerAccount.isPending}
        onOpenChange={setOpenLedgerDialog}
        onSubmit={handleCreateLedgerAccount}
      />

      {/* Delete Confirmation */}
      <DialogBox
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Bank Account"
        actionLabel="Delete"
        actionVariant="destructive"
        actionLoading={remove.isPending}
        onAction={handleDelete}
      >
        <div>
          Delete <b>{deleteTarget?.account_name}?</b> <br />
          Please note that accounts with existing transactions cannot be deleted.
        </div>
      </DialogBox>
    </>
  );
}
