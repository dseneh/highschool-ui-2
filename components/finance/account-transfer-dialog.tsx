"use client";

import * as React from "react";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type {
  AccountTransferCommand,
  BankAccountDto,
  PaymentMethodDto,
} from "@/lib/api2/finance-types";
import { format } from "date-fns";

interface AccountTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankAccounts: BankAccountDto[];
  paymentMethods: PaymentMethodDto[];
  onSubmit: (payload: AccountTransferCommand) => void;
  submitting?: boolean;
}

export function AccountTransferDialog({
  open,
  onOpenChange,
  bankAccounts,
  paymentMethods,
  onSubmit,
  submitting,
}: AccountTransferDialogProps) {
  const [fromAccount, setFromAccount] = React.useState("");
  const [toAccount, setToAccount] = React.useState("");
  const [methodId, setMethodId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [description, setDescription] = React.useState("");
  const [reference, setReference] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setFromAccount("");
      setToAccount("");
      setMethodId("");
      setAmount("");
      setDate(new Date());
      setDescription("");
      setReference("");
    }
  }, [open]);

  function handleSubmit() {
    if (!fromAccount || !toAccount || !methodId || !amount || !date) return;

    onSubmit({
      from_account: fromAccount,
      to_account: toAccount,
      payment_method: methodId,
      amount: parseFloat(amount),
      date: format(date, "yyyy-MM-dd"),
      description: description || undefined,
      reference: reference || undefined,
    });
  }

  const isValid =
    fromAccount &&
    toAccount &&
    fromAccount !== toAccount &&
    methodId &&
    amount &&
    parseFloat(amount) > 0 &&
    date;

  const activeAccounts = bankAccounts.filter((a) => a.active);

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Account Transfer"
      description="Transfer funds between bank accounts."
      actionLabel="Transfer"
      onAction={handleSubmit}
      actionLoading={submitting}
      actionLoadingText="Transferring…"
      actionDisabled={!isValid}
      className="sm:max-w-md"
    >
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label>From Account *</Label>
          <Select
            value={fromAccount}
            onValueChange={(v) => setFromAccount(v ?? "")}
            items={activeAccounts.map((a) => ({ value: a.id, label: a.name }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select source account" />
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

        <div className="grid gap-2">
          <Label>To Account *</Label>
          <Select
            value={toAccount}
            onValueChange={(v) => setToAccount(v ?? "")}
            items={activeAccounts.filter((a) => a.id !== fromAccount).map((a) => ({ value: a.id, label: a.name }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select destination account" />
            </SelectTrigger>
            <SelectContent>
              {activeAccounts
                .filter((a) => a.id !== fromAccount)
                .map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="transfer-amount">Amount *</Label>
            <Input
              id="transfer-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Payment Method *</Label>
            <Select
              value={methodId}
              onValueChange={(v) => setMethodId(v ?? "")}
              items={paymentMethods.filter((m) => m.active).map((m) => ({ value: m.id, label: m.name }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Method" />
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
            <Label htmlFor="transfer-ref">Reference</Label>
            <Input
              id="transfer-ref"
              placeholder="Reference #"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="transfer-desc">Description</Label>
          <Input
            id="transfer-desc"
            placeholder="Transfer description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </DialogBox>
  );
}
