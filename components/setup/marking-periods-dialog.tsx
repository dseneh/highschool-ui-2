import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Edit02Icon,
  BookOpen02Icon,
  Calendar03Icon,
  TimeScheduleIcon,
  Clock03Icon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { SemesterDto } from "@/lib/api/academic-year-types";

interface MarkingPeriodsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semester: SemesterDto | null;
  onEdit: (id: string) => void;
}

export function MarkingPeriodsDialog({ 
  open, 
  onOpenChange, 
  semester, 
  onEdit 
}: MarkingPeriodsDialogProps) {
  if (!semester) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={BookOpen02Icon} className="size-5 text-primary" />
            {semester.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
              {format(new Date(semester.start_date), "MMM d")} — {format(new Date(semester.end_date), "MMM d, yyyy")}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={TimeScheduleIcon} className="size-3.5" />
              {semester.marking_periods?.length || 0} Marking Period{semester.marking_periods?.length !== 1 ? 's' : ''}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto -mx-6 px-6">
          <div className="border border-border rounded-lg overflow-hidden mt-4">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Period
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Date Range
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Duration
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {semester.marking_periods?.map((mp) => {
                  const mpDays = Math.ceil(
                    (new Date(mp.end_date).getTime() - new Date(mp.start_date).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const today = new Date();
                  const isActive = new Date(mp.start_date) <= today && today <= new Date(mp.end_date);
                  const isPast = new Date(mp.end_date) < today;
                  const isFuture = new Date(mp.start_date) > today;
                  
                  return (
                    <tr 
                      key={mp.id} 
                      className={cn(
                        "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                        isActive && "bg-primary/5"
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "size-2 rounded-full shrink-0",
                            isActive && "bg-primary animate-pulse",
                            isPast && "bg-muted-foreground/30",
                            isFuture && "bg-muted-foreground/50"
                          )} />
                          <span className="font-medium">{mp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {format(new Date(mp.start_date), "MMM d")} — {format(new Date(mp.end_date), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <HugeiconsIcon icon={Clock03Icon} className="size-3.5 text-muted-foreground" />
                          {mpDays}d
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isActive ? (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        ) : isPast ? (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Completed</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Upcoming</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<HugeiconsIcon icon={Edit02Icon} />}
                          onClick={() => {
                            onEdit(mp.id);
                            onOpenChange(false);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
