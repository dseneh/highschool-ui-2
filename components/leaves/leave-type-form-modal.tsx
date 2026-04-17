"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { DialogBox2 } from "@/components/ui/dialog-box2";
import type { CreateLeaveTypeCommand, LeaveTypeDto } from "@/lib/api2/leave-types";

const leaveTypeSchema = z
  .object({
    name: z.string().min(2, "Leave type name is required"),
    code: z.string().optional(),
    description: z.string().optional(),
    defaultDays: z.coerce.number().min(1, "Default days must be at least 1"),
    requiresApproval: z.boolean(),
    accrualFrequency: z.string().min(1, "Accrual frequency is required"),
    allowCarryover: z.boolean(),
    maxCarryoverDays: z.coerce.number().min(0, "Carryover cap cannot be negative"),
  })
  .superRefine((data, context) => {
    if (data.allowCarryover && data.maxCarryoverDays < 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxCarryoverDays"],
        message: "Carryover cap must be at least 1 day when rollover is enabled",
      });
    }
  });

const ACCRUAL_FREQUENCY_OPTIONS = [
  { value: "Upfront", label: "Upfront" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Annually", label: "Annually" },
];

type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>;

interface LeaveTypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateLeaveTypeCommand) => Promise<void>;
  isSubmitting: boolean;
  initialData?: LeaveTypeDto;
}

export function LeaveTypeFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialData,
}: LeaveTypeFormModalProps) {
  const form = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      code: initialData?.code ?? "",
      description: initialData?.description ?? "",
      defaultDays: initialData?.defaultDays ?? 1,
      requiresApproval: initialData?.requiresApproval ?? true,
      accrualFrequency: initialData?.accrualFrequency ?? "Upfront",
      allowCarryover: initialData?.allowCarryover ?? false,
      maxCarryoverDays: initialData?.maxCarryoverDays ?? 0,
    },
  });

  const requiresApproval = useWatch({
    control: form.control,
    name: "requiresApproval",
  });
  const allowCarryover = useWatch({
    control: form.control,
    name: "allowCarryover",
  });
  const accrualFrequency = useWatch({
    control: form.control,
    name: "accrualFrequency",
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name ?? "",
        code: initialData?.code ?? "",
        description: initialData?.description ?? "",
        defaultDays: initialData?.defaultDays ?? 1,
        requiresApproval: initialData?.requiresApproval ?? true,
        accrualFrequency: initialData?.accrualFrequency ?? "Upfront",
        allowCarryover: initialData?.allowCarryover ?? false,
        maxCarryoverDays: initialData?.maxCarryoverDays ?? 0,
      });
    }
  }, [form, initialData, open]);

  const handleSubmit = async (data: LeaveTypeFormData) => {
    await onSubmit({
      name: data.name,
      code: data.code || null,
      description: data.description || null,
      defaultDays: data.defaultDays,
      requiresApproval: data.requiresApproval,
      accrualFrequency: data.accrualFrequency,
      allowCarryover: data.allowCarryover,
      maxCarryoverDays: data.allowCarryover ? data.maxCarryoverDays : 0,
    });
    form.reset();
  };

  return (
    <DialogBox2
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Leave Type" : "Add Leave Type"}
      description={
        initialData
          ? "Update the leave type details"
          : "Create a new leave category for employee requests"
      }
      size="md"
      formId="leave-type-form"
      submitLabel={initialData ? "Update Leave Type" : "Create Leave Type"}
      loading={isSubmitting}
    >
      <form id="leave-type-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <Input placeholder="Annual Leave" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Code</label>
            <Input placeholder="AL" {...form.register("code")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Default Days</label>
            <Input type="number" min={1} {...form.register("defaultDays")} />
            {form.formState.errors.defaultDays && (
              <p className="text-xs text-red-500">{form.formState.errors.defaultDays.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Accrual Frequency</label>
          <SelectField
            items={ACCRUAL_FREQUENCY_OPTIONS}
            value={accrualFrequency}
            onValueChange={(value) => form.setValue("accrualFrequency", value as string)}
            placeholder="Select accrual frequency"
          />
          {form.formState.errors.accrualFrequency && (
            <p className="text-xs text-red-500">{form.formState.errors.accrualFrequency.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <Textarea placeholder="Explain when this leave type should be used" {...form.register("description")} />
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm">
            <Checkbox
              checked={requiresApproval}
              onCheckedChange={(checked) => form.setValue("requiresApproval", checked === true)}
            />
            <span>Require approval before the leave becomes active</span>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm">
            <Checkbox
              checked={allowCarryover}
              onCheckedChange={(checked) => form.setValue("allowCarryover", checked === true)}
            />
            <span>Allow unused leave days to roll over into the new year</span>
          </label>
        </div>

        {allowCarryover ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Carryover Cap</label>
            <Input type="number" min={1} {...form.register("maxCarryoverDays")} />
            {form.formState.errors.maxCarryoverDays && (
              <p className="text-xs text-red-500">{form.formState.errors.maxCarryoverDays.message}</p>
            )}
          </div>
        ) : null}
      </form>
    </DialogBox2>
  );
}
