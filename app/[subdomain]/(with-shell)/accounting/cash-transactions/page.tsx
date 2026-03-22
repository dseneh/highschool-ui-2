"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  PlusSignIcon,
  ArrowDataTransferHorizontalIcon,
  Invoice01Icon,
  MoneyBagIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "lucide-react";

import PageLayout from "@/components/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AccountingTableSkeleton } from "@/components/accounting/accounting-table-skeleton";
import { AccountingAmountField } from "@/components/accounting/accounting-amount-field";
import { CashTransactionDialog } from "@/components/accounting/cash-transaction-dialog";
import { StudentPaymentDialog } from "@/components/accounting/student-payment-dialog";
import { DialogBox } from "@/components/ui/dialog-box";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AccountingBankAccountSelect,
  AccountingCurrencySelect,
  AccountingPaymentMethodSelect,
  AccountingTransactionTypeSelect,
} from "@/components/shared/data-reusable";
import { showToast } from "@/lib/toast";
import {
  useCashTransactions,
  useCashTransactionMutations,
  useJournalEntryMutations,
  useTransactionTypes,
  useAccountingBankAccounts,
  useAccountingCurrencies,
} from "@/hooks/use-accounting";
import type {
  AccountingCashTransactionDto,
} from "@/lib/api2/accounting-types";
import { CashTransactionsTable } from "./_components/cash-transactions-table";
import { CashTransactionDetailSheet } from "./_components/cash-transaction-detail-sheet";
import { useCashTransactionFilterParams } from "@/components/accounting/cash-transaction-filters";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { getQueryClient } from "@/lib/query-client";

type ActionTarget = {
  action: "approve" | "reject" | "post" | "delete";
  record: AccountingCashTransactionDto;
} | null;

type CreateTemplate = "student_payment" | "new_income" | "new_expense" | "account_transfer";

const incomeSchema = z.object({
  bank_account: z.string().min(1, "Bank account is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  income_type: z.string().min(1, "Income type is required"),
  currency: z.string().min(1, "Currency is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  entry_date: z.string().min(1, "Date is required"),
});

const expenseSchema = z.object({
  bank_account: z.string().min(1, "Bank account is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  expense_type: z.string().min(1, "Expense type is required"),
  currency: z.string().min(1, "Currency is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  entry_date: z.string().min(1, "Date is required"),
});

const transferSchema = z
  .object({
    from_account: z.string().min(1, "Source account is required"),
    to_account: z.string().min(1, "Destination account is required"),
    currency: z.string().min(1, "Currency is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    entry_date: z.string().min(1, "Date is required"),
  })
  .refine((values) => values.from_account !== values.to_account, {
    message: "Source and destination accounts must be different",
    path: ["to_account"],
  });

type IncomeFormValues = z.infer<typeof incomeSchema>;
type ExpenseFormValues = z.infer<typeof expenseSchema>;
type TransferFormValues = z.infer<typeof transferSchema>;

type TemplateOption = {
  value: CreateTemplate;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    value: "student_payment",
    label: "Record Student Payment",
    description: "Capture a tuition payment",
    icon: <HugeiconsIcon icon={UserAccountIcon} className="h-4 w-4" />,
  },
  {
    value: "new_income",
    label: "General Income",
    description: "Record other incoming payments",
    icon: <HugeiconsIcon icon={MoneyBagIcon} className="h-4 w-4" />,
  },
  {
    value: "new_expense",
    label: "General Expense",
    description: "Record an outgoing cash expense",
    icon: <HugeiconsIcon icon={Invoice01Icon} className="h-4 w-4" />,
  },
  {
    value: "account_transfer",
    label: "Account Transfer",
    description: "Move funds between bank accounts",
    icon: <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="h-4 w-4" />,
  },
];

function getCurrentDateString() {
  return format(new Date(), "yyyy-MM-dd");
}

function getBankAccountCurrencyId(
  bankAccounts: Array<{ id: string; currency: { id?: string } | string }>,
  bankAccountId: string
) {
  const account = bankAccounts.find((item) => item.id === bankAccountId);
  if (!account) return "";
  return typeof account.currency === "string" ? account.currency : (account.currency?.id ?? "");
}

function resolveCurrencyCode(
  currencies: Array<{ id: string; code: string }>,
  value: unknown
) {
  if (!value) return null;

  if (typeof value === "string") {
    const matched = currencies.find((currency) => currency.id === value || currency.code === value);
    if (matched?.code) return matched.code;
    return /^[A-Z]{3}$/.test(value) ? value : null;
  }

  if (typeof value === "object") {
    return (value as { code?: string }).code ?? null;
  }

  return null;
}

function getBankAccountName(
  bankAccounts: Array<{ id: string; account_name: string; account_number: string }>,
  bankAccountId: string
) {
  const account = bankAccounts.find((item) => item.id === bankAccountId);
  if (!account) return "Selected account";
  return account.account_name || account.account_number || "Selected account";
}

function getTransactionTypeName(
  txTypes: Array<{ id: string; name: string }>,
  transactionTypeId: string
) {
  return txTypes.find((item) => item.id === transactionTypeId)?.name || "Transaction";
}

function isStudentPaymentTransaction(
  transaction: AccountingCashTransactionDto | null,
  txTypes: Array<{ id: string; code: string }>
) {
  if (!transaction) return false;

  const txTypeValue = transaction.transaction_type;
  if (txTypeValue && typeof txTypeValue === "object") {
    return txTypeValue.code === "TUITION";
  }

  if (typeof txTypeValue === "string") {
    const type = txTypes.find((item) => item.id === txTypeValue);
    return type?.code === "TUITION";
  }

  return false;
}

export default function CashTransactionsPage() {
  const filterState = useCashTransactionFilterParams();
  const { params } = filterState;

  const { data: transactionsData, isLoading, error, refetch } = useCashTransactions(params);
  const {
    approve,
    reject,
    post: postToJournal,
    remove,
  } = useCashTransactionMutations();
  const {
    postTransfer,
    postIncome,
    postExpense,
  } = useJournalEntryMutations();
  const { data: txTypes = [] } = useTransactionTypes();
  const { data: bankAccounts = [] } = useAccountingBankAccounts();
  const { data: currencies = [] } = useAccountingCurrencies();

  const [studentPaymentOpen, setStudentPaymentOpen] = useState(false);
  const [createTemplate, setCreateTemplate] = useState<CreateTemplate | null>(null);
  const [editTx, setEditTx] = useState<AccountingCashTransactionDto | null>(null);
  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const [deleteConfirmChecked, setDeleteConfirmChecked] = useState(false);
  const [preventJournalPostingChecked, setPreventJournalPostingChecked] = useState(false);
  const [detailTx, setDetailTx] = useState<AccountingCashTransactionDto | null>(null);
  const queryClient = getQueryClient();
  const transactions = useMemo(() => transactionsData?.results ?? [], [transactionsData?.results]);
  const totalCount = transactionsData?.count ?? transactions.length;

  useEffect(() => {
    if (actionTarget?.action !== "delete") {
      setDeleteConfirmChecked(false);
    }
    if (actionTarget?.action !== "approve") {
      setPreventJournalPostingChecked(false);
    }
  }, [actionTarget]);

  const defaultEntryDate = getCurrentDateString();
  const incomeForm = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      bank_account: "",
      payment_method: "",
      income_type: "",
      currency: "",
      amount: 0,
      entry_date: defaultEntryDate,
    },
  });
  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      bank_account: "",
      payment_method: "",
      expense_type: "",
      currency: "",
      amount: 0,
      entry_date: defaultEntryDate,
    },
  });
  const transferForm = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      from_account: "",
      to_account: "",
      currency: "",
      amount: 0,
      entry_date: defaultEntryDate,
    },
  });

  const selectedIncomeBankAccount = incomeForm.watch("bank_account");
  const selectedExpenseBankAccount = expenseForm.watch("bank_account");
  const selectedTransferFromAccount = transferForm.watch("from_account");
  const selectedTransferToAccount = transferForm.watch("to_account");
  const selectedIncomeCurrencyId = incomeForm.watch("currency");
  const selectedExpenseCurrencyId = expenseForm.watch("currency");
  const selectedTransferCurrencyId = transferForm.watch("currency");

  const selectedIncomeCurrencyCode = useMemo(
    () => resolveCurrencyCode(currencies, selectedIncomeCurrencyId),
    [currencies, selectedIncomeCurrencyId]
  );
  const selectedExpenseCurrencyCode = useMemo(
    () => resolveCurrencyCode(currencies, selectedExpenseCurrencyId),
    [currencies, selectedExpenseCurrencyId]
  );
  const selectedTransferCurrencyCode = useMemo(
    () => resolveCurrencyCode(currencies, selectedTransferCurrencyId),
    [currencies, selectedTransferCurrencyId]
  );

  useEffect(() => {
    const currencyId = getBankAccountCurrencyId(bankAccounts, selectedIncomeBankAccount);
    if (currencyId && incomeForm.getValues("currency") !== currencyId) {
      incomeForm.setValue("currency", currencyId, { shouldValidate: true });
    }
  }, [bankAccounts, selectedIncomeBankAccount, incomeForm]);

  useEffect(() => {
    const currencyId = getBankAccountCurrencyId(bankAccounts, selectedExpenseBankAccount);
    if (currencyId && expenseForm.getValues("currency") !== currencyId) {
      expenseForm.setValue("currency", currencyId, { shouldValidate: true });
    }
  }, [bankAccounts, selectedExpenseBankAccount, expenseForm]);

  useEffect(() => {
    const currencyId = getBankAccountCurrencyId(bankAccounts, selectedTransferFromAccount);
    if (currencyId && transferForm.getValues("currency") !== currencyId) {
      transferForm.setValue("currency", currencyId, { shouldValidate: true });
    }
  }, [bankAccounts, selectedTransferFromAccount, transferForm]);

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

  function openTemplate(template: CreateTemplate) {
    if (template === "student_payment") {
      setStudentPaymentOpen(true);
      return;
    }

    const currentDate = getCurrentDateString();
    setCreateTemplate(template);

    if (template === "new_income") {
      incomeForm.reset({
        bank_account: "",
        payment_method: "",
        income_type: "",
        currency: "",
        amount: 0,
        entry_date: currentDate,
      });
    } else if (template === "new_expense") {
      expenseForm.reset({
        bank_account: "",
        payment_method: "",
        expense_type: "",
        currency: "",
        amount: 0,
        entry_date: currentDate,
      });
    } else if (template === "account_transfer") {
      transferForm.reset({
        from_account: "",
        to_account: "",
        currency: "",
        amount: 0,
        entry_date: currentDate,
      });
    }
  }

  async function handleCreateFromTemplate() {
    try {
      if (createTemplate === "new_income") {
        const valid = await incomeForm.trigger();
        if (!valid) return;
        const values = incomeForm.getValues();
        const typeName = getTransactionTypeName(txTypes, values.income_type);
        await postIncome.mutateAsync({
          bank_account: values.bank_account,
          transaction_date: values.entry_date,
          reference_number: "",
          transaction_type: values.income_type,
          payment_method: values.payment_method,
          amount: values.amount,
          currency: values.currency,
          exchange_rate: 1,
          base_amount: values.amount,
          payer_payee: "",
          description: `${typeName} income`,
        });
        showToast.success("Income transaction created successfully");
      } else if (createTemplate === "new_expense") {
        const valid = await expenseForm.trigger();
        if (!valid) return;
        const values = expenseForm.getValues();
        const typeName = getTransactionTypeName(txTypes, values.expense_type);
        await postExpense.mutateAsync({
          bank_account: values.bank_account,
          transaction_date: values.entry_date,
          reference_number: "",
          transaction_type: values.expense_type,
          payment_method: values.payment_method,
          amount: values.amount,
          currency: values.currency,
          exchange_rate: 1,
          base_amount: values.amount,
          payer_payee: "",
          description: `${typeName} expense`,
        });
        showToast.success("Expense transaction created successfully");
      } else if (createTemplate === "account_transfer") {
        const valid = await transferForm.trigger();
        if (!valid) return;
        const values = transferForm.getValues();
        const fromName = getBankAccountName(bankAccounts, values.from_account);
        const toName = getBankAccountName(bankAccounts, values.to_account);
        await postTransfer.mutateAsync({
          from_account: values.from_account,
          to_account: values.to_account,
          from_currency: values.currency,
          to_currency: values.currency,
          amount: values.amount,
          transfer_date: values.entry_date,
          description: `Transfer from ${fromName} to ${toName}`,
        });
        showToast.success("Account transfer created successfully");
      }

      setCreateTemplate(null);
      await queryClient.invalidateQueries({ queryKey: ["accounting"] });
    } catch (error) {
      showToast.error("Failed to create transaction", getErrorMessage(error));
    }
  }

  async function handleAction() {
    if (!actionTarget) return;
    try {
      const { action, record } = actionTarget;
      if (action === "approve") {
        await approve.mutateAsync({
          id: record.id,
          preventJournalPosting: preventJournalPostingChecked,
        });
        if (preventJournalPostingChecked) {
          showToast.success("Transaction approved without journal posting");
        } else {
          showToast.success("Transaction approved and posted to journal");
        }
      } else if (action === "reject") {
        await reject.mutateAsync({ id: record.id, reason: "Rejected from cash transactions page" });
        showToast.success("Transaction rejected");
      } else if (action === "post") {
        await postToJournal.mutateAsync(record.id);
        showToast.success("Transaction posted to journal");
      } else if (action === "delete") {
        await remove.mutateAsync(record.id);
        showToast.success("Transaction deleted");
      }

      await queryClient.invalidateQueries({
        queryKey: ["accounting"],
      });

      if (action === "delete" && detailTx?.id === record.id) {
        setDetailTx(null);
      }
    } catch(error) {
      showToast.error("Action failed", getErrorMessage(error));
    } finally {
      setActionTarget(null);
    }
  }

  const ACTION_LABELS = {
    approve: { title: "Approve Transaction", description: "Mark this transaction as approved.", label: "Approve", variant: "default" as const },
    reject: { title: "Reject Transaction", description: "This will reject and prevent further processing.", label: "Reject", variant: "destructive" as const },
    post: { title: "Post to Journal", description: "This will create a journal entry from this transaction. This action cannot be undone.", label: "Post to Journal", variant: "default" as const },
    delete: {
      title: "Delete Transaction",
      description: "This will permanently delete this cash transaction and any linked posted journal entry with all journal lines.",
      label: "Delete",
      variant: "destructive" as const,
    },
  };

  const isActionLoading = approve.isPending || reject.isPending || postToJournal.isPending || remove.isPending;
  const isCreateLoading = postIncome.isPending || postExpense.isPending || postTransfer.isPending;
  const templateLabel = TEMPLATE_OPTIONS.find((option) => option.value === createTemplate)?.label ?? "New Transaction";
  const isEditingStudentPayment = isStudentPaymentTransaction(editTx, txTypes);

  return (
    <>
      <PageLayout
        title="Cash Transactions"
        description="Record, approve, and post cash inflows and outflows"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  icon={<HugeiconsIcon icon={PlusSignIcon} />}
                  iconRight={<ChevronDown className="h-3 w-3" />}
                >
                  New Transaction
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-60">
              {TEMPLATE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className="flex items-start gap-2 cursor-pointer"
                  onClick={() => openTemplate(option.value)}
                >
                  <span className="mt-0.5 shrink-0 text-muted-foreground">{option.icon}</span>
                  <span className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-[10px] text-muted-foreground">{option.description}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
        open={studentPaymentOpen}
        onOpenChange={setStudentPaymentOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["accounting"] })}
      />

      <StudentPaymentDialog
        open={Boolean(editTx && isEditingStudentPayment)}
        onOpenChange={(open) => {
          if (!open) setEditTx(null);
        }}
        transaction={editTx}
        isEdit
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["accounting"] })}
      />

      <CashTransactionDialog
        open={Boolean(editTx && !isEditingStudentPayment)}
        onOpenChange={(open) => {
          if (!open) setEditTx(null);
        }}
        transaction={editTx}
        isEdit
      />

      <DialogBox
        open={Boolean(createTemplate)}
        onOpenChange={(open) => {
          if (!open) setCreateTemplate(null);
        }}
        title={templateLabel}
        description="Enter the new transaction details below."
        actionLabel={createTemplate === "account_transfer" ? "Transfer Money" : "Create Transaction"}
        actionLoading={isCreateLoading}
        actionLoadingText="Saving..."
        onAction={() => {
          void handleCreateFromTemplate();
        }}
        showCloseButton={false}
        className="max-w-xl!"
      >
        {createTemplate === "new_income" ? (
          <Form {...incomeForm}>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={incomeForm.control}
                  name="bank_account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account *</FormLabel>
                      <FormControl>
                        <AccountingBankAccountSelect
                          useUrlState={false}
                          noTitle
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Receiving account"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="income_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Type *</FormLabel>
                      <FormControl>
                        <AccountingTransactionTypeSelect
                          useUrlState={false}
                          noTitle
                          category="income"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select income type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <FormControl>
                        <AccountingPaymentMethodSelect
                          useUrlState={false}
                          noTitle
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Cash, Bank Transfer…"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="entry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          placeholder="Select date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <FormControl>
                        <AccountingCurrencySelect
                          useUrlState={false}
                          noTitle
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select currency"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <AccountingAmountField
                          field={field}
                          currencyCode={selectedIncomeCurrencyCode}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        ) : null}

        {createTemplate === "new_expense" ? (
          <Form {...expenseForm}>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={expenseForm.control}
                  name="bank_account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account *</FormLabel>
                      <FormControl>
                        <AccountingBankAccountSelect
                          useUrlState={false}
                          noTitle
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Paying account"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="expense_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Type *</FormLabel>
                      <FormControl>
                        <AccountingTransactionTypeSelect
                          useUrlState={false}
                          noTitle
                          category="expense"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select expense type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <FormControl>
                        <AccountingPaymentMethodSelect
                          useUrlState={false}
                          noTitle
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Cash, Bank Transfer…"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="entry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          placeholder="Select date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <FormControl>
                        <AccountingCurrencySelect
                          useUrlState={false}
                          noTitle
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select currency"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <AccountingAmountField
                          field={field}
                          currencyCode={selectedExpenseCurrencyCode}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        ) : null}

        {createTemplate === "account_transfer" ? (
          <Form {...transferForm}>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={transferForm.control}
                  name="from_account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Account *</FormLabel>
                      <FormControl>
                        <AccountingBankAccountSelect
                          useUrlState={false}
                          noTitle
                          excludeIds={selectedTransferToAccount ? [selectedTransferToAccount] : []}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            if (value === transferForm.getValues("to_account")) {
                              transferForm.setValue("to_account", "", {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }
                          }}
                          placeholder="Transfer from"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transferForm.control}
                  name="to_account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Account *</FormLabel>
                      <FormControl>
                        <AccountingBankAccountSelect
                          useUrlState={false}
                          noTitle
                          excludeIds={selectedTransferFromAccount ? [selectedTransferFromAccount] : []}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            if (value === transferForm.getValues("from_account")) {
                              transferForm.setValue("from_account", "", {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }
                          }}
                          placeholder="Transfer to"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transferForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <FormControl>
                        <AccountingCurrencySelect
                          useUrlState={false}
                          noTitle
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select currency"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transferForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <AccountingAmountField
                          field={field}
                          currencyCode={selectedTransferCurrencyCode}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transferForm.control}
                  name="entry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          placeholder="Select date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        ) : null}
      </DialogBox>

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
            setPreventJournalPostingChecked(false);
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
          setPreventJournalPostingChecked(false);
        }}
        contentClassName="py-5"
        showCloseButton={false}
      >
        {actionTarget ? (
          <div className="space-y-3 bg-muted/20 ">
            <p className="text-sm text-foreground">
              You are about to <span className="font-semibold lowercase">{ACTION_LABELS[actionTarget.action].label}</span> this transaction.
            </p>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Reference:</span>{" "}
                <span className="font-mono">{actionTarget.record.reference_number ?? actionTarget.record.id}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Type:</span>{" "}
                {typeof actionTarget.record.transaction_type === "object"
                  ? actionTarget.record.transaction_type.name
                  : actionTarget.record.transaction_type}
              </p>
              <p>
                <span className="text-muted-foreground">Amount:</span>{" "}
                <span className="font-semibold text-foreground">
                  {actionTarget.record.currency?.symbol ?? actionTarget.record.currency?.code ?? ""} {actionTarget.record.amount}
                </span>
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Please confirm to continue.
            </p>

            {actionTarget.action === "delete" ? (
              <label className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <Checkbox
                  checked={deleteConfirmChecked}
                  onCheckedChange={(checked) => setDeleteConfirmChecked(checked === true)}
                  aria-label="Confirm permanent deletion"
                />
                <span className="text-xs text-foreground">
                  I understand this will permanently delete this cash transaction and any linked posted journal entry with all related journal lines.
                </span>
              </label>
            ) : null}

            {actionTarget.action === "approve" ? (
              <label className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50/60 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
                <Checkbox
                  checked={preventJournalPostingChecked}
                  onCheckedChange={(checked) => setPreventJournalPostingChecked(checked === true)}
                  aria-label="Prevent posting this approval to journal"
                />
                <span className="text-xs text-foreground">
                  Prevent posting to journal on approval. You can still use Post to Journal later.
                </span>
              </label>
            ) : null}
          </div>
        ) : null}
      </DialogBox>
    </>
  );
}
