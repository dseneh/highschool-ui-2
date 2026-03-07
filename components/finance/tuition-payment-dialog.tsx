"use client";

import * as React from "react";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { DatePicker } from "@/components/ui/date-picker";
import type {
  CreateTransactionCommand,
  TransactionTypeDto,
  PaymentMethodDto,
  BankAccountDto,
} from "@/lib/api2/finance-types";
import type { StudentDto } from "@/lib/api2/student-types";
import { useStudents } from "@/lib/api2/student";
import { format } from "date-fns";
import { toast } from "sonner";
import AvatarImg from '@/components/shared/avatar-img';

interface TuitionPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionTypes: TransactionTypeDto[];
  paymentMethods: PaymentMethodDto[];
  bankAccounts: BankAccountDto[];
  onSubmit: (payload: CreateTransactionCommand) => void;
  submitting?: boolean;
  student?: StudentDto; // Optional: pre-populate student
  skipSearch?: boolean; // Optional: skip search step entirely
}

export function TuitionPaymentDialog({
  open,
  onOpenChange,
  transactionTypes,
  paymentMethods,
  bankAccounts,
  onSubmit,
  submitting,
  student: initialStudent,
  skipSearch = false,
}: TuitionPaymentDialogProps) {
  const studentsApi = useStudents();

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
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [notes, setNotes] = React.useState("");

  // Find TUITION type id
  const tuitionType = transactionTypes.find(
    (t) => t.type_code === "TUITION" || t.name.toLowerCase() === "tuition"
  );

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
      setDate(new Date());
      setNotes("");
    }
  }, [open, initialStudent, skipSearch]);

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

  function handleSubmit() {
    if (!student || !amount || !accountId || !methodId || !date) return;

    const payload: CreateTransactionCommand = {
      type: tuitionType?.id ?? "",
      student: student.id_number,
      account: accountId,
      payment_method: methodId,
      amount: parseFloat(amount),
      date: format(date, "yyyy-MM-dd"),
      description: `Tuition payment for ${student.full_name}`,
      reference: reference || undefined,
      notes: notes || undefined,
    };
    onSubmit(payload);
  }

  const isValid =
    student && amount && parseFloat(amount) > 0 && accountId && methodId && date;

  const activeAccounts = bankAccounts.filter((a) => a.active);
  const activeMethods = paymentMethods.filter((m) => m.active);

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
      actionLoading={submitting}
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

          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="tuition-amount">Payment Amount *</Label>
            <Input
              id="tuition-amount"
              type="number"
              step="0.01"
              min="0"
              max="9999999"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
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
              <SelectField
                value={methodId}
                onValueChange={(v) => setMethodId(String(v))}
                items={activeMethods.map((m) => ({
                  value: m.id,
                  label: m.name,
                }))}
                placeholder="Select method"
              />
            </div>

            <div className="grid gap-2">
              <Label>Account *</Label>
              <SelectField
                value={accountId}
                onValueChange={(v) => setAccountId(String(v ?? ""))}
                items={activeAccounts.map((a) => ({
                  value: a.id,
                  label: a.name,
                }))}
                placeholder="Select account"
              />
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
