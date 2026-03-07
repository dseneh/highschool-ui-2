"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGrading } from "@/lib/api2/grading";
import { DialogBox } from "@/components/ui/dialog-box";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { MarkingPeriodSelect } from "../shared/data-reusable";
import { SelectField } from "../ui/select-field";

const createAssessmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  assessment_type: z.string().min(1, "Assessment type is required"),
  marking_period: z.string().min(1, "Marking period is required"),
  max_score: z.coerce.number().min(1, "Max score must be at least 1"),
  weight: z.coerce.number().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

type CreateAssessmentForm = z.infer<typeof createAssessmentSchema>;

interface CreateAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradebookId: string;
}

export function CreateAssessmentDialog({
  open,
  onOpenChange,
  gradebookId,
}: CreateAssessmentDialogProps) {
  const grading = useGrading();
  const { data: assessmentTypes } = grading.getAssessmentTypes();
  const createMutation = grading.createAssessment();
  const formId = React.useId();

  const form = useForm<CreateAssessmentForm>({
    resolver: zodResolver(createAssessmentSchema),
    defaultValues: {
      name: "",
      assessment_type: "",
      marking_period: "",
      max_score: 100,
      weight: undefined,
      date: "",
      description: "",
    },
  });

  const assessmentTypeOptions = assessmentTypes?.map((type) => ({
    label: type.name,
    value: type.id,
  })) || [];

  const onSubmit = async (values: CreateAssessmentForm) => {
    await createMutation.mutateAsync({
      gradebook_id: gradebookId,
      ...values,
    });
    onOpenChange(false);
    form.reset({
      name: "",
      assessment_type: "",
      marking_period: "",
      max_score: 100,
      weight: undefined,
      date: "",
      description: "",
    });
  };

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Create Assessment"
      description="Add a new assessment to this gradebook. Grades will be automatically created for all enrolled students."
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={createMutation.isPending}>
            Create Assessment
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                const { value, ...fieldProps } = field;
                return (
                  <FormItem>
                    <FormLabel>Assessment Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Midterm Exam" {...fieldProps} value={value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="assessment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <SelectField 
                        items={assessmentTypeOptions}
                        value={field.value}
                      onValueChange={field.onChange}
                        placeholder="Select assessment type"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marking_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marking Period</FormLabel>
                    {/* <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {markingPeriods?.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select> */}
                    <MarkingPeriodSelect
                        value={field.value}
                        onChange={field.onChange}
                        useUrlState={false}
                        noTitle
                      />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => {
                  const { value, ...fieldProps } = field;
                  return (
                    <FormItem>
                      <FormLabel>Max Score</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...fieldProps}
                          value={value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => {
                  const { value, ...fieldProps } = field;
                  return (
                    <FormItem>
                      <FormLabel>Weight (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Leave blank to use default"
                          {...fieldProps}
                          value={value ?? ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Override assessment type weight
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date (optional)</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) =>
                        field.onChange(date?.toISOString().split("T")[0] ?? "")
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => {
                const { value, ...fieldProps } = field;
                return (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this assessment"
                        {...fieldProps}
                        value={value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            </form>
        </Form>
      </DialogBox>
    );
  }
