"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { DatePicker } from "@/components/ui/date-picker";
import { DialogBox2 } from "@/components/ui/dialog-box2";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreatePerformanceReviewCommand,
  PerformanceReviewDto,
} from "@/lib/api2/hr-types";
import type { EmployeeDto } from "@/lib/api2/employee-types";

const schema = z.object({
  reviewTitle: z.string().min(1, "Review title is required"),
  reviewerId: z.string().optional(),
  reviewPeriod: z.string().optional(),
  reviewDate: z.string().min(1, "Review date is required"),
  nextReviewDate: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  rating: z.string().optional(),
  goalsSummary: z.string().optional(),
  strengths: z.string().optional(),
  improvementAreas: z.string().optional(),
  managerComments: z.string().optional(),
  overallScore: z.coerce.number().min(0).max(5).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePerformanceReviewCommand) => Promise<void>;
  isSubmitting: boolean;
  employeeId: string;
  reviewers?: EmployeeDto[];
  initialData?: PerformanceReviewDto;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toDateValue(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

export function PerformanceReviewFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  employeeId,
  reviewers = [],
  initialData,
}: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reviewTitle: initialData?.reviewTitle ?? "",
      reviewerId: initialData?.reviewerId ?? "",
      reviewPeriod: initialData?.reviewPeriod ?? "",
      reviewDate: initialData?.reviewDate ?? formatDate(new Date()),
      nextReviewDate: initialData?.nextReviewDate ?? "",
      status: initialData?.status ?? "Draft",
      rating: initialData?.rating ?? "",
      goalsSummary: initialData?.goalsSummary ?? "",
      strengths: initialData?.strengths ?? "",
      improvementAreas: initialData?.improvementAreas ?? "",
      managerComments: initialData?.managerComments ?? "",
      overallScore: initialData?.overallScore ?? "",
    },
  });

  const status = useWatch({ control: form.control, name: "status" });
  const rating = useWatch({ control: form.control, name: "rating" });
  const reviewerId = useWatch({ control: form.control, name: "reviewerId" });
  const reviewDate = useWatch({ control: form.control, name: "reviewDate" });
  const nextReviewDate = useWatch({ control: form.control, name: "nextReviewDate" });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      reviewTitle: initialData?.reviewTitle ?? "",
      reviewerId: initialData?.reviewerId ?? "",
      reviewPeriod: initialData?.reviewPeriod ?? "",
      reviewDate: initialData?.reviewDate ?? formatDate(new Date()),
      nextReviewDate: initialData?.nextReviewDate ?? "",
      status: initialData?.status ?? "Draft",
      rating: initialData?.rating ?? "",
      goalsSummary: initialData?.goalsSummary ?? "",
      strengths: initialData?.strengths ?? "",
      improvementAreas: initialData?.improvementAreas ?? "",
      managerComments: initialData?.managerComments ?? "",
      overallScore: initialData?.overallScore ?? "",
    });
  }, [form, initialData, open]);

  const reviewerOptions = reviewers.map((e) => ({
    value: e.id,
    label: e.fullName || e.employeeNumber || "Unnamed",
  }));

  const handleSubmit = async (data: FormData) => {
    await onSubmit({
      employeeId,
      reviewerId: data.reviewerId || null,
      reviewTitle: data.reviewTitle,
      reviewPeriod: data.reviewPeriod || null,
      reviewDate: data.reviewDate,
      nextReviewDate: data.nextReviewDate || null,
      status: data.status,
      rating: data.rating || null,
      goalsSummary: data.goalsSummary || null,
      strengths: data.strengths || null,
      improvementAreas: data.improvementAreas || null,
      managerComments: data.managerComments || null,
      overallScore:
        data.overallScore !== "" && data.overallScore !== undefined
          ? Number(data.overallScore)
          : null,
    });
    form.reset();
  };

  return (
    <DialogBox2
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Performance Review" : "New Performance Review"}
      description="Evaluate performance, set goals, and provide feedback"
      size="lg"
      formId="performance-review-form"
      submitLabel={initialData ? "Update Review" : "Save Review"}
      loading={isSubmitting}
    >
      <form
        id="performance-review-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 p-2"
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Review Title</label>
          <Input placeholder="Q1 2026 Performance Review" {...form.register("reviewTitle")} />
          {form.formState.errors.reviewTitle ? (
            <p className="text-xs text-red-500">{form.formState.errors.reviewTitle.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Review Date</label>
            <DatePicker
              value={toDateValue(reviewDate)}
              onChange={(d) =>
                form.setValue("reviewDate", d ? formatDate(d) : "", {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="MM/DD/YYYY"
            />
            {form.formState.errors.reviewDate ? (
              <p className="text-xs text-red-500">{form.formState.errors.reviewDate.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Next Review Date</label>
            <DatePicker
              value={toDateValue(nextReviewDate)}
              onChange={(d) =>
                form.setValue("nextReviewDate", d ? formatDate(d) : "", { shouldDirty: true })
              }
              placeholder="MM/DD/YYYY"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Review Period</label>
            <Input placeholder="Q1 2026" {...form.register("reviewPeriod")} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <SelectField
              items={STATUS_OPTIONS}
              value={status}
              onValueChange={(v) =>
                form.setValue("status", v as string, { shouldValidate: true })
              }
              placeholder="Select status"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Rating</label>
            <SelectField
              items={RATING_OPTIONS}
              value={rating}
              onValueChange={(v) => form.setValue("rating", v as string)}
              placeholder="Select rating"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Overall Score (0–5)</label>
            <Input
              type="number"
              min={0}
              max={5}
              step="0.01"
              placeholder="e.g. 4.25"
              {...form.register("overallScore")}
            />
          </div>
        </div>

        {reviewers.length > 0 ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Reviewer</label>
            <SelectField
              items={reviewerOptions}
              value={reviewerId}
              onValueChange={(v) => form.setValue("reviewerId", v as string)}
              placeholder="Select reviewer"
              searchable
            />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Goals Summary</label>
          <Textarea
            placeholder="Key objectives and deliverables for this period"
            rows={3}
            {...form.register("goalsSummary")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Strengths</label>
            <Textarea
              placeholder="Areas of strong performance"
              rows={3}
              {...form.register("strengths")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Areas for Improvement</label>
            <Textarea
              placeholder="Skills and behaviors to develop"
              rows={3}
              {...form.register("improvementAreas")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Manager Comments</label>
          <Textarea
            placeholder="Additional feedback from the manager"
            rows={3}
            {...form.register("managerComments")}
          />
        </div>
      </form>
    </DialogBox2>
  );
}
