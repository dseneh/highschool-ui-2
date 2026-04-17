"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogBox2 } from "@/components/ui/dialog-box2";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import type { CreatePayrollComponentCommand, PayrollComponentDto } from "@/lib/api2/payroll-types";

const componentSchema = z.object({
  name: z.string().min(2, "Component name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  componentType: z.string().min(1, "Component type is required"),
  calculationMethod: z.string().min(1, "Calculation method is required"),
  defaultValue: z.coerce.number().min(0, "Default value cannot be negative"),
  taxable: z.boolean(),
});

type ComponentFormData = z.infer<typeof componentSchema>;

const COMPONENT_TYPE_OPTIONS = [
  { value: "Earning", label: "Earning" },
  { value: "Deduction", label: "Deduction" },
];

const CALCULATION_METHOD_OPTIONS = [
  { value: "Fixed", label: "Fixed Amount" },
  { value: "Percentage", label: "Percentage of Base/Gross" },
];

interface PayrollComponentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePayrollComponentCommand) => Promise<void>;
  isSubmitting: boolean;
  initialData?: PayrollComponentDto;
}

export function PayrollComponentFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialData,
}: PayrollComponentFormModalProps) {
  const form = useForm<ComponentFormData>({
    resolver: zodResolver(componentSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      code: initialData?.code ?? "",
      description: initialData?.description ?? "",
      componentType: initialData?.componentType ?? "Earning",
      calculationMethod: initialData?.calculationMethod ?? "Fixed",
      defaultValue: initialData?.defaultValue ?? 0,
      taxable: initialData?.taxable ?? false,
    },
  });

  const componentType = useWatch({ control: form.control, name: "componentType" });
  const calculationMethod = useWatch({ control: form.control, name: "calculationMethod" });
  const taxable = useWatch({ control: form.control, name: "taxable" });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name ?? "",
        code: initialData?.code ?? "",
        description: initialData?.description ?? "",
        componentType: initialData?.componentType ?? "Earning",
        calculationMethod: initialData?.calculationMethod ?? "Fixed",
        defaultValue: initialData?.defaultValue ?? 0,
        taxable: initialData?.taxable ?? false,
      });
    }
  }, [form, initialData, open]);

  const handleSubmit = async (data: ComponentFormData) => {
    await onSubmit({
      name: data.name,
      code: data.code || null,
      description: data.description || null,
      componentType: data.componentType,
      calculationMethod: data.calculationMethod,
      defaultValue: data.defaultValue,
      taxable: data.taxable,
    });
    form.reset();
  };

  return (
    <DialogBox2
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Payroll Component" : "Add Payroll Component"}
      description="Configure reusable earnings and deductions for employee compensation packages"
      size="md"
      formId="payroll-component-form"
      submitLabel={initialData ? "Update Component" : "Create Component"}
      loading={isSubmitting}
    >
      <form id="payroll-component-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <Input placeholder="Housing Allowance" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Code</label>
            <Input placeholder="HOUSE" {...form.register("code")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Default Value</label>
            <Input type="number" min={0} step="0.01" {...form.register("defaultValue")} />
            {form.formState.errors.defaultValue ? (
              <p className="text-xs text-red-500">{form.formState.errors.defaultValue.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Component Type</label>
            <SelectField
              items={COMPONENT_TYPE_OPTIONS}
              value={componentType}
              onValueChange={(value) => form.setValue("componentType", value as string)}
              placeholder="Select component type"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Calculation Method</label>
            <SelectField
              items={CALCULATION_METHOD_OPTIONS}
              value={calculationMethod}
              onValueChange={(value) => form.setValue("calculationMethod", value as string)}
              placeholder="Select calculation method"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <Textarea placeholder="Describe how this payroll component should be applied" {...form.register("description")} />
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm">
          <Checkbox checked={taxable} onCheckedChange={(checked) => form.setValue("taxable", checked === true)} />
          <span>Mark this component as taxable for payroll reporting</span>
        </label>
      </form>
    </DialogBox2>
  );
}
