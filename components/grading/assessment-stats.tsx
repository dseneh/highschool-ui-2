import { cn } from "@/lib/utils";
import type { AssessmentStatistics } from "@/lib/api2/grading-types";

interface StatsBasicProps {
  maxScore: string;
  weight: string;
  dueDate: string | null;
}

export function StatsBasic({ maxScore, weight, dueDate }: StatsBasicProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
      <span className="whitespace-nowrap">
        Max Score:{" "}
        <span className="font-semibold text-foreground">{maxScore} pts</span>
      </span>
      <span className="hidden sm:inline">•</span>
      <span className="whitespace-nowrap">
        Weight: <span className="font-semibold text-foreground">{weight}x</span>
      </span>
      <span className="hidden sm:inline">•</span>
      <span className="whitespace-nowrap">
        Due:{" "}
        <span className="font-semibold text-foreground">
          {dueDate
            ? new Date(dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "N/A"}
        </span>
      </span>
    </div>
  );
}

interface StatsProgressProps {
  statistics: AssessmentStatistics;
}

export function StatsProgress({ statistics }: StatsProgressProps) {
  const progressPercentage =
    statistics.total_students > 0
      ? ((statistics.graded_students / statistics.total_students) * 100).toFixed(
          0
        )
      : "0";

  const isComplete =
    statistics.graded_students === statistics.total_students &&
    statistics.total_students > 0;
  const isStarted = statistics.graded_students > 0;

  return (
    <div className="w-full space-y-2">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {statistics.graded_students}/{statistics.total_students}
          </span>{" "}
          graded
        </span>
        <span
          className={cn(
            "text-xs font-semibold",
            isComplete
              ? "text-green-600 dark:text-green-400"
              : isStarted
                ? "text-blue-600 dark:text-blue-400"
                : "text-muted-foreground"
          )}
        >
          {progressPercentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            isComplete
              ? "bg-green-500"
              : isStarted
                ? "bg-blue-500"
                : "bg-gray-400"
          )}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Performance Metrics - Compact */}
      {isStarted && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
          <span className="whitespace-nowrap">
            Avg:{" "}
            <span className="font-medium text-foreground">
              {statistics.average_score.toFixed(1)} (
              {statistics.average_percentage.toFixed(0)}%)
            </span>
          </span>
          {statistics.highest_score !== null && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">
                High:{" "}
                <span className="font-medium text-green-600 dark:text-green-400">
                  {statistics.highest_score}
                </span>
              </span>
            </>
          )}
          {statistics.lowest_score !== null && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">
                Low:{" "}
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {statistics.lowest_score}
                </span>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
