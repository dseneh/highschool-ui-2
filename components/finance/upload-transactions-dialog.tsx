"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectField } from "@/components/ui/select-field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type {
  BulkTransactionType,
  BulkTransactionRow,
  BulkTransactionCommand,
  TransactionTypeDto,
  PaymentMethodDto,
  BankAccountDto,
} from "@/lib/api2/finance-types";
import {
  Upload04Icon,
  Download04Icon,
  Delete02Icon,
  Cancel01Icon,
  SchoolIcon,
  ArrowDataTransferHorizontalIcon,
  Invoice02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { getErrorMessage } from "@/lib/utils";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  BulkUploadEditableCell,
  BulkUploadStepIndicator,
} from "@/components/shared/bulk-upload/preview-primitives";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = "setup" | "preview" | "uploading";

const STEPS: { key: Step; label: string; num: number }[] = [
  { key: "setup", label: "Setup", num: 1 },
  { key: "preview", label: "Review", num: 2 },
  { key: "uploading", label: "Upload", num: 3 },
];

interface ParsedRow {
  student_id: string;
  amount: string;
  reference: string;
  notes: string;
  status: string;
  date: string;
}

interface UploadTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionTypes: TransactionTypeDto[];
  paymentMethods: PaymentMethodDto[];
  bankAccounts: BankAccountDto[];
  onSubmit: (type: BulkTransactionType, payload: BulkTransactionCommand) => Promise<void> | void;
  submitting?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const STATUS_OPTIONS = [
  { value: "", label: "Keep from file" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "canceled", label: "Canceled" },
];

function normalizeHeader(header: string): string {
  const h = header.toLowerCase().trim().replace(/[^a-z0-9_]/g, "_");
  if (h === "student" || h === "student_id" || h === "studentid") return "student_id";
  if (h === "amount") return "amount";
  if (h === "reference" || h === "ref") return "reference";
  if (h === "notes" || h === "note") return "notes";
  if (h === "status") return "status";
  if (h === "date") return "date";
  return h;
}

function parseFile(data: ArrayBuffer): ParsedRow[] {
  const wb = XLSX.read(data, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, {
    defval: "",
  });

  return raw.map((row) => {
    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      mapped[normalizeHeader(key)] = String(value ?? "");
    }
    return {
      student_id: mapped.student_id ?? "",
      amount: mapped.amount ?? "",
      reference: mapped.reference ?? "",
      notes: mapped.notes ?? "",
      status: mapped.status ?? "",
      date: mapped.date ?? "",
    };
  });
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["student_id", "amount", "reference", "notes", "status", "date"],
    ["STU-001", "5000", "REF-001", "Payment note", "pending", "2025-01-15"],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  XLSX.writeFile(wb, "bulk_transactions_template.xlsx");
}

/* ------------------------------------------------------------------ */
/*  Mode cards config                                                  */
/* ------------------------------------------------------------------ */

const MODE_CARDS: {
  type: BulkTransactionType;
  title: string;
  description: string;
  icon: typeof SchoolIcon;
}[] = [
  {
    type: "TUITION",
    title: "Tuition Payments",
    description: "Bulk upload tuition payments linked to students.",
    icon: SchoolIcon,
  },
  {
    type: "ACCOUNT",
    title: "Account Transfers",
    description: "Bulk upload account transfer records.",
    icon: ArrowDataTransferHorizontalIcon,
  },
  {
    type: "GENERAL",
    title: "General Transactions",
    description: "Bulk upload general income or expense transactions.",
    icon: Invoice02Icon,
  },
];

const TRANSACTION_TYPE_OPTIONS = MODE_CARDS.map((card) => ({
  value: card.type,
  label: card.title,
}));

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function UploadTransactionsDialog({
  open,
  onOpenChange,
  transactionTypes,
  paymentMethods,
  bankAccounts,
  onSubmit,
  submitting,
}: UploadTransactionsDialogProps) {
  const [step, setStep] = React.useState<Step>("setup");
  const [mode, setMode] = React.useState<BulkTransactionType | null>(null);
  const [rows, setRows] = React.useState<ParsedRow[]>([]);
  const [fileName, setFileName] = React.useState("");

  // Header-level overrides
  const [headerAccount, setHeaderAccount] = React.useState("");
  const [headerMethod, setHeaderMethod] = React.useState("");
  const [headerType, setHeaderType] = React.useState("");
  const [headerStatus, setHeaderStatus] = React.useState("");
  const [overrideExisting, setOverrideExisting] = React.useState(false);

  const fileRef = React.useRef<HTMLInputElement>(null);

  const activeAccounts = bankAccounts.filter((a) => a.active);
  const activeMethods = paymentMethods.filter((m) => m.active);

  // Filter general types for general mode
  const generalTypes = transactionTypes.filter(
    (t) => !t.is_hidden && !["TUITION", "TRANSFER"].includes(t.type_code)
  );

  // Reset on open/close
  React.useEffect(() => {
    if (open) {
      setStep("setup");
      setMode(null);
      setRows([]);
      setFileName("");
      setHeaderAccount("");
      setHeaderMethod("");
      setHeaderType("");
      setHeaderStatus("");
      setOverrideExisting(false);
    }
  }, [open]);

  /* ---------- File handling ---------- */

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith(".csv")) {
      toast.error("Please upload an Excel (.xlsx, .xls) or CSV file");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File size must be under 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result as ArrayBuffer;
        const parsed = parseFile(data);
        if (parsed.length === 0) {
          toast.error("No data rows found in file");
          return;
        }
        setRows(parsed);
        setFileName(file.name);
        setStep("preview");
        toast.success(`Loaded ${parsed.length} rows from ${file.name}`);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset the input so the same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
      fileRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  /* ---------- Row editing ---------- */

  function updateRow(index: number, field: keyof ParsedRow, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  /* ---------- Submit ---------- */

  async function handleSubmit() {
    if (!mode) return;

    const transactions: BulkTransactionRow[] = rows.map((row) => ({
      student: row.student_id || undefined,
      amount: parseFloat(row.amount) || 0,
      reference: row.reference || undefined,
      notes: row.notes || undefined,
      status: headerStatus || row.status || undefined,
      date: row.date || undefined,
      payment_method: headerMethod || undefined,
      account: headerAccount || undefined,
      type: mode === "GENERAL" ? headerType || undefined : undefined,
    }));

    const payload: BulkTransactionCommand = {
      override_existing: overrideExisting,
      transactions,
    };

    setStep("uploading");
    try {
      await onSubmit(mode, payload);
    } catch {
      setStep("preview");
    }
  }

  const isValid = rows.length > 0 && headerAccount && headerMethod;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={step === "preview" ? "sm:max-w-6xl" : "sm:max-w-2xl"}>
        <DialogHeader>
          <DialogTitle>Upload Transactions</DialogTitle>
          <DialogDescription>
            Use the same bulk-upload workflow: setup, preview, and apply edits before upload.
          </DialogDescription>
        </DialogHeader>

        <BulkUploadStepIndicator step={step} steps={STEPS} />

        {step === "setup" && (
          <div className="flex flex-col gap-6 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Transaction Type</Label>
              <SelectField
                value={mode ?? ""}
                onValueChange={(value) => setMode((value as BulkTransactionType) ?? null)}
                items={TRANSACTION_TYPE_OPTIONS}
                placeholder="Select transaction type"
              />
            </div>

            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-10 transition-colors hover:border-primary/50 hover:bg-accent/30"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HugeiconsIcon icon={Upload04Icon} size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Drag & drop your file here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports .xlsx, .xls, .csv — max 5 MB</p>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
          </div>
        )}

        {step === "preview" && (
        <div className="flex flex-col gap-4 py-2">
          {/* Header overrides */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Apply to all rows
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="grid gap-1.5">
                <Label className="text-xs">Account *</Label>
                <Select
                  value={headerAccount}
                  onValueChange={(v) => setHeaderAccount(v ?? "")}
                  items={activeAccounts.map((a) => ({
                    value: a.id,
                    label: a.name,
                  }))}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select" />
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

              <div className="grid gap-1.5">
                <Label className="text-xs">Payment Method *</Label>
                <Select
                  value={headerMethod}
                  onValueChange={(v) => setHeaderMethod(v ?? "")}
                  items={activeMethods.map((m) => ({
                    value: m.id,
                    label: m.name,
                  }))}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select" />
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

              {mode === "GENERAL" && (
                <div className="grid gap-1.5">
                  <Label className="text-xs">Transaction Type</Label>
                  <Select
                    value={headerType}
                    onValueChange={(v) => setHeaderType(v ?? "")}
                    items={generalTypes.map((t) => ({
                      value: t.id,
                      label: t.name,
                    }))}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {generalTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={headerStatus}
                  onValueChange={(v) => setHeaderStatus(v ?? "")}
                  items={STATUS_OPTIONS.map((s) => ({
                    value: s.value,
                    label: s.label,
                  }))}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Keep from file" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value || "keep"} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Checkbox
                id="override"
                checked={overrideExisting}
                onCheckedChange={(v) => setOverrideExisting(Boolean(v))}
              />
              <Label htmlFor="override" className="text-xs cursor-pointer">
                Override existing transactions for matched students
              </Label>
            </div>
          </div>

          {/* File info bar */}
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Upload04Icon} size={14} />
              <span>{fileName}</span>
              <span className="text-muted-foreground/60">
                · {rows.length} rows
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<HugeiconsIcon icon={Cancel01Icon} size={12} />}
              onClick={() => {
                setRows([]);
                setFileName("");
                setStep("setup");
              }}
            >
              Change file
            </Button>
          </div>

          {/* Data table */}
          <div className="max-h-72 overflow-auto rounded-md border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium">#</th>
                  <th className="px-2 py-1.5 text-left font-medium">
                    Student ID
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium">Amount</th>
                  <th className="px-2 py-1.5 text-left font-medium">
                    Reference
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium">Notes</th>
                  <th className="px-2 py-1.5 text-left font-medium">Status</th>
                  <th className="px-2 py-1.5 text-left font-medium">Date</th>
                  <th className="px-2 py-1.5 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t hover:bg-muted/40">
                    <td className="px-2 py-1 text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="px-2 py-1">
                      <BulkUploadEditableCell
                        value={row.student_id}
                        onChange={(value) => updateRow(i, "student_id", value)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <BulkUploadEditableCell
                        value={row.amount}
                        onChange={(value) => updateRow(i, "amount", value)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <BulkUploadEditableCell
                        value={row.reference}
                        onChange={(value) => updateRow(i, "reference", value)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <BulkUploadEditableCell
                        value={row.notes}
                        onChange={(value) => updateRow(i, "notes", value)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <BulkUploadEditableCell
                        value={row.status}
                        onChange={(value) => updateRow(i, "status", value)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <BulkUploadEditableCell
                        value={row.date}
                        onChange={(value) => updateRow(i, "date", value)}
                      />
                    </td>
                    <td className="px-2 py-1 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeRow(i)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={12} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">
              All rows removed. Upload a new file to continue.
            </p>
          )}
        </div>
      )}

        {step === "uploading" && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm font-medium">Uploading transactions...</p>
            <p className="text-xs text-muted-foreground">Please wait while we process your file.</p>
          </div>
        )}

        <DialogFooter>
          {step === "setup" && (
            <>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                iconLeft={<HugeiconsIcon icon={Download04Icon} size={14} />}
              >
                Download Template
              </Button>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep("setup")}
                iconLeft={<ArrowLeft className="size-4" />}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={!isValid || Boolean(submitting)}
                loading={Boolean(submitting)}
                loadingText="Uploading"
              >
                Upload Transactions
              </Button>
            </>
          )}

          {step === "uploading" && (
            <Button variant="ghost" disabled>
              Processing...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
