import StatusBadge from "@/components/ui/status-badge";

type GradeWorkflowStatus = "draft" | "pending" | "reviewed" | "submitted" | "approved" | "rejected";

interface GradeWorkflowBadgeProps {
  status: GradeWorkflowStatus | string;
  className?: string;
  showLabel?: boolean;
}

const WORKFLOW_STATUS_LABELS: Record<GradeWorkflowStatus, string> = {
  draft: "Draft",
  pending: "Pending Review",
  reviewed: "Reviewed",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

const WORKFLOW_STATUS_VARIANTS = {
  draft: "outline" as const,
  pending: "warning" as const,
  reviewed: "secondary" as const,
  submitted: "default" as const,
  approved: "success" as const,
  rejected: "destructive" as const,
};

export function GradeWorkflowBadge({
  status,
  className,
  showLabel = true,
}: GradeWorkflowBadgeProps) {
  const normalizedStatus = (status || "draft").toLowerCase() as GradeWorkflowStatus;

  return (
    <StatusBadge
      status={normalizedStatus}
      label={showLabel ? WORKFLOW_STATUS_LABELS[normalizedStatus] : undefined}
      variants={WORKFLOW_STATUS_VARIANTS}
      className={className}
    />
  );
}
