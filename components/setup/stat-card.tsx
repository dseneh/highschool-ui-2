import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  className?: string;
}

export function StatCard({ icon, label, value, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-muted/50 p-4", className)}>
      <div className="flex items-center gap-2 mb-1">
        <HugeiconsIcon icon={icon} className="size-4 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
