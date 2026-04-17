"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Download,
  FileCheck,
  FileX,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogBox } from "@/components/ui/dialog-box";
import { showToast } from "@/lib/toast";
import { cn, getErrorMessage } from "@/lib/utils";
import { useEmployee } from "@/lib/api2/employee";
import {
  BulkUploadEditableCell,
  BulkUploadStepIndicator,
} from "@/components/shared/bulk-upload/preview-primitives";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const PREVIEW_ROWS = 1000;
const MAX_VALIDATION_MESSAGES = 8;

const REQUIRED_HEADERS = [
  "id_number",
  "first_name",
  "last_name",
  "date_of_birth",
  "gender",
  "email",
  "phone_number",
  "hire_date",
  "is_teacher",
] as const;

const TEMPLATE_HEADERS = [
  "id_number",
  "first_name",
  "last_name",
  "middle_name",
  "date_of_birth",
  "email",
  "phone_number",
  "gender",
  "hire_date",
  "employment_status",
  "is_teacher",
  "address",
  "city",
  "state",
  "postal_code",
  "country",
  "place_of_birth",
] as const;

type Step = "setup" | "preview" | "uploading";

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

interface PreviewValidation {
  missingColumns: string[];
  errorCount: number;
  sampleErrors: string[];
}

interface UploadIssue {
  row: number;
  staffId: string;
  message: string;
}

interface UploadReport {
  totalRows: number;
  createdCount: number;
  failedCount: number;
  errors: UploadIssue[];
}

interface StaffBulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const STEPS: { key: Step; label: string; num: number }[] = [
  { key: "setup", label: "Setup", num: 1 },
  { key: "preview", label: "Review", num: 2 },
  { key: "uploading", label: "Upload", num: 3 },
];

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current.trim());
  return result;
}

function parseCSVText(text: string): ParsedData {
  const normalizedText = text.replace(/^\uFEFF/, "");
  const lines = normalizedText.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length < 2) {
    return { headers: [], rows: [] };
  }

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? "";
      return acc;
    }, {});
  });

  return { headers, rows };
}

function parseSpreadsheetRows(file: File): Promise<(string | number | boolean | null)[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const workbook = XLSX.read(reader.result, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) {
          reject(new Error("Workbook has no sheets."));
          return;
        }
        const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(firstSheet, {
          header: 1,
          raw: false,
          defval: "",
        });
        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsArrayBuffer(file);
  });
}

async function parseUploadFile(file: File): Promise<ParsedData> {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".csv")) {
    const text = await file.text();
    return parseCSVText(text);
  }

  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    const sheetRows = await parseSpreadsheetRows(file);
    if (sheetRows.length < 2) {
      return { headers: [], rows: [] };
    }

    const headers = (sheetRows[0] ?? []).map((cell) => String(cell ?? "").trim());
    const rows = sheetRows.slice(1).map((row) => {
      return headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = String(row[index] ?? "").trim();
        return acc;
      }, {});
    }).filter((row) => Object.values(row).some((value) => value.length > 0));

    return { headers, rows };
  }

  throw new Error("Only CSV, XLSX, or XLS files are accepted.");
}

function rowsToCSVText(headers: string[], rows: Record<string, string>[]): string {
  const escapeValue = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return [
    headers.map(escapeValue).join(","),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header] ?? "")).join(",")),
  ].join("\n");
}

function getTemplateSampleRecords(): Record<string, string>[] {
  return [
    {
      id_number: "EMP-001",
      first_name: "Jane",
      last_name: "Doe",
      middle_name: "",
      date_of_birth: "1990-05-12",
      email: "jane.doe@school.com",
      phone_number: "+1234567890",
      gender: "female",
      hire_date: "2025-09-01",
      employment_status: "active",
      is_teacher: "yes",
      address: "12 Cedar Avenue",
      city: "Kampala",
      state: "Central",
      postal_code: "256",
      country: "Uganda",
      place_of_birth: "Kampala",
    },
    {
      id_number: "EMP-002",
      first_name: "John",
      last_name: "Smith",
      middle_name: "",
      date_of_birth: "1988-11-03",
      email: "john.smith@school.com",
      phone_number: "+1234567891",
      gender: "male",
      hire_date: "2025-09-01",
      employment_status: "active",
      is_teacher: "no",
      address: "44 Palm Street",
      city: "Entebbe",
      state: "Central",
      postal_code: "257",
      country: "Uganda",
      place_of_birth: "Gulu",
    },
  ];
}

function downloadStaffCSVTemplate() {
  const csv = rowsToCSVText([...TEMPLATE_HEADERS], getTemplateSampleRecords());

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "staff_upload_template.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function downloadStaffExcelTemplate() {
  const sampleRecords = getTemplateSampleRecords();
  const sampleRows = sampleRecords.map((record) =>
    TEMPLATE_HEADERS.map((header) => record[header] ?? "")
  );
  const worksheetData = [[...TEMPLATE_HEADERS], ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Upload");
  XLSX.writeFile(workbook, "staff_upload_template.xlsx");
}

function cleanCellValue(value: string | undefined): string {
  return (value ?? "").trim();
}

function normalizeIdNumber(value: string | undefined): string {
  return cleanCellValue(value);
}

function parseTeacherFlag(value: string): boolean | null {
  const normalized = cleanCellValue(value).toLowerCase();
  if (!normalized) return null;

  if (["true", "yes", "1", "y"].includes(normalized)) return true;
  if (["false", "no", "0", "n"].includes(normalized)) return false;

  return null;
}

function isValidDate(value: string): boolean {
  const normalized = cleanCellValue(value);
  if (!normalized) return false;

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!isoMatch) return false;

  const year = Number(isoMatch[1]);
  const month = Number(isoMatch[2]);
  const day = Number(isoMatch[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    Number.isFinite(year) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isReasonableBirthDate(value: string): boolean {
  const normalized = cleanCellValue(value);
  if (!isValidDate(normalized)) return false;

  const dob = new Date(`${normalized}T00:00:00Z`);
  const today = new Date();
  if (dob > today) return false;

  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dob.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }

  return age >= 16 && age <= 100;
}

function validatePreviewRows(headers: string[], rows: Record<string, string>[]): PreviewValidation {
  const missingColumns = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  const sampleErrors: string[] = [];
  const idTracker = new Set<string>();
  let errorCount = 0;

  const pushError = (message: string) => {
    errorCount += 1;
    if (sampleErrors.length < MAX_VALIDATION_MESSAGES) {
      sampleErrors.push(message);
    }
  };

  rows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2;

    REQUIRED_HEADERS.forEach((header) => {
      if (!cleanCellValue(row[header])) {
        pushError(`Row ${rowNumber}: ${header} is required`);
      }
    });

    const staffId = normalizeIdNumber(row.id_number);
    if (staffId) {
      const key = staffId.toLowerCase();
      if (idTracker.has(key)) {
        pushError(`Row ${rowNumber}: duplicate id_number '${staffId}' in file`);
      }
      idTracker.add(key);

      if (/^\d+(?:\.\d+)?e[+-]?\d+$/i.test(staffId)) {
        pushError(
          `Row ${rowNumber}: id_number looks like scientific notation. Format id_number as text in Excel.`
        );
      }
    }

    const gender = cleanCellValue(row.gender).toLowerCase();
    if (gender && gender !== "male" && gender !== "female") {
      pushError(`Row ${rowNumber}: gender must be male or female`);
    }

    const hireDate = cleanCellValue(row.hire_date);
    if (hireDate && !isValidDate(hireDate)) {
      pushError(`Row ${rowNumber}: hire_date must be YYYY-MM-DD`);
    }

    const dob = cleanCellValue(row.date_of_birth);
    if (dob && !isValidDate(dob)) {
      pushError(`Row ${rowNumber}: date_of_birth must be YYYY-MM-DD`);
    } else if (dob && !isReasonableBirthDate(dob)) {
      pushError(`Row ${rowNumber}: date_of_birth must be a valid age between 16 and 100`);
    }

    const teacherFlag = parseTeacherFlag(row.is_teacher);
    if (teacherFlag === null) {
      pushError(`Row ${rowNumber}: is_teacher must be yes/no, true/false, or 1/0`);
    }

    const email = cleanCellValue(row.email);
    if (!email) {
      pushError(`Row ${rowNumber}: email is required`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      pushError(`Row ${rowNumber}: invalid email format`);
    }

    const phoneNumber = cleanCellValue(row.phone_number);
    if (!phoneNumber) {
      pushError(`Row ${rowNumber}: phone_number is required`);
    }
  });

  return {
    missingColumns,
    errorCount,
    sampleErrors,
  };
}

function buildCreatePayload(row: Record<string, string>) {
  const payload: Record<string, string | boolean> = {
    id_number: normalizeIdNumber(row.id_number),
    first_name: cleanCellValue(row.first_name),
    last_name: cleanCellValue(row.last_name),
    date_of_birth: cleanCellValue(row.date_of_birth),
    gender: cleanCellValue(row.gender).toLowerCase(),
    email: cleanCellValue(row.email),
    phone_number: cleanCellValue(row.phone_number),
    hire_date: cleanCellValue(row.hire_date),
    is_teacher: parseTeacherFlag(row.is_teacher) ?? false,
  };

  const optionalKeys: Array<keyof Record<string, string>> = [
    "middle_name",
    "employment_status",
    "address",
    "city",
    "state",
    "postal_code",
    "country",
    "place_of_birth",
  ];

  optionalKeys.forEach((key) => {
    const value = cleanCellValue(row[key]);
    if (value) {
      payload[key] = value;
    }
  });

  return payload;
}

export function StaffBulkUploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: StaffBulkUploadDialogProps) {
  const employeeApi = useEmployee();
  const createStaffMutation = employeeApi.createEmployee();

  const [step, setStep] = React.useState<Step>("setup");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fieldError, setFieldError] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);
  const [parsedData, setParsedData] = React.useState<ParsedData | null>(null);
  const [editableRows, setEditableRows] = React.useState<Record<string, string>[]>([]);
  const [previewSearch, setPreviewSearch] = React.useState("");
  const [reportOpen, setReportOpen] = React.useState(false);
  const [uploadReport, setUploadReport] = React.useState<UploadReport | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetDialog = React.useCallback(() => {
    setStep("setup");
    setSelectedFile(null);
    setFieldError("");
    setIsDragging(false);
    setParsedData(null);
    setEditableRows([]);
    setPreviewSearch("");
    setReportOpen(false);
    setUploadReport(null);
  }, []);

  React.useEffect(() => {
    if (!open) {
      resetDialog();
    }
  }, [open, resetDialog]);

  const processFile = React.useCallback((file: File) => {
    setFieldError("");

    const lowerName = file.name.toLowerCase();
    if (!(lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls"))) {
      setFieldError("Only CSV, XLSX, or XLS files are accepted.");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setFieldError(`File is too large (${formatBytes(file.size)}). Max is 10 MB.`);
      return;
    }

    parseUploadFile(file)
      .then((data) => {

        if (data.rows.length === 0 || data.headers.length === 0) {
          setFieldError("File appears empty. Check the file and try again.");
          return;
        }

        if (data.rows.length > PREVIEW_ROWS) {
          setFieldError(
            `File has ${data.rows.length.toLocaleString()} rows. Maximum is ${PREVIEW_ROWS.toLocaleString()} rows per upload.`
          );
          return;
        }

        setSelectedFile(file);
        setParsedData(data);
        setEditableRows(data.rows.map((row) => ({ ...row })));
      })
      .catch((error) => {
        setFieldError(getErrorMessage(error));
      });
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const totalRows = editableRows.length;
  const previewRows = editableRows.slice(0, PREVIEW_ROWS);

  const filteredPreviewRows = React.useMemo(() => {
    if (!previewSearch.trim()) {
      return previewRows.map((row, index) => ({ row, originalIdx: index }));
    }

    const query = previewSearch.toLowerCase();
    return previewRows
      .map((row, index) => ({ row, originalIdx: index }))
      .filter(({ row }) =>
        Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(query))
      );
  }, [previewRows, previewSearch]);

  const previewValidation = React.useMemo(() => {
    if (!parsedData) return null;
    return validatePreviewRows(parsedData.headers, editableRows);
  }, [parsedData, editableRows]);

  const hasValidationErrors = Boolean(
    previewValidation &&
      (previewValidation.missingColumns.length > 0 || previewValidation.errorCount > 0)
  );

  const updateCell = (filteredIndex: number, header: string, value: string) => {
    const originalIndex = filteredPreviewRows[filteredIndex]?.originalIdx;
    if (originalIndex === undefined) return;

    setEditableRows((previous) => {
      const next = [...previous];
      next[originalIndex] = { ...next[originalIndex], [header]: value };
      return next;
    });
  };

  const deleteRow = (originalIndex: number) => {
    setEditableRows((previous) => previous.filter((_, index) => index !== originalIndex));
  };

  const handleUpload = async () => {
    if (!parsedData || !selectedFile) {
      setFieldError("Please upload a CSV or Excel file first.");
      return;
    }

    if (editableRows.length === 0) {
      setFieldError("Add at least one row before uploading.");
      return;
    }

    if (hasValidationErrors) {
      setFieldError("Please fix validation issues before uploading.");
      return;
    }

    setFieldError("");
    setStep("uploading");

    let createdCount = 0;
    const errors: UploadIssue[] = [];

    for (let index = 0; index < editableRows.length; index += 1) {
      const row = editableRows[index];
      const rowNumber = index + 2;
      const staffId = cleanCellValue(row.id_number) || `row-${rowNumber}`;

      try {
        const payload = buildCreatePayload(row);
        await createStaffMutation.mutateAsync(payload);
        createdCount += 1;
      } catch (error) {
        errors.push({
          row: rowNumber,
          staffId,
          message: getErrorMessage(error),
        });
      }
    }

    const failedCount = errors.length;
    const report: UploadReport = {
      totalRows: editableRows.length,
      createdCount,
      failedCount,
      errors,
    };

    setUploadReport(report);
    setStep("preview");

    if (createdCount > 0) {
      onSuccess?.();
    }

    if (failedCount > 0) {
      setReportOpen(true);
      showToast.warning(
        "Upload completed with errors",
        `${createdCount} created, ${failedCount} failed. Review the report.`
      );
      return;
    }

    setReportOpen(false);
    showToast.success("Staff uploaded successfully", `${createdCount} staff records were created.`);
    onOpenChange(false);
  };

  const isUploading = step === "uploading" && createStaffMutation.isPending;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && isUploading) return;
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent
          showCloseButton={!isUploading}
          className="flex h-full max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 md:max-w-[72vw]"
        >
          <div className="shrink-0 space-y-3 border-b px-6 pb-4 pt-5">
            <DialogHeader>
              <DialogTitle className="text-lg">Bulk Upload Staff</DialogTitle>
              <DialogDescription className="text-sm">
                {step === "setup" && "Upload an Excel (.xlsx) or CSV file to begin staff import."}
                {step === "preview" && "Review and edit rows before importing."}
                {step === "uploading" && "Creating staff records, please wait..."}
              </DialogDescription>
            </DialogHeader>
            <BulkUploadStepIndicator step={step} steps={STEPS} showCheckOnComplete={false} />
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
            {step === "setup" && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/25 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Use the staff upload template (Excel recommended)</p>
                      <p className="text-xs text-muted-foreground">
                        Required columns: {REQUIRED_HEADERS.join(", ")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={<Download />}
                        onClick={downloadStaffExcelTemplate}
                      >
                        Download Excel
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={<Download />}
                        onClick={downloadStaffCSVTemplate}
                      >
                        Download CSV
                      </Button>
                    </div>
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-8 py-10 text-center transition-all",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : selectedFile
                        ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/20"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="sr-only"
                    onChange={handleFileInputChange}
                  />

                  {selectedFile && parsedData ? (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                        <FileCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          {selectedFile.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatBytes(selectedFile.size)} · {parsedData.rows.length.toLocaleString()} rows · {parsedData.headers.length} columns
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
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
                          {isDragging ? "Drop file here" : "Drop Excel/CSV file here or click to browse"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Excel (.xlsx) or CSV · max 10 MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {step === "preview" && parsedData && (
              <div className="flex h-full min-h-0 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                  <FileCheck className="size-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{selectedFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalRows.toLocaleString()} rows · {parsedData.headers.length} columns
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStep("setup");
                      setFieldError("");
                    }}
                  >
                    Change file
                  </Button>
                </div>

                {previewValidation &&
                  (previewValidation.missingColumns.length > 0 || previewValidation.errorCount > 0) && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <div className="space-y-1.5">
                          <p className="font-medium">
                            Found {previewValidation.errorCount} validation issue
                            {previewValidation.errorCount === 1 ? "" : "s"}
                            {previewValidation.missingColumns.length > 0
                              ? ` and ${previewValidation.missingColumns.length} missing required column${previewValidation.missingColumns.length === 1 ? "" : "s"}`
                              : ""}
                            .
                          </p>
                          {previewValidation.missingColumns.length > 0 && (
                            <p>Missing columns: {previewValidation.missingColumns.join(", ")}</p>
                          )}
                          {previewValidation.sampleErrors.length > 0 && (
                            <div className="space-y-1 text-xs">
                              {previewValidation.sampleErrors.map((error) => (
                                <p key={error}>- {error}</p>
                              ))}
                              {previewValidation.errorCount > previewValidation.sampleErrors.length && (
                                <p>
                                  ...and {previewValidation.errorCount - previewValidation.sampleErrors.length} more.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                <div className="min-h-0 flex flex-1 flex-col overflow-hidden rounded-lg border">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Preview {filteredPreviewRows.length > 0 ? `showing ${filteredPreviewRows.length} of ${Math.min(PREVIEW_ROWS, totalRows)}` : "no matches"}
                    </span>
                    <div className="flex h-7 items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                      <Search className="size-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search rows..."
                        value={previewSearch}
                        onChange={(event) => setPreviewSearch(event.target.value)}
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
                          <th className="w-10 px-3 py-2 text-left text-xs font-semibold text-muted-foreground">#</th>
                          <th className="w-12 px-2 py-2 text-center text-xs font-semibold text-muted-foreground"></th>
                          {parsedData.headers.map((header) => (
                            <th
                              key={header}
                              className="whitespace-nowrap py-2 pr-3 text-left text-xs font-semibold text-muted-foreground"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPreviewRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={parsedData.headers.length + 2}
                              className="px-4 py-4 text-center text-sm text-muted-foreground"
                            >
                              No rows match your search.
                            </td>
                          </tr>
                        ) : (
                          filteredPreviewRows.map(({ row, originalIdx }, filteredIndex) => (
                            <tr key={originalIdx} className="border-b transition-colors last:border-0 hover:bg-muted/90">
                              <td className="select-none px-3 py-1.5 text-xs text-muted-foreground">{originalIdx + 1}</td>
                              <td className="px-2 py-1.5 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  icon={<Trash2 className="size-3.5 text-destructive" />}
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => deleteRow(originalIdx)}
                                />
                              </td>
                              {parsedData.headers.map((header) => (
                                <td key={header} className="max-w-45 py-1 pr-2 hover:bg-accent/60">
                                  <BulkUploadEditableCell
                                    value={row[header] ?? ""}
                                    onChange={(value) => updateCell(filteredIndex, header, value)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {step === "uploading" && (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  <Upload className="size-4 shrink-0 animate-pulse text-primary" />
                  <span>
                    Uploading {totalRows.toLocaleString()} row{totalRows === 1 ? "" : "s"} from {selectedFile?.name}
                  </span>
                </div>
              </div>
            )}

            {fieldError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <FileX className="size-4 shrink-0" />
                <span className="flex-1">{fieldError}</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex shrink-0 border-t px-3 py-4 sm:justify-between">
            <div className="flex w-full items-center justify-between gap-1">
              <div>
                {step === "preview" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStep("setup");
                      setFieldError("");
                    }}
                    icon={<ArrowLeft />}
                  >
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {step === "uploading" ? (
                  <Button type="button" variant="outline" disabled>
                    Uploading...
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>

                    {step === "setup" && (
                      <Button
                        type="button"
                        onClick={() => {
                          if (!selectedFile || !parsedData) {
                            setFieldError("Please upload and parse a CSV or Excel file first.");
                            return;
                          }
                          setFieldError("");
                          setStep("preview");
                        }}
                        disabled={!selectedFile || !parsedData}
                        iconRight={<ArrowRight />}
                      >
                        Preview Data
                      </Button>
                    )}

                    {step === "preview" && (
                      <Button
                        type="button"
                        onClick={handleUpload}
                        loading={createStaffMutation.isPending}
                        loadingText="Uploading"
                        icon={<Upload />}
                        disabled={hasValidationErrors || editableRows.length === 0}
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

      <DialogBox
        open={reportOpen}
        onOpenChange={setReportOpen}
        title="Upload Report"
        description="Review upload outcome for this staff import."
        cancelLabel={false}
        actionLabel="Close"
        onAction={() => setReportOpen(false)}
      >
        {uploadReport ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded border bg-muted/20 p-2">
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{uploadReport.totalRows}</p>
              </div>
              <div className="rounded border bg-muted/20 p-2">
                <p className="text-muted-foreground">Created</p>
                <p className="font-semibold">{uploadReport.createdCount}</p>
              </div>
              <div className="rounded border bg-muted/20 p-2">
                <p className="text-muted-foreground">Failed</p>
                <p className="font-semibold text-destructive">{uploadReport.failedCount}</p>
              </div>
            </div>

            {uploadReport.errors.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-destructive">Errors</h4>
                <div className="max-h-75 space-y-1 overflow-auto rounded border border-destructive/30 bg-destructive/5 p-3 text-xs">
                  {uploadReport.errors.map((issue) => (
                    <p key={`${issue.row}-${issue.staffId}`}>
                      Row {issue.row} ({issue.staffId}): {issue.message}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All rows uploaded successfully.</p>
            )}
          </div>
        ) : null}
      </DialogBox>
    </>
  );
}
