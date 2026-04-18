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
  CreateEmployeeAttendanceCommand,
  EmployeeAttendanceDto,
} from "@/lib/api2/employee-attendance-types";

const attendanceSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  attendanceDate: z.string().min(1, "Date is required"),
  status: z.string().min(1, "Status is required"),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  notes: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

const STATUS_OPTIONS = [
  { value: "Present", label: "Present" },
  { value: "Late", label: "Late" },
  { value: "Absent", label: "Absent" },
  { value: "Remote", label: "Remote" },
  { value: "On Leave", label: "On Leave" },
];

interface EmployeeAttendanceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeeAttendanceCommand) => Promise<void>;
  isSubmitting: boolean;
  employees: EmployeeDto[];
  initialData?: EmployeeAttendanceDto;
}

export function EmployeeAttendanceFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  employees,
  initialData,
}: EmployeeAttendanceFormModalProps) {
  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employeeId: initialData?.employeeId ?? "",
      attendanceDate: initialData?.attendanceDate ?? new Date().toISOString().slice(0, 10),
      status: initialData?.status ?? "Present",
      checkInTime: initialData?.checkInTime ?? "",
      checkOutTime: initialData?.checkOutTime ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const employeeId = useWatch({ control: form.control, name: "employeeId" });
  const attendanceDate = useWatch({ control: form.control, name: "attendanceDate" });
  const status = useWatch({ control: form.control, name: "status" });

  React.useEffect(() => {
    if (open) {
      form.reset({
        employeeId: initialData?.employeeId ?? "",
        attendanceDate: initialData?.attendanceDate ?? new Date().toISOString().slice(0, 10),
        status: initialData?.status ?? "Present",
        checkInTime: initialData?.checkInTime ?? "",
        checkOutTime: initialData?.checkOutTime ?? "",
        notes: initialData?.notes ?? "",
      });
    }
  }, [form, initialData, open]);

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: employee.fullName || employee.employeeNumber || "Unnamed Employee",
  }));

  const handleSubmit = async (data: AttendanceFormData) => {
    await onSubmit({
      employeeId: data.employeeId,
      attendanceDate: data.attendanceDate,
      status: data.status,
      checkInTime: data.checkInTime || null,
      checkOutTime: data.checkOutTime || null,
      notes: data.notes || null,
    });
    form.reset();
  };

  return (
    <DialogBox2
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Attendance Record" : "Add Attendance Record"}
      description="Track daily employee attendance, check-in times, and notes"
      size="md"
      formId="employee-attendance-form"
      submitLabel={initialData ? "Update Record" : "Create Record"}
      loading={isSubmitting}
    >
      <form id="employee-attendance-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Employee</label>
          <SelectField
            items={employeeOptions}
            value={employeeId}
            onValueChange={(value) => form.setValue("employeeId", value)}
            placeholder="Select employee"
            searchable
          />
          {form.formState.errors.employeeId ? (
            <p className="text-xs text-red-500">{form.formState.errors.employeeId.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date</label>
            <DatePicker
              value={attendanceDate ? new Date(`${attendanceDate}T00:00:00`) : undefined}
              onChange={(date) => {
                if (!date) {
                  form.setValue("attendanceDate", "", { shouldDirty: true, shouldValidate: true });
                  return;
                }
                const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                form.setValue("attendanceDate", formatted, { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="MM/DD/YYYY"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <SelectField
              items={STATUS_OPTIONS}
              value={status}
              onValueChange={(value) => form.setValue("status", value)}
              placeholder="Select status"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Check In</label>
            <Input type="time" {...form.register("checkInTime")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Check Out</label>
            <Input type="time" {...form.register("checkOutTime")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes</label>
          <Textarea placeholder="Optional attendance notes" {...form.register("notes")} />
        </div>
      </form>
    </DialogBox2>
  );
}
