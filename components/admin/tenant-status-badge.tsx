import StatusBadge from "@/components/ui/status-badge";

interface TenantStatusBadgeProps {
  status?: string;
  active?: boolean;
  className?: string;
};

export default function TenantStatusBadge({
  status,
  active,
  className,
}: TenantStatusBadgeProps) {
  return (
    <StatusBadge
      status={status}
      className={className}
      disabled={!(active ?? false)}
      fallbackStatus="inactive"
    />
  );
}
