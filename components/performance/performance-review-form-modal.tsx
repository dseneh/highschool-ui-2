"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { DialogBox2 } from "@/components/ui/dialog-box2";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import type { EmployeeDto } from "@/lib/api2/employee-types";
import type {
  CreateEmployeePerformanceReviewCommand,
  EmployeePerformanceReviewDto,
} from "@/lib/api2/employee-performance-review-types";

const performanceReviewSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    reviewerId: z.string().optional(),
    reviewTitle: z.string().min(1, "Review title is required"),
    reviewPeriod: z.string().optional(),
    reviewDate: z.string().min(1, "Review date is required"),
    nextReviewDate: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    rating: z.string().min(1, "Rating is required"),
    overallScore: z.string().optional(),
    goalsSummary: z.string().optional(),
    strengths: z.string().optional(),
    improvementAreas: z.string().optional(),
    managerComments: z.string().optional(),
    employeeComments: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.nextReviewDate || !data.reviewDate) return true;
      return new Date(data.nextReviewDate) >= new Date(data.reviewDate);
    },
    {
      message: "Next review date cannot be earlier than the review date",
      path: ["nextReviewDate"],
    }
  );

type PerformanceReviewFormData = z.infer<typeof performanceReviewSchema>;

const STATUS_OPTIONS = [
  { value: "Draft", label: "Draft" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Acknowledged", label: "Acknowledged" },
];

const RATING_OPTIONS = [
  { value: "Needs Improvement", label: "Needs Improvement" },
  { value: "Meets Expectations", label: "Meets Expectations" },
  { value: "Exceeds Expectations", label: "Exceeds Expectations" },
  { value: "Outstanding", label: "Outstanding" },
];

interface PerformanceReviewFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeePerformanceReviewCommand) => Promise<void>;
  isSubmitting: boolean;
  employees: EmployeeDto[];
  initialData?: EmployeePerformanceReviewDto;
}

export function PerformanceReviewFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  employees,
  initialData,
}: PerformanceReviewFormModalProps) {
  const form = useForm<PerformanceReviewFormData>({
    resolver: zodResolver(performanceReviewSchema),
    defaultValues: {
      employeeId: initialData?.employeeId ?? "",
      reviewerId: initialData?.reviewerId ?? "",
      reviewTitle: initialData?.reviewTitle ?? "",
      reviewPeriod: initialData?.reviewPeriod ?? "",
      reviewDate: initialData?.reviewDate ?? new Date().toISOString().slice(0, 10),
      nextReviewDate: initialData?.nextReviewDate ?? "",
      status: initialData?.status ?? "Draft",
      rating: initialData?.rating ?? "Meets Expectations",
      overallScore: initialData?.overallScore != null ? String(initialData.overallScore) : "",
      goalsSummary: initialData?.goalsSummary ?? "",
      strengths: initialData?.strengths ?? "",
      improvementAreas: initialData?.improvementAreas ?? "",
      managerComments: initialData?.managerComments ?? "",
      employeeComments: initialData?.employeeComments ?? "",
    },
  });

  const employeeId = useWatch({ control: form.control, name: "employeeId" });
  const reviewerId = useWatch({ control: form.control, name: "reviewerId" });
  const reviewDate = useWatch({ control: form.control, name: "reviewDate" });
  const nextReviewDate = useWatch({ control: form.control, name: "nextReviewDate" });
  const status = useWatch({ control: form.control, name: "status" });
  const rating = useWatch({ control: form.control, name: "rating" });

  React.useEffect(() => {
    if (open) {
      form.reset({
        employeeId: initialData?.employeeId ?? "",
        reviewerId: initialData?.reviewerId ?? "",
        reviewTitle: initialData?.reviewTitle ?? "",
        reviewPeriod: initialData?.reviewPeriod ?? "",
        reviewDate: initialData?.reviewDate ?? new Date().toISOString().slice(0, 10),
        nextReviewDate: initialData?.nextReviewDate ?? "",
        status: initialData?.status ?? "Draft",
        rating: initialData?.rating ?? "Meets Expectations",
        overallScore: initialData?.overallScore != null ? String(initialData.overallScore) : "",
        goalsSummary: initialData?.goalsSummary ?? "",
        strengths: initialData?.strengths ?? "",
        improvementAreas: initialData?.improvementAreas ?? "",
        managerComments: initialData?.managerComments ?? "",
        employeeComments: initialData?.employeeComments ?? "",
      });
    }
  }, [form, initialData, open]);

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: employee.fullName || employee.employeeNumber || "Unnamed Employee",
  }));

  const reviewerOptions = [{ value: "", label: "No reviewer selected" }, ...employeeOptions];

  const handleSubmit = async (data: PerformanceReviewFormData) => {
    await onSubmit({
      employeeId: data.employeeId,
      reviewerId: data.reviewerId || null,
      reviewTitle: data.reviewTitle,
      reviewPeriod: data.reviewPeriod || null,
      reviewDate: data.reviewDate,
      nextReviewDate: data.nextReviewDate || null,
      status: data.status,
      rating: data.rating,
      overallScore: data.overallScore ? Number(data.overallScore) : null,
      goalsSummary: data.goalsSummary || null,
      strengths: data.strengths || null,
      improvementAreas: data.improvementAreas || null,
      managerComments: data.managerComments || null,
      employeeComments: data.employeeComments || null,
    });
    form.reset();
  };

  return (
    <DialogBox2
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Performance Review" : "Add Performance Review"}
      description="Record employee performance outcomes, strengths, and development actions"
      size="lg"
      formId="employee-performance-review-form"
      submitLabel={initialData ? "Update Review" : "Create Review"}
      loading={isSubmitting}
    >
      <form
        id="employee-performance-review-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 p-2"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Employee</label>
            <SelectField
              items={employeeOptions}
              value={employeeId}
              onValueChange={(value) => form.setValue("employeeId", value as string)}
              placeholder="Select employee"
              searchable
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Reviewer</label>
            <SelectField
              items={reviewerOptions}
              value={reviewerId}
              onValueChange={(value) => form.setValue("reviewerId", value as string)}
              placeholder="Select reviewer"
              searchable
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium">Review Title</label>
            <Input placeholder="e.g. Mid-Year Review" {...form.register("reviewTitle")} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Review Period</label>
            <Input placeholder="e.g. Q2 2026" {...form.register("reviewPeriod")} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Overall Score</label>
            <Input type="number" min="0" max="5" step="0.1" {...form.register("overallScore")} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Review Date</label>
            <DatePicker
              value={reviewDate ? new Date(`${reviewDate}T00:00:00`) : undefined}
              onChange={(date) => {
                if (!date) {
                  form.setValue("reviewDate", "", { shouldDirty: true, shouldValidate: true });
                  return;
                }
                const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                form.setValue("reviewDate", formatted, { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="MM/DD/YYYY"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Next Review Date</label>
            <DatePicker
              value={nextReviewDate ? new Date(`${nextReviewDate}T00:00:00`) : undefined}
              onChange={(date) => {
                if (!date) {
                  form.setValue("nextReviewDate", "", { shouldDirty: true, shouldValidate: true });
                  return;
                }
                const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                form.setValue("nextReviewDate", formatted, { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <SelectField
              items={STATUS_OPTIONS}
              value={status}
              onValueChange={(value) => form.setValue("status", value as string)}
              placeholder="Select status"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Rating</label>
            <SelectField
              items={RATING_OPTIONS}
              value={rating}
              onValueChange={(value) => form.setValue("rating", value as string)}
              placeholder="Select rating"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Goals Summary</label>
          <Textarea placeholder="Key goals or objectives reviewed" {...form.register("goalsSummary")} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Strengths</label>
            <Textarea placeholder="Top strengths and wins" {...form.register("strengths")} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Improvement Areas</label>
            <Textarea placeholder="Development priorities" {...form.register("improvementAreas")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Manager Comments</label>
          <Textarea placeholder="Manager feedback and action items" {...form.register("managerComments")} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Employee Comments</label>
          <Textarea placeholder="Optional employee acknowledgement or comments" {...form.register("employeeComments")} />
        </div>
      </form>
    </DialogBox2>
  );
}
