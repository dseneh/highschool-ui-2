"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { downloadStudentsListReport } from "@/lib/api2/report-service";
import { showToast } from "@/lib/toast";
import {
  File02Icon,
  FileExportIcon,
  FilterHorizontalIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AcademicYearSelect, GradeLevelSelect, SectionSelect } from "../shared/data-reusable";
import { SelectField } from "../ui/select-field";
import { cn } from "@/lib/utils";

interface StudentExportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  urlParams: StudentTableUrlParams;
  gradeFilterOptions?: Array<{ label: string; value: string }>;
  sectionFilterOptions?: Array<{ label: string; value: string }>;
}

interface StudentTableUrlParams {
  search: string;
  status: string;
  grade_level: string;
  section: string;
  gender: string;
  balance_owed: string;
  balance_condition: string;
  balance_min: string;
  balance_max: string;
  show_rank: string;
  show_grade_average: string;
  show_balance: string;
  include_billing: string;
}

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Enrolled", value: "enrolled" },
  { label: "Not Enrolled", value: "not_enrolled" },
  { label: "Withdrawn", value: "withdrawn" },
  { label: "Graduated", value: "graduated" },
  { label: "Dropped", value: "dropped" },
];

const GENDER_OPTIONS = [
  { label: "All genders", value: "" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Unknown", value: "unknown" },
];

const BALANCE_OWED_OPTIONS = [
  { label: "All students", value: "" },
  { label: "Has outstanding balance", value: "owed" },
  { label: "No outstanding balance", value: "clear" },
];

const BALANCE_CONDITION_OPTIONS = [
  { label: "Is Between", value: "is-between" },
  { label: "Is Greater Than", value: "is-greater-than" },
  { label: "Is Less Than", value: "is-less-than" },
  { label: "Is Equal To", value: "is-equal-to" },
  { label: "% Is Between", value: "pct-is-between" },
  { label: "% Is Greater Than", value: "pct-is-greater-than" },
  { label: "% Is Less Than", value: "pct-is-less-than" },
  { label: "% Is Equal To", value: "pct-is-equal-to" },
];

function firstValue(csv: string | undefined): string {
  if (!csv || csv === "all") return "";
  return csv.split(",")[0]?.trim() ?? "";
}

export function StudentExportSheet({
  open,
  onOpenChange,
  urlParams,
  gradeFilterOptions = [],
  sectionFilterOptions = [],
}: StudentExportSheetProps) {
  const subdomain = useTenantSubdomain();

  const [search, setSearch] = React.useState("");
  const [includeBilling, setIncludeBilling] = React.useState(true);
  const [includeAcademicPerformance, setIncludeAcademicPerformance] = React.useState(false);
  const [showRank, setShowRank] = React.useState(false);
  const [showGradeAverage, setShowGradeAverage] = React.useState(false);
  const [academicYearId, setAcademicYearId] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [gradeLevel, setGradeLevel] = React.useState("");
  const [section, setSection] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [balanceOwed, setBalanceOwed] = React.useState("");
  const [balanceCondition, setBalanceCondition] = React.useState("is-between");
  const [balanceMin, setBalanceMin] = React.useState("");
  const [balanceMax, setBalanceMax] = React.useState("");
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const nextShowRank = (urlParams.show_rank || "0") === "1";
    const nextShowGradeAverage = (urlParams.show_grade_average || "0") === "1";

    setSearch(urlParams.search ?? "");
    setIncludeBilling((urlParams.include_billing || "0") === "1");
    setIncludeAcademicPerformance(nextShowRank || nextShowGradeAverage);
    setShowRank(nextShowRank);
    setShowGradeAverage(nextShowGradeAverage);
    setAcademicYearId("");
    setStatus(firstValue(urlParams.status));
    setGradeLevel(firstValue(urlParams.grade_level));
    setSection(firstValue(urlParams.section));
    setGender(firstValue(urlParams.gender));
    setBalanceOwed(urlParams.balance_owed ?? "");
    setBalanceCondition(urlParams.balance_condition || "is-between");
    setBalanceMin(urlParams.balance_min ?? "");
    setBalanceMax(urlParams.balance_max ?? "");
  }, [open, urlParams]);

  const activeFilterCount = [
    search,
    status,
    gradeLevel,
    section,
    gender,
    balanceOwed,
    balanceMin,
    balanceMax,
  ].filter(Boolean).length;

  const isBalanceBetween = balanceCondition === "is-between" || balanceCondition === "pct-is-between";
  const showSectionFilter = sectionFilterOptions.length > 1;
  const hasBalanceFilter = Boolean(balanceMin || balanceMax);

  function handleAcademicPerformanceChange(checked: boolean) {
    setIncludeAcademicPerformance(checked);

    if (!checked) {
      setShowRank(false);
      setShowGradeAverage(false);
      return;
    }

    if (!showRank && !showGradeAverage) {
      setShowRank(true);
      setShowGradeAverage(true);
    }
  }

  function handleReset() {
    setSearch("");
    setStatus("");
    setGradeLevel("");
    setSection("");
    setGender("");
    setBalanceOwed("");
    setBalanceCondition("is-between");
    setBalanceMin("");
    setBalanceMax("");
  }

  async function handleDownload() {
    setIsExporting(true);
    try {
      const result = await downloadStudentsListReport(subdomain, {
        search: search || undefined,
        status: status || undefined,
        grade_level: gradeLevel || undefined,
        section: section || undefined,
        academic_year_id: academicYearId || undefined,
        gender: gender || undefined,
        balance_owed: balanceOwed || undefined,
        balance_condition: hasBalanceFilter ? balanceCondition : undefined,
        balance_min: balanceMin || undefined,
        balance_max: isBalanceBetween ? balanceMax || undefined : undefined,
        include_billing: includeBilling ? "1" : "0",
        show_rank: includeAcademicPerformance && showRank ? "1" : "0",
        show_grade_average: includeAcademicPerformance && showGradeAverage ? "1" : "0",
      });

      if (result.kind === "background") {
        showToast.info(
          "Large export queued",
          result.estimatedRecords
            ? `Preparing ${result.estimatedRecords.toLocaleString()} records in the background.`
            : "Preparing your student export in the background."
        );
        onOpenChange(false);
        return;
      }

      const date = new Date().toISOString().slice(0, 10);
      const filename = result.filename || `students-export-${date}.xlsx`;
      const downloadUrl = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);

      showToast.success("Export ready", `Downloading ${filename}`);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export failed";
      showToast.error("Export failed", message);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full flex flex-col">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md bg-muted p-2">
              <HugeiconsIcon icon={FileExportIcon} size={18} className="text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle>Export Students</SheetTitle>
              <SheetDescription>
                Configure student list to download.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 fpy-4">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Export Options
            </p>

            <div className="space-y-2">
              <Label>Format</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-primary bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
                >
                  <HugeiconsIcon icon={File02Icon} size={14} />
                  Excel (.xlsx)
                </button>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground opacity-50"
                >
                  <HugeiconsIcon icon={File02Icon} size={14} />
                  PDF (coming soon)
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="include-billing"
                checked={includeBilling}
                onCheckedChange={(checked) => setIncludeBilling(Boolean(checked))}
                className="mt-0.5"
              />
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="include-billing" className="cursor-pointer">
                  Include billing data
                </Label>
                <p className="text-xs text-muted-foreground">
                  Adds balances, concessions, and other billing-related values to the export when available.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="include-academic-performance"
                checked={includeAcademicPerformance}
                onCheckedChange={(checked) => handleAcademicPerformanceChange(Boolean(checked))}
                className="mt-0.5"
              />
              <div className="flex flex-1 flex-col gap-0.5">
                <Label htmlFor="include-academic-performance" className="cursor-pointer">
                  Include academic performance record
                </Label>
                <p className="text-xs text-muted-foreground">
                  Adds current academic-year academic metrics to the export.
                </p>
              </div>
            </div>

            {includeAcademicPerformance && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Academic performance fields
                </p>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="include-grade-average"
                    checked={showGradeAverage}
                    onCheckedChange={(checked) => setShowGradeAverage(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="include-grade-average" className="cursor-pointer">
                      Grade average
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Includes each student&apos;s current overall grade average when available.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="include-rank"
                    checked={showRank}
                    onCheckedChange={(checked) => setShowRank(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="include-rank" className="cursor-pointer">
                      Rank
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Includes the student&apos;s current rank within the available grading scope.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(includeBilling || includeAcademicPerformance) && (
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <AcademicYearSelect
                  noTitle
                  value={academicYearId}
                  onChange={setAcademicYearId}
                  useUrlState={false}
                  autoSelectCurrent
                />
                <p className="text-xs text-muted-foreground">
                  Applies to billing totals and academic performance metrics in this export.
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <HugeiconsIcon icon={FilterHorizontalIcon} size={12} />
                Filters
              </p>
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {activeFilterCount} active
                  </Badge>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search students"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enrollment status</Label>
               <SelectField
               items={STATUS_OPTIONS}
               value={status}
               onValueChange={(value) => setStatus(String(value ?? ""))}
              />
            </div>

            {gradeFilterOptions.length > 0 && (
              <div className="space-y-2">
                <Label>Grade Level</Label>
                <GradeLevelSelect
                  noTitle
                  value={gradeLevel}
                  onChange={setGradeLevel}
                  useUrlState={false}
                />
              </div>
            )}

            {gradeLevel && showSectionFilter && (
              <div className="space-y-2">
                <Label>Section</Label>
                <SectionSelect
                  noTitle
                  gradeLevelId={gradeLevel}
                  value={section}
                  onChange={setSection}
                  useUrlState={false}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Gender</Label>
              <SelectField
               items={GENDER_OPTIONS}
               value={gender}
               onValueChange={(value) => setGender(String(value ?? ""))}
              />
            </div>

            <div className="space-y-2">
              <Label>Outstanding balance</Label>
              {/* <Select value={balanceOwed} onValueChange={(value) => setBalanceOwed(value ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All students" />
                </SelectTrigger>
                <SelectContent>
                  {BALANCE_OWED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
              <SelectField
               items={BALANCE_OWED_OPTIONS}
               value={balanceOwed}
               onValueChange={(value) => setBalanceOwed(String(value ?? ""))}
              />
            </div>

            <div className="space-y-2">
              <Label>Balance condition</Label>
              <SelectField
               items={BALANCE_CONDITION_OPTIONS}
               value={balanceCondition}
               onValueChange={(value) => setBalanceCondition(String(value ?? "is-between"))}
              />
            </div>

            <div className={cn(
                isBalanceBetween ? "grid grid-cols-2 gap-3" : "space-y-2",
                "mb-1"
            )}>
              <div className="space-y-2">
                <Label>{isBalanceBetween ? "Minimum balance" : "Balance amount"}</Label>
                <Input
                  inputMode="decimal"
                  value={balanceMin}
                  onChange={(event) => setBalanceMin(event.target.value)}
                  placeholder={isBalanceBetween ? "0.00" : "Enter amount"}
                />
              </div>
              {isBalanceBetween && (
                <div className="space-y-2">
                  <Label>Maximum balance</Label>
                  <Input
                    inputMode="decimal"
                    value={balanceMax}
                    onChange={(event) => setBalanceMax(event.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            loading={isExporting}
            loadingText="Exporting..."
            iconLeft={<HugeiconsIcon icon={FileExportIcon} size={14} />}
            onClick={handleDownload}
          >
            Download Excel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
