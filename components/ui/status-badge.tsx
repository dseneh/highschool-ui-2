import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "warning"
  | "other"
  | "outline"
  | "ghost"
  | "link"
  | "success";

const DEFAULT_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  active: "success",
  inactive: "destructive",
  suspended: "warning",
  trial: "outline",
  other: "other",
  enrolled: "success",
  graduated: "success",
  dropped: "destructive",
  withdrawn: "destructive",
  pending: "warning",
  'not enrolled': "destructive",
};

const DEFAULT_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  trial: "Trial",
  other: "Other",
};

export interface StatusBadgeProps {
  status?: string | null;
  className?: string;
  label?: string;
  fallbackStatus?: string;
  labels?: Partial<Record<string, string>>;
  variants?: Partial<Record<string, BadgeVariant>>;
  disabled?: boolean;
  disabledSuffix?: string;
}

export default function StatusBadge({
  status,
  className,
  label,
  fallbackStatus = "inactive",
  labels,
  variants,
  disabled = false,
  disabledSuffix = " (Disabled)",
}: StatusBadgeProps) {
  const normalizedStatus = (status || fallbackStatus).toLowerCase();

  const mergedVariants: Partial<Record<string, BadgeVariant>> = {
    ...DEFAULT_STATUS_VARIANTS,
    ...(variants || {}),
  };

  const mergedLabels: Partial<Record<string, string>> = {
    ...DEFAULT_STATUS_LABELS,
    ...(labels || {}),
  };

  const resolvedVariant = mergedVariants[normalizedStatus] ?? "secondary";
  const resolvedLabel =
    label ||
    mergedLabels[normalizedStatus] ||
    normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

  return (
    <Badge variant={resolvedVariant} className={cn(disabled && "opacity-60", className)}>
      {resolvedLabel}
      {disabled ? disabledSuffix : ""}
    </Badge>
  );
}
