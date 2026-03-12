"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useGrading } from "@/lib/api2/grading";
import { useAllMarkingPeriods } from "@/hooks/use-marking-period";
import PageLayout from "@/components/dashboard/page-layout";
import { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateAction } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectField } from "@/components/ui/select-field";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  FileIcon,
} from "@hugeicons/core-free-icons";
import { GradeStatus, SectionStudentGrade } from "@/lib/api2/grading-types";
import { CreateAssessmentDialog } from "@/components/grading/create-assessment-dialog";
import { GradeEntryTable } from "@/components/grading/grade-entry-table";
import { AssessmentsList } from "@/components/grading/assessments-list";
import { GradebookNav } from "@/components/grading/gradebook-nav";
import { FinalGradesTable } from "@/components/grading/final-grades-table";
import { GradeWorkflowBadge } from "@/components/grading/grade-workflow-badge";
import { ArrowLeft, RefreshCcw, AlertCircle, CheckCircle2, Clock, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useHeaderBreadcrumbs } from "@/hooks/use-header-breadcrumbs";

export default function GradebookDetailPage() {
  const params = useParams();
  const gradebookId = params.id as string;
  const router = useRouter();
  
  // Get marking period from URL query params
  const [markingPeriod, setMarkingPeriod] = useQueryState("markingPeriod");
  const [activeTab, setActiveTab] = useQueryState("tab", { defaultValue: "entry" });
  const [gradeLevelParam] = useQueryState("gradeLevel");
  const [sectionParam] = useQueryState("section");
  const [fromParam] = useQueryState("from");

  // Build fallback list URL from current detail query params
  const backToListParams = new URLSearchParams();
  if (gradeLevelParam) backToListParams.set("gradeLevel", gradeLevelParam);
  if (sectionParam) backToListParams.set("section", sectionParam);
  const backToListUrl = `/grading/gradebooks${backToListParams.toString() ? `?${backToListParams.toString()}` : ""}`;

  const grading = useGrading();
  const { data: gradebook, isLoading: gradebookLoading, error: gradebookError, refetch: refetchGradebook, isFetching: gradebookFetching } = grading.getGradeBook(gradebookId);
  const { data: allMarkingPeriods } = useAllMarkingPeriods();
  const { data: assessments, isLoading: assessmentsLoading, error: assessmentsError, refetch: refetchAssessments, isFetching: assessmentsFetching } = grading.getAssessments(
    gradebookId,
    {
      marking_period: markingPeriod || undefined,
      include_stats: true,
    }
  );

  const { data: finalGrades, isLoading: finalGradesLoading, error: finalGradesError, refetch: refetchFinalGrades, isFetching: finalGradesFetching } = grading.getSectionFinalGrades(
    gradebook?.academic_year?.id || "",
    gradebook?.section?.id || "",
    markingPeriod || "",
    gradebook?.subject?.id || "",
    "subject",
    {
      enabled: Boolean(gradebook?.academic_year?.id) && Boolean(gradebook?.section?.id) && Boolean(markingPeriod) && Boolean(gradebook?.subject?.id),
    }
  );

  const handleRefetch = () => {
    refetchGradebook();
    refetchAssessments();
    refetchFinalGrades();
  };
  const loading = gradebookLoading || assessmentsLoading || finalGradesLoading;
  const fetching = gradebookFetching || assessmentsFetching || finalGradesFetching;
  const error = gradebookError || assessmentsError || finalGradesError;

  const [createAssessmentOpen, setCreateAssessmentOpen] = useState(false);

  // Auto-select current marking period on initial load
  useEffect(() => {
    if (!markingPeriod && allMarkingPeriods && allMarkingPeriods.length > 0) {
      // Find the current marking period
      const currentPeriod = allMarkingPeriods.find(mp => mp.is_current);
      if (currentPeriod) {
        setMarkingPeriod(currentPeriod.id);
      } else {
        // Fallback to first marking period if no current one
        setMarkingPeriod(allMarkingPeriods[0].id);
      }
    }
  }, [markingPeriod, allMarkingPeriods, setMarkingPeriod]);

  const assessmentsList = assessments || [];
  const canEdit = gradebook?.status === GradeStatus.DRAFT;
  
  // Determine if grades can be edited based on workflow status
  // Grades are editable only in draft or rejected status
  const predominantStatus = useMemo(() => {
    if (!finalGrades?.students) return GradeStatus.DRAFT;
    
    // Count statuses across all student grades for this marking period
    const statusCounts: Record<string, number> = {};
    finalGrades.students.forEach((student: SectionStudentGrade) => {
      const studentGradebook = student.gradebooks?.find((g) => g.id === gradebook?.id);
      const status = studentGradebook?.status || GradeStatus.DRAFT;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Return the most common status, or draft if no grades
    if (Object.keys(statusCounts).length === 0) return GradeStatus.DRAFT;
    return Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0][0];
  }, [finalGrades, gradebook?.id]);
  
  const canEditGrades = predominantStatus === GradeStatus.DRAFT || predominantStatus === GradeStatus.REJECTED;

  // Check if marking period is selected
  const hasMarkingPeriod = Boolean(markingPeriod);

  const rejectedGradesCount = useMemo(() => {
    if (!finalGrades?.students) return 0;
    return finalGrades.students.filter((student: SectionStudentGrade) => {
      const studentGradebook = student.gradebooks?.find((g) => g.id === gradebook?.id);
      return studentGradebook?.status === "rejected";
    }).length;
  }, [finalGrades, gradebook?.id]);

  const pendingGradesCount = useMemo(() => {
    if (!finalGrades?.students) return 0;
    return finalGrades.students.filter((student: SectionStudentGrade) => {
      const studentGradebook = student.gradebooks?.find((g) => g.id === gradebook?.id);
      return studentGradebook?.status === "pending";
    }).length;
  }, [finalGrades, gradebook?.id]);

  const gradingConfig = finalGrades?.config;
  const showAssessmentsTab = Boolean(
    gradingConfig && (gradingConfig.grading_style !== "single_entry" || gradingConfig.display_assessment_on_single_entry)
  );
  const canReview = Boolean(gradingConfig?.require_grade_review);
  const canApprove = Boolean(gradingConfig?.require_grade_approval);
  const canCreateAssessment = Boolean(gradingConfig?.allow_assessment_create);
  const canEditAssessment = Boolean(gradingConfig?.allow_assessment_edit);
  const canDeleteAssessment = Boolean(gradingConfig?.allow_assessment_delete);

  // Prepare marking period options for selector
  const markingPeriodOptions = (allMarkingPeriods || []).map(mp => ({
    value: mp.id,
    label: `${mp.name} (${mp.semester.name})`,
  }));

  // Determine if we came from teacher grades page
  const fromTeacherGrades = Boolean(
    fromParam && fromParam.includes("/staff/") && fromParam.includes("/grades")
  );
  const backUrl = fromParam || backToListUrl;

  const headerBreadcrumbs = useMemo(() => {
    if (fromTeacherGrades && gradebook && fromParam) {
      const staffIdMatch = fromParam.match(/\/staff\/([^/]+)\/grades/);
      const staffId = staffIdMatch ? staffIdMatch[1] : "";

      return [
        {
          label: "Staff Profile",
          href: staffId ? `/staff/${staffId}/students` : undefined,
        },
        {
          label: "My Classes & Grades",
          href: fromParam,
        },
        {
          label: `${gradebook.subject.name} Grade Entry`,
          current: true,
        },
      ];
    }

    return [
      {
        label: "Gradebooks",
        href: backToListUrl,
      },
      {
        label: gradebook ? `${gradebook.subject.name} - ${gradebook.section.name}` : "Gradebook",
        current: true,
      },
    ];
  }, [fromTeacherGrades, gradebook, fromParam, backToListUrl]);

  useHeaderBreadcrumbs(headerBreadcrumbs);

  return (
    <>
      <PageLayout
        title={gradebook ? `${gradebook.subject.name} - ${gradebook.section.name}` : "Gradebook"}
        description={gradebook ? `${gradebook.grade_level.name} • ${gradebook.academic_year.name}` : "Loading..."}
        loading={loading}
        error={error}
        actions={
          gradebook && (
            <div className="flex items-center gap-3">
                {/* Contextual Back Button */}
                {fromTeacherGrades ? (
                  <Button
                    variant="outline"
                    iconLeft={<ArrowLeft className="h-4 w-4" />}
                    onClick={() => router.push(backUrl)}
                  >
                    Back to My Classes
                  </Button>
                ) : null}
              
                <div className="flex items-center gap-4">
                  <label htmlFor="marking-period-select" className="text-sm font-medium text-foreground shrink-0">
                    Marking Period:
                  </label>
                  <div className="w-full max-w-md">
                    <SelectField
                      items={markingPeriodOptions}
                      value={markingPeriod || ""}
                      onValueChange={(value) => setMarkingPeriod(value as string)}
                      placeholder="Select marking period"
                      disabled={markingPeriodOptions.length === 0 || loading || fetching}
                      triggerClassName="bg-gray-100"
                    />
                  </div>
                </div>
              {/* <Badge variant={getStatusVariant(gradebook.status)}>
                {gradebook.status}
              </Badge> */}
              {canEdit && (
                <Button
                  variant="outline"
                  icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
                  onClick={() => setCreateAssessmentOpen(true)}
                  disabled={loading || fetching}
                >
                  Add Assessment
                </Button>
              )}
                <Button
                  variant="outline"
                  onClick={handleRefetch}
                  loading={loading || fetching}
                  icon={<RefreshCcw className="h-4 w-4" />}
                />
            </div>
          )
        }
      >
        {gradebook && (
          <>
            {/* Gradebook Navigation - Allow switching between gradebooks, sections, grade levels */}
            <GradebookNav 
              currentGradebookId={gradebookId} 
              currentGradebook={gradebook}
            />

            {/* Workflow Status Banner */}
            {hasMarkingPeriod && finalGrades?.students && (
              <Alert className={cn(
                predominantStatus === GradeStatus.DRAFT && "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900",
                predominantStatus === GradeStatus.REJECTED && "border-destructive/50 bg-destructive/10",
                predominantStatus === GradeStatus.PENDING && "border-warning/50 bg-warning/10",
                predominantStatus === GradeStatus.REVIEWED && "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20",
                predominantStatus === GradeStatus.SUBMITTED && "border-purple-500/50 bg-purple-50 dark:bg-purple-950/20",
                predominantStatus === GradeStatus.APPROVED && "border-success/50 bg-success/10"
              )}>
                <div className="flex items-start gap-3">
                  {predominantStatus === GradeStatus.DRAFT && <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />}
                  {predominantStatus === GradeStatus.REJECTED && <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />}
                  {predominantStatus === GradeStatus.PENDING && <Clock className="h-5 w-5 text-warning mt-0.5" />}
                  {predominantStatus === GradeStatus.REVIEWED && <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />}
                  {predominantStatus === GradeStatus.SUBMITTED && <Clock className="h-5 w-5 text-purple-600 mt-0.5" />}
                  {predominantStatus === GradeStatus.APPROVED && <Lock className="h-5 w-5 text-success mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">Grade Entry Status:</span>
                      <GradeWorkflowBadge status={predominantStatus} />
                    </div>
                    <AlertDescription className="text-sm">
                      {predominantStatus === GradeStatus.DRAFT && (
                        <>You can enter and edit grades. When ready, submit them for {canReview ? "review" : canApprove ? "approval" : "finalization"}.</>
                      )}
                      {predominantStatus === GradeStatus.REJECTED && (
                        <>These grades were rejected. Please review the feedback, make corrections, and resubmit.</>
                      )}
                      {predominantStatus === GradeStatus.PENDING && (
                        <>Grades are awaiting review. You cannot edit them until they are reviewed or rejected.</>
                      )}
                      {predominantStatus === GradeStatus.REVIEWED && (
                        <>Grades have been reviewed{canApprove ? " and are awaiting approval" : " and are ready for submission"}. Editing is locked.</>
                      )}
                      {predominantStatus === GradeStatus.SUBMITTED && (
                        <>Grades have been submitted{canApprove ? " and are awaiting final approval" : ""}. Editing is locked.</>
                      )}
                      {predominantStatus === GradeStatus.APPROVED && (
                        <>Grades have been approved and finalized. No further edits are allowed.</>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {/* Gradebook Info */}
            {/* <Card className="gap-1">
              <CardHeader>
                <CardTitle className="text-base">Gradebook Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Teacher
                  </div>
                  <div className="mt-1">
                    {gradebook.teacher?.full_name || (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Calculation Method
                  </div>
                  <div className="mt-1 capitalize">
                    {gradebook.calculation_method.replace("_", " ")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Assessments
                  </div>
                  <div className="mt-1">
                    {gradebook.total_assessments !== undefined ? (
                      <>
                        {gradebook.calculated_assessments || 0}/
                        {gradebook.total_assessments}
                      </>
                    ) : (
                      assessmentsList.length
                    )}
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Marking Period Selector */}
            {/* <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <label htmlFor="marking-period-select" className="text-sm font-medium text-foreground shrink-0">
                    Marking Period:
                  </label>
                  <div className="w-full max-w-md">
                    <SelectField
                      items={markingPeriodOptions}
                      value={markingPeriod || ""}
                      onValueChange={(value) => setMarkingPeriod(value as string)}
                      placeholder="Select marking period"
                      disabled={markingPeriodsLoading || markingPeriodOptions.length === 0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Tabs for Grade Entry and Assessments */}
            <Tabs value={activeTab || "entry"} onValueChange={(value) => setActiveTab(value)}>
              <TabsList>
                <TabsTrigger value="entry">
                  <span className="flex items-center gap-2">
                    <span>Grade Entry</span>
                    {rejectedGradesCount > 0 && (
                      <Badge variant="destructive">{rejectedGradesCount}</Badge>
                    )}
                  </span>
                </TabsTrigger>
                {showAssessmentsTab && (
                  <TabsTrigger value="assessments">
                    Assessments {hasMarkingPeriod && `(${assessmentsList.length})`}
                  </TabsTrigger>
                )}
                {canReview && (
                  <TabsTrigger value="reviewGrades">
                    <span className="flex items-center gap-2">
                      <span>Review Grades</span>
                      {pendingGradesCount > 0 && (
                        <Badge variant="secondary">{pendingGradesCount}</Badge>
                      )}
                    </span>
                  </TabsTrigger>
                )}
                {canApprove && (
                  <TabsTrigger value="approveGrades">Approve Grades</TabsTrigger>
                )}
                <TabsTrigger value="viewGrades">View Grades</TabsTrigger>
              </TabsList>

              <TabsContent value="entry" className="mt-4">
                {!hasMarkingPeriod ? (
                  <Card className="p-8 text-center">
                    <div className="text-muted-foreground">
                      Please select a marking period to view grade entry.
                    </div>
                  </Card>
                ) : assessmentsList.length === 0 ? (
                  <EmptyState>
                    <EmptyStateIcon>
                      <HugeiconsIcon icon={FileIcon} className="h-12 w-12" />
                    </EmptyStateIcon>
                    <EmptyStateTitle>No assessments yet</EmptyStateTitle>
                    <EmptyStateDescription>
                      Create your first assessment to start entering grades
                    </EmptyStateDescription>
                    <EmptyStateAction onClick={() => setCreateAssessmentOpen(true)}>
                      Create Assessment
                    </EmptyStateAction>
                  </EmptyState>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Grade Entry</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <GradeEntryTable
                        gradebook={gradebook}
                        markingPeriodId={markingPeriod}
                        canEdit={canEditGrades}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {showAssessmentsTab && (
                <TabsContent value="assessments" className="mt-4">
                {!hasMarkingPeriod ? (
                  <Card className="p-8 text-center">
                    <div className="text-muted-foreground">
                      Please select a marking period to view assessments.
                    </div>
                  </Card>
                ) : (
                  <>
                    <div className="flex items-center justify-end mb-4">
                      {canCreateAssessment && (
                        <Button
                          variant="default"
                          icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
                          onClick={() => setCreateAssessmentOpen(true)}
                        >
                          Add Assessment
                        </Button>
                      )}
                    </div>
                    <AssessmentsList
                      assessments={assessmentsList}
                      canEdit={canEditAssessment}
                      canDelete={canDeleteAssessment}
                      canAdd={canCreateAssessment}
                      onAdd={() => setCreateAssessmentOpen(true)}
                    />
                  </>
                )}
                </TabsContent>
              )}

              {canReview && (
                <TabsContent value="reviewGrades" className="mt-4">
                  {!hasMarkingPeriod ? (
                    <Card className="p-8 text-center">
                      <div className="text-muted-foreground">
                        Please select a marking period to review grades.
                      </div>
                    </Card>
                  ) : (
                    <FinalGradesTable
                      data={finalGrades}
                      isLoading={finalGradesLoading}
                      type="review"
                      markingPeriodId={markingPeriod}
                    />
                  )}
                </TabsContent>
              )}

              {canApprove && (
                <TabsContent value="approveGrades" className="mt-4">
                  {!hasMarkingPeriod ? (
                    <Card className="p-8 text-center">
                      <div className="text-muted-foreground">
                        Please select a marking period to approve grades.
                      </div>
                    </Card>
                  ) : (
                    <FinalGradesTable
                      data={finalGrades}
                      isLoading={finalGradesLoading}
                      type="approve"
                      markingPeriodId={markingPeriod}
                    />
                  )}
                </TabsContent>
              )}

              <TabsContent value="viewGrades" className="mt-4">
                {!hasMarkingPeriod ? (
                  <Card className="p-8 text-center">
                    <div className="text-muted-foreground">
                      Please select a marking period to view grades.
                    </div>
                  </Card>
                ) : (
                  <FinalGradesTable
                    data={finalGrades}
                    isLoading={finalGradesLoading}
                    type="view"
                    markingPeriodId={markingPeriod}
                  />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </PageLayout>

      <CreateAssessmentDialog
        open={createAssessmentOpen}
        onOpenChange={setCreateAssessmentOpen}
        gradebookId={gradebookId}
      />
    </>
  );
}
