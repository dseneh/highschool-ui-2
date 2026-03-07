"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  useAcademicYears,
  useCurrentAcademicYear,
} from "@/hooks/use-academic-year";
import { getStudentReportCardPdf } from "@/lib/api/grading-service";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { PageContent } from "@/components/dashboard/page-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileExportIcon,
  Download01Icon
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
  const params = useParams();
  const idNumber = params.id_number as string;
  const subdomain = useTenantSubdomain();

  const studentsApi = useStudentsApi()
    const { data: student, isLoading: studentLoading, refetch: refreshStudent, isFetching, error: studentError } = studentsApi.getStudent(idNumber, {
      enabled: !!idNumber && window.location.href.includes("/students/"),
    })

  const { data: currentYear } = useCurrentAcademicYear();
  const { data: allYears } = useAcademicYears();
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  const activeYearId = selectedYearId || currentYear?.id || "";
  const activeYear = allYears?.find((y) => y.id === activeYearId);

  const handleDownloadReportCard = useCallback(async () => {
    if (!student?.id || !activeYearId) return;
    setDownloading(true);
    try {
      const blob = await getStudentReportCardPdf(
        subdomain,
        student.id,
        activeYearId,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Report_Card_${student.full_name.replace(/\s+/g, "_")}_${activeYear?.name || activeYearId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Report card downloaded successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  }, [student, activeYearId, activeYear, subdomain]);

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
                loading={downloading}
                loadingText="Downloading..."
                icon={<HugeiconsIcon icon={Download01Icon} />}
              >
                Download PDF
              </Button>
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
