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
import { useStaff } from "@/lib/api2/staff";
import { useMemo } from "react";
import type { Position } from "@/lib/api2/staff/types";
import { SelectField } from "../ui/select-field";
import DepartmentSelect from "../shared/data-reusable/department-select";

const positionFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  department: z.string().optional(),
  category: z.string().optional(),
  teaching_role: z.boolean().optional(),
});

type PositionFormData = z.infer<typeof positionFormSchema>;

interface PositionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PositionFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Position;
}

export function PositionFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialData,
}: PositionFormModalProps) {
  const staffApi = useStaff();
  const { data: positionCategoriesData } = staffApi.getPositionCategories({});


  const categories = useMemo<Array<{ id: string; name: string }>>(() => {
    if (!positionCategoriesData) return [];
    if (Array.isArray(positionCategoriesData)) {
      return positionCategoriesData as Array<{ id: string; name: string }>;
    }
    if (Array.isArray(positionCategoriesData.results)) {
      return positionCategoriesData.results as Array<{ id: string; name: string }>;
    }
    return [];
  }, [positionCategoriesData]);

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categories]);

  const form = useForm<PositionFormData>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      department: initialData?.department?.id || "",
      category: initialData?.category?.id || "",
      teaching_role: initialData?.teaching_role || false,
    },
  });

  const departmentValue = useWatch({
    control: form.control,
    name: "department",
  });
  const categoryValue = useWatch({
    control: form.control,
    name: "category",
  });
  const teachingRoleValue = useWatch({
    control: form.control,
    name: "teaching_role",
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: initialData?.title || "",
        description: initialData?.description || "",
        department: initialData?.department?.id || "",
        category: initialData?.category?.id || "",
        teaching_role: initialData?.teaching_role || false,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: PositionFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Position" : "Add New Position"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the position details"
              : "Create a new position for your institution"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Position Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Head Teacher, Deputy Principal"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe the responsibilities and requirements..."
              className="min-h-20"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Department</label>
              <DepartmentSelect
                searchable
                value={departmentValue || ""}
                onChange={(value: unknown) => {
                  const nextValue = typeof value === "string" ? value : "";
                  form.setValue("department", nextValue);
                }}
                placeholder="Select department"
                useUrlState={false}
                noTitle
              />
              {form.formState.errors.department && (
                <p className="text-xs text-red-500">{form.formState.errors.department.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <SelectField
                searchable
                items={categoryOptions}
                value={categoryValue || ""}
                onValueChange={(value: unknown) => {
                  const nextValue = typeof value === "string" ? value : "";
                  form.setValue("category", nextValue);
                }}
                placeholder="Select category"
              />
    
              {form.formState.errors.category && (
                <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-dashed p-4">
            <Checkbox
              id="teaching_role"
              checked={teachingRoleValue}
              onCheckedChange={(checked) =>
                form.setValue("teaching_role", checked === true)
              }
            />
            <label htmlFor="teaching_role" className="text-sm font-medium">
              This is a teacher position
            </label>
          </div>

          <div className="flex gap-2 justify-end pt-4">
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
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {initialData ? "Update Position" : "Add Position"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
