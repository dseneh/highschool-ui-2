"use client";

import * as React from "react";
import { DialogBox } from "@/components/ui/dialog-box";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { GeneralFeeDto } from "@/lib/api2/finance-types";
import { formatCurrency } from "@/lib/utils";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface AddFeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feeIds: string[]) => void;
  loading?: boolean;
  availableFees: GeneralFeeDto[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AddFeeDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  availableFees,
}: AddFeeDialogProps) {
  const [selectedFeeIds, setSelectedFeeIds] = React.useState<string[]>([]);

  // Reset selection when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedFeeIds([]);
    }
  }, [open]);

  const handleToggleFee = (feeId: string, checked: boolean) => {
    setSelectedFeeIds((prev) =>
      checked ? [...prev, feeId] : prev.filter((id) => id !== feeId)
    );
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedFeeIds(checked ? availableFees.map((f) => f.id) : []);
  };

  const handleSubmit = () => {
    if (selectedFeeIds.length > 0) {
      onSubmit(selectedFeeIds);
    }
  };

  const allSelected =
    availableFees.length > 0 && selectedFeeIds.length === availableFees.length;
  const someSelected = selectedFeeIds.length > 0 && !allSelected;

  const dialogContent = availableFees.length === 0 ? (
    <div className="py-8">
      <EmptyState>
        <EmptyStateTitle>No Available Fees</EmptyStateTitle>
        <EmptyStateDescription>
          All active fees are already assigned to this section, or no fees exist.
        </EmptyStateDescription>
      </EmptyState>
    </div>
  ) : (
    <>
      {/* Select All */}
      <div className="flex items-center space-x-2 pb-2 border-b">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={handleToggleAll}
                id="select-all"
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Select All ({selectedFeeIds.length}/{availableFees.length})
              </label>
            </div>

            {/* Fee List */}
            {/* <ScrollArea className="max-h-[400px] pr-4"> */}
              <div className="space-y-2 py-2">
                {availableFees.map((fee) => {
                  const isChecked = selectedFeeIds.includes(fee.id);
                  return (
                    <div
                      key={fee.id}
                      className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleToggleFee(fee.id, !!checked)
                        }
                        id={fee.id}
                      />
                      <label
                        htmlFor={fee.id}
                        className="flex-1 cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{fee.name}</span>
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(fee.amount)}
                          </span>
                        </div>
                        {/* {fee.description && (
                          <p className="text-xs -mt-1 text-muted-foreground">
                            {fee.description}
                          </p>
                        )} */}
                        {fee.student_target && (
                          <p className="text-xs text-muted-foreground">
                            Target: {fee.student_target}
                          </p>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            {/* </ScrollArea> */}
          </>
        );

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Add Fees to Section"
      description="Select one or more fees to assign to this section."
      actionLabel={`Add ${selectedFeeIds.length > 0 ? `(${selectedFeeIds.length})` : ""} Fee${selectedFeeIds.length !== 1 ? "s" : ""}`}
      onAction={handleSubmit}
      actionLoading={loading}
      cancelLabel={availableFees.length === 0 ? "Close" : "Cancel"}
      footer={availableFees.length === 0 ? null : undefined}
    >
      {dialogContent}
    </DialogBox>
  );
}
