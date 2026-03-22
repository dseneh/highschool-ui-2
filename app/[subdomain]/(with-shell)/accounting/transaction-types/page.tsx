"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import PageLayout from "@/components/dashboard/page-layout";
import { DialogBox } from "@/components/ui/dialog-box";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AccountingTableSkeleton } from "@/components/accounting/accounting-table-skeleton";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils/error-handler";
import {
  useLedgerAccounts,
  useTransactionTypeMutations,
  useTransactionTypes,
} from "@/hooks/use-accounting";
import type {
  AccountingTransactionTypeDto,
  CreateAccountingTransactionTypeCommand,
  TransactionCategory,
  UpdateAccountingTransactionTypeCommand,
} from "@/lib/api2/accounting-types";
import { TransactionTypesTable } from "./_components/transaction-types-table";

const CATEGORY_OPTIONS: { value: TransactionCategory; label: string }[] = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
];

const ACTIVE_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    code: z
      .string()
      .min(1, "Code is required")
      .max(50, "Code must be 50 characters or less"),
    transaction_category: z.enum(["income", "expense", "transfer"]),
    description: z.string().optional().nullable(),
    default_ledger_account: z.string().optional().nullable(),
    is_active: z.enum(["true", "false"]),
  })
  .superRefine((values, ctx) => {
    if (
      values.transaction_category !== "transfer" &&
      (!values.default_ledger_account || values.default_ledger_account.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Default ledger account is required for income and expense types",
        path: ["default_ledger_account"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const emptyForm: FormValues = {
  name: "",
  code: "",
  transaction_category: "income",
  description: "",
  default_ledger_account: "",
  is_active: "true",
};

export default function TransactionTypesPage() {
  const { data: txTypes = [], isLoading, error, refetch } = useTransactionTypes();
  const { data: ledgerAccounts = [] } = useLedgerAccounts();
  const { create, update, remove } = useTransactionTypeMutations();

  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    record?: AccountingTransactionTypeDto;
  }>({ open: false, mode: "create" });

  const [deleteTarget, setDeleteTarget] = useState<AccountingTransactionTypeDto | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
  });

  const selectedCategory = useWatch({
    control: form.control,
    name: "transaction_category",
  });
  const selectedCode = useWatch({
    control: form.control,
    name: "code",
  });
  const selectedDefaultLedgerAccount = useWatch({
    control: form.control,
    name: "default_ledger_account",
  });

  const isTransferCode = useMemo(
    () => /^TRANSFER_(IN|OUT)$/i.test((selectedCode ?? "").trim()),
    [selectedCode]
  );

  const eligibleLedgerAccounts = useMemo(
    () =>
      ledgerAccounts.filter((account) => {
        if (!account.is_active || account.is_header) return false;
        if (isTransferCode) return account.account_type === "asset";
        if (selectedCategory === "income") return account.account_type === "income";
        if (selectedCategory === "expense") return account.account_type === "expense";
        return true;
      }),
    [ledgerAccounts, selectedCategory, isTransferCode]
  );

  const ledgerOptions = useMemo(
    () =>
      eligibleLedgerAccounts.map((account) => ({
        value: account.id,
        label: `${account.code} - ${account.name}`,
      })),
    [eligibleLedgerAccounts]
  );

  useEffect(() => {
    if (!selectedDefaultLedgerAccount) return;

    const isEligible = eligibleLedgerAccounts.some(
      (account) => account.id === selectedDefaultLedgerAccount
    );
    if (!isEligible) {
      form.setValue("default_ledger_account", "", { shouldValidate: true, shouldDirty: true });
      form.clearErrors("default_ledger_account");
    }
  }, [eligibleLedgerAccounts, form, selectedDefaultLedgerAccount, selectedCategory]);

  function openCreate() {
    form.reset(emptyForm);
    setDialog({ open: true, mode: "create" });
  }

  function openEdit(record: AccountingTransactionTypeDto) {
    form.reset({
      name: record.name,
      code: record.code,
      transaction_category: record.transaction_category,
      description: record.description ?? "",
      default_ledger_account: record.default_ledger_account ?? "",
      is_active: record.is_active ? "true" : "false",
    });
    setDialog({ open: true, mode: "edit", record });
  }

  async function handleSubmit(values: FormValues) {
    const selectedLedger = ledgerAccounts.find(
      (account) => account.id === values.default_ledger_account
    );

    if (selectedLedger && isTransferCode && selectedLedger.account_type !== "asset") {
      form.setError("default_ledger_account", {
        type: "validate",
        message: "Transfer In/Out types must use an asset clearing account.",
      });
      return;
    }

    if (
      selectedLedger &&
      !isTransferCode &&
      (values.transaction_category === "income" || values.transaction_category === "expense") &&
      selectedLedger.account_type !== values.transaction_category
    ) {
      form.setError("default_ledger_account", {
        type: "validate",
        message: `Selected account type (${selectedLedger.account_type}) does not match category (${values.transaction_category}).`,
      });
      return;
    }

    const payload: CreateAccountingTransactionTypeCommand | UpdateAccountingTransactionTypeCommand = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      transaction_category: values.transaction_category,
      description: values.description?.trim() ? values.description.trim() : null,
      default_ledger_account: values.default_ledger_account || null,
      is_active: values.is_active === "true",
    };

    try {
      if (dialog.mode === "create") {
        await create.mutateAsync(payload as CreateAccountingTransactionTypeCommand);
        showToast.success("Transaction type created");
      } else {
        await update.mutateAsync({
          id: dialog.record!.id,
          payload: payload as UpdateAccountingTransactionTypeCommand,
        });
        showToast.success("Transaction type updated");
      }
      setDialog({ open: false, mode: "create" });
    } catch (submitError) {
      showToast.error(getErrorMessage(submitError));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget.id);
      showToast.success("Transaction type deleted");
    } catch (deleteError) {
      showToast.error(getErrorMessage(deleteError));
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <PageLayout
        title="Accounting Transaction Types"
        description="Configure transaction categories, posting defaults, and active status."
        actions={
          <Button icon={<HugeiconsIcon icon={PlusSignIcon} />} onClick={openCreate}>
            New Transaction Type
          </Button>
        }
        skeleton={<AccountingTableSkeleton columns={8} />}
        loading={isLoading}
        error={error}
        refreshAction={refetch}
      >
        <TransactionTypesTable
          txTypes={txTypes}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      </PageLayout>

      <DialogBox
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        title={dialog.mode === "create" ? "Create Transaction Type" : "Edit Transaction Type"}
        description="Set category and default posting account to avoid posting failures."
        actionLabel={dialog.mode === "create" ? "Create" : "Save"}
        actionLoading={create.isPending || update.isPending}
        formId="transaction-type-form"
      >
        <Form {...form}>
          <form
            id="transaction-type-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Tuition Payment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. TUITION_PAY" className="font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transaction_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <SelectField
                        items={CATEGORY_OPTIONS}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select category"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <SelectField
                        items={ACTIVE_OPTIONS}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select status"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_ledger_account"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Default Ledger Account</FormLabel>
                    <FormControl>
                      <SelectField
                        key={`default-ledger-${selectedCategory}`}
                        items={
                          selectedCategory === "transfer"
                            ? [{ value: "", label: "No default account" }, ...ledgerOptions]
                            : ledgerOptions
                        }
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        placeholder="Select ledger account"
                      />
                    </FormControl>
                    <div className="text-[11px] -mt-1">
                      {isTransferCode
                        ? "Transfer In/Out codes should map to an asset clearing account (e.g., Bank Transfer Clearing)."
                        : "For transfer category, no default is required. For income and expense categories, a default is required and only accounts matching the category are shown."}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Optional description"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DialogBox>

      <DialogBox
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Transaction Type"
        actionLabel="Delete"
        actionVariant="destructive"
        actionLoading={remove.isPending}
        onAction={handleDelete}
      >
        Delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.
      </DialogBox>
    </>
  );
}
