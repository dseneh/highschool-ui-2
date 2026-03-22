"use client";

import { useState, useCallback } from "react";
import {
  useAcademicYears,
  useCurrentAcademicYear,
} from "@/hooks/use-academic-year";
import { useResolvedStudentIdNumber } from "@/hooks/use-resolved-student-id-number";
import { getStudentReportCardPdf } from "@/lib/api2/grading-service";
import { downloadStudentBillingPdf } from "@/lib/api2/billing-service";
import { downloadStudentIndividualReport } from "@/lib/api2/report-service";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { PageContent } from "@/components/dashboard/page-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileExportIcon,
  Download01Icon,
  File02Icon,
  Invoice02Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import PageLayout from "@/components/dashboard/page-layout";
import { AcademicYearSelect } from "@/components/shared/data-reusable";
import {useStudents as useStudentsApi} from '@/lib/api2/student';

function ReportsSkeleton() {
  return (
    <PageContent>
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </PageContent>
  );
}

export default function StudentReportsPage() {
  const idNumber = useResolvedStudentIdNumber();
  const subdomain = useTenantSubdomain();

  const studentsApi = useStudentsApi()
    const { data: student, isLoading: studentLoading, refetch: refreshStudent, isFetching, error: studentError } = studentsApi.getStudent(idNumber, {
      enabled: !!idNumber,
    })

  const { data: currentYear } = useCurrentAcademicYear();
  const { data: allYears } = useAcademicYears();
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [downloadingReportCard, setDownloadingReportCard] = useState(false);
  const [downloadingBio, setDownloadingBio] = useState(false);
  const [downloadingFinancialPdf, setDownloadingFinancialPdf] = useState(false);
  const [downloadingFullReport, setDownloadingFullReport] = useState(false);

  const activeYearId = selectedYearId || currentYear?.id || "";
  const activeYear = allYears?.find((y) => y.id === activeYearId);

  const triggerBlobDownload = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadReportCard = useCallback(async () => {
    if (!student?.id || !activeYearId) return;
    setDownloadingReportCard(true);
    try {
      const blob = await getStudentReportCardPdf(
        subdomain,
        student.id,
        activeYearId,
      );
      triggerBlobDownload(
        blob,
        `Report_Card_${student.full_name.replace(/\s+/g, "_")}_${activeYear?.name || activeYearId}.pdf`
      );
      toast.success("Report card downloaded successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingReportCard(false);
    }
  }, [student, activeYearId, activeYear, subdomain, triggerBlobDownload]);

  const handleDownloadBio = useCallback(async () => {
    if (!student?.id) return;
    setDownloadingBio(true);
    try {
      const blob = await downloadStudentIndividualReport(subdomain, student.id, {
        reportType: "bio",
        format: "csv",
      });
      triggerBlobDownload(blob, `Student_Bio_${student.id_number}.csv`);
      toast.success("Student bio downloaded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingBio(false);
    }
  }, [student, subdomain, triggerBlobDownload]);

  const handleDownloadFinancialPdf = useCallback(async () => {
    if (!student?.id) return;
    setDownloadingFinancialPdf(true);
    try {
      const blob = await downloadStudentBillingPdf(subdomain, student.id);
      triggerBlobDownload(blob, `Financial_Statement_${student.id_number}.pdf`);
      toast.success("Financial statement downloaded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingFinancialPdf(false);
    }
  }, [student, subdomain, triggerBlobDownload]);

  const handleDownloadFullReport = useCallback(async () => {
    if (!student?.id) return;
    setDownloadingFullReport(true);
    try {
      const blob = await downloadStudentIndividualReport(subdomain, student.id, {
        reportType: "full",
        format: "json",
        academicYearId: activeYearId || undefined,
      });
      triggerBlobDownload(blob, `Student_Full_Report_${student.id_number}.json`);
      toast.success("Full student report downloaded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingFullReport(false);
    }
  }, [student, subdomain, activeYearId, triggerBlobDownload]);

  if (studentLoading) return <ReportsSkeleton />;

  return (
    <PageLayout
      title={`Reports & Documents`}
      description="Download report cards and academic documents"
      noData={!student}
      loading={studentLoading}
      fetching={isFetching}
      refreshAction={refreshStudent}
      error={studentError}
      actions={
        <div>
          <AcademicYearSelect 
          autoSelectCurrent 
          noTitle
          autoSelectFirst
          />
        </div>
      }
      emptyStateTitle="No Reports Available"
      emptyStateDescription="There is no report to download for the student"
    >
      {student && (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={FileExportIcon}
                    className="size-6 text-primary"
                  />
                </div>
                <div>
                  <p className="font-medium">
                    Report Card — {activeYear?.name || "Select Year"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.full_name} &middot;{" "}
                    {student.current_enrollment?.grade_level?.name ||
                      student.grade_level}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDownloadReportCard}
                disabled={!activeYearId}
                variant="outline"
                  loading={downloadingReportCard}
                loadingText="Downloading..."
                icon={<HugeiconsIcon icon={Download01Icon} />}
              >
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Student Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">Bio Details</p>
                  <p className="mb-3 mt-1 text-xs text-muted-foreground">
                    Student identity and profile information as CSV.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={downloadingBio}
                    loadingText="Downloading..."
                    onClick={handleDownloadBio}
                    icon={<HugeiconsIcon icon={File02Icon} />}
                  >
                    Download Bio CSV
                  </Button>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">Financial Record</p>
                  <p className="mb-3 mt-1 text-xs text-muted-foreground">
                    Billing statement PDF for finance and parent communication.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={downloadingFinancialPdf}
                    loadingText="Downloading..."
                    onClick={handleDownloadFinancialPdf}
                    icon={<HugeiconsIcon icon={Invoice02Icon} />}
                  >
                    Download Finance PDF
                  </Button>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">Full Student Report</p>
                  <p className="mb-3 mt-1 text-xs text-muted-foreground">
                    Consolidated JSON bundle with bio and financial sections.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={downloadingFullReport}
                    loadingText="Downloading..."
                    onClick={handleDownloadFullReport}
                    icon={<HugeiconsIcon icon={File01Icon} />}
                  >
                    Download Full JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        {student.enrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Available Reports by Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.enrollments.map((enrollment: any) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {enrollment.academic_year.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {enrollment.grade_level.name} &middot;{" "}
                        {enrollment.section.name}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setSelectedYearId(enrollment.academic_year.id);
                      }}
                      icon={<HugeiconsIcon icon={FileExportIcon} />}
                    >
                      View Report
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      )}
    </PageLayout>
  );
}
