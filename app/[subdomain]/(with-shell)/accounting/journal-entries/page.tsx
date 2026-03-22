"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PlusSignIcon,
  ArrowDataTransferHorizontalIcon,
  MoneyBagIcon,
  Invoice01Icon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";

import PageLayout from "@/components/dashboard/page-layout";
import { DialogBox } from "@/components/ui/dialog-box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectField } from "@/components/ui/select-field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountingTableSkeleton } from "@/components/accounting/accounting-table-skeleton";
import { showToast } from "@/lib/toast";
import {
  useJournalEntries,
  useJournalEntryDetail,
  useJournalEntryMutations,
  useLedgerAccounts,
} from "@/hooks/use-accounting";
import { useStudents } from "@/hooks/use-student";
import { JournalEntriesTable } from "./_components/journal-entries-table";
import { JournalEntryDetailSheet } from "./_components/journal-entry-detail-sheet";
import { AccountTransferForm } from "./_components/account-transfer-form";
import { NewExpenseForm } from "./_components/new-expense-form";
import { NewIncomeForm } from "./_components/new-income-form";
import type { AccountingJournalEntryDetailDto, AccountingJournalEntryDto, JournalEntryStatus } from "@/lib/api2/accounting-types";
import {
  accountTransferSchema,
  expenseSchema,
  incomeSchema,
  StudentPaymentFormValues,
  AccountTransferFormValues,
  IncomeFormValues,
  ExpenseFormValues,
  studentPaymentSchema,
} from "./_components/posting-form-schemas";
import { StudentPaymentForm } from "./_components/student-payment-form";
import { ChevronDown } from "lucide-react";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { NumericFormat } from "react-number-format";
import { getErrorMessage } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type PostingType =
  | "student_payment"
  | "new_income"
  | "new_expense"
  | "account_transfer";

type PostingTypeOption = {
  value: PostingType;
  label: string;
  icon: React.ReactNode;
  description: string;
  devider: boolean;
};

/* ------------------------------------------------------------------ */
/*  Posting Type Selector                                               */
/* ------------------------------------------------------------------ */

const POSTING_TYPE_OPTIONS: PostingTypeOption[] = [
  {
    value: "student_payment",
    label: "Record Student Payment",
    icon: <HugeiconsIcon icon={UserAccountIcon} className="h-5 w-5" />,
    description: "Record payment received from a student",
    devider: false,
  },
  {
    value: "new_income",
    label: "New Income",
    icon: <HugeiconsIcon icon={MoneyBagIcon} className="h-5 w-5" />,
    description: "Record non-student income received",
    devider: false,
  },
  {
    value: "new_expense",
    label: "New Expense",
    icon: <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5" />,
    description: "Record an expense or payment made",
    devider: false,
  },
  {
    value: "account_transfer",
    label: "Account Transfer",
    icon: <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="h-5 w-5" />,
    description: "Move funds between two bank accounts",
    devider: false,
  },
];

function getCurrentDateString() {
  return format(new Date(), "yyyy-MM-dd");
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function JournalEntriesPage() {
  const { data: entries = [], isLoading, error, refetch } = useJournalEntries();
  const [detailEntryId, setDetailEntryId] = useState<string | null>(null);
  const { data: detailEntry, isLoading: isDetailLoading } = useJournalEntryDetail(detailEntryId);
  const { update, updateLine, remove, postStudentPayment, postTransfer, postIncome, postExpense } = useJournalEntryMutations();
  const { data: ledgerAccounts = [] } = useLedgerAccounts();
  const [studentFinderOpen, setStudentFinderOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedType, setSelectedType] = useState<PostingType | null>(null);
  const [editEntry, setEditEntry] = useState<AccountingJournalEntryDto | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [deleteEntry, setDeleteEntry] = useState<AccountingJournalEntryDto | null>(null);
  const [postingOpen, setPostingOpen] = useState(false);
  const { data: editEntryDetail } = useJournalEntryDetail(editEntry?.id ?? null);
  const defaultEntryDate = getCurrentDateString();
  const { data: studentResults } = useStudents(
    {
      search: studentSearch || undefined,
      pageSize: 20,
    },
    { enabled: postingOpen && selectedType === "student_payment" }
  );

  /* Forms */
  const studentForm = useForm<StudentPaymentFormValues>({ resolver: zodResolver(studentPaymentSchema), defaultValues: { student_id: "", bank_account: "", payment_method: null, currency: "", amount: 0, entry_date: defaultEntryDate, description: "" } });
  const transferForm = useForm<AccountTransferFormValues>({ resolver: zodResolver(accountTransferSchema), defaultValues: { from_account: "", to_account: "", currency: "", amount: 0, entry_date: defaultEntryDate, description: "" } });
  const incomeForm = useForm<IncomeFormValues>({ resolver: zodResolver(incomeSchema), defaultValues: { bank_account: "", income_type: "", currency: "", amount: 0, payer: "", entry_date: defaultEntryDate, description: "" } });
  const expenseForm = useForm<ExpenseFormValues>({ resolver: zodResolver(expenseSchema), defaultValues: { bank_account: "", expense_type: "", currency: "", amount: 0, payee: "", entry_date: defaultEntryDate, description: "" } });

  /* Derived options */
  const hasLedgerAccounts = ledgerAccounts.length > 0;

  function openPostingForType(type: PostingType) {
    setSelectedType(type);
    setPostingOpen(true);
    const currentDate = getCurrentDateString();
    // Reset the appropriate form
    if (type === "student_payment") studentForm.reset({ student_id: "", bank_account: "", payment_method: null, currency: "", amount: 0, entry_date: currentDate, description: "" });
    else if (type === "new_income") incomeForm.reset({ bank_account: "", income_type: "", currency: "", amount: 0, payer: "", entry_date: currentDate, description: "" });
    else if (type === "new_expense") expenseForm.reset({ bank_account: "", expense_type: "", currency: "", amount: 0, payee: "", entry_date: currentDate, description: "" });
    else if (type === "account_transfer") transferForm.reset({ from_account: "", to_account: "", currency: "", amount: 0, entry_date: currentDate, description: "" });
  }

  const isPostingLoading =
    update.isPending ||
    updateLine.isPending ||
    remove.isPending ||
    postStudentPayment.isPending ||
    postTransfer.isPending ||
    postIncome.isPending ||
    postExpense.isPending;

  async function handlePost() {
    try {
      if (selectedType === "student_payment") {
        const valid = await studentForm.trigger();
        if (!valid) return;
        const v = studentForm.getValues();
        await postStudentPayment.mutateAsync({
          bank_account: v.bank_account,
          transaction_date: v.entry_date,
          reference_number: "",
          transaction_type: "",
          payment_method: v.payment_method ?? "",
          amount: v.amount,
          currency: v.currency,
          payer_payee: `Student ${v.student_id}`,
          description: v.description,
          source_reference: v.student_id,
        });
      } else if (selectedType === "new_income") {
        const valid = await incomeForm.trigger();
        if (!valid) return;
        const v = incomeForm.getValues();
        await postIncome.mutateAsync({
          bank_account: v.bank_account,
          transaction_date: v.entry_date,
          reference_number: "",
          transaction_type: v.income_type,
          payment_method: "",
          amount: v.amount,
          currency: v.currency,
          payer_payee: v.payer ?? "",
          description: v.description,
        });
      } else if (selectedType === "new_expense") {
        const valid = await expenseForm.trigger();
        if (!valid) return;
        const v = expenseForm.getValues();
        await postExpense.mutateAsync({
          bank_account: v.bank_account,
          transaction_date: v.entry_date,
          reference_number: "",
          transaction_type: v.expense_type,
          payment_method: "",
          amount: v.amount,
          currency: v.currency,
          payer_payee: v.payee ?? "",
          description: v.description,
        });
      } else if (selectedType === "account_transfer") {
        const valid = await transferForm.trigger();
        if (!valid) return;
        const v = transferForm.getValues();
        await postTransfer.mutateAsync({
          from_account: v.from_account,
          to_account: v.to_account,
          from_currency: v.currency,
          to_currency: v.currency,
          amount: v.amount,
          transfer_date: v.entry_date,
          description: v.description,
        });
      }
      showToast.success("Journal entry posted successfully");
      setPostingOpen(false);
    } catch (e) {
      showToast.error("Failed to post journal entry", getErrorMessage(e));
    }
  }

  async function handleUpdateEntry() {
    if (!editEntry) return;

    const nextAmount = Number(editAmount);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      showToast.error("Amount must be greater than 0");
      return;
    }

    const currentAmount = Number(editEntry.total_debit ?? editEntry.total_credit ?? 0);
    const amountChanged = Math.abs(nextAmount - currentAmount) > 0.0001;

    try {
      await update.mutateAsync({
        id: editEntry.id,
        payload: {
          posting_date: editEntry.posting_date,
          reference_number: editEntry.reference_number,
          source: editEntry.source,
          description: editEntry.description,
          status: editEntry.status,
          source_reference: editEntry.source_reference,
        },
      });

      if (amountChanged) {
        const detail = editEntryDetail as AccountingJournalEntryDetailDto | undefined;
        if (!detail?.lines?.length) {
          showToast.error("Unable to update amount lines right now. Please try again.");
          return;
        }

        await Promise.all(
          detail.lines
            .filter((line) => Number(line.debit_amount) > 0 || Number(line.credit_amount) > 0)
            .map((line) =>
              updateLine.mutateAsync({
                id: line.id,
                payload: {
                  amount: nextAmount,
                  base_amount: nextAmount,
                  debit_amount: Number(line.debit_amount) > 0 ? nextAmount : 0,
                  credit_amount: Number(line.credit_amount) > 0 ? nextAmount : 0,
                },
              })
            )
        );
      }

      showToast.success("Journal entry updated successfully");
      setEditEntry(null);
      setEditAmount("");
    } catch {
      showToast.error("Failed to update journal entry");
    }
  }

  async function handleDeleteEntry() {
    if (!deleteEntry) return;
    try {
      await remove.mutateAsync(deleteEntry.id);
      showToast.success("Journal entry deleted successfully");
      if (detailEntryId === deleteEntry.id) {
        setDetailEntryId(null);
      }
      setDeleteEntry(null);
    } catch {
      showToast.error("Failed to delete journal entry");
    }
  }

  async function handleStatusChange(entry: AccountingJournalEntryDto, status: JournalEntryStatus) {
    if (entry.status === status) return;
    try {
      await update.mutateAsync({
        id: entry.id,
        payload: {
          posting_date: entry.posting_date,
          reference_number: entry.reference_number,
          source: entry.source,
          description: entry.description,
          status,
          source_reference: entry.source_reference,
        },
      });
      showToast.success(`Journal entry marked as ${status}`);
    } catch (e) {
      showToast.error("Failed to update journal entry status", getErrorMessage(e));
    }
  }

  const postingTypeLabel = POSTING_TYPE_OPTIONS.find((o) => o.value === selectedType)?.label ?? "New Entry";

  return (
    <>
      <PageLayout
        title="Journal Entries"
        description="View and post accounting journal entries"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                icon={<HugeiconsIcon icon={PlusSignIcon} />}
                iconRight={<ChevronDown className="h-3 w-3" />}
                >
                New Entry
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {POSTING_TYPE_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => openPostingForType(opt.value)}
                  className="flex items-start gap-2"
                >
                  <span className="fmt-0.5 shrink-0 text-muted-foreground">{opt.icon}</span>
                  <span className="flex flex-col">
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
        skeleton={<AccountingTableSkeleton columns={5} />}
        loading={isLoading}
        error={error}
        refreshAction={refetch}
      >
        <JournalEntriesTable
          entries={entries}
          isLoading={isLoading}
          onRowClick={(entry) => setDetailEntryId(entry.id)}
          onEdit={(entry) => {
            setEditEntry(entry);
            setEditAmount(String(Number(entry.total_debit ?? entry.total_credit ?? 0)));
          }}
          onDelete={(entry) => setDeleteEntry(entry)}
          onStatusChange={(entry, status) => {
            void handleStatusChange(entry, status);
          }}
        />
      </PageLayout>

      <JournalEntryDetailSheet
        entry={detailEntry ?? null}
        open={Boolean(detailEntryId)}
        isLoading={isDetailLoading}
        onOpenChange={(open) => {
          if (!open) setDetailEntryId(null);
        }}
      />

      {/* Step 2: Posting Form */}
      <DialogBox
        open={Boolean(editEntry)}
        onOpenChange={(open) => {
          if (!open) {
            setEditEntry(null);
            setEditAmount("");
          }
        }}
        title="Edit Journal Entry"
        description="Update journal entry details"
        actionLabel="Save Changes"
        actionLoading={update.isPending}
        onAction={() => {
          void handleUpdateEntry();
        }}
      >
        {editEntry ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="journal-reference-number">Reference Number</Label>
              <Input
                id="journal-reference-number"
                value={editEntry.reference_number}
                onChange={(event) => setEditEntry({ ...editEntry, reference_number: event.target.value })}
                placeholder="Reference number"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="journal-posting-date">Posting Date</Label>
              <DatePicker
                value={editEntry.posting_date ? new Date(editEntry.posting_date) : undefined}
                onChange={(date) =>
                  setEditEntry({
                    ...editEntry,
                    posting_date: date ? format(date, "yyyy-MM-dd") : "",
                  })
                }
                placeholder="Select posting date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="journal-amount">Amount</Label>
              <NumericFormat
                id="journal-amount"
                customInput={Input}
                thousandSeparator="," 
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                value={editAmount}
                onValueChange={({ value }) => setEditAmount(value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="journal-source-reference">Source Reference</Label>
              <Input
                id="journal-source-reference"
                value={editEntry.source_reference || ""}
                onChange={(event) => setEditEntry({ ...editEntry, source_reference: event.target.value })}
                placeholder="Source reference"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="journal-description">Description</Label>
              <Textarea
                id="journal-description"
                value={editEntry.description}
                onChange={(event) => setEditEntry({ ...editEntry, description: event.target.value })}
                placeholder="Description"
              />
            </div>
          </div>
        ) : null}
      </DialogBox>

      <DialogBox
        open={Boolean(deleteEntry)}
        onOpenChange={(open) => {
          if (!open) setDeleteEntry(null);
        }}
        title="Delete Journal Entry"
        description="This action cannot be undone."
        actionLabel="Delete"
        actionVariant="destructive"
        actionLoading={remove.isPending}
        onAction={() => {
          void handleDeleteEntry();
        }}
      >
        {deleteEntry ? (
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-sm">
              Are you sure you want to delete journal entry
              <span className="mx-1 font-mono">{deleteEntry.reference_number}</span>?
            </p>
          </div>
        ) : null}
      </DialogBox>

      <DialogBox
        open={postingOpen}
        onOpenChange={(open) => {
          if (!open) setPostingOpen(false);
        }}
        title={postingTypeLabel}
        description={selectedType === "account_transfer" ? "Provide the account transfer details." : "Fill in the details to post this journal entry."}
        actionLabel={selectedType === "account_transfer" ? "Transfer Money" : "Submit Entry"}
        actionLoading={isPostingLoading}
        onAction={handlePost}
        showCloseButton={false}
      >
        {selectedType === "student_payment" && (
          <StudentPaymentForm
            form={studentForm}
            onOpenStudentFinder={() => setStudentFinderOpen(true)}
          />
        )}

        {selectedType === "new_income" && (
          <NewIncomeForm form={incomeForm} />
        )}

        {selectedType === "new_expense" && (
          <NewExpenseForm form={expenseForm} />
        )}

        {selectedType === "account_transfer" && (
          <AccountTransferForm form={transferForm} />
        )}
      </DialogBox>

      <DialogBox
        open={studentFinderOpen}
        onOpenChange={setStudentFinderOpen}
        title="Find Student"
        description="Search and select a student to fill Student ID."
        actionLabel="Close"
        onAction={() => setStudentFinderOpen(false)}
      >
        <div className="space-y-3">
          <Input
            placeholder="Search by name or ID"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          />
          <div className="max-h-72 overflow-y-auto rounded-md border">
            {(studentResults?.results ?? []).length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No students found.</div>
            ) : (
              <div className="divide-y">
                {(studentResults?.results ?? []).map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => {
                      studentForm.setValue("student_id", student.id_number, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setStudentFinderOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-accent"
                  >
                    <div className="text-sm font-medium">{student.full_name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{student.id_number}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogBox>
    </>
  );
}
