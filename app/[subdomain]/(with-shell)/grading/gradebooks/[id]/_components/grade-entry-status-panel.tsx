"use client";

import { AlertCircle, CheckCircle2, Clock, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeWorkflowBadge } from "@/components/grading/grade-workflow-badge";
import { GradeStatus } from "@/lib/api2/grading-types";
import { cn } from "@/lib/utils";

interface GradeEntryStatusPanelProps {
  status: string;
  canReview: boolean;
  canApprove: boolean;
  hasMarkingPeriod: boolean;
}

const statusClassMap: Record<string, string> = {
  [GradeStatus.DRAFT]: "border-gray-300 bg-gray-50 dark:border-gray-600/50 dark:bg-gray-800/50",
  [GradeStatus.REJECTED]: "border-destructive/50 bg-destructive/10 dark:border-destructive/50 dark:bg-destructive/10",
  [GradeStatus.PENDING]: "border-warning/50 bg-warning/10 dark:border-warning/50 dark:bg-warning/10",
  [GradeStatus.REVIEWED]: "border-blue-500/50 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-50",
  [GradeStatus.SUBMITTED]: "border-purple-500/50 bg-purple-50 dark:border-purple-500/50 dark:bg-purple-50",
  [GradeStatus.APPROVED]: "border-success/50 bg-success/10 dark:border-success/50 dark:bg-success/10",
};

function StatusIcon({ status, className }: { status: string; className?: string }) {
  if (status === GradeStatus.DRAFT) {
    return <AlertCircle className={cn("mt-0.5 h-4 w-4 text-gray-600", className)} />;
  }
  if (status === GradeStatus.REJECTED) {
    return <AlertCircle className={cn("mt-0.5 h-4 w-4 text-destructive", className)} />;
  }
  if (status === GradeStatus.PENDING) {
    return <Clock className={cn("mt-0.5 h-4 w-4 text-warning", className)} />;
  }
  if (status === GradeStatus.REVIEWED) {
    return <CheckCircle2 className={cn("mt-0.5 h-4 w-4 text-blue-600", className)} />;
  }
  if (status === GradeStatus.SUBMITTED) {
    return <Clock className={cn("mt-0.5 h-4 w-4 text-purple-600", className)} />;
  }
  return <Lock className={cn("mt-0.5 h-4 w-4 text-success", className)} />;
}

function getStatusDescription(status: string, canReview: boolean, canApprove: boolean) {
  if (status === GradeStatus.DRAFT) {
    return `You can enter and edit grades. When ready, submit them for ${canReview ? "review" : canApprove ? "approval" : "finalization"}.`;
  }
  if (status === GradeStatus.REJECTED) {
    return "These grades were rejected. Please review the feedback, make corrections, and resubmit.";
  }
  if (status === GradeStatus.PENDING) {
    return "Grades are awaiting review. You cannot edit them until they are reviewed or rejected.";
  }
  if (status === GradeStatus.REVIEWED) {
    return `Grades have been reviewed${canApprove ? " and are awaiting approval" : " and are ready for submission"}. Editing is locked.`;
  }
  if (status === GradeStatus.SUBMITTED) {
    return `Grades have been submitted${canApprove ? " and are awaiting final approval" : ""}. Editing is locked.`;
  }
  return "Grades have been approved and finalized. No further edits are allowed.";
}

export function GradeEntryStatusPanel({
  status,
  canReview,
  canApprove,
  hasMarkingPeriod,
}: GradeEntryStatusPanelProps) {
  if (!hasMarkingPeriod) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Grade Entry Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a marking period to view grade workflow status.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
        statusClassMap[status] || statusClassMap[GradeStatus.DRAFT],
        "border-0 p-2"
    )}>
      {/* <CardHeader className="fpb-2">
        <CardTitle className="text-sm">Grade Entry Status</CardTitle>
      </CardHeader> */}
      <CardContent className="fspace-y-2">
        <div className="flex items-center gap-2">
          <StatusIcon status={status} className="size-5 " />
          <GradeWorkflowBadge status={status} className="" />
        </div>
        <p className="text-xs text-muted-foreground">
          {getStatusDescription(status, canReview, canApprove)}
        </p>
      </CardContent>
    </Card>
  );
}
