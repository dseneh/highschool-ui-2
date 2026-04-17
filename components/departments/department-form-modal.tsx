"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EmployeeDepartmentDto } from "@/lib/api2/employee-types";
import { DialogBox2 } from "../ui/dialog-box2";

const departmentFormSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentFormSchema>;

interface DepartmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: EmployeeDepartmentDto;
}

export function DepartmentFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialData,
}: DepartmentFormModalProps) {
  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      description: initialData?.description || "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        description: initialData?.description || "",
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: DepartmentFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <DialogBox2 
    open={open} 
    onOpenChange={onOpenChange}
    title={initialData ? "Edit Department" : "Add New Department"}
    description={initialData ? "Update the department details" : "Create a new department for your institution"}
    size="md"
    formId="department-form"
    submitLabel={initialData ? "Update Department" : "Create Department"}
    loading={isSubmitting}
    >
        <form
          id="department-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 p-2"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Department Name <span className="text-red-500">*</span>
            </label>
            <Input
                autoFocus
              placeholder="e.g., English Department, Science"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Department Code</label>
            <Input
              placeholder="e.g., ENG, SCI"
              {...form.register("code")}
            />
            {form.formState.errors.code && (
              <p className="text-xs text-red-500">{form.formState.errors.code.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Short description of the department"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="department-form"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {initialData ? "Update Department" : "Add Department"}
            </Button>
          </div> */}
        </form>
    </DialogBox2>
  );
}
