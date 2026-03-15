import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import type { PeriodDto, PeriodType } from "./types";

type CreatePeriodDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodName: string;
  periodDescription: string;
  periodType: PeriodType;
  periodError: string | null;
  loading: boolean;
  onPeriodNameChange: (value: string) => void;
  onPeriodDescriptionChange: (value: string) => void;
  onPeriodTypeChange: (value: PeriodType) => void;
  onSubmit: () => void;
};

export function CreatePeriodDialog({
  open,
  onOpenChange,
  periodName,
  periodDescription,
  periodType,
  periodError,
  loading,
  onPeriodNameChange,
  onPeriodDescriptionChange,
  onPeriodTypeChange,
  onSubmit,
}: CreatePeriodDialogProps) {
  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Create Period"
      description="Create a shared period label used across sections (e.g., Period 1, Recess)."
      onAction={onSubmit}
      actionLabel="Create Period"
      actionLoading={loading}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="period-name">Period Name</Label>
          <Input
            id="period-name"
            value={periodName}
            onChange={(e) => onPeriodNameChange(e.target.value)}
            placeholder="e.g. Period 1 or Recess"
          />
        </div>
        <div className="space-y-1">
          <Label>Period Type</Label>
          <SelectField
            value={periodType}
            onValueChange={(value) => onPeriodTypeChange(String(value) as PeriodType)}
            items={[
              { value: "class", label: "Class" },
              { value: "recess", label: "Recess" },
            ]}
            placeholder="Select period type"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="period-description">Description (optional)</Label>
          <Input
            id="period-description"
            value={periodDescription}
            onChange={(e) => onPeriodDescriptionChange(e.target.value)}
            placeholder="Optional description"
          />
        </div>
        {periodError && <p className="text-sm text-destructive">{periodError}</p>}
      </div>
    </DialogBox>
  );
}

type AddOrEditSlotDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  selectedSectionName?: string;
  slotError: string | null;
  loading: boolean;
  effectivePeriodId: string;
  dayOfWeek: string;
  sortOrder: string;
  startTime: string;
  endTime: string;
  periods: PeriodDto[];
  dayOptions: Array<{ value: string; label: string }>;
  onPeriodChange: (value: string) => void;
  onDayChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onSubmit: () => void;
};

export function AddOrEditSlotDialog({
  open,
  onOpenChange,
  isEditing,
  selectedSectionName,
  slotError,
  loading,
  effectivePeriodId,
  dayOfWeek,
  sortOrder,
  startTime,
  endTime,
  periods,
  dayOptions,
  onPeriodChange,
  onDayChange,
  onSortOrderChange,
  onStartTimeChange,
  onEndTimeChange,
  onSubmit,
}: AddOrEditSlotDialogProps) {
  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Time Slot" : "Add Time Slot"}
      description={
        selectedSectionName
          ? `${isEditing ? "Updating" : "Adding"} a slot for ${selectedSectionName}.`
          : "Add a period slot to the selected section."
      }
      onAction={onSubmit}
      actionLabel={isEditing ? "Save Changes" : "Add Slot"}
      actionLoading={loading}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Period</Label>
          <SelectField
            value={effectivePeriodId}
            onValueChange={(value) => onPeriodChange(String(value))}
            items={periods.map((period) => ({
              value: period.id,
              label: `${period.name} (${period.period_type || "class"})`,
            }))}
            placeholder="Select period"
            searchable
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Day</Label>
            <SelectField
              value={dayOfWeek}
              onValueChange={(value) => onDayChange(String(value))}
              items={dayOptions}
              placeholder="Day"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Sort Order</Label>
            <Input
              type="number"
              min={1}
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="slot-start">Start Time</Label>
            <Input
              id="slot-start"
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slot-end">End Time</Label>
            <Input
              id="slot-end"
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
            />
          </div>
        </div>
        {slotError && <p className="text-sm text-destructive">{slotError}</p>}
      </div>
    </DialogBox>
  );
}
