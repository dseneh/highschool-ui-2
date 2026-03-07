import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Edit02Icon, 
  BookOpen02Icon,
  Calendar03Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { SemesterDto } from "@/lib/api2/academic-year-types";

interface SemesterCardProps {
  semester: SemesterDto;
  onEdit: (id: string) => void;
  onViewMarkingPeriods: (semester: SemesterDto) => void;
}

export function SemesterCard({ semester, onEdit, onViewMarkingPeriods }: SemesterCardProps) {
  const totalDays = Math.ceil(
    (new Date(semester.end_date).getTime() - new Date(semester.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = Math.max(
    0,
    Math.min(
      totalDays,
      Math.ceil(
        (new Date().getTime() - new Date(semester.start_date).getTime()) / (1000 * 60 * 60 * 24)
      )
    )
  );
  const progress = totalDays > 0 ? Math.round((daysElapsed / totalDays) * 100) : 0;

  return (
    <Card 
      className={cn(
        "transition-all border-2 gap-0",
        semester.is_current 
          ? "border-primary shadow-lg shadow-primary/20" 
          : "border-border hover:border-muted-foreground/30"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <HugeiconsIcon 
                icon={BookOpen02Icon} 
                className={cn(
                  "size-5",
                  semester.is_current ? "text-primary" : "text-muted-foreground"
                )}
              />
              <CardTitle className="text-lg flex items-center gap-2">
                {semester.name}
                 {semester.is_current && (
              <Badge className="bg-primary text-primary-foreground">
                Active Now
              </Badge>
            )}
                </CardTitle>
            </div>
           
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<HugeiconsIcon icon={Edit02Icon} />}
            onClick={() => onEdit(semester.id)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm">
          <HugeiconsIcon icon={Calendar03Icon} className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {format(new Date(semester.start_date), "MMM d, yyyy")} — {format(new Date(semester.end_date), "MMM d, yyyy")}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                semester.is_current
                  ? "bg-linear-to-r from-primary to-primary/80"
                  : "bg-linear-to-r from-muted-foreground/60 to-muted-foreground/40"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {daysElapsed} of {totalDays} days
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-semibold">{totalDays} days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Marking Periods</p>
            <p className="font-semibold">{semester.marking_periods?.length || 0}</p>
          </div>
        </div>

        {/* View Marking Periods Button */}
        {semester.marking_periods && semester.marking_periods.length > 0 && (
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            icon={<HugeiconsIcon icon={ViewIcon} />}
            onClick={() => onViewMarkingPeriods(semester)}
          >
            View Marking Periods
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
