import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeftRight,
  Ban,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Circle,
  Clock3,
  DollarSign,
  FileCheck,
  Landmark,
  MinusCircle,
  PenSquare,
  UserMinus,
  UserX,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

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
  approved: "success",
  rejected: "destructive",
  canceled: "destructive",
  cancelled: "destructive",
  calcelled: "destructive",
  deleted: "destructive",
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
  posted: "success",
  draft: "outline",
  reversed: "destructive",
  closed: "destructive",
  asset: "default",
  liability: "secondary",
  equity: "outline",
  income: "success",
  expense: "destructive",
  transfer: "secondary",
};

const DEFAULT_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  approved: "Approved",
  rejected: "Rejected",
  canceled: "Canceled",
  cancelled: "Cancelled",
  calcelled: "Cancelled",
  deleted: "Deleted",
  inactive: "Inactive",
  suspended: "Suspended",
  trial: "Trial",
  other: "Other",
  pending: "Pending",
  posted: "Posted",
  draft: "Draft",
  reversed: "Reversed",
  closed: "Closed",
  asset: "Asset",
  liability: "Liability",
  equity: "Equity",
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
};

const DEFAULT_STATUS_ICONS: Partial<Record<string, LucideIcon>> = {
  active: CheckCircle2,
  approved: CheckCircle2,
  rejected: MinusCircle,
  canceled: Ban,
  cancelled: Ban,
  calcelled: Ban,
  deleted: MinusCircle,
  inactive: MinusCircle,
  suspended: Ban,
  trial: Clock3,
  other: Circle,
  enrolled: Users,
  graduated: FileCheck,
  dropped: UserX,
  withdrawn: UserMinus,
  pending: Clock3,
  "not enrolled": UserX,
  posted: CheckCircle2,
  draft: PenSquare,
  reversed: ArrowLeftRight,
  closed: Ban,
  asset: Landmark,
  liability: Briefcase,
  equity: Wallet,
  income: DollarSign,
  expense: AlertTriangle,
  transfer: ArrowLeftRight,
};

export interface StatusBadgeProps {
  status?: string | null;
  className?: string;
  label?: string;
  fallbackStatus?: string;
  labels?: Partial<Record<string, string>>;
  variants?: Partial<Record<string, BadgeVariant>>;
  icons?: Partial<Record<string, LucideIcon>>;
  showIcon?: boolean;
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
  icons,
  showIcon = true,
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

  const mergedIcons: Partial<Record<string, LucideIcon>> = {
    ...DEFAULT_STATUS_ICONS,
    ...(icons || {}),
  };

  const resolvedVariant = mergedVariants[normalizedStatus] ?? "secondary";
  const resolvedLabel =
    label ||
    mergedLabels[normalizedStatus] ||
    normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
  const StatusIcon = showIcon ? mergedIcons[normalizedStatus] : undefined;

  return (
    <Badge variant={resolvedVariant} className={cn(disabled && "opacity-60", className)}>
      {StatusIcon ? <StatusIcon className="size-4" /> : null}
      {resolvedLabel}
      {disabled ? disabledSuffix : ""}
    </Badge>
  );
}
