import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Timeline, TimelineItem } from "@/components/shared/timeline";
import AvatarImg from "@/components/shared/avatar-img";
import { DialogBox } from "../ui/dialog-box";

interface GradeChange {
  id: string;
  change_type: string;
  old_score: string | null;
  new_score: string | null;
  old_status: string | null;
  new_status: string | null;
  old_comment: string | null;
  new_comment: string | null;
  change_reason: string | null;
  changed_by: {
    id: string;
    name: string;
  } | null;
  changed_at: string;
}

interface GradeHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradeId: string;
  studentName: string;
  studentPhoto?: string | null;
  subjectName?: string | null;
  periodName?: string | null;
  history?: GradeChange[]; // Optional: pass history from payload to avoid API call
}

const getChangeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    create: "Created",
    score: "Score",
    status: "Status",
    comment: "Comment",
    correction: "Correction",
    bulk: "Bulk",
  };
  return labels[type] || type;
};

const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return null;

  const colors: Record<string, string> = {
    draft: "secondary",
    pending: "warning",
    reviewed: "default",
    submitted: "default",
    approved: "success",
    rejected: "destructive",
  };

  return (
    <Badge variant={(colors[status] as any) || "secondary"} className="text-xs">
      {status}
    </Badge>
  );
};

export function GradeHistoryModal({
  open,
  onOpenChange,
  gradeId,
  studentName,
  studentPhoto,
  subjectName,
  periodName,
  history: passedHistory,
}: GradeHistoryModalProps) {
  const { data: response, isLoading } = useQuery({
    queryKey: ["grade-history", gradeId],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/grading/grades/${gradeId}/history/`,
      );
      if (!response.ok) throw new Error("Failed to fetch history");
      return response.json();
    },
    enabled: open && !passedHistory, // Only fetch if history not passed
  });

  const history = passedHistory || response?.data || [];
  const orderedHistory = [...history].sort((a: GradeChange, b: GradeChange) => {
    return new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime();
  });

  return (
    <DialogBox
      open={open}
      showCloseButton={false}
      onOpenChange={onOpenChange}
      className="w-full max-w-2xl"
      cancelLabel="Close"
      title={
        <div className="flex items-center gap-2 justify-between w-full border-b pb-2">
          <div className="text-sm">Grade History</div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <div className="text-sm font-medium text-foreground">
                {studentName}
              </div>
              <div className="text-xs text-muted-foreground">
                {subjectName || "Subject"}
                {periodName ? ` • ${periodName}` : ""}
              </div>
            </div>
            <AvatarImg
              src={studentPhoto || undefined}
              alt={studentName}
              name={studentName}
              className="h-10 w-10"
              imgClassName="object-cover"
            />
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : orderedHistory.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No change history yet
        </div>
      ) : (
        <div className="overflow-auto flex-1 pr-1">
          <Timeline>
            {orderedHistory.map((change: GradeChange) => {
              const hasScoreChange = change.old_score !== change.new_score;
              const hasStatusChange = change.old_status !== change.new_status;
              const hasCommentChange =
                change.old_comment !== change.new_comment;
              const showDetails =
                hasScoreChange || hasStatusChange || hasCommentChange;

              return (
                <TimelineItem key={change.id}>
                  <div className="rounded-md border bg-card p-3 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {getChangeTypeLabel(change.change_type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(change.changed_at),
                          "MMM d, yyyy HH:mm",
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {change.changed_by?.name || "System"}
                      </span>
                    </div>

                    {showDetails && (
                      <div className="mt-2 grid gap-2 text-sm">
                        {hasScoreChange && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Score</span>
                            <span className="text-red-600 font-medium">
                              {change.old_score || "—"}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-green-600 font-medium">
                              {change.new_score || "—"}
                            </span>
                          </div>
                        )}

                        {hasStatusChange && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Status
                            </span>
                            <StatusBadge status={change.old_status} />
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <StatusBadge status={change.new_status} />
                          </div>
                        )}

                        {hasCommentChange && (
                          <div className="grid gap-1 text-xs">
                            <div className="text-muted-foreground">Comment</div>
                            <div className="flex flex-col gap-1">
                              <div className="rounded bg-muted/50 px-2 py-1 text-muted-foreground">
                                <span className="line-through">
                                  {change.old_comment || "(empty)"}
                                </span>
                              </div>
                              <div className="rounded bg-muted/50 px-2 py-1">
                                {change.new_comment || "(empty)"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {change.change_reason && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Reason:
                        </span>{" "}
                        {change.change_reason}
                      </div>
                    )}
                  </div>
                </TimelineItem>
              );
            })}
          </Timeline>
        </div>
      )}
    </DialogBox>
  );
}
