"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateDefaultAssessmentTemplate,
  useUpdateDefaultAssessmentTemplate,
  useAssessmentTypes,
} from "@/hooks/use-grading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type { DefaultAssessmentTemplateDto } from "@/lib/api2/grading-types";
import { SelectField } from "@/components/ui/select-field";

const defaultAssessmentSchema = z.object({
  assessment_type: z.string().min(1, "Assessment type is required"),
  name: z.string().min(1, "Name is required"),
  max_score: z.coerce.number().min(0, "Max score must be at least 0"),
  weight: z.coerce.number().min(0).default(0),
  description: z.string().default(""),
  is_active: z.boolean().default(true),
});

type DefaultAssessmentFormInput = z.input<typeof defaultAssessmentSchema>;
type DefaultAssessmentForm = z.output<typeof defaultAssessmentSchema>;

interface DefaultAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: DefaultAssessmentTemplateDto | null;
  onSuccess?: () => void;
}

export function DefaultAssessmentDialog({
  open,
  onOpenChange,
  assessment,
  onSuccess,
}: DefaultAssessmentDialogProps) {
  const createMutation = useCreateDefaultAssessmentTemplate();
  const updateMutation = useUpdateDefaultAssessmentTemplate();
  const { data: assessmentTypes = [] } = useAssessmentTypes();

  const isEdit = Boolean(assessment);

  const form = useForm<DefaultAssessmentFormInput, unknown, DefaultAssessmentForm>({
    resolver: zodResolver(defaultAssessmentSchema),
    defaultValues: {
      assessment_type: "",
      name: "",
      max_score: 100,
      weight: 0,
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (assessment) {
      form.reset({
        assessment_type: assessment.assessment_type.id,
        name: assessment.name,
        max_score: assessment.max_score,
        weight: assessment.weight || 0,
        description: assessment.description || "",
        is_active: assessment.is_active,
      });
    } else {
      form.reset({
        assessment_type: "",
        name: "",
        max_score: 100,
        weight: 0,
        description: "",
        is_active: true,
      });
    }
  }, [assessment, form]);

  const onSubmit = async (values: DefaultAssessmentForm) => {
    try {
      if (isEdit && assessment) {
        await updateMutation.mutateAsync({
          id: assessment.id,
          command: {
            name_template: values.name,
            default_max_score: values.max_score,
            default_weight: values.weight,
            description: values.description,
            is_active: values.is_active,
          },
        });
        showToast.success("Success",
          "Default assessment updated successfully"
        );
      } else {
        await createMutation.mutateAsync({
          assessment_type: values.assessment_type,
          name_template: values.name,
          default_max_score: values.max_score,
          default_weight: values.weight,
          description: values.description,
          is_active: values.is_active,
        });
        showToast.success("Success",
          "Default assessment created successfully"
        );
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      showToast.error("Error",
        getErrorMessage(error)
      );
    }
  };

  const assessmentTypesOptions = assessmentTypes.map((type) => ({
    label: type.name,
    value: type.id,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Default Assessment" : "Add Default Assessment"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the default assessment template"
              : "Create a new default assessment that will be added to all new gradebooks"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Assessment Type */}
            <FormField
              control={form.control}
              name="assessment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Type</FormLabel>
                  <SelectField
                   items={assessmentTypesOptions}
                    {...field}
                    disabled={isEdit}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Midterm Exam"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Score and Weight */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this assessment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Switch */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <FormLabel className="text-base">Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This assessment will be included in new gradebooks
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? "Update Assessment" : "Create Assessment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
