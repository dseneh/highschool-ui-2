"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { DialogBox } from "@/components/ui/dialog-box";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AccountingBankAccountSelect,
  AccountingCurrencySelect,
  AccountingPaymentMethodSelect,
} from "@/components/shared/data-reusable";
import {
  Form,
} from "@/components/ui/form";
import AvatarImg from "@/components/shared/avatar-img";
import { showToast } from "@/lib/toast";
import {
  useTransactionTypes,
  useCashTransactionMutations,
  useAccountingBankAccounts,
  useAccountingCurrencies,
} from "@/hooks/use-accounting";
import { useStudentByNumber, useStudentDetail } from "@/hooks/use-student";
import type {
  AccountingCashTransactionDto,
  CreateAccountingCashTransactionCommand,
  UpdateAccountingCashTransactionCommand,
} from "@/lib/api2/accounting-types";
import type { StudentDto } from "@/lib/api2/student-types";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { ReusableFormField } from "@/components/shared/reusable-form-field";

/* ─── Schema ──────────────────────────────────────────────────────── */

const formSchema = z.object({
  transaction_date: z.string().min(1, "Date is required"),
  reference_number: z.string().optional(),
  bank_account: z.string().min(1, "Bank account is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  currency: z.string().min(1, "Currency is required"),
  exchange_rate: z.coerce.number().positive("Exchange rate must be positive"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/* ─── Props ───────────────────────────────────────────────────────── */

interface StudentPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStudent?: StudentDto | null;
  transaction?: AccountingCashTransactionDto | null;
  isEdit?: boolean;
  onSuccess?: () => void;
}

function getRefId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    return String((value as { id?: string }).id ?? "");
  }
  return "";
}

function resolveCurrencyCode(
  currencies: Array<{ id: string; code: string }>,
  value: unknown
): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const matched = currencies.find((currency) => currency.id === value || currency.code === value);
    if (matched?.code) return matched.code;
    return /^[A-Z]{3}$/.test(value) ? value : null;
  }

  if (typeof value === "object") {
    const code = (value as { code?: string }).code;
    return code ?? null;
  }

  return null;
}

function resolveCurrencyValue(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const currency = value as { id?: string; code?: string };
    return currency.id ?? currency.code ?? "";
  }
  return "";
}

/* ─── Component ───────────────────────────────────────────────────── */

export function StudentPaymentDialog({
  open,
  onOpenChange,
  initialStudent,
  transaction,
  isEdit = false,
  onSuccess,
}: StudentPaymentDialogProps) {
  const isEditMode = Boolean(isEdit && transaction);

  /* ── state ── */
  const [step, setStep] = useState<"search" | "form">(
    initialStudent || isEditMode ? "form" : "search"
  );
  const [studentIdInput, setStudentIdInput] = useState("");
  const [queryId, setQueryId] = useState<string | undefined>(undefined);
  const [student, setStudent] = useState<StudentDto | null>(initialStudent ?? null);

  /* ── data hooks ── */
  const { data: txTypes = [] } = useTransactionTypes();
  const { data: bankAccounts = [] } = useAccountingBankAccounts();
  const { data: currencies = [] } = useAccountingCurrencies();
  const { create, update } = useCashTransactionMutations();

  const editStudentId = isEditMode
    ? (transaction?.source_reference ?? undefined)
    : undefined;

  /* ── student lookup ── */
  const {
    data: foundStudent,
    isLoading: searching,
    isError: searchError,
    refetch: refetchStudent,
  } = useStudentDetail(queryId, { enabled: false });

  const {
    data: editStudent,
    isLoading: editStudentLoading,
  } = useStudentByNumber(editStudentId, {
    enabled: Boolean(isEditMode && editStudentId && open),
  });

  /* ── TUITION transaction type ── */
  const tuitionType = useMemo(
    () => txTypes.find((t) => t.code === "TUITION"),
    [txTypes]
  );
  const transactionTypeId = getRefId(transaction?.transaction_type);

  /* ── form ── */
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transaction_date: format(new Date(), "yyyy-MM-dd"),
      reference_number: "",
      bank_account: "",
      payment_method: "",
      currency: "",
      exchange_rate: 1,
      amount: "" as unknown as number,
      description: "",
    },
  });

  const selectedBankAccountId = useWatch({
    control: form.control,
    name: "bank_account",
  });
  const selectedCurrencyId = useWatch({
    control: form.control,
    name: "currency",
  });
  const enteredAmount = useWatch({
    control: form.control,
    name: "amount",
  });

  /* Resolve selected currency code */
  const selectedCurrencyCode = useMemo(() => {
    return resolveCurrencyCode(currencies, selectedCurrencyId);
  }, [currencies, selectedCurrencyId]);

  /* Resolve bank account currency code */
  const bankAccountCurrencyCode = useMemo(() => {
    const acc = bankAccounts.find((a) => a.id === selectedBankAccountId);
    if (!acc) return null;
    return resolveCurrencyCode(currencies, acc.currency);
  }, [bankAccounts, currencies, selectedBankAccountId]);

  /* When user picks a bank account, pre-fill currency from it */
  useEffect(() => {
    const acc = bankAccounts.find((a) => a.id === selectedBankAccountId);
    if (!acc) return;
    const currencyValue = resolveCurrencyValue(acc.currency);
    if (currencyValue) {
      form.setValue("currency", currencyValue);
    }
  }, [selectedBankAccountId, bankAccounts, form]);

  /* Derived: show exchange rate only when selected currency differs from bank account currency */
  const showExchangeRate = useMemo(() => {
    if (!bankAccountCurrencyCode || !selectedCurrencyId) return false;
    const selectedCode = resolveCurrencyCode(currencies, selectedCurrencyId);
    if (!selectedCode) return false;
    return selectedCode !== bankAccountCurrencyCode;
  }, [bankAccountCurrencyCode, selectedCurrencyId, currencies]);

  const studentBalance = useMemo(() => {
    const enrollmentBalance = student?.current_enrollment?.billing_summary?.balance;
    if (typeof enrollmentBalance === "number") return enrollmentBalance;

    const rootBalance = student?.balance;
    if (typeof rootBalance === "number") return rootBalance;

    return 0;
  }, [student]);

  const projectedBalance = useMemo(() => {
    return studentBalance - Number(enteredAmount || 0);
  }, [enteredAmount, studentBalance]);

  const balanceCurrencyCode = useMemo(() => {
    return (
      student?.current_enrollment?.billing_summary?.currency ||
      selectedCurrencyCode ||
      bankAccountCurrencyCode ||
      "USD"
    );
  }, [bankAccountCurrencyCode, selectedCurrencyCode, student]);

  /* ── React to student lookup result ── */
  const prevQueryId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (isEditMode) return;
    if (!queryId || queryId === prevQueryId.current) return;
    prevQueryId.current = queryId;
    refetchStudent();
  }, [isEditMode, queryId, refetchStudent]);

  useEffect(() => {
    if (isEditMode) return;
    if (!foundStudent) return;
    setStudent(foundStudent as StudentDto);
    showToast.success(`Student found: ${(foundStudent as StudentDto).full_name}`);
    setStep("form");
  }, [isEditMode, foundStudent]);

  useEffect(() => {
    if (isEditMode) return;
    if (searchError && queryId) {
      showToast.error("Student not found with this ID");
    }
  }, [isEditMode, searchError, queryId]);

  useEffect(() => {
    if (!isEditMode) return;
    if (!editStudent) return;
    setStudent(editStudent);
  }, [isEditMode, editStudent]);

  /* ── Reset on open/close ── */
  useEffect(() => {
    if (!open) return;

    if (isEditMode && transaction) {
      setStep("form");
      setStudentIdInput("");
      setQueryId(undefined);
      prevQueryId.current = undefined;
      form.reset({
        transaction_date: transaction.transaction_date || format(new Date(), "yyyy-MM-dd"),
        reference_number: transaction.reference_number || "",
        bank_account: getRefId(transaction.bank_account),
        payment_method: getRefId(transaction.payment_method),
        currency: resolveCurrencyValue(transaction.currency),
        exchange_rate: Number(transaction.exchange_rate || 1),
        amount: Number(transaction.amount || 0),
        description: transaction.description || "",
      });
      return;
    }

    if (initialStudent) {
      setStudent(initialStudent);
      setStep("form");
    } else {
      setStep("search");
      setStudentIdInput("");
      setQueryId(undefined);
      prevQueryId.current = undefined;
      setStudent(null);
    }
    form.reset({
      transaction_date: format(new Date(), "yyyy-MM-dd"),
      reference_number: "",
      bank_account: "",
      payment_method: "",
      currency: "",
      exchange_rate: 1,
      amount: "" as unknown as number,
      description: "",
    });
  }, [open, initialStudent, isEditMode, transaction, form]);

  /* ── Handlers ── */
  function handleSearch() {
    const id = studentIdInput.trim();
    if (!id) {
      showToast.error("Please enter a student ID");
      return;
    }
    setQueryId(id);
  }

  async function handleSubmit(values: FormValues) {
    const effectiveTypeId = tuitionType?.id || transactionTypeId;
    if (!effectiveTypeId) {
      showToast.error(
        "TUITION transaction type not configured"
      );
      return;
    }

    const rate = showExchangeRate ? values.exchange_rate : 1;
    const sourceRef = student?.id_number || transaction?.source_reference || null;

    const payload: CreateAccountingCashTransactionCommand | UpdateAccountingCashTransactionCommand = {
      transaction_date: values.transaction_date,
      reference_number: values.reference_number ?? "",
      bank_account: values.bank_account,
      transaction_type: effectiveTypeId,
      payment_method: values.payment_method,
      currency: values.currency,
      amount: values.amount,
      exchange_rate: rate,
      base_amount: values.amount * rate,
      description:
        values.description?.trim() ||
        (student?.full_name
          ? `Tuition payment for ${student.full_name}`
          : transaction?.description || "Tuition payment"),
      source_reference: sourceRef,
    };

    try {
      if (isEditMode && transaction) {
        await update.mutateAsync({
          id: transaction.id,
          payload,
        });
        showToast.success("Payment updated successfully");
      } else {
        await create.mutateAsync(payload as CreateAccountingCashTransactionCommand);
        showToast.success("Payment recorded successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      showToast.error(
        isEditMode ? "Failed to update payment" : "Failed to record payment",
        getErrorMessage(error)
      );
    }
  }

  const isFormValid = form.formState.isValid && Boolean(tuitionType || transactionTypeId);

  /* ─── Render ──────────────────────────────────────────────────── */

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Record Tuition Payment"
      description={
        step === "search"
          ? "Enter the student's ID number to continue."
          : `Payment for ${student?.full_name ?? transaction?.source_reference ?? ""}`
      }
      actionLabel={step === "form" ? (isEditMode ? "Update Payment" : "Record Payment") : undefined}
      onAction={step === "form" ? form.handleSubmit(handleSubmit) : undefined}
      actionLoading={create.isPending || update.isPending || editStudentLoading}
      actionLoadingText={isEditMode ? "Updating…" : "Recording…"}
      actionDisabled={step === "form" ? !isFormValid : true}
      footer={step === "search" ? null : undefined}
      formId={step === "form" ? "student-payment-form" : undefined}
      className="sm:max-w-xl"
    >
      {/* ── Step 1: Search ── */}
      {step === "search" && !isEditMode && (
        <div className="flex flex-col items-center justify-center py-8 gap-6">
          <div className="max-w-sm w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-id-search">Student ID *</Label>
              <Input
                id="student-id-search"
                placeholder="Enter student ID number"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
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
              disabled={!studentIdInput.trim() || searching}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Payment form ── */}
      {step === "form" && (
        <Form {...form}>
          <form
            id="student-payment-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-2"
          >
            {/* Student banner */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AvatarImg
                    src={student?.photo}
                    alt={student?.full_name}
                    className="w-10 h-10 rounded-full"
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
                {!initialStudent && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setStudent(null);
                      setQueryId(undefined);
                      prevQueryId.current = undefined;
                      setStep("search");
                    }}
                  >
                    Change
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:grid-cols-2 dark:border-amber-800 dark:bg-amber-900/20">
              <div>
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="text-sm font-semibold">
                  {balanceCurrencyCode} {studentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Projected Balance After Payment</p>
                <p
                  className={`text-sm font-semibold ${projectedBalance < 0 ? "text-destructive" : ""}`}
                >
                  {balanceCurrencyCode} {projectedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
            <ReusableFormField
              control={form.control}
              name="transaction_date"
              label="Payment Date"
              required
              type="custom"
              customRender={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(String(field.value)) : undefined}
                      onChange={(d) =>
                        field.onChange(d ? format(d, "yyyy-MM-dd") : "")
                      }
                      placeholder="Select date"
                    />
              )}
            />

            <ReusableFormField
              control={form.control}
              name="reference_number"
              label="Reference Number"
              placeholder="Auto-generated if left blank"
              description="Check number, receipt ID, bank ref"
            />
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">

            <ReusableFormField
              control={form.control}
              name="bank_account"
              label="Bank Account"
              required
              type="custom"
              customRender={({ field }) => (
                    <AccountingBankAccountSelect
                      useUrlState={false}
                      noTitle
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      placeholder="Select account"
                    />
              )}
            />
            <ReusableFormField
              control={form.control}
              name="payment_method"
              label="Payment Method"
              required
              type="custom"
              customRender={({ field }) => (
                    <AccountingPaymentMethodSelect
                      useUrlState={false}
                      noTitle
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      placeholder="Cash, Check, Bank Transfer…"
                    />
              )}
            />
            </div>
            
             <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
            <ReusableFormField
              control={form.control}
              name="currency"
              label="Currency"
              required
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
            {showExchangeRate && (
              <ReusableFormField
                control={form.control}
                name="exchange_rate"
                label="Exchange Rate"
                required
                type="number"
                step="0.0001"
                placeholder="1.0000"
                description={`Rate relative to bank account currency${bankAccountCurrencyCode ? ` (${bankAccountCurrencyCode})` : ""}`}
              />
            )}
                </div>

            <ReusableFormField
                          control={form.control}
                          name="amount"
                          label="Amount"
                          type="amount"
                          placeholder="0.00"
                          currencyCode={selectedCurrencyCode}
                        />

            {/* Description — optional, auto-filled */}
            <ReusableFormField
              control={form.control}
              name="description"
              label="Description"
              placeholder={
                student
                  ? `Tuition payment for ${student.full_name}`
                  : "Auto-filled from student name"
              }
              description="Leave blank to auto-fill from student name"
            />
          </form>
        </Form>
      )}
    </DialogBox>
  );
}
