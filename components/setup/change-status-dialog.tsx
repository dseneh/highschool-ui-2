"use client";

import React from "react";
import { toast } from "sonner";
import { DialogBox } from "@/components/ui/dialog-box";
import { Badge } from "@/components/ui/badge";
import { useAcademicYearMutations } from "@/hooks/use-academic-year";
import { getErrorMessage } from "@/lib/utils";
import type { AcademicYearDto } from "@/lib/api/academic-year-types";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircleIcon,
  Clock03Icon,
  PauseIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: AcademicYearDto | null;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return CheckmarkCircleIcon;
    case "onhold":
      return Clock03Icon;
    case "inactive":
      return PauseIcon;
    default:
      return CheckmarkCircleIcon;
  }
}

const statuses: Array<{ value: "active" | "inactive" | "onhold"; label: string; description: string }> = [
  {
    value: "active",
    label: "Active",
    description:
      "Academic year is operational. All features are available.",
  },
  {
    value: "onhold",
    label: "On Hold",
    description:
      "Academic year is paused. No new data can be entered.",
  },
  {
    value: "inactive",
    label: "Inactive",
    description:
      "Academic year is closed. Read-only access only.",
  },
];

export function ChangeStatusDialog({
  open,
  onOpenChange,
  year,
}: ChangeStatusDialogProps) {
  const { changeStatus } = useAcademicYearMutations();
  const [selectedStatus, setSelectedStatus] = React.useState<"active" | "inactive" | "onhold" | null>(null);

  React.useEffect(() => {
    if (year) {
      setSelectedStatus(year.status as "active" | "inactive" | "onhold");
    }
  }, [year, open]);

  const handleChangeStatus = () => {
    if (!year?.id || !selectedStatus) return;

    changeStatus.mutate(
      { id: year.id, status: selectedStatus },
      {
        onSuccess: () => {
          toast.success(`Academic year status changed to ${selectedStatus}`);
          onOpenChange(false);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  if (!year) return null;

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Change Academic Year Status"
      description={
        <>
          Current status: <Badge variant="outline" className="capitalize ml-2">{year.status}</Badge>
        </>
      }
      actionLabel="Change Status"
      actionLoading={changeStatus.isPending}
      onAction={handleChangeStatus}
      actionDisabled={selectedStatus === year.status}
      cancelLabel="Cancel"
      onCancel={() => onOpenChange(false)}
    >
      <div className="space-y-3">
        {statuses.map((status) => {
          const StatusIcon = getStatusIcon(status.value);
          const isSelected = selectedStatus === status.value;

          return (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted/50"
              )}
            >
              <div className="flex items-start gap-3">
                <HugeiconsIcon
                  icon={StatusIcon}
                  className={cn(
                    "size-5 mt-1 shrink-0",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div>
                  <p className="font-semibold">{status.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {status.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </DialogBox>
  );
}
