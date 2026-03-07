import { EmptyState, EmptyStateDescription, EmptyStateTitle } from "@/components/ui/empty-state";

type SetupComingSoonProps = {
  title: string;
  description?: string;
};

export function SetupComingSoon({
  title,
  description = "This page is being prepared. Check back soon.",
}: SetupComingSoonProps) {
  return (
    <EmptyState className="border-none bg-muted/20">
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <EmptyStateDescription>{description}</EmptyStateDescription>
    </EmptyState>
  );
}
