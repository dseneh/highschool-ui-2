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
  CreateEmployeeDocumentCommand,
  EmployeeDocumentDto,
} from "@/lib/api2/hr-types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  documentType: z.string().min(1, "Document type is required"),
  documentNumber: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  issuingAuthority: z.string().optional(),
  documentUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const DOCUMENT_TYPE_OPTIONS = [
  { value: "Contract", label: "Contract" },
  { value: "Identification", label: "Identification" },
  { value: "Certification", label: "Certification" },
  { value: "License", label: "License" },
  { value: "Permit", label: "Permit" },
  { value: "Other", label: "Other" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeeDocumentCommand) => Promise<void>;
  isSubmitting: boolean;
  employeeId: string;
  initialData?: EmployeeDocumentDto;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toDateValue(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

export function EmployeeDocumentFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  employeeId,
  initialData,
}: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      documentType: initialData?.documentType ?? "",
      documentNumber: initialData?.documentNumber ?? "",
      issueDate: initialData?.issueDate ?? "",
      expiryDate: initialData?.expiryDate ?? "",
      issuingAuthority: initialData?.issuingAuthority ?? "",
      documentUrl: initialData?.documentUrl ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const documentType = useWatch({ control: form.control, name: "documentType" });
  const issueDate = useWatch({ control: form.control, name: "issueDate" });
  const expiryDate = useWatch({ control: form.control, name: "expiryDate" });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      title: initialData?.title ?? "",
      documentType: initialData?.documentType ?? "",
      documentNumber: initialData?.documentNumber ?? "",
      issueDate: initialData?.issueDate ?? "",
      expiryDate: initialData?.expiryDate ?? "",
      issuingAuthority: initialData?.issuingAuthority ?? "",
      documentUrl: initialData?.documentUrl ?? "",
      notes: initialData?.notes ?? "",
    });
  }, [form, initialData, open]);

  const handleSubmit = async (data: FormData) => {
    await onSubmit({
      employeeId,
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
      title={initialData ? "Edit Document" : "Add Document"}
      description="Contracts, certifications, licenses, and other employee documents"
      size="md"
      formId="employee-document-form"
      submitLabel={initialData ? "Update Document" : "Save Document"}
      loading={isSubmitting}
    >
      <form
        id="employee-document-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 p-2"
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <Input placeholder="Employment Contract 2026" {...form.register("title")} />
          {form.formState.errors.title ? (
            <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Document Type</label>
            <SelectField
              items={DOCUMENT_TYPE_OPTIONS}
              value={documentType}
              onValueChange={(v) => form.setValue("documentType", v as string, { shouldValidate: true })}
              placeholder="Select type"
            />
            {form.formState.errors.documentType ? (
              <p className="text-xs text-red-500">{form.formState.errors.documentType.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Document Number</label>
            <Input placeholder="DOC-2026-001" {...form.register("documentNumber")} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Issue Date</label>
            <DatePicker
              value={toDateValue(issueDate)}
              onChange={(d) =>
                form.setValue("issueDate", d ? formatDate(d) : "", { shouldDirty: true })
              }
              placeholder="MM/DD/YYYY"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Expiry Date</label>
            <DatePicker
              value={toDateValue(expiryDate)}
              onChange={(d) =>
                form.setValue("expiryDate", d ? formatDate(d) : "", { shouldDirty: true })
              }
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Issuing Authority</label>
          <Input placeholder="Ministry of Education" {...form.register("issuingAuthority")} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Document URL</label>
          <Input
            type="url"
            placeholder="https://..."
            {...form.register("documentUrl")}
          />
          {form.formState.errors.documentUrl ? (
            <p className="text-xs text-red-500">{form.formState.errors.documentUrl.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes</label>
          <Textarea placeholder="Optional notes about this document" {...form.register("notes")} />
        </div>
      </form>
    </DialogBox2>
  );
}
