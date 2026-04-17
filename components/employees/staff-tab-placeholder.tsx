"use client";

import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon } from "@hugeicons/core-free-icons";

interface StaffTabPlaceholderProps {
  title: string;
  description: string;
}

export function StaffTabPlaceholder({
  title,
  description,
}: StaffTabPlaceholderProps) {
  return (
    <div className="py-12">
      <EmptyState>
        <EmptyStateIcon>
          <HugeiconsIcon icon={UserGroupIcon} className="h-10 w-10" />
        </EmptyStateIcon>
        <EmptyStateTitle>{title}</EmptyStateTitle>
        <EmptyStateDescription>{description}</EmptyStateDescription>
      </EmptyState>
    </div>
  );
}
