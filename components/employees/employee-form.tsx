"use client";

import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Tick02Icon,
  UserAdd01Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type {
  CreateEmployeeCommand,
  UpdateEmployeeCommand,
  EmployeeDto,
} from "@/lib/api/employee-types";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const EMPLOYMENT_TYPE_OPTIONS = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Intern",
];

const STEPS = [
  {
    key: "personal",
    label: "Personal Info",
    description: "Basic personal details",
  },
  {
    key: "employment",
    label: "Employment",
    description: "Job and work details",
  },
  { key: "address", label: "Address", description: "Residential address" },
  { key: "review", label: "Review", description: "Confirm and submit" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/* ------------------------------------------------------------------ */
/*  Zod schemas -- one per validatable step                            */
/* ------------------------------------------------------------------ */

const personalSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phoneNumber: z.string().optional(),
  dateOfBirth: z
    .date({ required_error: "Date of birth is required" })
    .optional(),
  gender: z.string().optional(),
  nationalId: z.string().optional(),
  passportNumber: z.string().optional(),
});

const employmentSchema = z.object({
  employeeNumber: z.string().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  hireDate: z.date({ required_error: "Hire date is required" }).optional(),
});

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

/** Map step key to its Zod schema (null = no validation) */
const STEP_SCHEMAS: Record<StepKey, z.ZodSchema | null> = {
  personal: personalSchema,
  employment: employmentSchema,
  address: addressSchema,
  review: null,
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeDto | null;
  onSubmit: (
    data: CreateEmployeeCommand | UpdateEmployeeCommand
  ) => Promise<void>;
  submitting?: boolean;
}

/* ------------------------------------------------------------------ */
/*  StepIndicator                                                      */
/* ------------------------------------------------------------------ */

function StepIndicator({
  steps,
  currentIndex,
}: {
  steps: typeof STEPS;
  currentIndex: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full border text-xs font-medium transition-all duration-300",
                i < currentIndex
                  ? "bg-primary text-primary-foreground border-primary scale-100"
                  : i === currentIndex
                    ? "bg-primary text-primary-foreground border-primary ring-4 ring-primary/15"
                    : "bg-muted text-muted-foreground border-border"
              )}
            >
              {i < currentIndex ? (
                <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cn(
                "hidden text-xs font-medium transition-colors duration-200 sm:block",
                i <= currentIndex
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-px min-w-4 flex-1 transition-colors duration-300",
                i < currentIndex ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ReviewRow                                                          */
/* ------------------------------------------------------------------ */

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] truncate text-right font-medium">
        {value || "--"}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FormField -- wraps Field + FieldError                              */
/* ------------------------------------------------------------------ */

function FormField({
  name,
  label,
  required,
  errors,
  children,
  className,
}: {
  name: string;
  label: string;
  required?: boolean;
  errors: Record<string, string | undefined>;
  children: React.ReactNode;
  className?: string;
}) {
  const error = errors[name];
  return (
    <Field
      orientation="vertical"
      data-invalid={!!error}
      className={cn(className)}
    >
      <FieldLabel className="text-sm text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </FieldLabel>
      <FieldContent>
        {children}
        {error && <FieldError>{error}</FieldError>}
      </FieldContent>
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/*  AnimatedHeight -- measures children and animates container height  */
/* ------------------------------------------------------------------ */

function AnimatedStepContent({
  animKey,
  direction,
  children,
}: {
  animKey: number;
  direction: "forward" | "backward";
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | "auto">("auto");

  React.useEffect(() => {
    if (!innerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });
    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [animKey]);

  const animationClass =
    direction === "forward"
      ? "animate-step-forward"
      : "animate-step-backward";

  return (
    <div
      ref={containerRef}
      className="transition-[height] duration-300 ease-out"
      style={{ height: typeof height === "number" ? `${height}px` : "auto" }}
    >
      <div ref={innerRef} key={animKey} className={cn("p-6", animationClass)}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function EmployeeFormModal({
  open,
  onOpenChange,
  employee,
  onSubmit,
  submitting = false,
}: EmployeeFormModalProps) {
  const isEdit = Boolean(employee);

  const [stepIndex, setStepIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<"forward" | "backward">(
    "forward"
  );
  const [animKey, setAnimKey] = React.useState(0);
  const [errors, setErrors] = React.useState<
    Record<string, string | undefined>
  >({});
  const currentStep = STEPS[stepIndex].key;

  // Form data
  const [form, setForm] = React.useState(() => buildInitialForm(employee));

  // Reset when modal opens or employee reference changes
  React.useEffect(() => {
    if (open) {
      setStepIndex(0);
      setDirection("forward");
      setAnimKey(0);
      setErrors({});
      setForm(buildInitialForm(employee));
    }
  }, [open, employee]);

  /* ---------- helpers ---------- */

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field error on edit
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  /** Validate the current step. Returns true if valid. */
  function validateStep(): boolean {
    const schema = STEP_SCHEMAS[currentStep];
    if (!schema) return true;

    const result = schema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors: Record<string, string | undefined> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return false;
  }

  function goNext() {
    if (!validateStep()) return;
    if (stepIndex < STEPS.length - 1) {
      setDirection("forward");
      setAnimKey((k) => k + 1);
      setStepIndex((i) => i + 1);
      setErrors({});
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setDirection("backward");
      setAnimKey((k) => k + 1);
      setStepIndex((i) => i - 1);
      setErrors({});
    }
  }

  async function handleSubmit() {
    const address = {
      street: form.street || null,
      city: form.city || null,
      state: form.state || null,
      postalCode: form.postalCode || null,
      country: form.country || null,
    };

    if (isEdit && employee) {
      const payload: UpdateEmployeeCommand = {
        employeeId: employee.id,
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        middleName: form.middleName || null,
        email: form.email || null,
        phoneNumber: form.phoneNumber || null,
        dateOfBirth: form.dateOfBirth
          ? form.dateOfBirth.toISOString()
          : new Date().toISOString(),
        gender: form.gender || null,
        nationalId: form.nationalId || null,
        passportNumber: form.passportNumber || null,
        address,
        departmentId: employee.departmentId ?? null,
        positionId: employee.positionId ?? null,
        managerId: employee.managerId ?? null,
        jobTitle: form.jobTitle || null,
        employmentType: form.employmentType || null,
        modifiedBy: null,
      };
      await onSubmit(payload);
    } else {
      const payload: CreateEmployeeCommand = {
        employeeNumber: form.employeeNumber || null,
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        middleName: form.middleName || null,
        email: form.email || null,
        phoneNumber: form.phoneNumber || null,
        dateOfBirth: form.dateOfBirth
          ? form.dateOfBirth.toISOString()
          : new Date().toISOString(),
        gender: form.gender || null,
        nationalId: form.nationalId || null,
        passportNumber: form.passportNumber || null,
        address,
        hireDate: form.hireDate
          ? form.hireDate.toISOString()
          : new Date().toISOString(),
        departmentId: null,
        positionId: null,
        managerId: null,
        jobTitle: form.jobTitle || null,
        employmentType: form.employmentType || null,
        createdBy: null,
      };
      await onSubmit(payload);
    }
  }

  /* ---------- format helpers ---------- */

  function fmtDate(d?: Date | null) {
    if (!d) return null;
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /* ---------- render ---------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[90vh] max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[800px]"
        showCloseButton
      >
        {/* ── Header ── */}
        <div className="border-b px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Employee" : "Create New Employee"}
            </DialogTitle>
            <DialogDescription className='-mt-2'>
              {STEPS[stepIndex].description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <StepIndicator steps={STEPS} currentIndex={stepIndex} />
          </div>
        </div>

        {/* ── Step content with animated height + slide ── */}
        <ScrollArea className="min-h-0 flex-1 h-0">
          <AnimatedStepContent animKey={animKey} direction={direction}>
            {/* Step 1: Personal */}
            {currentStep === "personal" && (
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <FormField
                  name="firstName"
                  label="First Name"
                  required
                  errors={errors}
                >
                  <Input
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    placeholder="John"
                    aria-invalid={!!errors.firstName}
                  />
                </FormField>
                <FormField
                  name="lastName"
                  label="Last Name"
                  required
                  errors={errors}
                >
                  <Input
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    placeholder="Doe"
                    aria-invalid={!!errors.lastName}
                  />
                </FormField>
                <FormField
                  name="middleName"
                  label="Middle Name"
                  errors={errors}
                >
                  <Input
                    value={form.middleName}
                    onChange={(e) => update("middleName", e.target.value)}
                  />
                </FormField>
                <FormField
                  name="email"
                  label="Email"
                  required
                  errors={errors}
                >
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="john@company.com"
                    aria-invalid={!!errors.email}
                  />
                </FormField>
                <FormField
                  name="phoneNumber"
                  label="Phone Number"
                  errors={errors}
                >
                  <Input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => update("phoneNumber", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </FormField>
                <FormField
                  name="dateOfBirth"
                  label="Date of Birth"
                  errors={errors}
                >
                  <DatePicker
                    value={form.dateOfBirth}
                    onChange={(date) => update("dateOfBirth", date)}
                    placeholder="Select date of birth"
                    allowFutureDates={false}
                  />
                </FormField>
                <FormField name="gender" label="Gender" errors={errors}>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => update("gender", v!)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField
                  name="nationalId"
                  label="National ID"
                  errors={errors}
                >
                  <Input
                    value={form.nationalId}
                    onChange={(e) => update("nationalId", e.target.value)}
                  />
                </FormField>
                <FormField
                  name="passportNumber"
                  label="Passport Number"
                  errors={errors}
                  className="sm:col-span-2"
                >
                  <Input
                    value={form.passportNumber}
                    onChange={(e) =>
                      update("passportNumber", e.target.value)
                    }
                  />
                </FormField>
              </div>
            )}

            {/* Step 2: Employment */}
            {currentStep === "employment" && (
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                {!isEdit && (
                  <FormField
                    name="employeeNumber"
                    label="Employee Number"
                    errors={errors}
                  >
                    <Input
                      value={form.employeeNumber}
                      onChange={(e) =>
                        update("employeeNumber", e.target.value)
                      }
                      placeholder="EMP-001"
                    />
                  </FormField>
                )}
                <FormField
                  name="jobTitle"
                  label="Job Title"
                  required
                  errors={errors}
                >
                  <Input
                    value={form.jobTitle}
                    onChange={(e) => update("jobTitle", e.target.value)}
                    placeholder="Software Engineer"
                    aria-invalid={!!errors.jobTitle}
                  />
                </FormField>
                <FormField
                  name="employmentType"
                  label="Employment Type"
                  required
                  errors={errors}
                >
                  <Select
                    value={form.employmentType}
                    onValueChange={(v) => update("employmentType", v!)}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.employmentType}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                {!isEdit && (
                  <FormField
                    name="hireDate"
                    label="Hire Date"
                    errors={errors}
                  >
                    <DatePicker
                      value={form.hireDate}
                      onChange={(date) => update("hireDate", date)}
                      placeholder="Select hire date"
                    />
                  </FormField>
                )}
              </div>
            )}

            {/* Step 3: Address */}
            {currentStep === "address" && (
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <FormField
                  name="street"
                  label="Street"
                  errors={errors}
                  className="sm:col-span-2"
                >
                  <Input
                    value={form.street}
                    onChange={(e) => update("street", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </FormField>
                <FormField name="city" label="City" errors={errors}>
                  <Input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="New York"
                  />
                </FormField>
                <FormField
                  name="state"
                  label="State / Province"
                  errors={errors}
                >
                  <Input
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    placeholder="NY"
                  />
                </FormField>
                <FormField
                  name="postalCode"
                  label="Postal Code"
                  errors={errors}
                >
                  <Input
                    value={form.postalCode}
                    onChange={(e) => update("postalCode", e.target.value)}
                    placeholder="10001"
                  />
                </FormField>
                <FormField name="country" label="Country" errors={errors}>
                  <Input
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    placeholder="United States"
                  />
                </FormField>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === "review" && (
              <div className="flex flex-col gap-4">
                {/* Personal */}
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Personal Information
                  </p>
                  <div className="divide-y">
                    <ReviewRow label="First Name" value={form.firstName} />
                    <ReviewRow label="Last Name" value={form.lastName} />
                    <ReviewRow label="Middle Name" value={form.middleName} />
                    <ReviewRow label="Email" value={form.email} />
                    <ReviewRow label="Phone" value={form.phoneNumber} />
                    <ReviewRow
                      label="Date of Birth"
                      value={fmtDate(form.dateOfBirth)}
                    />
                    <ReviewRow label="Gender" value={form.gender} />
                    <ReviewRow label="National ID" value={form.nationalId} />
                    <ReviewRow
                      label="Passport #"
                      value={form.passportNumber}
                    />
                  </div>
                </div>

                {/* Employment */}
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Employment Details
                  </p>
                  <div className="divide-y">
                    {!isEdit && (
                      <ReviewRow
                        label="Employee #"
                        value={form.employeeNumber}
                      />
                    )}
                    <ReviewRow label="Job Title" value={form.jobTitle} />
                    <ReviewRow
                      label="Employment Type"
                      value={form.employmentType}
                    />
                    {!isEdit && (
                      <ReviewRow
                        label="Hire Date"
                        value={fmtDate(form.hireDate)}
                      />
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Address
                  </p>
                  <div className="divide-y">
                    <ReviewRow label="Street" value={form.street} />
                    <ReviewRow label="City" value={form.city} />
                    <ReviewRow label="State" value={form.state} />
                    <ReviewRow label="Postal Code" value={form.postalCode} />
                    <ReviewRow label="Country" value={form.country} />
                  </div>
                </div>
              </div>
            )}
          </AnimatedStepContent>
        </ScrollArea>

        {/* ── Footer ── */}
        <DialogFooter className="border-t p-4 sm:justify-between">
          <Button
            variant="outline"
            onClick={stepIndex === 0 ? () => onOpenChange(false) : goBack}
            disabled={submitting}
            iconLeft={
              stepIndex > 0 ? (
                <HugeiconsIcon icon={ArrowLeft01Icon} />
              ) : undefined
            }
          >
            {stepIndex === 0 ? "Cancel" : "Back"}
          </Button>

          {stepIndex < STEPS.length - 1 ? (
            <Button
              onClick={goNext}
              iconRight={<HugeiconsIcon icon={ArrowRight01Icon} />}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={submitting}
              loadingText={isEdit ? "Saving..." : "Creating..."}
              iconLeft={
                isEdit ? (
                  <HugeiconsIcon icon={PencilEdit01Icon} />
                ) : (
                  <HugeiconsIcon icon={UserAdd01Icon} />
                )
              }
            >
              {isEdit ? "Save Changes" : "Create Employee"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildInitialForm(employee?: EmployeeDto | null) {
  return {
    employeeNumber: employee?.employeeNumber ?? "",
    firstName: employee?.firstName ?? "",
    lastName: employee?.lastName ?? "",
    middleName: employee?.middleName ?? "",
    email: employee?.email ?? "",
    phoneNumber: employee?.phoneNumber ?? "",
    dateOfBirth: employee?.dateOfBirth
      ? new Date(employee.dateOfBirth)
      : (undefined as Date | undefined),
    gender: employee?.gender ?? "",
    nationalId: employee?.nationalId ?? "",
    passportNumber: employee?.passportNumber ?? "",
    hireDate: employee?.hireDate
      ? new Date(employee.hireDate)
      : (new Date() as Date | undefined),
    jobTitle: employee?.jobTitle ?? "",
    employmentType: employee?.employmentType ?? "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  };
}
