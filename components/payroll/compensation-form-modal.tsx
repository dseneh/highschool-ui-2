"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { DialogBox2 } from "@/components/ui/dialog-box2";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import AccountingCurrencySelect from "@/components/shared/data-reusable/accounting-currency-select";
import { useAccountingCurrencies } from "@/hooks/use-accounting";
import type { EmployeeDto } from "@/lib/api2/employee-types";
import type {
  CreateEmployeeCompensationCommand,
  EmployeeCompensationDto,
  PayrollComponentDto,
} from "@/lib/api2/payroll-types";

const compensationSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  baseSalary: z.coerce.number().min(0, "Base salary cannot be negative"),
  currency: z.string().min(1, "Currency is required"),
  paymentFrequency: z.string().min(1, "Payment frequency is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  notes: z.string().optional(),
});

type CompensationFormData = z.infer<typeof compensationSchema>;

const PAYMENT_FREQUENCY_OPTIONS = [
  { value: "Monthly", label: "Monthly" },
  { value: "Biweekly", label: "Bi-Weekly" },
  { value: "Weekly", label: "Weekly" },
  { value: "Annually", label: "Annually" },
];

interface CompensationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeeCompensationCommand) => Promise<void>;
  isSubmitting: boolean;
  employees: EmployeeDto[];
  components: PayrollComponentDto[];
  initialData?: EmployeeCompensationDto;
  hideEmployeeSelect?: boolean;
}

export function CompensationFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  employees,
  components,
  initialData,
  hideEmployeeSelect,
}: CompensationFormModalProps) {
  const form = useForm<CompensationFormData>({
    resolver: zodResolver(compensationSchema),
    defaultValues: {
      employeeId: initialData?.employeeId ?? "",
      baseSalary: initialData?.baseSalary ?? 0,
      currency: initialData?.currency ?? "USD",
      paymentFrequency: initialData?.paymentFrequency ?? "Monthly",
      effectiveDate: initialData?.effectiveDate ?? new Date().toISOString().slice(0, 10),
      notes: initialData?.notes ?? "",
    },
  });

  const [selectedComponentIds, setSelectedComponentIds] = React.useState<string[]>([]);
  const [overrideValues, setOverrideValues] = React.useState<Record<string, string>>({});
  const { data: currencies = [] } = useAccountingCurrencies();

  const employeeId = useWatch({ control: form.control, name: "employeeId" });
  const paymentFrequency = useWatch({ control: form.control, name: "paymentFrequency" });
  const effectiveDate = useWatch({ control: form.control, name: "effectiveDate" });
  const currencyCode = useWatch({ control: form.control, name: "currency" });

  const selectedCurrencyId = React.useMemo(
    () => currencies.find((currency) => currency.code === currencyCode)?.id ?? "",
    [currencies, currencyCode]
  );

  React.useEffect(() => {
    if (!open) return;

    form.reset({
      employeeId: initialData?.employeeId ?? "",
      baseSalary: initialData?.baseSalary ?? 0,
      currency: initialData?.currency ?? "USD",
      paymentFrequency: initialData?.paymentFrequency ?? "Monthly",
      effectiveDate: initialData?.effectiveDate ?? new Date().toISOString().slice(0, 10),
      notes: initialData?.notes ?? "",
    });

    const selectedItems = initialData?.items ?? [];
    setSelectedComponentIds(selectedItems.map((item) => item.componentId));
    setOverrideValues(
      selectedItems.reduce<Record<string, string>>((accumulator, item) => {
        accumulator[item.componentId] = item.overrideValue == null ? "" : String(item.overrideValue);
        return accumulator;
      }, {})
    );
  }, [form, initialData, open]);

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: employee.fullName || employee.employeeNumber || "Unnamed Employee",
  }));

  const handleToggleComponent = (componentId: string, checked: boolean) => {
    setSelectedComponentIds((current) => {
      if (checked) {
        return current.includes(componentId) ? current : [...current, componentId];
      }
      return current.filter((value) => value !== componentId);
    });
  };

  const handleSubmit = async (data: CompensationFormData) => {
    await onSubmit({
      employeeId: data.employeeId,
      baseSalary: data.baseSalary,
      currency: data.currency,
      paymentFrequency: data.paymentFrequency,
      effectiveDate: data.effectiveDate,
      notes: data.notes || null,
      items: selectedComponentIds.map((componentId) => ({
        componentId,
        overrideValue: overrideValues[componentId] ? Number(overrideValues[componentId]) : null,
      })),
    });
    form.reset();
    setSelectedComponentIds([]);
    setOverrideValues({});
  };

  return (
    <DialogBox2
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Compensation Package" : "Create Compensation Package"}
      description="Set the employee base salary and attach recurring earnings or deductions"
      size="lg"
      formId="compensation-form"
      submitLabel={initialData ? "Update Compensation" : "Save Compensation"}
      loading={isSubmitting}
    >
      <form id="compensation-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!hideEmployeeSelect && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Employee</label>
            <SelectField
              items={employeeOptions}
              value={employeeId}
              onValueChange={(value) => form.setValue("employeeId", value as string)}
              placeholder="Select employee"
              searchable
            />
            {form.formState.errors.employeeId ? (
              <p className="text-xs text-red-500">{form.formState.errors.employeeId.message}</p>
            ) : null}
          </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Base Salary</label>
            <Input type="number" min={0} step="0.01" {...form.register("baseSalary")} />
            {form.formState.errors.baseSalary ? (
              <p className="text-xs text-red-500">{form.formState.errors.baseSalary.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            <label className="text-sm font-medium">Payment Frequency</label>
            <SelectField
              items={PAYMENT_FREQUENCY_OPTIONS}
              value={paymentFrequency}
              onValueChange={(value) => form.setValue("paymentFrequency", value as string)}
              placeholder="Select frequency"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Effective Date</label>
            <DatePicker
              value={effectiveDate ? new Date(`${effectiveDate}T00:00:00`) : undefined}
              onChange={(date) => {
                if (!date) {
                  form.setValue("effectiveDate", "", { shouldDirty: true, shouldValidate: true });
                  return;
                }
                const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                form.setValue("effectiveDate", formatted, { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes</label>
          <Textarea placeholder="Optional payroll notes or package details" {...form.register("notes")} />
        </div>

        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">Payroll Components</h3>
            <p className="text-xs text-muted-foreground">Select the earnings and deductions to include in this employee package.</p>
          </div>

          {components.length === 0 ? (
            <p className="text-sm text-muted-foreground">Create payroll components first to attach them here.</p>
          ) : (
            <div className="space-y-3">
              {components.map((component) => {
                const isChecked = selectedComponentIds.includes(component.id);
                return (
                  <div key={component.id} className="rounded-lg border border-dashed p-3">
                    <label className="flex items-start gap-3 text-sm">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => handleToggleComponent(component.id, checked === true)}
                      />
                      <span className="flex-1">
                        <span className="block font-medium">{component.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {component.componentType} • {component.calculationMethod} • Default {component.defaultValue}
                        </span>
                      </span>
                    </label>

                    {isChecked ? (
                      <div className="mt-3 space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Override value</label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={overrideValues[component.id] ?? ""}
                          onChange={(event) =>
                            setOverrideValues((current) => ({
                              ...current,
                              [component.id]: event.target.value,
                            }))
                          }
                          placeholder="Leave blank to use default"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </form>
    </DialogBox2>
  );
}
