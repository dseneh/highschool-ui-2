"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SelectField } from "../ui/select-field";

interface ConcessionFiltersProps {
  typeFilter: string;
  targetFilter: string;
  minAmount: string;
  maxAmount: string;
  onTypeFilterChange: (value: string) => void;
  onTargetFilterChange: (value: string) => void;
  onMinAmountChange: (value: string) => void;
  onMaxAmountChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function ConcessionFilters({
  typeFilter,
  targetFilter,
  minAmount,
  maxAmount,
  onTypeFilterChange,
  onTargetFilterChange,
  onMinAmountChange,
  onMaxAmountChange,
  onClearFilters,
  hasActiveFilters,
}: ConcessionFiltersProps) {

    const typeOptions = [
        { value: "all", label: "All Types" },
        { value: "percentage", label: "Percentage" },
        { value: "flat", label: "Flat" },
    ];

    const targetOptions = [
        { value: "all", label: "All Targets" },
        { value: "entire_bill", label: "Entire Bill" },
        { value: "tuition", label: "Tuition" },
        { value: "other_fees", label: "Other Fees" },
    ];
  return (
    <div className="space-y-4 flex  items-center gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Type Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Type</label>
          <SelectField
            value={typeFilter}
            onValueChange={(value:any) => onTypeFilterChange(value || "all")}
            items={typeOptions}
          />
        </div>

        {/* Target Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Target</label>
          <SelectField
            value={targetFilter}
            onValueChange={(value:any) => onTargetFilterChange(value || "all")}
            items={targetOptions}
          />
        </div>

        {/* Min Amount */}
        <div>
          <label className="text-sm font-medium mb-2 block">Min Amount</label>
          <Input
            type="number"
            placeholder="0"
            value={minAmount}
            onChange={(e) => onMinAmountChange(e.target.value)}
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="text-sm font-medium mb-2 block">Max Amount</label>
          <Input
            type="number"
            placeholder="No limit"
            value={maxAmount}
            onChange={(e) => onMaxAmountChange(e.target.value)}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={onClearFilters}
            icon={<X className="h-4 w-4" />}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
