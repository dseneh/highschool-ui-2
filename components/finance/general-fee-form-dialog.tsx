"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  GeneralFeeDto,
  CreateGeneralFeeCommand,
  UpdateGeneralFeeCommand,
} from "@/lib/api2/finance-types";
import {SelectField} from '@/components/ui/select-field';

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const createSchema = z.object({
  name: z.string().min(1, "Fee name is required").max(100),
  amount: z.coerce.number().min(0, "Amount must be at least 0"),
  student_target: z.enum(["", "new", "returning", "transferred"]).optional(),
  description: z.string().optional(),
  apply_to_all_sections: z.boolean().default(false),
});

const updateSchema = z.object({
  name: z.string().min(1, "Fee name is required").max(100).optional(),
  amount: z.coerce.number().min(0, "Amount must be at least 0").optional(),
  student_target: z.enum(["", "new", "returning", "transferred"]).optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  apply_to_all_sections: z.boolean().default(false).optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;
type FormData = CreateFormData | UpdateFormData;

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface GeneralFeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateGeneralFeeCommand | UpdateGeneralFeeCommand) => void;
  loading?: boolean;
  initialData?: GeneralFeeDto | Partial<CreateGeneralFeeCommand>;
  mode?: "create" | "edit";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function GeneralFeeFormDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  initialData,
  mode = "create",
}: GeneralFeeFormDialogProps) {
  const isEdit = mode === "edit";

  const schema = isEdit ? updateSchema : createSchema;
  
  const resolver = React.useMemo(
    () => zodResolver(schema as any),
    [isEdit]
  ) as Resolver<FormData>;

  const form = useForm<FormData>({
    resolver,
    defaultValues: {
      name: "",
      amount: 0,
      student_target: "",
      description: "",
      apply_to_all_sections: false,
      ...(isEdit && { active: true }),
    },
  });

  // Reset form when dialog opens/closes or data changes
  React.useEffect(() => {
    const validStudentTargets = ["", "new", "returning", "transferred"];
    const getValidStudentTarget = (value?: string | null) => {
      if (value && validStudentTargets.includes(value)) {
        return value as "" | "new" | "returning" | "transferred";
      }
      return "";
    };

    if (open && initialData && isEdit) {
      const editData = initialData as GeneralFeeDto;
      form.reset({
        name: editData.name,
        amount: editData.amount,
        student_target: getValidStudentTarget(editData.student_target),
        description: editData.description || "",
        active: editData.active,
        apply_to_all_sections: false,
      });
    } else if (open && initialData && !isEdit) {
      // For duplicate mode - pre-fill with initial data
      form.reset({
        name: initialData.name || "",
        amount: initialData.amount || 0,
        student_target: getValidStudentTarget(initialData.student_target),
        description: initialData.description || "",
        apply_to_all_sections: false,
      });
    } else if (open && !isEdit) {
      form.reset({
        name: "",
        amount: 0,
        student_target: "",
        description: "",
        apply_to_all_sections: false,
      });
    }
  }, [open, initialData, isEdit, form]);

  const handleSubmit = (data: FormData) => {
    if (isEdit) {
      onSubmit(data as UpdateGeneralFeeCommand);
      return;
    }
    onSubmit(data as CreateGeneralFeeCommand);
  };

  const studentTargetOptions = [
    { value: "", label: "All Students" },
    { value: "new", label: "New Students" },
    { value: "returning", label: "Returning Students" },
    { value: "transferred", label: "Transferred Students" },
  ];

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Fee Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tuition Fee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student Target */}
            <FormField
              control={form.control}
              name="student_target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Students</FormLabel>
                  <SelectField
                    value={field.value}
                    onValueChange={field.onChange}
                    items={studentTargetOptions}
                    placeholder="Select target students"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add details about this fee..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status (Edit only) */}
            {isEdit && (
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Inactive fees will not be available for assignment
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {/* Apply to All Sections */}
            <FormField
              control={form.control}
              name="apply_to_all_sections"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Apply to all sections</FormLabel>
                    <FormDescription>
                      {isEdit
                        ? "Update this fee amount in all assigned sections"
                        : "Automatically assign this fee to all active sections"}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Actions */}
          </form>
        </Form>
      );

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Fee" : "Create Fee"}
      description={
        isEdit
          ? "Update the fee details below."
          : "Add a new fee type to your school."
      }
      actionLabel={isEdit ? "Update Fee" : "Create Fee"}
      onAction={form.handleSubmit(handleSubmit)}
      actionLoading={loading}
    >
      {formContent}
    </DialogBox>
  );
}
