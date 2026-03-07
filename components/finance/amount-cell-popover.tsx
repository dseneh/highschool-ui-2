"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AmountCellPopoverProps {
  feeId: string;
  amount: number;
  active: boolean;
  onUpdateAmount: (id: string, amount: number, applyToAllSections: boolean) => void;
    isUpdating?: boolean;
}

export function AmountCellPopover({
  feeId,
  amount,
  active,
  onUpdateAmount,
  isUpdating,
}: AmountCellPopoverProps) {
  const [editAmount, setEditAmount] = React.useState("");
  const [applyToAllSections, setApplyToAllSections] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isOpen]);

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setEditAmount(amount.toString());
      setApplyToAllSections(true);
    }
  };

  const handleSaveAmount = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const parsedAmount = parseFloat(editAmount);
    if (!isNaN(parsedAmount) && parsedAmount >= 0) {
      onUpdateAmount(feeId, parsedAmount, applyToAllSections);
      setEditAmount("");
      setApplyToAllSections(false);
      setIsOpen(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveAmount(e);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel(e as any);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setEditAmount(e.target.value);
  };

  const checkboxId = `apply-to-all-sections-${feeId}`;

  return (
    <div className="flex items-center justify-end gap-2 group">
      <span className="font-semibold">{formatCurrency(amount)}</span>
      <Popover open={isOpen} onOpenChange={handleOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 p-0  transition-opacity"
            disabled={!active}
            icon={<Pencil className="size-3" />}
            tooltip="Edit amount"
          >
            <span className="sr-only">Edit amount</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-4"
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Amount
              </label>
              <Input
                ref={inputRef}
                type="number"
                value={editAmount}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="0.00"
                step="0.01"
                min="0"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id={checkboxId}
                checked={applyToAllSections}
                onCheckedChange={(checked) =>
                  setApplyToAllSections(checked === true)
                }
              />
              <label
                htmlFor={checkboxId}
                className="text-sm text-muted-foreground cursor-pointer select-none leading-tight"
              >
                Apply to all sections
              </label>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t">
              <Button size="sm" 
              onClick={handleSaveAmount}
              loading={isUpdating}
              >
                Update Amount
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={isUpdating}>
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
