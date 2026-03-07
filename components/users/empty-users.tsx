"use client";

import { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription } from "@/components/ui/empty-state";

export function EmptyUsers() {
  return (
    <EmptyState>
      <EmptyStateIcon />
      <EmptyStateTitle>No Users Found</EmptyStateTitle>
      <EmptyStateDescription>
        No users have been created yet. Create one to get started.
      </EmptyStateDescription>
    </EmptyState>
  );
}
