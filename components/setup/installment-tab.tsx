"use client";

import * as React from "react";
import PageLayout from "@/components/dashboard/page-layout";
import AcademicYearSelect from "@/components/shared/data-reusable/academic-year-select";
import { useAcademicYears } from "@/hooks/use-academic-year";
import { useInstallments, useInstallmentMutations } from "@/hooks/use-finance";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogBox } from "@/components/ui/dialog-box";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateInstallmentCommand,
  PaymentInstallmentDto,
} from "@/lib/api2/finance-types";
import type { AcademicYearDto } from "@/lib/api2/academic-year-types";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { Plus, RefreshCcw, Trash2 } from "lucide-react";

const createInstallmentSchema = (academicYear?: AcademicYearDto) => {
  const startDate = academicYear ? parseISO(academicYear.start_date) : null;
  const endDate = academicYear ? parseISO(academicYear.end_date) : null;

  return z
    .object({
      installments: z
        .array(
          z.object({
            installment_id: z.string().optional(),
            value: z
              .coerce
              .number()
              .min(1, "Percentage is required")
              .max(100, "Must be between 1 and 100"),
            due_date: z.date({ required_error: "Due date is required" }),
          })
        )
        .min(1, "Add at least one installment"),
    })
    .refine(
      (data) => {
        const total = data.installments.reduce(
          (sum, inst) => sum + (Number.isFinite(inst.value) ? inst.value : 0),
          0
        );
        return Math.abs(total - 100) < 0.01;
      },
      {
        message: "Total percentage must equal 100%",
        path: ["installments"],
      }
    )
    .refine(
      (data) => {
        const dates = data.installments.map((inst) =>
          format(inst.due_date, "yyyy-MM-dd")
        );
        return new Set(dates).size === dates.length;
      },
      {
        message: "Due dates must be unique",
        path: ["installments"],
      }
    )
    .refine(
      (data) => {
        for (let i = 1; i < data.installments.length; i += 1) {
          if (isBefore(data.installments[i].due_date, data.installments[i - 1].due_date)) {
            return false;
          }
        }
        return true;
      },
      {
        message: "Due dates must be in ascending order",
        path: ["installments"],
      }
    )
    .refine(
      (data) => {
        if (!startDate || !endDate) return true;
        return data.installments.every(
          (inst) =>
            !isBefore(inst.due_date, startDate) &&
            !isAfter(inst.due_date, endDate)
        );
      },
      {
        message: "Due dates must be within the academic year",
        path: ["installments"],
      }
    );
};

type InstallmentFormItem = {
  installment_id?: string;
  value: number;
  due_date: Date;
};

type InstallmentFormInput = {
  installments: InstallmentFormItem[];
};

type NormalizedInstallment = {
  id?: string;
  value: number;
  due_date: string;
};

type InstallmentDialogMode = "create" | "edit";

export function InstallmentTab() {
  const [yearId, setYearId] = useQueryState("year", { defaultValue: "" });
  const { data: academicYears, isLoading: yearsLoading } = useAcademicYears();

  const selectedYear = React.useMemo(() => {
    if (!academicYears) return null;
    return (
      academicYears.find((year) => year.id === yearId) ||
      academicYears.find((year) => year.current) ||
      academicYears[0] ||
      null
    );
  }, [academicYears, yearId]);

  React.useEffect(() => {
    if (!yearId && academicYears && academicYears.length > 0) {
      const current = academicYears.find((year) => year.current);
      void setYearId(current?.id || academicYears[0]?.id || "");
    }
  }, [yearId, academicYears, setYearId]);

  const {
    data: installments,
    isLoading: installmentsLoading,
    isFetching,
    refetch,
  } = useInstallments(selectedYear?.id);

  const { create, bulkUpdate, remove } = useInstallmentMutations(
    selectedYear?.id
  );

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] =
    React.useState<InstallmentDialogMode>("create");
  const [deletingInstallment, setDeletingInstallment] =
    React.useState<PaymentInstallmentDto | null>(null);

  const installmentSchema = React.useMemo(
    () => createInstallmentSchema(selectedYear || undefined),
    [selectedYear]
  );

  const form = useForm<InstallmentFormInput>({
    resolver: zodResolver(installmentSchema),
    defaultValues: {
      installments: [{ value: 0, due_date: undefined as unknown as Date }],
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { fields, append, remove: removeField } = useFieldArray({
    control: form.control,
    name: "installments",
  });

  const watchedInstallments = useWatch({
    control: form.control,
    name: "installments",
  });

  const formTotalPercentage = React.useMemo(() => {
    if (!watchedInstallments?.length) return 0;
    return watchedInstallments.reduce((sum, inst) => {
      // Convert to number safely (Input type="number" can return strings)
      const value = typeof inst?.value === 'string' 
        ? parseFloat(inst.value) 
        : inst?.value;
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  }, [watchedInstallments]);

  const openDialog = (mode: InstallmentDialogMode) => {
    setDialogMode(mode);
    setDialogOpen(true);
  };

  React.useEffect(() => {
    if (!dialogOpen) return;

    if (dialogMode === "edit" && installments && installments.length > 0) {
      form.reset({
        installments: installments.map((inst) => ({
          installment_id: inst.id,
          value: inst.percentage || inst.value,
          due_date: parseISO(inst.due_date),
        })),
      });
      return;
    }

    form.reset({
      installments: [{ value: 0, due_date: undefined as unknown as Date }],
    });
  }, [dialogOpen, dialogMode, installments, form]);

  const handleSubmit = (data: InstallmentFormInput) => {
    if (!selectedYear) {
      toast.error("Please select an academic year");
      return;
    }

    const normalized: NormalizedInstallment[] = data.installments.map(
      (inst) => ({
        id: inst.installment_id,
        value: Number(inst.value),
        due_date: format(inst.due_date, "yyyy-MM-dd"),
      })
    );

    if (dialogMode === "edit" && installments && installments.length > 0) {
      bulkUpdate.mutate(normalized, {
        onSuccess: () => {
          toast.success("Installments updated successfully");
          setDialogOpen(false);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      });
      return;
    }

    const createPayload: CreateInstallmentCommand[] = normalized.map(
      ({ value, due_date }) => ({ value, due_date })
    );

    create.mutate(createPayload, {
      onSuccess: () => {
        toast.success("Installments created successfully");
        setDialogOpen(false);
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  const handleInvalid = (errors: Record<string, unknown>) => {
    // For array field errors, Zod stores the error at the field level
    const fieldErrors = form.formState.errors;
    
    // Check for array-level errors (from .refine() with path: ["installments"])
    const installmentFieldError = fieldErrors.installments as
      | { message?: string }
      | undefined;
    const installmentError = installmentFieldError?.message;
    
    if (installmentError) {
      toast.error(installmentError);
      return;
    }

    // Fallback: look for any field errors
    const firstErrorMessage = Object.values(errors)
      .map((error) => (error as { message?: string })?.message)
      .find((message) => Boolean(message));

    if (firstErrorMessage) {
      toast.error(firstErrorMessage);
    } else {
      toast.error("Please check all fields and try again");
    }
  };

  const handleDelete = () => {
    if (!deletingInstallment) return;

    remove.mutate(deletingInstallment.id, {
      onSuccess: () => {
        toast.success("Installment deleted successfully");
        setDeletingInstallment(null);
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  const installmentRows = React.useMemo(
    () => installments ?? [],
    [installments]
  );
  const hasInstallments = installmentRows.length > 0;

  const sortedInstallments = React.useMemo(() => {
    return [...installmentRows].sort((a, b) => {
      const seqA = a.sequence ?? 0;
      const seqB = b.sequence ?? 0;
      if (seqA !== seqB) return seqA - seqB;
      return a.due_date.localeCompare(b.due_date);
    });
  }, [installmentRows]);

  const scheduleRows = React.useMemo(() => {
    return sortedInstallments.reduce<
      { installment: PaymentInstallmentDto; percent: number; cumulative: number }[]
    >((acc, inst) => {
      const pct = Number(inst.percentage ?? inst.value ?? 0);
      const prev = acc[acc.length - 1]?.cumulative ?? 0;
      const cumulative = prev + (Number.isFinite(pct) ? pct : 0);
      acc.push({ installment: inst, percent: pct, cumulative });
      return acc;
    }, []);
  }, [sortedInstallments]);

  const displayTotalPercentage = React.useMemo(() => {
    return scheduleRows.length > 0
      ? scheduleRows[scheduleRows.length - 1].cumulative
      : 0;
  }, [scheduleRows]);

  return (
    <PageLayout
      title="Installments"
      description="Set up fee installment schedules"
      actions={
        <div className="flex items-center gap-2">
          <AcademicYearSelect noTitle selectClassName="w-56" />
          <Button
            variant="outline"
            iconLeft={<RefreshCcw className="h-4 w-4" />}
            loading={isFetching}
            onClick={() => refetch()}
            tooltip="Refresh installments"
          >
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {yearsLoading || installmentsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : !selectedYear ? (
          <EmptyState>
            <EmptyStateTitle>No Academic Year Selected</EmptyStateTitle>
            <EmptyStateDescription>
              Please select an academic year to manage installments.
            </EmptyStateDescription>
          </EmptyState>
        ) : !hasInstallments ? (
          <EmptyState>
            <EmptyStateTitle>No Installments Yet</EmptyStateTitle>
            <EmptyStateDescription>
              Create a payment schedule for {selectedYear.name}.
            </EmptyStateDescription>
            <EmptyStateAction onClick={() => openDialog("create")}>
              <Button iconLeft={<Plus className="h-4 w-4" />}>
                Add Installments
              </Button>
            </EmptyStateAction>
          </EmptyState>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="rounded-xl border bg-card p-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Schedule Summary
                </p>
                <h3 className="text-2xl font-semibold">
                  {displayTotalPercentage.toFixed(2)}%
                </h3>
                <p className="text-sm text-muted-foreground">
                  Total scheduled across {installmentRows.length} installments
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <Progress value={Math.min(100, displayTotalPercentage)} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Target 100%</span>
                  <span>
                    {displayTotalPercentage >= 100
                      ? "On target"
                      : "Needs adjustment"}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3 rounded-lg border bg-muted/40 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Academic year</span>
                  <span className="font-medium">{selectedYear.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(parseISO(selectedYear.start_date), "MMM d, yyyy")} —{" "}
                  {format(parseISO(selectedYear.end_date), "MMM d, yyyy")}
                </div>
              </div>

              <Button
                className="mt-5 w-full"
                iconLeft={<Plus className="h-4 w-4" />}
                onClick={() => openDialog("edit")}
              >
                Edit Schedule
              </Button>
            </div>

            <div className="rounded-xl border bg-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold">Installment Timeline</h3>
                  <p className="text-sm text-muted-foreground">
                    Ordered by due date and sequence
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  iconLeft={<Plus className="h-4 w-4" />}
                  onClick={() => openDialog("edit")}
                >
                  Update
                </Button>
              </div>

              <div className="divide-y">
                {scheduleRows.map(({ installment, percent, cumulative }, index) => (
                  <div
                    key={installment.id}
                    className="group relative grid gap-4 px-5 py-4 sm:grid-cols-[120px_1fr_auto]"
                  >
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Installment {installment.sequence ?? index + 1}
                      </p>
                      <p className="text-lg font-semibold">{percent}%</p>
                      <Badge variant={installment.active ? "default" : "secondary"}>
                        {installment.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          Due {format(parseISO(installment.due_date), "MMM d, yyyy")}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          Cumulative {cumulative.toFixed(2)}%
                        </span>
                      </div>
                      <Progress value={Math.min(100, cumulative)} className="h-2" />
                    </div>

                    <div className="flex items-center justify-end">
                      <Button
                        size="xs"
                        variant="ghost"
                        iconLeft={<Trash2 className="h-3 w-3" />}
                        onClick={() => setDeletingInstallment(installment)}
                        disabled={!installment.active}
                        tooltip="Delete installment"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogBox
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          dialogMode === "edit" ? "Edit Installments" : "Create Installments"
        }
        description={
          selectedYear
            ? `Manage installments for ${selectedYear.name}`
            : "Manage installments"
        }
        onAction={form.handleSubmit(handleSubmit, handleInvalid)}
        actionLabel={dialogMode === "edit" ? "Save Changes" : "Create"}
        actionLoading={create.isPending || bulkUpdate.isPending}
      >
        <Form {...form}>
          <form className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Percentage</p>
                <p className={`text-sm ${displayTotalPercentage === 100 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}`}>
                  {formTotalPercentage.toFixed(2)}%
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                iconLeft={<Plus className="h-4 w-4" />}
                onClick={() =>
                  append({ value: 0, due_date: undefined as unknown as Date })
                }
              >
                Add Row
              </Button>
            </div>

            {form.formState.errors.installments?.message && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {form.formState.errors.installments?.message}
              </div>
            )}

            <div className="space-y-4 w-full">
              {fields.map((field, index) => {
                const valueError = form.formState.errors.installments?.[index]?.value;
                const dateError = form.formState.errors.installments?.[index]?.due_date;
                
                return (
                  <div
                    key={field.id}
                    className={`grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-4 ${
                      valueError || dateError ? 'border-destructive bg-destructive/5' : ''
                    }`}
                  >
                  <FormField
                    control={form.control}
                    name={`installments.${index}.value`}
                    render={({ field: valueField }) => (
                      <FormItem>
                        <FormLabel>Percentage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            step={0.01}
                            {...valueField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`installments.${index}.due_date`}
                    render={({ field: dateField }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={dateField.value}
                            onChange={dateField.onChange}
                            placeholder="Select date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end max-w-xs">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      iconLeft={<Trash2 className="h-4 w-4" />}
                      onClick={() => removeField(index)}
                      disabled={fields.length === 1}
                    />
                  </div>
                </div>
                );
              })}
            </div>
          </form>
        </Form>
      </DialogBox>

      <DialogBox
        open={!!deletingInstallment}
        onOpenChange={(open) => !open && setDeletingInstallment(null)}
        title="Delete Installment"
        description={`Are you sure you want to delete installment ${deletingInstallment?.sequence ?? ""}? This action cannot be undone.`}
        onAction={handleDelete}
        actionLabel="Delete"
        actionVariant="destructive"
        actionLoading={remove.isPending}
      />
    </PageLayout>
  );
}
