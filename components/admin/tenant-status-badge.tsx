import { Badge } from "@/components/ui/badge";
import { TenantStatus } from "@/lib/api/admin-tenant-types";
import { cn } from "@/lib/utils";

interface TenantStatusBadgeProps {
  status?: string;
  active?: boolean;
}

const statusConfig = {
  active: {
    label: "Active",
    variant: "success" as const,
  },
  inactive: {
    label: "Inactive",
    variant: "secondary" as const,
  },
  suspended: {
    label: "Suspended",
    variant: "destructive" as const,
  },
  trial: {
    label: "Trial",
    variant: "outline" as const,
  },
};

export default function TenantStatusBadge({
  status,
  active,
}: TenantStatusBadgeProps) {
  const normalizedStatus = (status ?? "inactive") as TenantStatus;
  const config = statusConfig[normalizedStatus] ?? statusConfig.inactive;
  
  return (
    <Badge
      variant={config.variant}
      className={cn(!active && "opacity-60")}
    >
      {config.label}
      {!active && " (Disabled)"}
    </Badge>
  );
}
