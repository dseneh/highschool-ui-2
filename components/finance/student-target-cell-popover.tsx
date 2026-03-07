"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";

const STUDENT_TARGET_OPTIONS = [
  { value: "", label: "All Students" },
  { value: "new", label: "New Students" },
  { value: "returning", label: "Returning Students" },
  { value: "transferred", label: "Transferred Students" },
];

const STUDENT_TARGET_LABELS: Record<string, string> = {
  new: "New Students",
  returning: "Returning Students",
  transferred: "Transferred Students",
  "": "All Students",
};

const TARGET_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  returning: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  transferred: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

interface StudentTargetCellPopoverProps {
  feeId: string;
  studentTarget: string;
  active: boolean;
  onUpdateTarget: (
    feeId: string,
    studentTarget: string,
    applyToAllSections: boolean
  ) => void;
  isUpdating?: boolean;
}

export function StudentTargetCellPopover({
  feeId,
  studentTarget,
  active,
  onUpdateTarget,
  isUpdating,
}: StudentTargetCellPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedTarget, setSelectedTarget] = React.useState(studentTarget || "");
  const [applyToAllSections, setApplyToAllSections] = React.useState(false);

  const currentTarget = studentTarget || "";
  const label = STUDENT_TARGET_LABELS[currentTarget] || "All Students";
  const colorClass = TARGET_COLORS[currentTarget] || TARGET_COLORS[""];

  const hasChanged = selectedTarget !== currentTarget;

  const handleSave = () => {
    if (!hasChanged) {
      setOpen(false);
      return;
    }
    onUpdateTarget(feeId, selectedTarget, applyToAllSections);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedTarget(currentTarget);
    setApplyToAllSections(false);
    setOpen(false);
  };

  // Reset state when popover opens
  React.useEffect(() => {
    if (open) {
      setSelectedTarget(currentTarget);
      setApplyToAllSections(false);
    }
  }, [open, currentTarget]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
        size="sm"
        variant="outline"
          className={cn(
            "w-full inline-flex cursor-pointer hover:opacity-80 transition-opacity",
            !active && "opacity-50 cursor-not-allowed"
          )}
          disabled={!active}
          iconRight={<ChevronDownIcon className="size-3" />}
        >
            {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="center">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Update Student Target</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Select which type of students this fee applies to.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="target-select" className="text-sm font-medium mb-1.5 block">
                Target Students
              </label>
              <SelectField
                items={STUDENT_TARGET_OPTIONS}
                value={selectedTarget}
                onValueChange={(value) => setSelectedTarget(value as string)}
                placeholder="Select target..."
                className="w-full"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="apply-to-sections"
                checked={applyToAllSections}
                onChange={(e) => setApplyToAllSections(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="apply-to-sections"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Apply to all sections using this fee
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="flex-1"
              disabled={!hasChanged || isUpdating}
              loading={isUpdating}
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
