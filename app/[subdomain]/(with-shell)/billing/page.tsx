"use client";

import * as React from "react";
import PageLayout from "@/components/dashboard/page-layout";
import { SummaryCardGrid } from "@/components/dashboard/summary-card-grid";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";
import AcademicYearSelect from "@/components/shared/data-reusable/academic-year-select";
import { getIconByKey } from "@/lib/icon-map";
import { formatCurrency, cn, getErrorMessage } from "@/lib/utils";
import { useSummary } from "@/lib/api2/summary";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import type {
  BillingSummaryItemDto,
  BillingSummaryParams,
} from "@/lib/api/finance-types";
import { getBillingSummaryColumns } from "@/components/finance/billing-summary-columns";
import { downloadBillingSummary } from "@/lib/api/finance-service";
import { useRouter } from "next/navigation";
import { ArrowLeft02Icon, FileExportIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Summary metrics                                                    */
/* ------------------------------------------------------------------ */

function buildMetrics(data: BillingSummaryItemDto[]) {
  const totalBills = data.reduce((s, d) => s + Number(d.total_bills ?? 0), 0);
  const totalPaid = data.reduce((s, d) => s + Number(d.total_paid ?? 0), 0);
  const balance = totalBills - totalPaid;
  const percentPaid = totalBills > 0 ? (totalPaid / totalBills) * 100 : 0;
  const studentCount = data.reduce((s, d) => s + (d.student_count ?? 0), 0);

  return [
    {
      title: "Total Bills",
      value: formatCurrency(totalBills),
      subtitle: `${studentCount} students`,
      icon: getIconByKey("invoices"),
    },
    {
      title: "Total Paid",
      value: formatCurrency(totalPaid),
      subtitle: `${percentPaid.toFixed(0)}% collected`,
      icon: getIconByKey("check"),
    },
    {
      title: "Outstanding Balance",
      value: formatCurrency(balance),
      subtitle: balance > 0 ? "Unpaid amount" : "All settled",
      icon: getIconByKey("cancel"),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Breadcrumb for drill-down                                          */
/* ------------------------------------------------------------------ */

interface DrillState {
  viewType: "grade_level" | "section" | "student";
  gradeLevel?: { id: string; name: string };
  section?: { id: string; name: string };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BillingPage() {
  const router = useRouter();
  const { data: currentYear } = useCurrentAcademicYear();
  const summaryApi = useSummary();

  // Academic year from URL (managed by AcademicYearSelect)
  const [yearId, setYearId] = React.useState<string>("");

  // Drill-down state
  const [drill, setDrill] = React.useState<DrillState>({
    viewType: "grade_level",
  });

  // Set initial year when current year loads
  React.useEffect(() => {
    if (currentYear && !yearId) {
      setYearId(currentYear.id);
    }
  }, [currentYear, yearId]);

  // Build query params
  const queryParams: BillingSummaryParams | null = yearId
    ? {
        academic_year_id: yearId,
        view_type: drill.viewType,
        grade_level_id: drill.gradeLevel?.id,
        section_id: drill.section?.id,
      }
    : null;

  const { data: summaryData, isLoading } = summaryApi.getStudentBillingSummary(
    queryParams as any
  );
  const items = summaryData?.results ?? [];

  /* ---- Drill-down handlers ---- */

  const handleDrillDown = React.useCallback((item: BillingSummaryItemDto) => {
    if (drill.viewType === "grade_level" && item.grade_level) {
      setDrill({
        viewType: "section",
        gradeLevel: item.grade_level,
      });
    } else if (drill.viewType === "section" && item.section) {
      setDrill({
        viewType: "student",
        gradeLevel: drill.gradeLevel,
        section: item.section,
      });
    }
  }, [drill.viewType, drill.gradeLevel]);

  function handleBack() {
    if (drill.viewType === "student") {
      setDrill({
        viewType: "section",
        gradeLevel: drill.gradeLevel,
      });
    } else if (drill.viewType === "section") {
      setDrill({ viewType: "grade_level" });
    }
  }

  const handleStudentClick = React.useCallback((item: BillingSummaryItemDto) => {
    if (item.id_number) {
      router.push(`/students/${item.id_number}/billing`);
    }
  }, [router]);

  async function handleExport() {
    if (!queryParams) return;
    try {
      // For now, keep using the old download service until api2 provides blob support
      // TODO: Update to use api2 when downloadBillingSummary is available in lib/api2/summary
      // const { data: blob } = await summaryApi.downloadStudentBillingSummary(queryParams);
      const blob = await downloadBillingSummary(undefined as any, queryParams);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `billing-summary-${drill.viewType}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  /* ---- Columns ---- */
  const columns = React.useMemo(
    () =>
      getBillingSummaryColumns({
        viewType: drill.viewType,
        onDrillDown: drill.viewType !== "student" ? handleDrillDown : undefined,
        onStudentClick:
          drill.viewType === "student" ? handleStudentClick : undefined,
      }),
    [drill.viewType, handleDrillDown, handleStudentClick]
  );

  /* ---- Breadcrumb label ---- */
  const breadcrumbParts: string[] = ["All Grades"];
  if (drill.gradeLevel) breadcrumbParts.push(drill.gradeLevel.name);
  if (drill.section) breadcrumbParts.push(drill.section.name);

  const isEmpty = items.length === 0;

  return (
    <PageLayout
      title="Billing Summary"
      description="Overview of student billing and payment collection"
      actions={
        <div className="flex items-center gap-2">
          <AcademicYearSelect
            noTitle
            selectClassName="w-48"
            autoSelectCurrent
            value={yearId}
            onChange={setYearId}
            useUrlState={false}
          />
          <AuthButton
            roles="accountant"
            disable
            variant="outline"
            iconLeft={<HugeiconsIcon icon={FileExportIcon} size={16} />}
            onClick={handleExport}
          >
            Export
          </AuthButton>
        </div>
      }
      loading={isLoading}
      skeleton={
        <>
          {/* Summary cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative p-5 rounded-xl border bg-card overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-3 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="size-10 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar skeleton */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>

          {/* Table skeleton */}
          <div className="rounded-md border">
            <div className="border-b px-4 py-3 flex gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-24" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-b px-4 py-3 flex items-center gap-6">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </>
      }
      noData={isEmpty}
      emptyState={<div className="text-center text-muted-foreground py-8">No billing data found</div>}
    >
      <SummaryCardGrid items={buildMetrics(items)} />

      {items.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Payment Collection</span>
            <span className="text-sm text-muted-foreground">
              {(() => {
                const totalBills = items.reduce(
                  (s: number, d: any) => s + Number(d.total_bills ?? 0),
                  0
                );
                const totalPaid = items.reduce(
                  (s: number, d: any) => s + Number(d.total_paid ?? 0),
                  0
                );
                return totalBills > 0
                  ? `${((totalPaid / totalBills) * 100).toFixed(1)}%`
                  : "0%";
              })()}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                (() => {
                  const totalBills = items.reduce(
                    (s: number, d: any) => s + Number(d.total_bills ?? 0),
                    0
                  );
                  const totalPaid = items.reduce(
                    (s: number, d: any) => s + Number(d.total_paid ?? 0),
                    0
                  );
                  const pct =
                    totalBills > 0 ? (totalPaid / totalBills) * 100 : 0;
                  return pct >= 80
                    ? "bg-green-500"
                    : pct >= 50
                      ? "bg-yellow-500"
                      : pct >= 25
                        ? "bg-orange-500"
                        : "bg-red-500";
                })()
              )}
              style={{
                width: `${Math.min(
                  (() => {
                    const totalBills = items.reduce(
                      (s: number, d: any) => s + Number(d.total_bills ?? 0),
                      0
                    );
                    const totalPaid = items.reduce(
                      (s: number, d: any) => s + Number(d.total_paid ?? 0),
                      0
                    );
                    return totalBills > 0
                      ? (totalPaid / totalBills) * 100
                      : 0;
                  })(),
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Drill-down breadcrumb + back */}
      {drill.viewType !== "grade_level" && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<HugeiconsIcon icon={ArrowLeft02Icon} size={14} />}
            onClick={handleBack}
          >
            Back
          </Button>
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbParts.map((part, i) => (
              <React.Fragment key={part}>
                {i > 0 && <span>/</span>}
                <span
                  className={cn(
                    i === breadcrumbParts.length - 1 && "text-foreground font-medium"
                  )}
                >
                  {part}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={items}
        showPagination={items.length > 20}
        pageSize={30}
      />
    </PageLayout>
  );
}
