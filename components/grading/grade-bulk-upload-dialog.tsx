"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileCheck,
  FileX,
  RefreshCw,
  X,
  Download,
  AlertCircle,
  Search,
  Trash2,
  ArrowLeft,
  ArrowRight,
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
import { Checkbox } from "@/components/ui/checkbox";
import { DialogBox } from "@/components/ui/dialog-box";
import { cn, getErrorMessage } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { useBulkUploadGrades } from "@/hooks/use-grading";
import type { BulkUploadGradeIssue, BulkUploadGradesResponse } from "@/lib/api2/grading-types";
import {
  BulkUploadEditableCell,
  BulkUploadStepIndicator,
} from "@/components/shared/bulk-upload/preview-primitives";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const PREVIEW_ROWS = 1000;
const MAX_VALIDATION_MESSAGES = 8;

type Step = "setup" | "preview" | "uploading";

interface GradeBulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  onSuccess?: () => void;
  templateContext?: {
    gradeLevel?: string;
    section?: string;
    subject?: string;
    academicYear?: string;
    markingPeriod?: string;
    assessments?: string[];
    students?: Array<{
      id_number: string;
      full_name: string;
    }>;
  };
}

interface GradeTemplateMetadata {
  gradeLevel: string;
  section: string;
  subject: string;
  academicYear: string;
  markingPeriod: string;
}

interface ParsedGradeData {
  metadata: GradeTemplateMetadata;
  headers: string[];
  rows: Record<string, string>[];
}

interface PreviewValidation {
  metadataErrors: string[];
  missingColumns: string[];
  errorCount: number;
  sampleErrors: string[];
}

const REQUIRED_COLUMN_MATCHERS = {
  studentId: [/^student\s*id$/i, /^id[_\s-]*number$/i, /^id$/i],
  studentName: [/^student\s*name$/i, /^name$/i],
};

const METADATA_LABELS = {
  gradeLevel: "Grade Level:",
  section: "Section:",
  subject: "Subject:",
  academicYear: "Academic Year:",
  markingPeriod: "Marking Period:",
};

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

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isMatchingHeader(header: string, patterns: RegExp[]): boolean {
  const normalized = normalizeHeader(header);
  return patterns.some((pattern) => pattern.test(normalized));
}

function parseSheetRows(file: File): Promise<(string | number | boolean | null)[][]> {
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

function getCellText(row: (string | number | boolean | null)[] | undefined, colIndex: number): string {
  if (!row) return "";
  const value = row[colIndex];
  if (value == null) return "";
  return String(value).trim();
}

function findMetadataStart(rows: (string | number | boolean | null)[][]): number {
  return rows.findIndex((row) => /grade\s*level/i.test(getCellText(row, 0)));
}

function findHeaderRow(rows: (string | number | boolean | null)[][]): number {
  return rows.findIndex((row) => {
    const values = row.map((cell) => String(cell ?? "").trim()).filter(Boolean);
    if (values.length < 2) return false;
    const hasStudentId = values.some((value) =>
      isMatchingHeader(value, REQUIRED_COLUMN_MATCHERS.studentId),
    );
    const hasStudentName = values.some((value) =>
      isMatchingHeader(value, REQUIRED_COLUMN_MATCHERS.studentName),
    );
    return hasStudentId && hasStudentName;
  });
}

function parseGradeTemplate(rows: (string | number | boolean | null)[][]): ParsedGradeData {
  const metadataStart = findMetadataStart(rows);
  if (metadataStart < 0) {
    throw new Error("Template format invalid: missing 'Grade Level:' metadata row.");
  }

  const metadata: GradeTemplateMetadata = {
    gradeLevel: getCellText(rows[metadataStart], 1),
    section: getCellText(rows[metadataStart + 1], 1),
    subject: getCellText(rows[metadataStart + 2], 1),
    academicYear: getCellText(rows[metadataStart + 3], 1),
    markingPeriod: getCellText(rows[metadataStart + 4], 1),
  };

  const headerRowIndex = findHeaderRow(rows);
  if (headerRowIndex < 0) {
    throw new Error("Template format invalid: could not find a header row with Student ID and Student Name.");
  }

  const rawHeaders = (rows[headerRowIndex] ?? []).map((cell) => String(cell ?? "").trim());
  const headers = rawHeaders.filter((header) => header.length > 0);
  if (headers.length < 3) {
    throw new Error("Template format invalid: add at least one assessment column.");
  }

  const dataRows = rows.slice(headerRowIndex + 1).map((row) => {
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      const value = row[index];
      acc[header] = value == null ? "" : String(value).trim();
      return acc;
    }, {});
  });

  const hasAnyData = dataRows.some((row) => Object.values(row).some((value) => value.trim().length > 0));
  if (!hasAnyData) {
    throw new Error("No grade rows found in the template.");
  }

  const nonEmptyRows = dataRows.filter((row) =>
    Object.values(row).some((value) => value.trim().length > 0),
  );

  return {
    metadata,
    headers,
    rows: nonEmptyRows,
  };
}

function getStudentColumnKeys(headers: string[]): { studentIdKey: string; studentNameKey: string; assessmentHeaders: string[] } {
  const studentIdKey = headers.find((header) => isMatchingHeader(header, REQUIRED_COLUMN_MATCHERS.studentId)) ?? "";
  const studentNameKey = headers.find((header) => isMatchingHeader(header, REQUIRED_COLUMN_MATCHERS.studentName)) ?? "";
  const assessmentHeaders = headers.filter((header) => header !== studentIdKey && header !== studentNameKey);
  return { studentIdKey, studentNameKey, assessmentHeaders };
}

function validatePreviewRows(
  parsedData: ParsedGradeData,
  editableRows: Record<string, string>[],
): PreviewValidation {
  const metadataErrors: string[] = [];
  const missingColumns: string[] = [];
  const sampleErrors: string[] = [];
  let errorCount = 0;

  if (!parsedData.metadata.gradeLevel) metadataErrors.push("Grade Level is required in metadata");
  if (!parsedData.metadata.section) metadataErrors.push("Section is required in metadata");
  if (!parsedData.metadata.subject) metadataErrors.push("Subject is required in metadata");
  if (!parsedData.metadata.academicYear) metadataErrors.push("Academic Year is required in metadata");
  if (!parsedData.metadata.markingPeriod) metadataErrors.push("Marking Period is required in metadata");

  const { studentIdKey, studentNameKey, assessmentHeaders } = getStudentColumnKeys(parsedData.headers);

  if (!studentIdKey) missingColumns.push("Student ID");
  if (!studentNameKey) missingColumns.push("Student Name");
  if (assessmentHeaders.length === 0) missingColumns.push("At least one assessment column");

  const pushError = (message: string) => {
    errorCount += 1;
    if (sampleErrors.length < MAX_VALIDATION_MESSAGES) {
      sampleErrors.push(message);
    }
  };

  editableRows.forEach((row, idx) => {
    const rowNumber = idx + 1;
    if (studentIdKey && !row[studentIdKey]?.trim()) {
      pushError(`Row ${rowNumber}: Student ID is required`);
    }
    if (studentNameKey && !row[studentNameKey]?.trim()) {
      pushError(`Row ${rowNumber}: Student Name is required`);
    }

    assessmentHeaders.forEach((assessmentHeader) => {
      const value = row[assessmentHeader]?.trim() ?? "";
      if (!value) return;

      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        pushError(`Row ${rowNumber}: ${assessmentHeader} must be numeric`);
        return;
      }
      if (numeric < 0) {
        pushError(`Row ${rowNumber}: ${assessmentHeader} cannot be negative`);
      }

      const decimalPart = value.includes(".") ? value.split(".")[1] : "";
      if (decimalPart.length > 2) {
        pushError(`Row ${rowNumber}: ${assessmentHeader} allows max 2 decimal places`);
      }
    });
  });

  return {
    metadataErrors,
    missingColumns,
    errorCount,
    sampleErrors,
  };
}

function buildUploadWorkbook(parsedData: ParsedGradeData, editableRows: Record<string, string>[]) {
  const aoa: (string | number)[][] = [
    [METADATA_LABELS.gradeLevel, parsedData.metadata.gradeLevel],
    [METADATA_LABELS.section, parsedData.metadata.section],
    [METADATA_LABELS.subject, parsedData.metadata.subject],
    [METADATA_LABELS.academicYear, parsedData.metadata.academicYear],
    [METADATA_LABELS.markingPeriod, parsedData.metadata.markingPeriod],
    [],
    ["Instructions:", "Do NOT modify metadata or student information columns. Only enter scores in assessment columns."],
    [],
    parsedData.headers,
    ...editableRows.map((row) => parsedData.headers.map((header) => row[header] ?? "")),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Grades Upload");

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}

function downloadGradeTemplate(templateContext?: GradeBulkUploadDialogProps["templateContext"]) {
  const assessmentHeaders =
    templateContext?.assessments?.filter((assessment) => assessment.trim().length > 0) ?? [];
  const headers = [
    "Student ID",
    "Student Name",
    ...(assessmentHeaders.length > 0 ? assessmentHeaders : ["Assessment 1"]),
  ];

  const studentRows =
    templateContext?.students?.length
      ? templateContext.students.map((student) => [
          student.id_number,
          student.full_name,
          ...headers.slice(2).map(() => ""),
        ])
      : [["", "", ...headers.slice(2).map(() => "")]];

  const ws = XLSX.utils.aoa_to_sheet([
    [METADATA_LABELS.gradeLevel, templateContext?.gradeLevel || ""],
    [METADATA_LABELS.section, templateContext?.section || ""],
    [METADATA_LABELS.subject, templateContext?.subject || ""],
    [METADATA_LABELS.academicYear, templateContext?.academicYear || ""],
    [METADATA_LABELS.markingPeriod, templateContext?.markingPeriod || ""],
    [],
    [
      "Instructions:",
      "Do NOT modify metadata or student information columns. Only enter scores in assessment columns.",
    ],
    [],
    headers,
    ...studentRows,
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Grades Upload");
  XLSX.writeFile(wb, "grades_upload_template.xlsx");
}

export function GradeBulkUploadDialog({
  open,
  onOpenChange,
  sectionId,
  onSuccess,
  templateContext,
}: GradeBulkUploadDialogProps) {
  const uploadGrades = useBulkUploadGrades();

  const [step, setStep] = React.useState<Step>("setup");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fieldError, setFieldError] = React.useState<string>("");
  const [isDragging, setIsDragging] = React.useState(false);
  const [parsedData, setParsedData] = React.useState<ParsedGradeData | null>(null);
  const [editableRows, setEditableRows] = React.useState<Record<string, string>[]>([]);
  const [previewSearch, setPreviewSearch] = React.useState("");
  const [overrideGrades, setOverrideGrades] = React.useState(false);
  const [uploadReportOpen, setUploadReportOpen] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<BulkUploadGradesResponse | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isUploadLocked = step === "uploading" && uploadGrades.isPending;

  const resetDialog = React.useCallback(() => {
    setStep("setup");
    setSelectedFile(null);
    setFieldError("");
    setIsDragging(false);
    setParsedData(null);
    setEditableRows([]);
    setPreviewSearch("");
    setOverrideGrades(false);
    setUploadReportOpen(false);
    setUploadResult(null);
  }, []);

  React.useEffect(() => {
    if (!open) resetDialog();
  }, [open, resetDialog]);

  const processFile = React.useCallback(async (file: File) => {
    setFieldError("");

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls")) {
      setFieldError("Only Excel files (.xlsx, .xls) are accepted.");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setFieldError(`File is too large (${formatBytes(file.size)}). Max is 10 MB.`);
      return;
    }

    try {
      const rawRows = await parseSheetRows(file);
      const data = parseGradeTemplate(rawRows);

      if (data.rows.length > PREVIEW_ROWS) {
        setFieldError(
          `File has ${data.rows.length.toLocaleString()} rows. Maximum preview is ${PREVIEW_ROWS.toLocaleString()} rows.`,
        );
      }

      setSelectedFile(file);
      setParsedData(data);
      setEditableRows(data.rows);
    } catch (error) {
      setSelectedFile(null);
      setParsedData(null);
      setEditableRows([]);
      setFieldError(getErrorMessage(error));
    }
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void processFile(file);
    }
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
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
        Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(query)),
      );
  }, [previewRows, previewSearch]);

  const previewValidation = React.useMemo(() => {
    if (!parsedData) return null;
    return validatePreviewRows(parsedData, editableRows);
  }, [parsedData, editableRows]);

  const hasPreviewValidationErrors = previewValidation
    ? previewValidation.metadataErrors.length > 0 ||
      previewValidation.missingColumns.length > 0 ||
      previewValidation.errorCount > 0
    : false;

  const goToPreview = () => {
    if (!selectedFile || !parsedData) {
      setFieldError("Upload and parse an Excel file first.");
      return;
    }
    setFieldError("");
    setStep("preview");
  };

  const updateCell = (filteredIdx: number, header: string, value: string) => {
    const originalIdx = filteredPreviewRows[filteredIdx]?.originalIdx;
    if (originalIdx === undefined) return;

    setEditableRows((previous) => {
      const next = [...previous];
      next[originalIdx] = { ...next[originalIdx], [header]: value };
      return next;
    });
  };

  const deleteRow = (originalIdx: number) => {
    setEditableRows((previous) => previous.filter((_, idx) => idx !== originalIdx));
  };

  const handleUpload = async () => {
    if (!selectedFile || !parsedData || !sectionId) {
      setFieldError("Missing required upload data.");
      return;
    }

    if (editableRows.length === 0) {
      setFieldError("Add at least one row before uploading.");
      return;
    }

    if (hasPreviewValidationErrors) {
      setFieldError("Please fix validation issues in preview before uploading.");
      return;
    }

    setFieldError("");
    setStep("uploading");

    try {
      const binary = buildUploadWorkbook(parsedData, editableRows);
      const uploadFile = new File([binary], selectedFile.name.replace(/\.(xlsx|xls)$/i, ".xlsx"), {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const response = await uploadGrades.mutateAsync({
        file: uploadFile,
        sectionId,
        overrideGrades,
      });

      const warningCount = response.statistics?.warning_count ?? response.warnings?.length ?? 0;
      const errorCount = response.statistics?.error_count ?? response.errors?.length ?? 0;

      if (errorCount > 0 || warningCount > 0) {
        setUploadResult(response);
        setUploadReportOpen(true);
        setStep("preview");

        if (errorCount > 0) {
          showToast.warning(
            "Upload completed with errors",
            `${errorCount} row${errorCount === 1 ? "" : "s"} failed. Review the report for details.`
          );
        } else {
          showToast.warning(
            "Upload completed with warnings",
            `${warningCount} warning${warningCount === 1 ? "" : "s"} returned. Review the report.`
          );
        }
        return;
      }

      showToast.success("Grades uploaded successfully", response.detail);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      setFieldError(getErrorMessage(error));
      setStep("preview");
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && isUploadLocked) return;
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent showCloseButton={!isUploadLocked} className="flex h-full max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 md:max-w-[72vw]">
        <div className="shrink-0 space-y-3 border-b px-6 pb-4 pt-5">
          <DialogHeader>
            <DialogTitle className="text-lg">Bulk Upload Grades</DialogTitle>
            <DialogDescription className="text-sm">
              {step === "setup" && "Upload the grade template Excel file to begin."}
              {step === "preview" && "Review, edit, and validate rows before uploading."}
              {step === "uploading" && "Submitting your grades upload to the server."}
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
                    <p className="text-sm font-medium">Use the official template format</p>
                    <p className="text-xs text-muted-foreground">
                      Includes metadata rows, Student ID/Name columns, and assessment score columns.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Download />}
                    onClick={() => downloadGradeTemplate(templateContext)}
                    disabled={isUploadLocked}
                  >
                    Download Template
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    checked={overrideGrades}
                    onCheckedChange={(checked) => setOverrideGrades(checked === true)}
                    className="mt-0.5 border-amber-500 data-[state=checked]:border-amber-600 data-[state=checked]:bg-amber-600"
                  />
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      Replace existing grades if they already exist
                    </span>
                    <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300">
                      By default, uploads only update draft grades and skip locked ones. Turn this on to force replacement of existing grades. Students who do not belong to this section and academic year will still be skipped with errors.
                    </p>
                  </div>
                </label>
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
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
                )}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") fileInputRef.current?.click();
                }}
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
                  accept=".xlsx,.xls"
                  className="sr-only"
                  onChange={handleFileInputChange}
                  disabled={isUploadLocked}
                />

                {selectedFile && parsedData ? (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                      <FileCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{selectedFile.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatBytes(selectedFile.size)} · {parsedData.rows.length.toLocaleString()} rows · {parsedData.headers.length} columns
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<RefreshCw />}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedFile(null);
                        setParsedData(null);
                        setEditableRows([]);
                        setFieldError("");
                      }}
                      disabled={isUploadLocked}
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
                        {isDragging ? "Drop it here!" : "Drop Excel file here or click to browse"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">.xlsx or .xls only · max 10 MB</p>
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
                    {totalRows.toLocaleString()} rows · {parsedData.headers.length} columns · {parsedData.metadata.subject}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<RefreshCw />}
                  onClick={() => {
                    setStep("setup");
                    setFieldError("");
                  }}
                >
                  Change file
                </Button>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>
                  <span className="font-semibold">Click any cell to edit</span>, use search to filter rows, and remove rows you do not want to upload.
                </p>
              </div>

              <div className="rounded-lg border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                <p>
                  Existing grades: <span className="font-medium text-foreground">{overrideGrades ? "will be replaced where matched" : "only draft grades will be updated"}</span>
                </p>
                <p className="mt-1">
                  Students outside this class: <span className="font-medium text-foreground">will be reported as errors and skipped</span>
                </p>
              </div>

              {previewValidation &&
                (previewValidation.metadataErrors.length > 0 ||
                  previewValidation.missingColumns.length > 0 ||
                  previewValidation.errorCount > 0) && (
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
                        {previewValidation.metadataErrors.length > 0 && (
                          <div className="space-y-1 text-xs">
                            {previewValidation.metadataErrors.map((error) => (
                              <p key={error}>- {error}</p>
                            ))}
                          </div>
                        )}
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
                        filteredPreviewRows.map(({ row, originalIdx }, filteredIdx) => (
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
                                tooltip="Delete row"
                              />
                            </td>
                            {parsedData.headers.map((header) => (
                              <td key={header} className="max-w-45 py-1 pr-2 hover:bg-accent/60">
                                <BulkUploadEditableCell
                                  value={row[header] ?? ""}
                                  onChange={(value) => updateCell(filteredIdx, header, value)}
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
                  <div className="border-t bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
                    +{(totalRows - PREVIEW_ROWS).toLocaleString()} more rows will be uploaded unchanged
                  </div>
                )}
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
              <button
                type="button"
                className="shrink-0 opacity-60 hover:opacity-100"
                onClick={() => setFieldError("")}
                disabled={isUploadLocked}
              >
                <X className="size-3.5" />
              </button>
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
                      onClick={goToPreview}
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
                      loading={uploadGrades.isPending}
                      loadingText="Uploading"
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

      <DialogBox
        open={uploadReportOpen}
        onOpenChange={setUploadReportOpen}
        title="Upload Report"
        description={uploadResult?.detail || "Review warnings and errors returned by the server."}
        cancelLabel={false}
        actionLabel="Close"
        onAction={() => setUploadReportOpen(false)}
        contentClassName="max-h-[60vh]"
      >
        {uploadResult ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div className="rounded border bg-muted/20 p-2">
                <p className="text-muted-foreground">Created</p>
                <p className="font-semibold">{uploadResult.statistics.grades_created}</p>
              </div>
              <div className="rounded border bg-muted/20 p-2">
                <p className="text-muted-foreground">Updated</p>
                <p className="font-semibold">{uploadResult.statistics.grades_updated}</p>
              </div>
              <div className="rounded border bg-muted/20 p-2">
                <p className="text-muted-foreground">Warnings</p>
                <p className="font-semibold">{uploadResult.statistics.warning_count}</p>
              </div>
              <div className="rounded border bg-muted/20 p-2">
                <p className="text-muted-foreground">Errors</p>
                <p className="font-semibold text-destructive">{uploadResult.statistics.error_count}</p>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-destructive">Errors</h4>
                <div className="space-y-1 rounded border border-destructive/30 bg-destructive/5 p-3 text-xs">
                  {uploadResult.errors.map((issue, idx) => (
                    <p key={`error-${issue.row}-${idx}`}>{formatUploadIssue(issue, "error")}</p>
                  ))}
                </div>
              </div>
            )}

            {uploadResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300">Warnings</h4>
                <div className="space-y-1 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  {uploadResult.warnings.map((issue, idx) => (
                    <p key={`warning-${issue.row}-${idx}`}>{formatUploadIssue(issue, "warning")}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogBox>
    </>
  );
}

function formatUploadIssue(issue: BulkUploadGradeIssue, type: "error" | "warning"): string {
  const message = type === "error" ? issue.error : issue.warning;
  const studentId = issue.student_id ? ` Student ${issue.student_id}.` : "";
  const assessment = issue.assessment ? ` Assessment ${issue.assessment}.` : "";
  return `Row ${issue.row}.${studentId}${assessment} ${message ?? "Unknown issue."}`.replace(/\s+/g, " ").trim();
}
