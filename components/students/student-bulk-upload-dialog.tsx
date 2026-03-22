"use client";

import * as React from "react";
import {
  Upload,
  FileCheck,
  FileX,
  AlertCircle,
  CheckCircle2,
  X,
  Pencil,
  RefreshCw,
  TableIcon,
  Loader2,
  Trash2,
  Search,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BulkUploadEditableCell,
  BulkUploadStepIndicator,
} from "@/components/shared/bulk-upload/preview-primitives";
import { showToast } from "@/lib/toast";
import { getErrorMessage, cn } from "@/lib/utils";
import type { GradeLevelDto } from "@/lib/api2/grade-level-types";
import {
  useCancelStudentBulkUpload,
  useStartStudentBulkUpload,
  useStudentBulkUploadTask,
} from "@/hooks/use-student";
import { getQueryClient } from "@/lib/query-client";
import { GradeLevelSelect } from "../shared/data-reusable";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const PREVIEW_ROWS = 1000;
const REQUIRED_FIELDS = [
  "first_name",
  "last_name",
  "date_of_birth",
  "gender",
  "country",
  "enrolled_as",
] as const;
const VALID_GENDERS = new Set(["male", "female"]);
const VALID_ENROLLMENT_STATUS = new Set(["new", "returning", "transferred"]);
const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_SLASH_DASH_REGEX = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2}|\d{4})$/;
const DATE_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_VALIDATION_MESSAGES = 6;

type Step = "setup" | "preview" | "uploading";

interface StudentBulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradeLevels: GradeLevelDto[];
}

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

interface PreviewValidation {
  missingColumns: string[];
  errorCount: number;
  sampleErrors: string[];
}

// lightweight inline CSV helpers — no external dependency
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim()); current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSVText(text: string): ParsedData {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return headers.reduce<Record<string, string>>((obj, h, i) => {
      obj[h] = values[i] ?? "";
      return obj;
    }, {});
  });
  return { headers, rows };
}

function rowsToCSVText(headers: string[], rows: Record<string, string>[]): string {
  const esc = (v: string) =>
    v.includes(",") || v.includes('"') || v.includes("\n")
      ? `"${v.replace(/"/g, '""')}"`
      : v;
  return [
    headers.map(esc).join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h] ?? "")).join(",")),
  ].join("\n");
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function cleanValue(value: string | null | undefined): string {
  if (value == null) return "";
  const normalized = String(value).trim();
  return ["<na>", "nan", "null", "none"].includes(normalized.toLowerCase()) ? "" : normalized;
}

function isValidDateInput(rawValue: string): boolean {
  const value = cleanValue(rawValue);
  if (!value) return false;

  if (DATE_ISO_REGEX.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      Number.isFinite(year) &&
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  const slashMatch = value.match(DATE_SLASH_DASH_REGEX);
  if (slashMatch) {
    const first = Number(slashMatch[1]);
    const second = Number(slashMatch[2]);
    const yearToken = slashMatch[3];
    const year = yearToken.length === 2 ? 2000 + Number(yearToken) : Number(yearToken);

    const mmddDate = new Date(Date.UTC(year, first - 1, second));
    const isValidMmDd =
      first >= 1 &&
      first <= 12 &&
      second >= 1 &&
      second <= 31 &&
      mmddDate.getUTCFullYear() === year &&
      mmddDate.getUTCMonth() === first - 1 &&
      mmddDate.getUTCDate() === second;

    const ddmmDate = new Date(Date.UTC(year, second - 1, first));
    const isValidDdMm =
      second >= 1 &&
      second <= 12 &&
      first >= 1 &&
      first <= 31 &&
      ddmmDate.getUTCFullYear() === year &&
      ddmmDate.getUTCMonth() === second - 1 &&
      ddmmDate.getUTCDate() === first;

    return isValidMmDd || isValidDdMm;
  }

  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

function validatePreviewRows(headers: string[], rows: Record<string, string>[]): PreviewValidation {
  const missingColumns = REQUIRED_FIELDS.filter((field) => !headers.includes(field));
  const sampleErrors: string[] = [];
  let errorCount = 0;
  const dedupeMap = new Map<string, number[]>();

  const pushError = (message: string) => {
    errorCount += 1;
    if (sampleErrors.length < MAX_VALIDATION_MESSAGES) {
      sampleErrors.push(message);
    }
  };

  rows.forEach((row, rowIdx) => {
    const rowNumber = rowIdx + 2;

    REQUIRED_FIELDS.forEach((field) => {
      if (!cleanValue(row[field])) {
        pushError(`Row ${rowNumber}: ${field} is required`);
      }
    });

    const email = cleanValue(row.email);
    if (email && !SIMPLE_EMAIL_REGEX.test(email)) {
      pushError(`Row ${rowNumber}: Invalid email format`);
    }

    const gender = cleanValue(row.gender).toLowerCase();
    if (gender && !VALID_GENDERS.has(gender)) {
      pushError(`Row ${rowNumber}: gender must be male or female`);
    }

    const enrolledAs = cleanValue(row.enrolled_as).toLowerCase();
    if (enrolledAs && !VALID_ENROLLMENT_STATUS.has(enrolledAs)) {
      pushError(`Row ${rowNumber}: enrolled_as must be new, returning, or transferred`);
    }

    const dateOfBirth = cleanValue(row.date_of_birth);
    if (dateOfBirth && !isValidDateInput(dateOfBirth)) {
      pushError(`Row ${rowNumber}: Invalid date_of_birth`);
    }

    const entryDate = cleanValue(row.entry_date);
    if (entryDate && !isValidDateInput(entryDate)) {
      pushError(`Row ${rowNumber}: Invalid entry_date`);
    }

    const firstName = cleanValue(row.first_name).toLowerCase();
    const lastName = cleanValue(row.last_name).toLowerCase();
    const dob = cleanValue(row.date_of_birth);
    if (firstName && lastName && dob) {
      const key = `${firstName}|${lastName}|${dob}`;
      const occurrences = dedupeMap.get(key) ?? [];
      occurrences.push(rowNumber);
      dedupeMap.set(key, occurrences);
    }
  });

  dedupeMap.forEach((rowsForStudent, key) => {
    if (rowsForStudent.length > 1) {
      const [firstName, lastName, dateOfBirth] = key.split("|");
      pushError(
        `Duplicate student: ${firstName} ${lastName} (${dateOfBirth}) appears in rows ${rowsForStudent.join(", ")}`,
      );
    }
  });

  return { missingColumns, errorCount, sampleErrors };
}

const STEPS: { key: Step; label: string; num: number }[] = [
  { key: "setup", label: "Setup", num: 1 },
  { key: "preview", label: "Review", num: 2 },
  { key: "uploading", label: "Upload", num: 3 },
];

function StatusBadge({ status }: { status: string }) {
  type V = "default" | "warning" | "success" | "destructive" | "secondary";
  const map: Record<string, { label: string; variant: V }> = {
    pending: { label: "Queued", variant: "secondary" },
    processing: { label: "Processing", variant: "warning" },
    completed: { label: "Completed", variant: "success" },
    failed: { label: "Failed", variant: "destructive" },
    cancelled: { label: "Cancelled", variant: "secondary" },
  };
  const info = map[status] ?? { label: status, variant: "secondary" as V };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export function StudentBulkUploadDialog({
  open,
  onOpenChange,
  gradeLevels,
}: StudentBulkUploadDialogProps) {
  const queryClient = getQueryClient();
  const [step, setStep] = React.useState<Step>("setup");
  const [gradeLevelId, setGradeLevelId] = React.useState<string>("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fieldError, setFieldError] = React.useState<string>("");
  const [taskId, setTaskId] = React.useState<string>("");
  const [isDragging, setIsDragging] = React.useState(false);
  const [parsedData, setParsedData] = React.useState<ParsedData | null>(null);
  const [editableRows, setEditableRows] = React.useState<Record<string, string>[]>([]);
  const [previewSearch, setPreviewSearch] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const startUpload = useStartStudentBulkUpload();
  const cancelUpload = useCancelStudentBulkUpload();
  const taskQuery = useStudentBulkUploadTask(taskId || undefined, {
    enabled: open && Boolean(taskId),
  });
  const taskStatus = taskQuery.data?.status;
  const isTaskRunning = taskStatus === "pending" || taskStatus === "processing";
  const isUploadLocked = step === "uploading" && (startUpload.isPending || isTaskRunning);

  const resetDialog = React.useCallback(() => {
    setStep("setup");
    setGradeLevelId("");
    setSelectedFile(null);
    setFieldError("");
    setTaskId("");
    setIsDragging(false);
    setParsedData(null);
    setEditableRows([]);
    setPreviewSearch("");
  }, []);

  React.useEffect(() => {
    if (!open) resetDialog();
  }, [open, resetDialog]);

  React.useEffect(() => {
    if (!taskQuery.data) return;
    if (taskQuery.data.status === "completed") {
      const result = taskQuery.data.result;
      const created = result?.created ?? taskQuery.data.created ?? 0;
      const errors = result?.total_errors ?? taskQuery.data.total_errors ?? 0;
      showToast.success(
        "Import complete!",
        `Created ${created} students${errors > 0 ? ` ${errors} rows had errors` : "."}`,
      );
      queryClient.invalidateQueries({ queryKey: ["students"] });
      onOpenChange(false);
      return;
    }
    if (taskQuery.data.status === "failed")
      showToast.error("Import failed", taskQuery.data.error ?? "Background processing failed.");
    if (taskQuery.data.status === "cancelled")
      showToast.info("Import cancelled");
  }, [taskQuery.data, queryClient, onOpenChange]);

  const processFile = React.useCallback((file: File) => {
    setFieldError("");
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFieldError("Only CSV files are accepted.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setFieldError(`File is too large (${formatBytes(file.size)}). Max is 10 MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSVText(text);
      if (data.rows.length === 0 || data.headers.length === 0) {
        setFieldError("CSV appears empty — check the file and try again.");
        return;
      }
      if (data.rows.length > PREVIEW_ROWS) {
        setFieldError(`File has ${data.rows.length.toLocaleString()} rows. Maximum is ${PREVIEW_ROWS.toLocaleString()} rows per upload. Please split the file and try again.`);
        return;
      }
      setSelectedFile(file);
      setParsedData(data);
      setEditableRows(data.rows.map((r) => ({ ...r })));
      setFieldError("");
    };
    reader.onerror = () => setFieldError("Could not read the file. Try again.");
    reader.readAsText(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const totalRows = editableRows.length;
  const previewRows = editableRows.slice(0, PREVIEW_ROWS);

  const filteredPreviewRows = React.useMemo(() => {
    if (!previewSearch.trim()) return previewRows.map((row, idx) => ({ row, originalIdx: idx }));
    const query = previewSearch.toLowerCase();
    return previewRows
      .map((row, idx) => ({ row, originalIdx: idx }))
      .filter(({ row }) =>
        Object.values(row).some((val) =>
          String(val ?? "").toLowerCase().includes(query)
        )
      );
  }, [previewRows, previewSearch]);

  const previewValidation = React.useMemo(
    () => (parsedData ? validatePreviewRows(parsedData.headers, editableRows) : null),
    [parsedData, editableRows],
  );
  const hasPreviewValidationErrors =
    Boolean(previewValidation) &&
    (previewValidation!.missingColumns.length > 0 || previewValidation!.errorCount > 0);

  const updateCell = (filteredIdx: number, header: string, value: string) => {
    const originalIdx = filteredPreviewRows[filteredIdx]?.originalIdx;
    if (originalIdx === undefined) return;
    setEditableRows((prev) => {
      const next = [...prev];
      next[originalIdx] = { ...next[originalIdx], [header]: value };
      return next;
    });
  };

  const deleteRow = (originalIdx: number) => {
    setEditableRows((prev) => prev.filter((_, idx) => idx !== originalIdx));
  };

  const goToPreview = () => {
    if (!gradeLevelId) { setFieldError("Please select a grade level."); return; }
    if (!selectedFile || !parsedData) { setFieldError("Please upload a CSV file."); return; }
    setFieldError("");
    setStep("preview");
  };

  const handleUpload = async () => {
    if (!selectedFile || !parsedData || !gradeLevelId) return;
    if (editableRows.length === 0) {
      setFieldError("Add at least one row before uploading.");
      return;
    }
    if (previewValidation && (previewValidation.missingColumns.length > 0 || previewValidation.errorCount > 0)) {
      setFieldError("Please fix validation issues in the preview before uploading.");
      return;
    }
    setFieldError("");
    const csvText = rowsToCSVText(parsedData.headers, editableRows);
    const uploadFile = new File(
      [new Blob([csvText], { type: "text/csv" })],
      selectedFile.name,
      { type: "text/csv" },
    );
    setStep("uploading");
    try {
      const response = await startUpload.mutateAsync({ gradeLevelId, file: uploadFile });
      if (response.task_id) { setTaskId(response.task_id); return; }
      const created = response.created ?? 0;
      const totalErrors = response.total_errors ?? 0;
      showToast.success(
        "Import complete!",
        `Created ${created} students${totalErrors > 0 ? ` ${totalErrors} rows had errors` : "."}`,
      );
      queryClient.invalidateQueries({ queryKey: ["students"] });
      onOpenChange(false);
    } catch (error) {
      setFieldError(getErrorMessage(error));
      setStep("preview");
    }
  };

  const handleCancelTask = async () => {
    if (!taskId) return;
    try {
      await cancelUpload.mutateAsync({ taskId });
    } catch (error) {
      showToast.error("Cancel failed", getErrorMessage(error));
    }
  };

  const selectedGrade = gradeLevels.find((g) => g.id === gradeLevelId);

  return (
    <Dialog 
    open={open} 
    onOpenChange={(nextOpen) => {
      if (!nextOpen && isUploadLocked) return;
      onOpenChange(nextOpen);
    }}
    >
      <DialogContent 
      showCloseButton={!startUpload.isPending} 
      className="flex h-full max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 md:max-w-[72vw]"
      
      >
        {/* Header + step indicator */}
        <div className="shrink-0 border-b px-6 pb-4 pt-5 space-y-3">
          <DialogHeader>
            <DialogTitle className="text-lg">Bulk Upload Students</DialogTitle>
            <DialogDescription className="text-sm">
              {step === "setup" && "Select a grade level and upload a CSV file to get started."}
              {step === "preview" && "Review and edit the first rows before sending to the server."}
              {step === "uploading" && "Your import is being processed in the background."}
            </DialogDescription>
          </DialogHeader>
          <BulkUploadStepIndicator step={step} steps={STEPS} />
        </div>

        {/* Scrollable body */}
        {step === "preview" ? (
          <div className="min-h-0 flex-1 overflow-hidden p-3">
            <div className="flex h-full min-h-0 flex-col gap-2">
            {/* ── STEP 2: Preview / Edit ── */}
            {parsedData && (
              <>
                {/* File summary bar */}
                <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                  <FileCheck className="size-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{selectedFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalRows.toLocaleString()} rows · {parsedData.headers.length} columns
                      {selectedGrade && (
                        <> · <span className="font-medium">{selectedGrade.name}</span></>
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<RefreshCw />}
                    onClick={() => { setStep("setup"); setFieldError(""); }}
                  >
                    Change file
                  </Button>
                </div>

                {/* Edit hint */}
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  <Pencil className="mt-0.5 size-4 shrink-0" />
                  <p>
                    <span className="font-semibold">Click any cell to edit</span>, use the search bar to
                    filter, and remove rows you do not want to import.
                  </p>
                </div>

                {/* Search bar */}
                {/* <div className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-muted/20">
                  <Search className="size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search rows..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm placeholder-muted-foreground focus:outline-none"
                  />
                  {previewSearch && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setPreviewSearch("")}
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div> */}

                {previewValidation && (previewValidation.missingColumns.length > 0 || previewValidation.errorCount > 0) && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <div className="space-y-1.5">
                        <p className="font-medium">
                          Found {previewValidation.errorCount} validation issue{previewValidation.errorCount === 1 ? "" : "s"}
                          {previewValidation.missingColumns.length > 0 ? ` and ${previewValidation.missingColumns.length} missing required column${previewValidation.missingColumns.length === 1 ? "" : "s"}` : ""}.
                        </p>
                        {previewValidation.missingColumns.length > 0 && (
                          <p>
                            Missing columns: {previewValidation.missingColumns.join(", ")}
                          </p>
                        )}
                        {previewValidation.sampleErrors.length > 0 && (
                          <div className="space-y-1 text-xs">
                            {previewValidation.sampleErrors.map((error) => (
                              <p key={error}>- {error}</p>
                            ))}
                            {previewValidation.errorCount > previewValidation.sampleErrors.length && (
                              <p>...and {previewValidation.errorCount - previewValidation.sampleErrors.length} more.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Editable table */}
                <div className="min-h-0 flex flex-1 flex-col rounded-lg border overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 bg-muted/40 shrink-0">
                  <div className="flex items-center gap-2 ">
                    <TableIcon className="size-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Preview {filteredPreviewRows.length > 0
                        ? `showing ${filteredPreviewRows.length} of ${Math.min(PREVIEW_ROWS, totalRows)}`
                        : "no matches"}{" "}
                      {previewSearch ? "(filtered)" : `of ${totalRows.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 h-7 rounded-lg border px-3 py-2 bg-muted /20">
                  <Search className="size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search rows..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="flex-1 bg-transparent text-xs placeholder-muted-foreground focus:outline-none"
                  />
                  {previewSearch && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setPreviewSearch("")}
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="w-10 px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                            #
                          </th>
                          <th className="w-12 px-2 py-2 text-center text-xs font-semibold text-muted-foreground">
                            
                          </th>
                          {parsedData.headers.map((h) => (
                            <th
                              key={h}
                              className="py-2 pr-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPreviewRows.length === 0 && previewSearch ? (
                          <tr>
                            <td colSpan={parsedData.headers.length + 2} className="px-4 py-4 text-center text-sm text-muted-foreground">
                              No rows match your search
                            </td>
                          </tr>
                        ) : filteredPreviewRows.length === 0 ? (
                          <tr>
                            <td colSpan={parsedData.headers.length + 2} className="px-4 py-4 text-center text-sm text-muted-foreground">
                              No rows remaining. Add rows in the CSV and re-upload, or go back and choose another file.
                            </td>
                          </tr>
                        ) : (
                          filteredPreviewRows.map(({ row, originalIdx }, filteredIdx) => (
                            <tr
                              key={originalIdx}
                              className="border-b last:border-0 hover:bg-muted /90 transition-colors"
                            >
                              <td className=" px-3 py-1.5 text-xs text-muted-foreground select-none">
                                {originalIdx + 1}
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  icon={<Trash2 className="size-3.5 text-destructive" />}
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => deleteRow(originalIdx)}
                                  tooltip="Delete row"
                                />
                              </td>
                              {parsedData.headers.map((h) => (
                                <td key={h} className="py-1 pr-2 max-w-45  hover:bg-accent/60">
                                  <BulkUploadEditableCell
                                    value={row[h] ?? ""}
                                    onChange={(v) => updateCell(filteredIdx, h, v)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {totalRows > PREVIEW_ROWS && !previewSearch && (
                    <div className="border-t px-4 py-2.5 text-xs text-muted-foreground bg-muted/20">
                      +{(totalRows - PREVIEW_ROWS).toLocaleString()} more rows will be uploaded unchanged
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Error banner */}
            {fieldError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <FileX className="size-4 shrink-0" />
                <span className="flex-1">{fieldError}</span>
                <button
                  type="button"
                  className="shrink-0 opacity-60 hover:opacity-100"
                  onClick={() => setFieldError("")}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
            </div>
          </div>
        ) : (
          <ScrollArea className="min-h-0 flex-1">
            <div className="p-6 space-y-5">

            {/* ── STEP 1: Setup ── */}
            {step === "setup" && (
              <>
                {/* <div className="space-y-2">
                  <label className="text-sm font-medium">Grade Level</label>
                  <Select
                    value={gradeLevelId || undefined}
                    onValueChange={(v) => { setGradeLevelId(v ?? ""); setFieldError(""); }}
                  >
                    <SelectTrigger className="w-full sm:w-72">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevels.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
                <GradeLevelSelect
                    useUrlState={false}
                    value={gradeLevelId}
                    onChange={(value) => {
                    setGradeLevelId(value);
                    }}
                    placeholder="Select grade level"
                    selectClassName="w-full md:w-xs"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">CSV File</label>
                  <div
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-8 py-10 text-center transition-all cursor-pointer",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : selectedFile
                        ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/20"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileInputChange}
                    />

                    {selectedFile ? (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                          <FileCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatBytes(selectedFile.size)}
                            {" · "}
                            <span className="font-medium text-foreground">
                              {parsedData?.rows.length.toLocaleString()} rows
                            </span>
                            {" · "}
                            {parsedData?.headers.length} columns
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          icon={<RefreshCw />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setParsedData(null);
                            setEditableRows([]);
                            setFieldError("");
                          }}
                        >
                          Change file
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Upload className="size-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {isDragging ? "Drop it here!" : "Drop CSV here or click to browse"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            CSV only · max 10 MB · large files processed in the background
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: Uploading ── */}
            {step === "uploading" && (
              <div className="space-y-6 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isTaskRunning ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : taskStatus === "completed" ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="size-4 text-destructive" />
                    )}
                    <span className="text-sm font-medium">
                      {isTaskRunning ? "Importing students" : "Import finished"}
                    </span>
                  </div>
                  {taskQuery.data && <StatusBadge status={taskQuery.data.status} />}
                </div>

                {startUpload.isPending && !taskId && (
                  <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-sm">Uploading file, please wait...</p>
                  </div>
                )}

                {taskQuery.data && (
                  <div className="space-y-3 rounded-xl border bg-muted/20 p-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold tabular-nums">
                        {taskQuery.data.progress ?? 0}%
                      </span>
                    </div>
                    <Progress value={taskQuery.data.progress ?? 0} className="h-2.5 rounded-full" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {(taskQuery.data.total_processed ?? 0).toLocaleString()} /{" "}
                        {(taskQuery.data.estimated_count ?? 0).toLocaleString()} rows processed
                      </span>
                      {(taskQuery.data.created ?? 0) > 0 && (
                        <Badge variant="success">{taskQuery.data.created} created</Badge>
                      )}
                    </div>
                    {taskQuery.data.total_errors > 0 && (
                      <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        <AlertCircle className="size-3.5 shrink-0" />
                        {taskQuery.data.total_errors} rows had validation errors
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm text-muted-foreground">
                  <FileCheck className="size-4 shrink-0 text-emerald-600" />
                  <span>
                    {selectedFile?.name} · {totalRows.toLocaleString()} rows · {selectedGrade?.name}
                  </span>
                </div>
              </div>
            )}

            {/* Error banner */}
            {fieldError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <FileX className="size-4 shrink-0" />
                <span className="flex-1">{fieldError}</span>
                <button
                  type="button"
                  className="shrink-0 opacity-60 hover:opacity-100"
                  onClick={() => setFieldError("")}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </ScrollArea>
        )}

        {/* Footer */}
        <DialogFooter className="flex shrink-0 border-t px-3 py-4 sm:justify-between">
            <div className="flex w-full items-center gap-1 justify-between">

           
          <div>
            {step === "preview" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setStep("setup"); setFieldError(""); }}
                icon={<ArrowLeft />}
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step === "uploading" && isTaskRunning ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancelTask}
                loading={cancelUpload.isPending}
                loadingText="Cancelling"
              >
                Cancel Import
              </Button>
            ) : step === "uploading" ? (
              <Button 
              type="button" 
              variant="outline" onClick={() => onOpenChange(false)}
              disabled={startUpload.isPending}
              >
                Close
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                {step === "setup" && (
                  <Button
                    type="button"
                    onClick={goToPreview}
                    disabled={!gradeLevelId || !selectedFile}
                    iconRight={<ArrowRight />}
                  >
                    Preview Data
                  </Button>
                )}
                {step === "preview" && (
                  <Button
                    type="button"
                    onClick={handleUpload}
                    loading={startUpload.isPending}
                    loadingText="Starting import"
                    icon={<Upload />}
                    disabled={hasPreviewValidationErrors || editableRows.length === 0}
                  >
                    Upload {totalRows === 1 ? "1 row" : `${totalRows.toLocaleString()} rows`}
                  </Button>
                )}
              </>
            )}
          </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
