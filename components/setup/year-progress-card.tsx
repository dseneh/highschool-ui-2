import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";

interface YearProgressCardProps {
  completionPercentage: number;
  daysElapsed: number;
  totalDays: number;
}

export function YearProgressCard({ completionPercentage, daysElapsed, totalDays }: YearProgressCardProps) {
  const daysLeft = totalDays - daysElapsed;

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Calendar03Icon} className="size-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">Year Progress</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{completionPercentage}%</p>
            <div className="flex items-center gap-2 justify-between">
              <p className="text-xs text-muted-foreground">
                {daysElapsed} of {totalDays} days
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {daysLeft} days left
              </p>
            </div>
          </div>
        </div>
        <div className="relative size-16 flex-shrink-0">
          <svg className="size-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
              className="text-primary transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <HugeiconsIcon icon={Calendar03Icon} className="size-6 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
