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
  CreateEmployeeDocumentCommand,
  EmployeeDocumentDto,
} from "@/lib/api2/employee-document-types";

const documentSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    title: z.string().min(1, "Document title is required"),
    documentType: z.string().min(1, "Document type is required"),
    documentNumber: z.string().optional(),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional(),
    issuingAuthority: z.string().optional(),
    documentUrl: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.issueDate || !data.expiryDate) return true;
      return new Date(data.expiryDate) >= new Date(data.issueDate);
    },
    {
      message: "Expiry date cannot be earlier than issue date",
      path: ["expiryDate"],
    }
  );

type DocumentFormData = z.infer<typeof documentSchema>;

const DOCUMENT_TYPE_OPTIONS = [
  { value: "Contract", label: "Contract" },
  { value: "Identification", label: "Identification" },
  { value: "Certification", label: "Certification" },
  { value: "License", label: "License" },
  { value: "Permit", label: "Permit" },
  { value: "Other", label: "Other" },
];

interface EmployeeDocumentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeeDocumentCommand) => Promise<void>;
  isSubmitting: boolean;
  employees: EmployeeDto[];
  initialData?: EmployeeDocumentDto;
}

export function EmployeeDocumentFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  employees,
  initialData,
}: EmployeeDocumentFormModalProps) {
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      employeeId: initialData?.employeeId ?? "",
      title: initialData?.title ?? "",
      documentType: initialData?.documentType ?? "Other",
      documentNumber: initialData?.documentNumber ?? "",
      issueDate: initialData?.issueDate ?? "",
      expiryDate: initialData?.expiryDate ?? "",
      issuingAuthority: initialData?.issuingAuthority ?? "",
      documentUrl: initialData?.documentUrl ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const employeeId = useWatch({ control: form.control, name: "employeeId" });
  const documentType = useWatch({ control: form.control, name: "documentType" });
  const issueDate = useWatch({ control: form.control, name: "issueDate" });
  const expiryDate = useWatch({ control: form.control, name: "expiryDate" });

  React.useEffect(() => {
    if (open) {
      form.reset({
        employeeId: initialData?.employeeId ?? "",
        title: initialData?.title ?? "",
        documentType: initialData?.documentType ?? "Other",
        documentNumber: initialData?.documentNumber ?? "",
        issueDate: initialData?.issueDate ?? "",
        expiryDate: initialData?.expiryDate ?? "",
        issuingAuthority: initialData?.issuingAuthority ?? "",
        documentUrl: initialData?.documentUrl ?? "",
        notes: initialData?.notes ?? "",
      });
    }
  }, [form, initialData, open]);

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: employee.fullName || employee.employeeNumber || "Unnamed Employee",
  }));

  const handleSubmit = async (data: DocumentFormData) => {
    await onSubmit({
      employeeId: data.employeeId,
      title: data.title,
      documentType: data.documentType,
      documentNumber: data.documentNumber || null,
      issueDate: data.issueDate || null,
      expiryDate: data.expiryDate || null,
      issuingAuthority: data.issuingAuthority || null,
      documentUrl: data.documentUrl || null,
      notes: data.notes || null,
    });
    form.reset();
  };

  return (
    <DialogBox2
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Employee Document" : "Add Employee Document"}
      description="Store employee contracts, licenses, certifications, and compliance records"
      size="md"
      formId="employee-document-form"
      submitLabel={initialData ? "Update Document" : "Create Document"}
      loading={isSubmitting}
    >
      <form id="employee-document-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-2">
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
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium">Document Title</label>
            <Input placeholder="e.g. Teaching License" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Document Type</label>
            <SelectField
              items={DOCUMENT_TYPE_OPTIONS}
              value={documentType}
              onValueChange={(value) => form.setValue("documentType", value)}
              placeholder="Select type"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Document Number</label>
            <Input placeholder="Optional reference number" {...form.register("documentNumber")} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Issue Date</label>
            <DatePicker
              value={issueDate ? new Date(`${issueDate}T00:00:00`) : undefined}
              onChange={(date) => {
                if (!date) {
                  form.setValue("issueDate", "", { shouldDirty: true, shouldValidate: true });
                  return;
                }
                const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                form.setValue("issueDate", formatted, { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="MM/DD/YYYY"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Expiry Date</label>
            <DatePicker
              value={expiryDate ? new Date(`${expiryDate}T00:00:00`) : undefined}
              onChange={(date) => {
                if (!date) {
                  form.setValue("expiryDate", "", { shouldDirty: true, shouldValidate: true });
                  return;
                }
                const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                form.setValue("expiryDate", formatted, { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="MM/DD/YYYY"
            />
            {form.formState.errors.expiryDate ? (
              <p className="text-xs text-red-500">{form.formState.errors.expiryDate.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Issuing Authority</label>
          <Input placeholder="Optional issuing authority" {...form.register("issuingAuthority")} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Document URL</label>
          <Input placeholder="https://example.com/document.pdf" {...form.register("documentUrl")} />
          {form.formState.errors.documentUrl ? (
            <p className="text-xs text-red-500">{form.formState.errors.documentUrl.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes</label>
          <Textarea placeholder="Optional notes about compliance or renewal" {...form.register("notes")} />
        </div>
      </form>
    </DialogBox2>
  );
}
