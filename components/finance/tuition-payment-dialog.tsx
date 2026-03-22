"use client";

import * as React from "react";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { AccountingAmountField } from "@/components/accounting/accounting-amount-field";
import {
  AccountingBankAccountSelect,
  AccountingPaymentMethodSelect,
} from "@/components/shared/data-reusable";
import {
  useAccountingCurrencies,
  useJournalEntryMutations,
  useTransactionTypes,
} from "@/hooks/use-accounting";
import type { StudentDto } from "@/lib/api2/student-types";
import { useStudents } from "@/lib/api2/student";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AvatarImg from '@/components/shared/avatar-img';

interface TuitionPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionTypes?: unknown[];
  paymentMethods?: unknown[];
  bankAccounts?: unknown[];
  onSubmit?: (payload: unknown) => void;
  onPaymentRecorded?: () => void;
  submitting?: boolean;
  student?: StudentDto; // Optional: pre-populate student
  skipSearch?: boolean; // Optional: skip search step entirely
}

export function TuitionPaymentDialog({
  open,
  onOpenChange,
  onPaymentRecorded,
  submitting,
  student: initialStudent,
  skipSearch = false,
}: TuitionPaymentDialogProps) {
  const studentsApi = useStudents();
  const { postStudentPayment } = useJournalEntryMutations();
  const { data: accountingCurrencies = [] } = useAccountingCurrencies();
  const { data: accountingTransactionTypes = [] } = useTransactionTypes();

  // Step: "search" | "form"
  const [step, setStep] = React.useState<"search" | "form">(skipSearch ? "form" : "search");
  const [searchId, setSearchId] = React.useState("");
  const [queryId, setQueryId] = React.useState(""); // ID to actually query
  const [student, setStudent] = React.useState<StudentDto | null>(initialStudent ?? null);

  // Use React Query for student fetching with caching
  const { data: studentData, refetch, isLoading: searching, isError } = studentsApi.getStudent(
    queryId,
    { enabled: false } // Don't fetch automatically
  );

  // Watch for student data changes
  React.useEffect(() => {
    if (studentData && !isError) {
      setStudent(studentData as StudentDto);
      toast.success(`Student found: ${(studentData as StudentDto).full_name}`);
      setStep("form");
    } else if (isError && queryId) {
      toast.error("Student not found with this ID");
    }
  }, [studentData, isError, queryId]);

  // Form state
  const [amount, setAmount] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [methodId, setMethodId] = React.useState("");
  const [currencyId, setCurrencyId] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [notes, setNotes] = React.useState("");

  const tuitionType = React.useMemo(
    () =>
      accountingTransactionTypes.find(
        (t) => t.code === "TUITION" || t.name.toLowerCase().includes("tuition")
      ),
    [accountingTransactionTypes]
  );

  const defaultCurrency = React.useMemo(
    () =>
      accountingCurrencies.find((currency) => currency.is_base_currency && currency.is_active) ??
      accountingCurrencies.find((currency) => currency.is_active) ??
      null,
    [accountingCurrencies]
  );

  const amountNumber = React.useMemo(() => {
    const parsed = Number.parseFloat(amount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const currentBalance = student?.current_enrollment?.billing_summary?.balance ?? 0;
  const projectedBalance = currentBalance - amountNumber;
  const currencySymbol = student?.current_enrollment?.billing_summary?.currency || "$";

  // Reset on open/close
  React.useEffect(() => {
    if (open) {
      // If student provided, use it and go to form, otherwise start at search
      if (initialStudent) {
        setStudent(initialStudent);
        setStep("form");
      } else {
        setStep(skipSearch ? "form" : "search");
        setSearchId("");
        setQueryId(""); // Reset query ID
        setStudent(null);
      }
      // Always reset form fields
      setAmount("");
      setReference("");
      setAccountId("");
      setMethodId("");
      setCurrencyId("");
      setDate(new Date());
      setNotes("");
    }
  }, [open, initialStudent, skipSearch]);

  React.useEffect(() => {
    if (!open) return;
    if (currencyId) return;
    if (!defaultCurrency) return;
    setCurrencyId(defaultCurrency.id);
  }, [open, currencyId, defaultCurrency]);

  async function handleSearch() {
    if (!searchId.trim()) {
      toast.error("Please enter a student ID");
      return;
    }

    // Update the query ID to trigger the search
    setQueryId(searchId.trim());
    // Trigger the refetch
    refetch();
  }

  async function handleSubmit() {
    if (!student || !accountId || !methodId || !date || !reference || !currencyId || !tuitionType?.id || amountNumber <= 0) {
      return;
    }

    try {
      await postStudentPayment.mutateAsync({
        bank_account: accountId,
        transaction_date: format(date, "yyyy-MM-dd"),
        reference_number: reference,
        transaction_type: tuitionType.id,
        payment_method: methodId,
        amount: amountNumber,
        currency: currencyId,
        payer_payee: student.full_name,
        description: notes?.trim() || `Tuition payment for ${student.full_name}`,
        source_reference: student.id,
      });

      toast.success("Payment recorded successfully");
      onOpenChange(false);
      onPaymentRecorded?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record payment");
    }
  }

  const isValid =
    student &&
    amountNumber > 0 &&
    accountId &&
    methodId &&
    date &&
    reference.trim() &&
    currencyId &&
    tuitionType?.id;

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Tuition Payment"
      description={
        step === "search"
          ? "Enter the student ID to continue with the payment."
          : `Payment for ${student?.full_name}`
      }
      actionLabel={step === "form" ? "Record Payment" : undefined}
      onAction={step === "form" ? handleSubmit : undefined}
      actionLoading={Boolean(submitting || postStudentPayment.isPending)}
      actionLoadingText="Recording…"
      actionDisabled={step === "form" ? !isValid : true}
      footer={step === "search" ? null : undefined}
      className="sm:max-w-lg"
      roles={["finance", "registrar", "accountant"]}
    >
      {step === "search" ? (
        <div className="flex flex-col items-center justify-center py-8 gap-6">
          <div className="max-w-sm w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-search">Student ID *</Label>
              <Input
                id="student-search"
                placeholder="Enter student ID number"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                disabled={searching}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the student&apos;s ID number to search and proceed with
                the tuition payment.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleSearch}
              loading={searching}
              loadingText="Searching…"
              disabled={!searchId.trim() || searching}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 py-2">
          {/* Student banner */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AvatarImg
                  src={student?.photo}
                  alt={student?.full_name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {student?.full_name}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    ID: {student?.id_number}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStudent(null);
                  setQueryId("");
                  setStep("search");
                }}
                disabled={skipSearch || !!initialStudent}
              >
                Change
              </Button>
            </div>
          </div>

          {/* Reference */}
          <div className="grid gap-2">
            <Label htmlFor="tuition-ref">Reference Number *</Label>
            <Input
              id="tuition-ref"
              placeholder="Enter payment reference number"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Provide a reference number (e.g., check number, transaction ID).
            </p>
          </div>

          {/* Payment Method + Account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Payment Method *</Label>
              <AccountingPaymentMethodSelect
                useUrlState={false}
                noTitle
                value={methodId || ""}
                onChange={(v) => setMethodId(String(v || ""))}
                placeholder="Select method"
              />
            </div>

            <div className="grid gap-2">
              <Label>Account *</Label>
              <AccountingBankAccountSelect
                useUrlState={false}
                noTitle
                value={accountId || ""}
                onChange={(v) => setAccountId(String(v || ""))}
                placeholder="Select account"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="tuition-amount">Payment Amount *</Label>
            <AccountingAmountField
              field={{
                value: amount === "" ? "" : Number.parseFloat(amount),
                onChange: (value: number | "") => setAmount(value === "" ? "" : String(value)),
                onBlur: () => {},
                name: "tuition-amount",
                ref: () => {},
              } as any}
              currencyCode={defaultCurrency?.code}
              placeholder="0.00"
            />
          </div>

          {/* Balance Preview */}
          <div className="rounded-xl border bg-muted/20 p-3 space-y-4">

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Current Balance
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {currencySymbol}{Number(currentBalance).toLocaleString()}
                </p>
              </div>

              <div className="">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Projected Balance
                </p>
                <p
                  className={cn(
                    "mt-1 text-lg font-semibold",
                    projectedBalance < 0 ? "text-red-600" : "text-emerald-600"
                  )}
                >
                  {currencySymbol}{Math.abs(projectedBalance).toLocaleString()}
                  {projectedBalance < 0 ? " (Overpaid)" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="grid gap-2">
            <Label>Date *</Label>
            <DatePicker
              value={date}
              onChange={setDate}
              placeholder="Select payment date"
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Enter payment notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      )}
    </DialogBox>
  );
}
