"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DialogBox2 } from "@/components/ui/dialog-box2";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees } from "@/hooks/use-employee";
import { useLeaveTypes } from "@/hooks/use-leave";
import type { CreateLeaveRequestCommand } from "@/lib/api2/leave-types";

const leaveRequestSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    leaveTypeId: z.string().min(1, "Leave type is required"),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date({ required_error: "End date is required" }),
    reason: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "End date cannot be earlier than start date",
  });

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateLeaveRequestCommand) => Promise<void>;
  isSubmitting: boolean;
}

function toDateString(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function LeaveRequestFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: LeaveRequestFormModalProps) {
  const { data: employees = [] } = useEmployees();
  const { data: leaveTypes = [] } = useLeaveTypes();

  const employeeOptions = React.useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label:
          employee.fullName ||
          [employee.firstName, employee.lastName].filter(Boolean).join(" ") ||
          employee.employeeNumber ||
          "Unnamed Employee",
      })),
    [employees]
  );

  const leaveTypeOptions = React.useMemo(
    () =>
      leaveTypes.map((leaveType) => ({
        value: leaveType.id,
        label: leaveType.name,
      })),
    [leaveTypes]
  );

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employeeId: "",
      leaveTypeId: "",
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
    },
  });

  const employeeValue = useWatch({ control: form.control, name: "employeeId" });
  const leaveTypeValue = useWatch({ control: form.control, name: "leaveTypeId" });
  const startDateValue = useWatch({ control: form.control, name: "startDate" });
  const endDateValue = useWatch({ control: form.control, name: "endDate" });

  React.useEffect(() => {
    if (open) {
      form.reset({
        employeeId: "",
        leaveTypeId: "",
        startDate: new Date(),
        endDate: new Date(),
        reason: "",
      });
    }
  }, [form, open]);

  const handleSubmit = async (data: LeaveRequestFormData) => {
    await onSubmit({
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
      startDate: toDateString(data.startDate),
      endDate: toDateString(data.endDate),
      reason: data.reason || null,
    });
    form.reset();
  };

  return (
    <DialogBox2
      open={open}
      onOpenChange={onOpenChange}
      title="Request Leave"
      description="Create a leave request for an employee"
      size="md"
      formId="leave-request-form"
      submitLabel="Create Request"
      loading={isSubmitting}
    >
      <form id="leave-request-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Employee</label>
          <SelectField
            searchable
            items={employeeOptions}
            value={employeeValue}
            onValueChange={(value) => form.setValue("employeeId", value as string, { shouldValidate: true })}
            placeholder="Select employee"
          />
          {form.formState.errors.employeeId && (
            <p className="text-xs text-red-500">{form.formState.errors.employeeId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Leave Type</label>
          <SelectField
            searchable
            items={leaveTypeOptions}
            value={leaveTypeValue}
            onValueChange={(value) => form.setValue("leaveTypeId", value as string, { shouldValidate: true })}
            placeholder="Select leave type"
          />
          {form.formState.errors.leaveTypeId && (
            <p className="text-xs text-red-500">{form.formState.errors.leaveTypeId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Start Date</label>
            <DatePicker
              value={startDateValue}
              onChange={(date) => form.setValue("startDate", date ?? new Date(), { shouldValidate: true })}
              placeholder="Select start date"
            />
            {form.formState.errors.startDate && (
              <p className="text-xs text-red-500">{form.formState.errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">End Date</label>
            <DatePicker
              value={endDateValue}
              onChange={(date) => form.setValue("endDate", date ?? new Date(), { shouldValidate: true })}
              placeholder="Select end date"
            />
            {form.formState.errors.endDate && (
              <p className="text-xs text-red-500">{form.formState.errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Reason</label>
          <Textarea placeholder="Optional reason or note for this leave request" {...form.register("reason")} />
        </div>
      </form>
    </DialogBox2>
  );
}
