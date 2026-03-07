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
  CreateTransactionCommand,
  TransactionTypeDto,
  PaymentMethodDto,
  BankAccountDto,
} from "@/lib/api2/finance-types";
import { format } from "date-fns";

interface GeneralTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionTypes: TransactionTypeDto[];
  paymentMethods: PaymentMethodDto[];
  bankAccounts: BankAccountDto[];
  onSubmit: (payload: CreateTransactionCommand) => void;
  submitting?: boolean;
}

/** Codes to exclude from general transactions */
const EXCLUDED_CODES = ["TUITION", "TRANSFER"];

export function GeneralTransactionDialog({
  open,
  onOpenChange,
  transactionTypes,
  paymentMethods,
  bankAccounts,
  onSubmit,
  submitting,
}: GeneralTransactionDialogProps) {
  const [typeId, setTypeId] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [methodId, setMethodId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [description, setDescription] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTypeId("");
      setAccountId("");
      setMethodId("");
      setAmount("");
      setDate(new Date());
      setDescription("");
      setReference("");
      setNotes("");
    }
  }, [open]);

  // Filter out tuition/transfer types
  const generalTypes = transactionTypes.filter(
    (t) => !t.is_hidden && !EXCLUDED_CODES.includes(t.type_code)
  );
  const incomeTypes = generalTypes.filter((t) => t.type === "income");
  const expenseTypes = generalTypes.filter((t) => t.type === "expense");

  const activeAccounts = bankAccounts.filter((a) => a.active);
  const activeMethods = paymentMethods.filter((m) => m.active);

  function handleSubmit() {
    if (!typeId || !accountId || !methodId || !amount || !date) return;

    onSubmit({
      type: typeId,
      account: accountId,
      payment_method: methodId,
      amount: parseFloat(amount),
      date: format(date, "yyyy-MM-dd"),
      description,
      reference: reference || undefined,
      notes: notes || undefined,
    });
  }

  const isValid =
    typeId && accountId && methodId && amount && parseFloat(amount) > 0 && date;

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="General Transaction"
      description="Record a general income or expense transaction."
      actionLabel="Create Transaction"
      onAction={handleSubmit}
      actionLoading={submitting}
      actionLoadingText="Creating…"
      actionDisabled={!isValid}
      className="sm:max-w-lg"
    >
      <div className="grid gap-4 py-2">
        {/* Amount */}
        <div className="grid gap-2">
          <Label htmlFor="gen-amount">Amount *</Label>
          <Input
            id="gen-amount"
            type="number"
            step="0.01"
            min="0"
            max="9999999"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Transaction Type */}
        <div className="grid gap-2">
          <Label>Transaction Type *</Label>
          <Select
            value={typeId}
            onValueChange={(v) => setTypeId(v ?? "")}
            items={generalTypes.map((t) => ({ value: t.id, label: t.name }))}
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
          <p className="text-xs text-muted-foreground">
            Tuition and transfer types are not available here.
          </p>
        </div>

        {/* Payment Method + Account */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Payment Method *</Label>
            <Select
              value={methodId}
              onValueChange={(v) => setMethodId(v ?? "")}
              items={activeMethods.map((m) => ({
                value: m.id,
                label: m.name,
              }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {activeMethods.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Account *</Label>
            <Select
              value={accountId}
              onValueChange={(v) => setAccountId(v ?? "")}
              items={activeAccounts.map((a) => ({
                value: a.id,
                label: a.name,
              }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {activeAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date + Reference */}
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
            <Label htmlFor="gen-ref">Reference</Label>
            <Input
              id="gen-ref"
              placeholder="Reference #"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="gen-desc">Description</Label>
          <Input
            id="gen-desc"
            placeholder="Brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="grid gap-2">
          <Label>Notes (Optional)</Label>
          <Textarea
            placeholder="Additional notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </DialogBox>
  );
}
