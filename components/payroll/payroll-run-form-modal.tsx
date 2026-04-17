"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import AccountingCurrencySelect from "@/components/shared/data-reusable/accounting-currency-select";
import { SelectField } from "@/components/ui/select-field";
import { DatePicker } from "@/components/ui/date-picker";
import { DialogBox2 } from "@/components/ui/dialog-box2";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAccountingCurrencies } from "@/hooks/use-accounting";
import type { CreatePayrollRunCommand, PayrollRunDto } from "@/lib/api2/payroll-types";

const payrollRunSchema = z
  .object({
    name: z.string().min(1, "Payroll run name is required"),
    runDate: z.string().min(1, "Run date is required"),
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
    paymentDate: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    currency: z.string().min(1, "Currency is required"),
    notes: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.periodStart && values.periodEnd && values.periodEnd < values.periodStart) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["periodEnd"],
        message: "Period end cannot be earlier than period start",
      });
    }

    if (values.periodEnd && values.paymentDate && values.paymentDate < values.periodEnd) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentDate"],
        message: "Payment date cannot be earlier than period end",
      });
    }
  });

type PayrollRunFormData = z.infer<typeof payrollRunSchema>;

const STATUS_OPTIONS = [
  { value: "Draft", label: "Draft" },
  { value: "Processing", label: "Processing" },
  { value: "Completed", label: "Completed" },
  { value: "Paid", label: "Paid" },
];

interface PayrollRunFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePayrollRunCommand) => Promise<void>;
  isSubmitting: boolean;
  initialData?: PayrollRunDto;
}

function formatDateForForm(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toDateValue(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

export function PayrollRunFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialData,
}: PayrollRunFormModalProps) {
  const { data: currencies = [] } = useAccountingCurrencies();

  const form = useForm<PayrollRunFormData>({
    resolver: zodResolver(payrollRunSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      runDate: initialData?.runDate ?? formatDateForForm(new Date()),
      periodStart: initialData?.periodStart ?? "",
      periodEnd: initialData?.periodEnd ?? "",
      paymentDate: initialData?.paymentDate ?? "",
      status: initialData?.status ?? "Draft",
      currency: initialData?.currency ?? "USD",
      notes: initialData?.notes ?? "",
    },
  });

  const status = useWatch({ control: form.control, name: "status" });
  const currencyCode = useWatch({ control: form.control, name: "currency" });
  const runDate = useWatch({ control: form.control, name: "runDate" });
  const periodStart = useWatch({ control: form.control, name: "periodStart" });
  const periodEnd = useWatch({ control: form.control, name: "periodEnd" });
  const paymentDate = useWatch({ control: form.control, name: "paymentDate" });

  const selectedCurrencyId = React.useMemo(
    () => currencies.find((currency) => currency.code === currencyCode)?.id ?? "",
    [currencies, currencyCode]
  );

  React.useEffect(() => {
    if (!open) return;

    form.reset({
      name: initialData?.name ?? "",
      runDate: initialData?.runDate ?? formatDateForForm(new Date()),
      periodStart: initialData?.periodStart ?? "",
      periodEnd: initialData?.periodEnd ?? "",
      paymentDate: initialData?.paymentDate ?? "",
      status: initialData?.status ?? "Draft",
      currency: initialData?.currency ?? "USD",
      notes: initialData?.notes ?? "",
    });
  }, [form, initialData, open]);

  const handleSubmit = async (data: PayrollRunFormData) => {
    await onSubmit({
      name: data.name,
      runDate: data.runDate,
      periodStart: data.periodStart || null,
      periodEnd: data.periodEnd || null,
      paymentDate: data.paymentDate || null,
      status: data.status,
      currency: data.currency,
      notes: data.notes || null,
    });
    form.reset();
  };

  return (
    <DialogBox2
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Payroll Run" : "Create Payroll Run"}
      description="Track a payroll cycle, its dates, and payout status"
      size="md"
      formId="payroll-run-form"
      submitLabel={initialData ? "Update Payroll Run" : "Save Payroll Run"}
      loading={isSubmitting}
    >
      <form id="payroll-run-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Payroll Run Name</label>
          <Input placeholder="April 2026 Payroll" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Run Date</label>
            <DatePicker
              value={toDateValue(runDate)}
              onChange={(date) => form.setValue("runDate", date ? formatDateForForm(date) : "", { shouldDirty: true, shouldValidate: true })}
              placeholder="MM/DD/YYYY"
            />
            {form.formState.errors.runDate ? (
              <p className="text-xs text-red-500">{form.formState.errors.runDate.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <SelectField
              items={STATUS_OPTIONS}
              value={status}
              onValueChange={(value) => form.setValue("status", value, { shouldDirty: true, shouldValidate: true })}
              placeholder="Select status"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Period Start</label>
            <DatePicker
              value={toDateValue(periodStart)}
              onChange={(date) => form.setValue("periodStart", date ? formatDateForForm(date) : "", { shouldDirty: true, shouldValidate: true })}
              placeholder="MM/DD/YYYY"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Period End</label>
            <DatePicker
              value={toDateValue(periodEnd)}
              onChange={(date) => form.setValue("periodEnd", date ? formatDateForForm(date) : "", { shouldDirty: true, shouldValidate: true })}
              placeholder="MM/DD/YYYY"
            />
            {form.formState.errors.periodEnd ? (
              <p className="text-xs text-red-500">{form.formState.errors.periodEnd.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Payment Date</label>
            <DatePicker
              value={toDateValue(paymentDate)}
              onChange={(date) => form.setValue("paymentDate", date ? formatDateForForm(date) : "", { shouldDirty: true, shouldValidate: true })}
              placeholder="MM/DD/YYYY"
            />
            {form.formState.errors.paymentDate ? (
              <p className="text-xs text-red-500">{form.formState.errors.paymentDate.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Currency</label>
          <AccountingCurrencySelect
            useUrlState={false}
            noTitle
            value={selectedCurrencyId}
            onChange={(currencyId) => {
              const selectedCurrency = currencies.find((currency) => currency.id === currencyId);
              form.setValue("currency", selectedCurrency?.code ?? "", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            placeholder="Select currency"
          />
          {form.formState.errors.currency ? (
            <p className="text-xs text-red-500">{form.formState.errors.currency.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes</label>
          <Textarea placeholder="Optional processing or payout notes" {...form.register("notes")} />
        </div>
      </form>
    </DialogBox2>
  );
}
