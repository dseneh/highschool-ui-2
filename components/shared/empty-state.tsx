import React from "react";
import { Button } from "@/components/ui/button";
import {
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyState,
} from "@/components/ui/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserMultiple02Icon, Add01Icon } from "@hugeicons/core-free-icons";

type EmptyStateProps = {
  handleAction?: () => void;
  actionProps?: any;
  title: string;
  description?: string;
  actionTitle?: string;
  icon?: React.ReactNode;
};
export default function EmptyStateComponent({
  handleAction,
  actionProps,
  title,
  description,
  actionTitle,
  icon,
}: EmptyStateProps) {
  return (
    <EmptyState className="">
      <EmptyStateIcon className="p-4 [&_svg]:size-8">
        {icon ? icon : <HugeiconsIcon icon={UserMultiple02Icon} />}
      </EmptyStateIcon>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      {description && (
        <EmptyStateDescription>{description}</EmptyStateDescription>
      )}
      {handleAction && (
      <Button
        size="sm"
        className="mt-4"
        icon={<HugeiconsIcon icon={Add01Icon} className="size-4" />}
        onClick={handleAction}
        {...actionProps}
      >
        {actionTitle}
      </Button>
      )}
    </EmptyState>
  );
}
