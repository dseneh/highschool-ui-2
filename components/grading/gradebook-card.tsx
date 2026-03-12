import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen02Icon,
  UserIcon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { GradeWorkflowBadge } from "./grade-workflow-badge";
import { cn } from "@/lib/utils";

interface GradebookCardProps {
  gradebook: any;
  statusBadge?: React.ReactNode;
  secondaryInfo?: React.ReactNode;
  actionMenu?: React.ReactNode;
    fromUrl?: string;
}

export function GradebookCard({
  gradebook,
  statusBadge,
  secondaryInfo,
  actionMenu,
    fromUrl,
}: GradebookCardProps) {
  // Determine if using statistics object (old API) or top-level properties (API2)
  const stats = gradebook.statistics || gradebook;
  const totalEnrolled = stats.total_enrolled_students || undefined;
  const studentsGraded = stats.students_with_grades || 0;
  
  // Get workflow status from gradebook data
  const workflowStatus = gradebook.workflow_status?.predominant_status || "draft";

  // Determine progress based on available data
  const hasStudentProgress =
    totalEnrolled !== undefined && studentsGraded !== undefined;

  let progressValue = 0;
  const progressLabel_ = "Grading Progress";
  let progressCurrent = "0";
  let progressTotal = "0";

//   if (hasStudentProgress) {
    progressValue =
      totalEnrolled > 0 ? (studentsGraded / totalEnrolled) * 100 : 0;
    progressCurrent = String(studentsGraded);
    progressTotal = String(totalEnrolled ?? 0);
//   }

  // Build the target URL with context
  const targetUrl = fromUrl 
    ? `/grading/gradebooks/${gradebook.id}?section=${gradebook.section.id}&gradeLevel=${gradebook.grade_level.id}&from=${encodeURIComponent(fromUrl)}`
    : `/grading/gradebooks/${gradebook.id}?section=${gradebook.section.id}&gradeLevel=${gradebook.grade_level.id}`;

  return (
    <Link
      href={targetUrl}
    >
      <Card className="group relative h-full cursor-pointer overflow-hidden border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 space-y-0 p-0">
        <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <CardContent className="relative space-y-4 p-4">
          {/* Header with icon, title, and status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-200 group-hover:bg-primary/15 group-hover:ring-primary/30">
                <HugeiconsIcon
                  icon={BookOpen02Icon}
                  className="h-6 w-6"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                  {gradebook.subject.name}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                    {gradebook.grade_level.name}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                    {gradebook.section.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <GradeWorkflowBadge status={workflowStatus} />
              {statusBadge}
              {actionMenu}
            </div>
          </div>

          {/* Info section */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <HugeiconsIcon
                icon={UserIcon}
                className="h-4 w-4 shrink-0"
              />
              <div className="flex items-center gap-2">
              <span className="truncate">
                Teacher:
              </span>
              <span className={cn(
                "truncate font-semibold",
                gradebook.teacher?.full_name ? "text-muted-foreground" : "text-orange-500"
              )}>
                {gradebook.teacher?.full_name || "No teacher assigned"}
              </span>
              </div>
            </div>

            {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Layers01Icon}
                      className="h-4 w-4 shrink-0"
                    />
                    <span className="text-muted-foreground">{progressLabel_}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {progressCurrent}/{progressTotal}
                  </span>
                </div>
                <Progress 
                  value={progressValue}
                  className="h-2"
                />
              </div>
            

            {secondaryInfo}
          </div>

        </CardContent>
      </Card>
    </Link>
  );
}
