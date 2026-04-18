"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectField } from "@/components/ui/select-field";
import {
  CreateEmployeePositionCommand,
  EmployeePositionDto,
} from "@/lib/api2/employee-types";
import { useEmployeeDepartments } from "@/hooks/use-employee";

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "Full-Time", label: "Full-Time" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Contract", label: "Contract" },
  { value: "Temporary", label: "Temporary" },
  { value: "Intern", label: "Intern" },
];

const positionFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  employmentType: z.string().min(1, "Employment type is required"),
  canTeach: z.boolean().optional(),
});

type PositionFormData = z.infer<typeof positionFormSchema>;

interface PositionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeePositionCommand) => Promise<void>;
  isSubmitting: boolean;
  initialData?: EmployeePositionDto;
}

export function PositionFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialData,
}: PositionFormModalProps) {
  const { data: departments = [] } = useEmployeeDepartments();

  const departmentOptions = React.useMemo(
    () =>
      departments.map((department) => ({
        value: department.id,
        label: department.name,
      })),
    [departments]
  );

  const form = useForm<PositionFormData>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      code: initialData?.code || "",
      description: initialData?.description || "",
      departmentId: initialData?.departmentId || "",
      employmentType: initialData?.employmentType || "Full-Time",
      canTeach: initialData?.canTeach || false,
    },
  });

  const departmentValue = useWatch({
    control: form.control,
    name: "departmentId",
  });
  const employmentTypeValue = useWatch({
    control: form.control,
    name: "employmentType",
  });
  const canTeachValue = useWatch({
    control: form.control,
    name: "canTeach",
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: initialData?.title || "",
        code: initialData?.code || "",
        description: initialData?.description || "",
        departmentId: initialData?.departmentId || "",
        employmentType: initialData?.employmentType || "Full-Time",
        canTeach: initialData?.canTeach || false,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: PositionFormData) => {
    await onSubmit({
      title: data.title,
      code: data.code || null,
      description: data.description || null,
      departmentId: data.departmentId || null,
      employmentType: data.employmentType,
      canTeach: data.canTeach ?? false,
    });
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Position" : "Add New Position"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the employee position details"
              : "Create a new position for employee onboarding and HR management"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Position Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Head Teacher, Finance Officer"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Position Code</label>
              <Input placeholder="e.g., HT-001" {...form.register("code")} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Employment Type</label>
              <SelectField
                searchable
                items={EMPLOYMENT_TYPE_OPTIONS}
                value={employmentTypeValue || ""}
                onValueChange={(value) => form.setValue("employmentType", value as string)}
                placeholder="Select employment type"
              />
              {form.formState.errors.employmentType && (
                <p className="text-xs text-red-500">{form.formState.errors.employmentType.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Department</label>
            <SelectField
              searchable
              items={departmentOptions}
              value={departmentValue || ""}
              onValueChange={(value) => form.setValue("departmentId", value as string)}
              placeholder="Select department"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe the responsibilities and scope of this position"
              className="min-h-20"
              {...form.register("description")}
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-dashed p-4">
            <Checkbox
              id="canTeach"
              checked={canTeachValue}
              onCheckedChange={(checked) => form.setValue("canTeach", checked === true)}
            />
            <label htmlFor="canTeach" className="text-sm font-medium">
              This position is eligible for teaching duties
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              {initialData ? "Update Position" : "Add Position"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
