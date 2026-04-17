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
  CreateEmployeeWorkflowTaskCommand,
  EmployeeWorkflowTaskDto,
} from "@/lib/api2/employee-workflow-types";

const workflowTaskSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  assignedToId: z.string().optional(),
  workflowType: z.string().min(1, "Workflow type is required"),
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});

type WorkflowTaskFormData = z.infer<typeof workflowTaskSchema>;

const WORKFLOW_TYPE_OPTIONS = [
  { value: "Onboarding", label: "Onboarding" },
  { value: "Offboarding", label: "Offboarding" },
];

const CATEGORY_OPTIONS = [
  { value: "Documentation", label: "Documentation" },
  { value: "Access Setup", label: "Access Setup" },
  { value: "Payroll Setup", label: "Payroll Setup" },
  { value: "Equipment", label: "Equipment" },
  { value: "Orientation", label: "Orientation" },
  { value: "Exit Clearance", label: "Exit Clearance" },
  { value: "Knowledge Transfer", label: "Knowledge Transfer" },
  { value: "Other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Blocked", label: "Blocked" },
];

interface EmployeeWorkflowFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeeWorkflowTaskCommand) => Promise<void>;
  isSubmitting: boolean;
  employees: EmployeeDto[];
  initialData?: EmployeeWorkflowTaskDto;
}

export function EmployeeWorkflowFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  employees,
  initialData,
}: EmployeeWorkflowFormModalProps) {
  const form = useForm<WorkflowTaskFormData>({
    resolver: zodResolver(workflowTaskSchema),
    defaultValues: {
      employeeId: initialData?.employeeId ?? "",
      assignedToId: initialData?.assignedToId ?? "",
      workflowType: initialData?.workflowType ?? "Onboarding",
      category: initialData?.category ?? "Documentation",
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      dueDate: initialData?.dueDate ?? "",
      status: initialData?.status ?? "Pending",
      notes: initialData?.notes ?? "",
    },
  });

  const employeeId = useWatch({ control: form.control, name: "employeeId" });
  const assignedToId = useWatch({ control: form.control, name: "assignedToId" });
  const workflowType = useWatch({ control: form.control, name: "workflowType" });
  const category = useWatch({ control: form.control, name: "category" });
  const dueDate = useWatch({ control: form.control, name: "dueDate" });
  const status = useWatch({ control: form.control, name: "status" });

  React.useEffect(() => {
    if (open) {
      form.reset({
        employeeId: initialData?.employeeId ?? "",
        assignedToId: initialData?.assignedToId ?? "",
        workflowType: initialData?.workflowType ?? "Onboarding",
        category: initialData?.category ?? "Documentation",
        title: initialData?.title ?? "",
        description: initialData?.description ?? "",
        dueDate: initialData?.dueDate ?? "",
        status: initialData?.status ?? "Pending",
        notes: initialData?.notes ?? "",
      });
    }
  }, [form, initialData, open]);

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: employee.fullName || employee.employeeNumber || "Unnamed Employee",
  }));

  const assignedToOptions = [{ value: "", label: "No assignee selected" }, ...employeeOptions];

  const handleSubmit = async (data: WorkflowTaskFormData) => {
    await onSubmit({
      employeeId: data.employeeId,
      assignedToId: data.assignedToId || null,
      workflowType: data.workflowType,
      category: data.category,
      title: data.title,
      description: data.description || null,
      dueDate: data.dueDate || null,
      status: data.status,
      notes: data.notes || null,
    });
    form.reset();
  };

  return (
    <DialogBox2
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Workflow Task" : "Add Workflow Task"}
      description="Track onboarding and offboarding checklist items for employees"
      size="md"
      formId="employee-workflow-task-form"
      submitLabel={initialData ? "Update Task" : "Create Task"}
      loading={isSubmitting}
    >
      <form id="employee-workflow-task-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Employee</label>
            <SelectField
              items={employeeOptions}
              value={employeeId}
              onValueChange={(value) => form.setValue("employeeId", value)}
              placeholder="Select employee"
              searchable
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Assigned To</label>
            <SelectField
              items={assignedToOptions}
              value={assignedToId}
              onValueChange={(value) => form.setValue("assignedToId", value)}
              placeholder="Select assignee"
              searchable
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Workflow Type</label>
            <SelectField
              items={WORKFLOW_TYPE_OPTIONS}
              value={workflowType}
              onValueChange={(value) => form.setValue("workflowType", value)}
              placeholder="Select workflow type"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <SelectField
              items={CATEGORY_OPTIONS}
              value={category}
              onValueChange={(value) => form.setValue("category", value)}
              placeholder="Select category"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Task Title</label>
          <Input placeholder="e.g. Create work email" {...form.register("title")} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Due Date</label>
            <DatePicker
              value={dueDate ? new Date(`${dueDate}T00:00:00`) : undefined}
              onChange={(date) => {
                if (!date) {
                  form.setValue("dueDate", "", { shouldDirty: true, shouldValidate: true });
                  return;
                }
                const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                form.setValue("dueDate", formatted, { shouldDirty: true, shouldValidate: true });
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

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <Textarea placeholder="Optional details for the task" {...form.register("description")} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes</label>
          <Textarea placeholder="Optional handoff or completion notes" {...form.register("notes")} />
        </div>
      </form>
    </DialogBox2>
  );
}
