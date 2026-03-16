"use client"

import { useQueryState } from "nuqs"
import { useStudents as useStudentsApi } from "@/lib/api2/student"
import { useStudentFinalGrades } from "@/hooks/use-grading"
import { useCurrentAcademicYear } from "@/hooks/use-academic-year"
import { useStudentPageActions, StudentPageDialogs } from "@/hooks/use-student-page-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state"
import AcademicYearSelect from "@/components/shared/data-reusable/academic-year-select"
import MarkingPeriodSelect from "@/components/shared/data-reusable/marking-period-select"
import StatCard from "./_components/stat-card"
import GradesSkeleton from "./_components/grades-skeleton"

import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, BookOpen02Icon, Medal01Icon, ChartIcon } from "@hugeicons/core-free-icons"
import { CircularProgress } from "@/components/ui/circular-progress"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import type { GradeBookRecord } from "@/lib/api2/grading-types"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import PageLayout from "@/components/dashboard/page-layout"
import { useResolvedStudentIdNumber } from "@/hooks/use-resolved-student-id-number"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Get initials from a subject name, e.g. "Social Studies" → "SS" */
function getSubjectInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
  return words.map((w) => w[0]).join("").toUpperCase().slice(0, 4)
}

function getGradeColor(grade: number | null | undefined): string {
  if (grade === null || grade === undefined) return "text-muted-foreground"
  if (grade >= 90) return "text-emerald-600"
  if (grade >= 80) return "text-blue-600"
  if (grade >= 70) return "text-amber-600"
  if (grade >= 60) return "text-orange-600"
  return "text-red-600"
}



/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentGradesPage() {
  const idNumber = useResolvedStudentIdNumber()
  const { resolvedTheme } = useTheme()

  const studentsApi = useStudentsApi()
  const { data: student, isLoading: studentLoading, refetch, isFetching, error } = studentsApi.getStudent(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/students/"),
  })
  const hookResult = useStudentPageActions(student)

  const { data: currentYear } = useCurrentAcademicYear()
  const [yearParam] = useQueryState("year", { defaultValue: "" })
  const [markingPeriodParam] = useQueryState("markingPeriod", { defaultValue: "" })

  const activeYearId = yearParam || currentYear?.id || ""

  const {
    data: gradesData,
    isLoading: gradesLoading,
    error: gradesError,
  } = useStudentFinalGrades(student?.id, activeYearId, markingPeriodParam || undefined)

  if (studentLoading) return <GradesSkeleton />

  const gradebooks = gradesData?.gradebooks ?? []
  const overallAvg = gradesData?.overall_averages?.final_average
  const sectionRanking = gradesData?.ranking?.section
  const gradeLevelRanking = gradesData?.ranking?.grade_level
  const useLetterGrades = gradesData?.config?.use_letter_grades ?? false
  const totalGradebooks = gradesData?.total_gradebooks ?? gradebooks.length

  // Chart data — one bar per subject (initials for labels, full name in tooltip)
  const chartData = gradebooks.map((gb: GradeBookRecord) => ({
    subject: getSubjectInitials(gb.subject.name),
    average: gb.marking_period.final_percentage ?? 0,
    fullName: gb.subject.name,
  }))

  const passingCount = gradebooks.filter(
    (gb: GradeBookRecord) => (gb.marking_period.final_percentage ?? 0) >= 50
  ).length

  // Final averages chart data (across all marking periods)
  const finalAvgChartData = gradebooks.map((gb: GradeBookRecord) => ({
    subject: getSubjectInitials(gb.subject.name),
    average: gb.averages.final_average ?? 0,
    fullName: gb.subject.name,
  }))

  const highestAvg = gradebooks.length
    ? Math.max(...gradebooks.map((gb: GradeBookRecord) => gb.averages.final_average ?? 0))
    : undefined

    const loading = isFetching || gradesLoading
  return (
    <PageLayout
    title="Academic Grades" 
    description="Student grades and academic performance"
    actions={
      <div className="flex items-center gap-2">
            <AcademicYearSelect noTitle selectClassName="w-50" autoSelectFirst disabled={loading} />
            <MarkingPeriodSelect noTitle selectClassName="w-50" disabled={loading} />
            <Button 
              icon={<RefreshCcw />}
                variant="outline"
                tooltip="Refresh page data"
              onClick={() => refetch()}
              loading={loading}
            />
          </div>
    }
    error={error || gradesError}
    skeleton={<GradesSkeleton />}
    loading={studentLoading || gradesLoading}
    noData={gradebooks.length === 0 && !gradesLoading && !gradesError}
    >
      <div className="space-y-4">

        {/* Prompt to select marking period */}
        {!markingPeriodParam && (
          <Card className="p-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40">
            <div className="flex items-start gap-3">
              <HugeiconsIcon icon={BookOpen02Icon} className="size-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                  Select a Marking Period
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Choose an academic year and marking period above to view grades.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Summary Cards — only show when we have data */}
        {markingPeriodParam && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Overall Average */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Average</p>
                  <p className={cn("text-2xl font-bold", getGradeColor(overallAvg))}>
                    {overallAvg != null ? `${overallAvg.toFixed(1)}%` : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalGradebooks} Subject{totalGradebooks !== 1 ? "s" : ""}
                  </p>
                </div>
                {overallAvg != null ? (
                  <CircularProgress
                    value={overallAvg}
                    size={56}
                    strokeWidth={5.2}
                    className={getGradeColor(overallAvg)}
                  />
                ) : (
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    <HugeiconsIcon icon={Medal01Icon} className="size-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            </Card>

            {/* Section Rank */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Section Rank</p>
                  <p className="text-2xl font-bold">
                    {sectionRanking?.rank ?? "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sectionRanking
                      ? `out of ${sectionRanking.total_students} students`
                      : "No ranking available"}
                  </p>
                </div>
                <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                  <HugeiconsIcon icon={ChartIcon} className="size-6 text-amber-600" />
                </div>
              </div>
            </Card>

            {/* Total Subjects / Passing */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Subjects</p>
                  <p className="text-2xl font-bold">{totalGradebooks}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {passingCount} passing
                  </p>
                </div>
                <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <HugeiconsIcon icon={BookOpen02Icon} className="size-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Loading state for grades */}
        {gradesLoading && markingPeriodParam ? (
          <div className="space-y-4">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        ) : gradesError && markingPeriodParam ? (
          <Card className="p-6 border-destructive/50 bg-destructive/10">
            <div className="flex items-start gap-3">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">Error Loading Grades</h3>
                <p className="text-sm text-muted-foreground">
                  {gradesError.message || "Could not load grade data"}
                </p>
              </div>
            </div>
          </Card>
        ) : gradebooks.length === 0 && markingPeriodParam && !gradesLoading ? (
          <EmptyState>
            <EmptyStateIcon className="p-4 [&_svg]:size-8">
              <HugeiconsIcon icon={BookOpen02Icon} />
            </EmptyStateIcon>
            <EmptyStateTitle>No Grades Available</EmptyStateTitle>
            <EmptyStateDescription>
              No grade data found for the selected marking period. Grades will appear here once
              they are recorded.
            </EmptyStateDescription>
          </EmptyState>
        ) : gradebooks.length > 0 ? (
          <>
            {/* Subject Performance Charts — compact payroll-style */}
            {chartData.length > 0 && (
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Marking Period Scores */}
                <StatCard
                  title="Period Scores"
                  value={overallAvg ?? null}
                  subtitle={`${passingCount}/${totalGradebooks} subjects passing`}
                  chartData={chartData}
                  icon={ChartIcon}
                  isDark={resolvedTheme === 'dark'}
                  gradientId="fillFinalAvg"
                  gradientStart="#4ade80"
                  gradientEnd="rgba(74, 222, 128, 0.5)"
                  gradientEndOpacity={0.5}
                  barName="Score"
                />

                {/* Final Averages */}
                <StatCard
                  title="Final Averages"
                  value={highestAvg ?? null}
                  subtitle="Highest subject avg"
                  chartData={finalAvgChartData}
                  icon={BookOpen02Icon}
                  isDark={resolvedTheme === 'dark'}
                  gradientId="fillFinalAvg"
                  gradientStart="#4ade80"
                  gradientEnd="rgba(74, 222, 128, 0.5)"
                  gradientEndOpacity={1}
                  barName="Final Avg"
                />
              </div>
            )}

            {/* Grades Table — Excel-style */}
            <Card className="pb-0 overflow-hidden gap-0 space-y-0">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle className="text-base">Subject Grades</CardTitle>
                {gradeLevelRanking && (
                  <Badge variant="outline" className="text-xs">
                    Grade Level Rank: {gradeLevelRanking.rank}/{gradeLevelRanking.total_students}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-0!">
                <div className="overflow-x-auto h-auto">
                  <table className="w-full border-collapse text-sm [&_th:first-child]:border-l-0 [&_td:first-child]:border-l-0 [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0 [&_thead_th]:border-t-0 [&_tfoot_td]:border-b-0 [&_tbody_tr:last-child_td]:border-b-0">
                    <thead>
                      <tr className="bg-muted/60">
                        <th className="border border-border px-3 py-2 text-left font-semibold text-muted-foreground">#</th>
                        <th className="border border-border px-3 py-2 text-left font-semibold text-muted-foreground min-w-44">Subject</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-muted-foreground min-w-24">Score</th>
                        {useLetterGrades && (
                          <th className="border border-border px-3 py-2 text-center font-semibold text-muted-foreground min-w-20">Grade</th>
                        )}
                        <th className="border border-border px-3 py-2 text-center font-semibold text-muted-foreground min-w-24">Status</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-muted-foreground min-w-20">Rank</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-muted-foreground min-w-24">Final Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradebooks.map((gb: GradeBookRecord, idx: number) => {
                        const mp = gb.marking_period
                        const score = mp.final_percentage
                        const finalAvg = gb.averages.final_average
                        return (
                          <tr key={gb.id} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                            <td className="border border-border px-3 py-2 text-muted-foreground tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="border border-border px-3 py-2 font-medium">
                              {gb.subject.name}
                            </td>
                            <td className={cn(
                              "border border-border px-3 py-2 text-center tabular-nums",
                              score != null ? cn("font-semibold", getGradeColor(score)) : ""
                            )}>
                              {score != null ? score.toFixed(1) : "-"}
                            </td>
                            {useLetterGrades && (
                              <td className={cn(
                                "border border-border px-3 py-2 text-center font-medium",
                                mp.letter_grade ? getGradeColor(score) : ""
                              )}>
                                {mp.letter_grade || "-"}
                              </td>
                            )}
                            <td className="border border-border px-3 py-2 text-center">
                              {mp.status ? (
                                <span className={cn(
                                  "inline-block rounded px-1.5 py-0.5 text-xs font-medium capitalize",
                                  mp.status === "approved"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                    : mp.status === "submitted" || mp.status === "reviewed"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                                      : "bg-muted text-muted-foreground"
                                )}>
                                  {mp.status}
                                </span>
                              ) : "-"}
                            </td>
                            <td className="border border-border px-3 py-2 text-center tabular-nums text-muted-foreground">
                              {mp.rank ? `${mp.rank.rank}/${mp.rank.total_students}` : "-"}
                            </td>
                            <td className={cn(
                              "border border-border px-3 py-2 text-center tabular-nums",
                              finalAvg != null ? cn("font-bold", getGradeColor(finalAvg)) : ""
                            )}>
                              {finalAvg != null ? finalAvg.toFixed(1) : "-"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    {/* Footer row with overall */}
                    {gradebooks.length > 0 && (
                      <tfoot>
                        <tr className="bg-muted/60 font-semibold">
                          <td className="border border-border px-3 py-2" colSpan={2}>
                            Overall
                          </td>
                          <td className={cn(
                            "border border-border px-3 py-2 text-center tabular-nums",
                            overallAvg != null ? getGradeColor(overallAvg) : ""
                          )}>
                            {overallAvg != null ? overallAvg.toFixed(1) : "-"}
                          </td>
                          {useLetterGrades && (
                            <td className="border border-border px-3 py-2 text-center">-</td>
                          )}
                          <td className="border border-border px-3 py-2 text-center">-</td>
                          <td className="border border-border px-3 py-2 text-center tabular-nums text-muted-foreground">
                            {sectionRanking ? `${sectionRanking.rank}/${sectionRanking.total_students}` : "-"}
                          </td>
                          <td className={cn(
                            "border border-border px-3 py-2 text-center tabular-nums",
                            overallAvg != null ? getGradeColor(overallAvg) : ""
                          )}>
                            {overallAvg != null ? overallAvg.toFixed(1) : "-"}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
      <StudentPageDialogs student={student} hookResult={hookResult} />
    </PageLayout>
  )
}
