"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { DialogBox } from "@/components/ui/dialog-box";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  AccountingBankAccountSelect,
  AccountingCurrencySelect,
  AccountingLedgerAccountSelect,
  AccountingPaymentMethodSelect,
  AccountingTransactionTypeSelect,
} from "@/components/shared/data-reusable";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { showToast } from "@/lib/toast";
import {
  useTransactionTypes,
  useCashTransactionMutations,
} from "@/hooks/use-accounting";
import type {
  CreateAccountingCashTransactionCommand,
  AccountingCashTransactionDto,
} from "@/lib/api2/accounting-types";
import { AccountingAmountField } from "@/components/accounting/accounting-amount-field";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { Textarea } from "../ui/textarea";

/* ─ Schema ─────────────────────────────────────────────────────── */

const schema = z.object({
  transaction_date: z.string().min(1, "Date is required"),
  reference_number: z.string(),
  bank_account: z.string().min(1, "Bank account is required"),
  transaction_type: z.string().min(1, "Transaction type is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  currency: z.string().min(1, "Currency is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  payer_payee: z.string().optional(),
  ledger_account: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ─ Dialog Component ────────────────────────────────────────────── */

interface CashTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: AccountingCashTransactionDto | null;
  isEdit?: boolean;
}

export function CashTransactionDialog({
  open,
  onOpenChange,
  transaction,
  isEdit = false,
}: CashTransactionDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      transaction_date: "",
      reference_number: "",
      bank_account: "",
      transaction_type: "",
      payment_method: "",
      currency: "",
      amount: 0,
      description: "",
      payer_payee: "",
      ledger_account: null,
    },
  });

  const { data: txTypes = [] } = useTransactionTypes();
  const { create, update } = useCashTransactionMutations();

  // Get selected transaction type to check if ledger account is required
  const selectedTypeId = form.watch("transaction_type");
  const selectedType = txTypes.find(
    (t) => (typeof t === "string" ? t === selectedTypeId : t.id === selectedTypeId)
  );

  // Check if ledger_account is required (when transaction type has no default)
  const requiresLedgerAccount = useMemo(() => {
    if (!selectedType) return false;
    const typeObj = typeof selectedType === "string" ? null : selectedType;
    return typeObj && !typeObj.default_ledger_account;
  }, [selectedType]);

  // Load transaction data if editing
  useEffect(() => {
    if (isEdit && transaction) {
      form.reset({
        transaction_date: transaction.transaction_date,
        reference_number: transaction.reference_number,
        bank_account:
          typeof transaction.bank_account === "string"
            ? transaction.bank_account
            : transaction.bank_account?.id,
        transaction_type:
          typeof transaction.transaction_type === "string"
            ? transaction.transaction_type
            : transaction.transaction_type?.id,
        payment_method:
          transaction.payment_method &&
          (typeof transaction.payment_method === "string"
            ? transaction.payment_method
            : transaction.payment_method?.id),
        currency:
          typeof transaction.currency === "string"
            ? transaction.currency
            : transaction.currency?.id || transaction.currency?.code,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        payer_payee: transaction.payer_payee,
        ledger_account:
          transaction.ledger_account &&
          (typeof transaction.ledger_account === "string"
            ? transaction.ledger_account
            : transaction.ledger_account?.id),
      });
    } else if (open) {
      form.reset({
        transaction_date: format(new Date(), "yyyy-MM-dd"),
        reference_number: "",
        bank_account: "",
        transaction_type: "",
        payment_method: "",
        currency: "",
        amount: 0,
        description: "",
        payer_payee: "",
        ledger_account: null,
      });
    }
  }, [open, transaction, isEdit, form]);

  async function handleSubmit(values: FormValues) {
    try {
      const payload: CreateAccountingCashTransactionCommand = {
        transaction_date: values.transaction_date,
        reference_number: values.reference_number || "",
        bank_account: values.bank_account,
        transaction_type: values.transaction_type,
        payment_method: values.payment_method,
        currency: values.currency,
        amount: values.amount,
        exchange_rate: 1,
        base_amount: values.amount,
        description: values.description,
        payer_payee: values.payer_payee || "",
        ledger_account: values.ledger_account || null,
        source_reference: transaction?.source_reference || null,
      };

      if (isEdit && transaction) {
        await update.mutateAsync({ id: transaction.id, payload });
        showToast.success("Transaction updated successfully");
      } else {
        await create.mutateAsync(payload);
        showToast.success("Transaction created successfully");
      }

      onOpenChange(false);
    } catch (error) {
      showToast.error(
        isEdit ? "Failed to update transaction" : "Failed to create transaction",
        getErrorMessage(error)
      );
    }
  }

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Cash Transaction" : "New Cash Transaction"}
      description={
        isEdit
          ? "Update the transaction details"
          : "Record an income or expense transaction with accurate ledger mapping"
      }
      actionLabel={isEdit ? "Update" : "Save Transaction"}
      actionLoading={create.isPending || update.isPending}
      formId="cash-tx-form"
      className="max-w-xl!"
    >
      <Form {...form}>
        <form
          id="cash-tx-form"
          onSubmit={form.handleSubmit((data) => handleSubmit(data))}
          className="space-y-4 pb-1"
        >
          {/* Row 1: Date, Reference */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Date *</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : "")}
                      placeholder="Select date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reference_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference No.</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Auto-generated if empty"
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: Bank Account, Payment Method */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
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
                      placeholder="Select account"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
                      placeholder="Cash, Check, Bank Transfer..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Currency, Amount */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
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
                      placeholder="USD, EUR..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <AccountingAmountField field={field} placeholder="0.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 4: Transaction Type */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="transaction_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type *</FormLabel>
                  <FormControl>
                    <AccountingTransactionTypeSelect
                      useUrlState={false}
                      noTitle
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select type (income/expense)"
                    />
                  </FormControl>
                  {requiresLedgerAccount ? (
                    <FormDescription className="text-xs -mt-1">⚠️ This type requires a ledger account</FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 5: Ledger Account */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="ledger_account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {requiresLedgerAccount ? "Ledger Account *" : "Override Ledger Account"}
                  </FormLabel>
                  <FormControl>
                    <AccountingLedgerAccountSelect
                      useUrlState={false}
                      noTitle
                      includeNoneOption
                      value={field.value ?? ""}
                      onChange={(value) => field.onChange(value || null)}
                      placeholder={
                        requiresLedgerAccount
                          ? "Required - select account"
                          : "Optional - uses type default"
                      }
                    />
                  </FormControl>
                  {requiresLedgerAccount && (
                    <FormDescription className="text-orange-600 text-xs -mt-1">
                      This transaction type has no default ledger account
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 6: Payer / Payee */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="payer_payee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payer / Payee</FormLabel>
                  <FormControl>
                    <Input placeholder="Name or entity..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 7: Description */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is this transaction for?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        </form>
      </Form>
    </DialogBox>
  );
}
