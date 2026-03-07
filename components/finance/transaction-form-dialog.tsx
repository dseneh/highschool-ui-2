"use client";

import * as React from "react";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type {
  TransactionDto,
  CreateTransactionCommand,
  TransactionTypeDto,
  PaymentMethodDto,
  BankAccountDto,
} from "@/lib/api/finance-types";
import { format } from "date-fns";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionDto | null;
  transactionTypes: TransactionTypeDto[];
  paymentMethods: PaymentMethodDto[];
  bankAccounts: BankAccountDto[];
  onSubmit: (payload: CreateTransactionCommand) => void;
  submitting?: boolean;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  transactionTypes,
  paymentMethods,
  bankAccounts,
  onSubmit,
  submitting,
}: TransactionFormDialogProps) {
  const isEdit = Boolean(transaction);

  const [typeId, setTypeId] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [methodId, setMethodId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [description, setDescription] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Reset form when opening / switching transaction
  React.useEffect(() => {
    if (open) {
      if (transaction) {
        setTypeId(transaction.transaction_type?.id ?? "");
        setAccountId(transaction.account?.id ?? "");
        setMethodId(transaction.payment_method?.id ?? "");
        setAmount(String(transaction.amount ?? ""));
        setDate(transaction.date ? new Date(transaction.date) : new Date());
        setDescription(transaction.description ?? "");
        setReference(transaction.reference ?? "");
        setNotes(transaction.notes ?? "");
      } else {
        setTypeId("");
        setAccountId("");
        setMethodId("");
        setAmount("");
        setDate(new Date());
        setDescription("");
        setReference("");
        setNotes("");
      }
    }
  }, [open, transaction]);

  function handleSubmit() {
    if (!typeId || !accountId || !methodId || !amount || !date) return;

    const payload: CreateTransactionCommand = {
      type: typeId,
      account: accountId,
      payment_method: methodId,
      amount: parseFloat(amount),
      date: format(date, "yyyy-MM-dd"),
      description,
      reference: reference || undefined,
      notes: notes || undefined,
    };
    onSubmit(payload);
  }

  const isValid =
    typeId && accountId && methodId && amount && parseFloat(amount) > 0 && date;

  // Split types for grouped display
  const incomeTypes = transactionTypes.filter((t) => t.type === "income" && !t.is_hidden);
  const expenseTypes = transactionTypes.filter((t) => t.type === "expense" && !t.is_hidden);

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Transaction" : "New Transaction"}
      description={
        isEdit
          ? "Update transaction details."
          : "Record a new financial transaction."
      }
      actionLabel={isEdit ? "Save Changes" : "Create Transaction"}
      onAction={handleSubmit}
      actionLoading={submitting}
      actionLoadingText={isEdit ? "Saving…" : "Creating…"}
      actionDisabled={!isValid}
      className="sm:max-w-lg"
    >
      <div className="grid gap-4 py-2">
        {/* Amount */}
        <div className="grid gap-2">
          <Label htmlFor="tx-amount">Amount *</Label>
          <Input
            id="tx-amount"
            type="number"
            step="0.01"
            min="0"
            max="9999999"
            placeholder="0.00"
            value={String(Math.abs(parseFloat(amount)) || "")}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Transaction Type */}
        <div className="grid gap-2">
          <Label>Transaction Type *</Label>
          <Select
            value={typeId}
            onValueChange={(v) => setTypeId(v ?? "")}
            items={transactionTypes.map((t) => ({ value: t.id, label: t.name }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {incomeTypes.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Income
                  </div>
                  {incomeTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </>
              )}
              {expenseTypes.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Expense
                  </div>
                  {expenseTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Two-column: Account + Payment Method */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Account *</Label>
            <Select
              value={accountId}
              onValueChange={(v) => setAccountId(v ?? "")}
              items={bankAccounts.filter((a) => a.active).map((a) => ({ value: a.id, label: a.name }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts
                  .filter((a) => a.active)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Payment Method *</Label>
            <Select
              value={methodId}
              onValueChange={(v) => setMethodId(v ?? "")}
              items={paymentMethods.filter((m) => m.active).map((m) => ({ value: m.id, label: m.name }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods
                  .filter((m) => m.active)
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Two-column: Date + Reference */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Date *</Label>
            <DatePicker
              value={date}
              onChange={setDate}
              placeholder="Select date"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tx-ref">Reference</Label>
            <Input
              id="tx-ref"
              placeholder="e.g. Receipt #"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="tx-desc">Description</Label>
          <Input
            id="tx-desc"
            placeholder="Brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="grid gap-2">
          <Label htmlFor="tx-notes">Notes</Label>
          <Textarea
            id="tx-notes"
            placeholder="Additional notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </DialogBox>
  );
}
