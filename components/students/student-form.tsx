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
import { Checkbox } from "@/components/ui/checkbox";
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
  UserIcon,
  Home01Icon,
  MortarboardIcon,
  CheckListIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useGradeLevels } from "@/hooks/use-grade-level";
import { useSections } from "@/hooks/use-section";
import { GradeLevelSelect, SectionSelect } from "@/components/shared/data-reusable";
import type {
  CreateStudentCommand,
  UpdateStudentCommand,
  StudentDto,
} from "@/lib/api2/student-types";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const ENTRY_AS_OPTIONS = [
  { value: "new", label: "New Student" },
  { value: "returning", label: "Returning Student" },
  { value: "transferred", label: "Transferred Student" },
];

const STEPS = [
  {
    key: "personal",
    label: "Personal",
    description: "Basic student details",
    icon: UserIcon,
  },
  {
    key: "address",
    label: "Address",
    description: "Residential address",
    icon: Home01Icon,
  },
  {
    key: "enrollment",
    label: "Enrollment",
    description: "Grade & entry info",
    icon: MortarboardIcon,
  },
  {
    key: "review",
    label: "Review",
    description: "Confirm & submit",
    icon: CheckListIcon,
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/* ------------------------------------------------------------------ */
/*  Zod schemas – one per validatable step                             */
/* ------------------------------------------------------------------ */

const personalSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  middle_name: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Enter a valid email address",
    }),
  phone_number: z.string().optional(),
  date_of_birth: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["male", "female"], {
    required_error: "Gender is required",
  }),
  place_of_birth: z.string().optional(),
});

const addressSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

const enrollmentSchema = z
  .object({
    entry_date: z.date().optional(),
    grade_level: z.string().min(1, "Grade level is required"),
    entry_as: z.enum(["new", "returning", "transferred"], {
      required_error: "Entry type is required",
    }),
    prev_id_number: z.string().optional(),
    enroll_student: z.boolean().optional(),
    section: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.entry_as === "transferred") {
        return !!data.prev_id_number && data.prev_id_number.trim().length > 0;
      }
      return true;
    },
    {
      message: "Previous ID is required for transferred students",
      path: ["prev_id_number"],
    }
  );

const STEP_SCHEMAS: Record<StepKey, z.ZodSchema | null> = {
  personal: personalSchema,
  address: addressSchema,
  enrollment: enrollmentSchema,
  review: null,
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface StudentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: StudentDto | null;
  onSubmit: (
    data: CreateStudentCommand | UpdateStudentCommand
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
    <nav className="flex items-center gap-1.5" aria-label="Form steps">
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                      ? "bg-primary text-primary-foreground ring-[3px] ring-primary/20"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <HugeiconsIcon icon={Tick02Icon} className="size-4" />
                ) : (
                  <HugeiconsIcon icon={step.icon} className="size-4" />
                )}
              </div>
              <div className="hidden sm:block">
                <p
                  className={cn(
                    "text-xs font-medium leading-none transition-colors",
                    isCurrent || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px min-w-6 flex-1 transition-colors duration-300",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionHeader – visual grouping inside steps                       */
/* ------------------------------------------------------------------ */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="sm:col-span-2 mb-1">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ReviewSection + ReviewRow                                          */
/* ------------------------------------------------------------------ */

function ReviewSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: typeof UserIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b bg-muted/40 rounded-t-xl">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HugeiconsIcon icon={icon} className="size-3.5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      </div>
      <div className="divide-y px-4">{children}</div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const isEmpty = !value || value === "--";
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "max-w-[60%] truncate text-right font-medium",
          isEmpty && "text-muted-foreground/50 italic"
        )}
      >
        {value || "Not provided"}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FormField                                                          */
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
/*  AnimatedStepContent                                                */
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
    direction === "forward" ? "animate-step-forward" : "animate-step-backward";

  return (
    <div
      ref={containerRef}
      className="transition-[height] duration-300 ease-out"
      style={{
        height: typeof height === "number" ? `${height}px` : "auto",
      }}
    >
      <div
        ref={innerRef}
        key={animKey}
        className={cn("px-6 py-5", animationClass)}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function StudentFormModal({
  open,
  onOpenChange,
  student,
  onSubmit,
  submitting = false,
}: StudentFormModalProps) {
  const isEdit = Boolean(student);

  const [stepIndex, setStepIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<"forward" | "backward">(
    "forward"
  );
  const [animKey, setAnimKey] = React.useState(0);
  const [errors, setErrors] = React.useState<
    Record<string, string | undefined>
  >({});
  const currentStep = STEPS[stepIndex].key;

  // Grade levels & sections – kept for review step name lookups
  // (React Query deduplicates with the same calls inside the reusable selects)
  const { data: gradeLevels = [] } = useGradeLevels();

  // Form data
  const [form, setForm] = React.useState(() => buildInitialForm(student));

  // Sections for the selected grade level – fetched via dedicated hook
  const { data: sections = [] } = useSections(
    form.grade_level || undefined
  );

  // Reset when modal opens or student reference changes
  React.useEffect(() => {
    if (open) {
      setStepIndex(0);
      setDirection("forward");
      setAnimKey(0);
      setErrors({});
      setForm(buildInitialForm(student));
    }
  }, [open, student]);

  /* ---------- helpers ---------- */

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

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

  function fmtDateISO(d?: Date | null): string | null {
    if (!d) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function handleSubmit() {
    if (isEdit && student) {
      const payload: UpdateStudentCommand = {
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name || null,
        date_of_birth: fmtDateISO(form.date_of_birth) ?? "",
        gender: form.gender as "male" | "female",
        email: form.email || null,
        phone_number: form.phone_number || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        postal_code: form.postal_code || null,
        country: form.country || null,
        place_of_birth: form.place_of_birth || null,
        entry_date: fmtDateISO(form.entry_date),
        grade_level: form.grade_level || null,
        entry_as: form.entry_as as "new" | "returning" | "transferred",
        prev_id_number: form.prev_id_number || null,
      };
      await onSubmit(payload);
    } else {
      const payload: CreateStudentCommand = {
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name || null,
        date_of_birth: fmtDateISO(form.date_of_birth) ?? "",
        gender: form.gender as "male" | "female",
        email: form.email || null,
        phone_number: form.phone_number || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        postal_code: form.postal_code || null,
        country: form.country || null,
        place_of_birth: form.place_of_birth || null,
        entry_date: fmtDateISO(form.entry_date),
        grade_level: form.grade_level,
        entry_as: form.entry_as as "new" | "returning" | "transferred",
        prev_id_number: form.prev_id_number || null,
        section: form.section || null,
        enroll_student: form.enroll_student,
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

  function gradeLevelName(id: string | undefined) {
    if (!id) return null;
    return gradeLevels.find((gl) => gl.id === id)?.name ?? null;
  }

  function sectionName(id: string | undefined) {
    if (!id) return null;
    return sections.find((s) => s.id === id)?.name ?? null;
  }

  /* ---------- render ---------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[90vh] max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-180"
        showCloseButton
      >
        {/* ── Header ── */}
        <div className="border-b px-6 pt-5 pb-4 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {isEdit ? "Edit Student" : "Add New Student"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {isEdit
                ? "Update the student\u2019s information below."
                : "Fill in the student\u2019s information to register them."}
            </DialogDescription>
          </DialogHeader>
          <StepIndicator steps={STEPS} currentIndex={stepIndex} />
        </div>

        {/* ── Step content ── */}
        <ScrollArea className="min-h-0 flex-1 h-0">
          <AnimatedStepContent animKey={animKey} direction={direction}>
            {/* ── Step 1: Personal Info ── */}
            {currentStep === "personal" && (
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <SectionHeader
                  title="Identity"
                  description="Student's legal name and personal details."
                />
                <FormField
                  name="first_name"
                  label="First Name"
                  required
                  errors={errors}
                >
                  <Input
                    value={form.first_name}
                    onChange={(e) => update("first_name", e.target.value)}
                    placeholder="John"
                    aria-invalid={!!errors.first_name}
                  />
                </FormField>
                <FormField
                  name="last_name"
                  label="Last Name"
                  required
                  errors={errors}
                >
                  <Input
                    value={form.last_name}
                    onChange={(e) => update("last_name", e.target.value)}
                    placeholder="Doe"
                    aria-invalid={!!errors.last_name}
                  />
                </FormField>
                <FormField
                  name="middle_name"
                  label="Middle Name"
                  errors={errors}
                >
                  <Input
                    value={form.middle_name}
                    onChange={(e) => update("middle_name", e.target.value)}
                    placeholder="Optional"
                  />
                </FormField>
                <FormField
                  name="gender"
                  label="Gender"
                  required
                  errors={errors}
                >
                  <Select
                    value={form.gender}
                    onValueChange={(v) => update("gender", v!)}
                    items={GENDER_OPTIONS.map((g) => ({ value: g.value, label: g.label }))}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.gender}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <div className="sm:col-span-2 mt-2 mb-1">
                  <div className="h-px bg-border" />
                </div>

                <SectionHeader
                  title="Contact & Birth"
                  description="How to reach the student and birth details."
                />
                <FormField name="email" label="Email" errors={errors}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="john@example.com"
                    aria-invalid={!!errors.email}
                  />
                </FormField>
                <FormField
                  name="phone_number"
                  label="Phone Number"
                  errors={errors}
                >
                  <Input
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => update("phone_number", e.target.value)}
                    placeholder="+231 555 0000"
                  />
                </FormField>
                <FormField
                  name="date_of_birth"
                  label="Date of Birth"
                  required
                  errors={errors}
                >
                  <DatePicker
                    value={form.date_of_birth}
                    onChange={(date) => update("date_of_birth", date)}
                    placeholder="Select date of birth"
                    allowFutureDates={false}
                  />
                </FormField>
                <FormField
                  name="place_of_birth"
                  label="Place of Birth"
                  errors={errors}
                >
                  <Input
                    value={form.place_of_birth}
                    onChange={(e) => update("place_of_birth", e.target.value)}
                    placeholder="Monrovia"
                  />
                </FormField>
              </div>
            )}

            {/* ── Step 2: Address ── */}
            {currentStep === "address" && (
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <SectionHeader
                  title="Home Address"
                  description="Where the student currently resides. All fields are optional."
                />
                <FormField
                  name="address"
                  label="Street Address"
                  errors={errors}
                  className="sm:col-span-2"
                >
                  <Input
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </FormField>
                <FormField name="city" label="City" errors={errors}>
                  <Input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Monrovia"
                  />
                </FormField>
                <FormField
                  name="state"
                  label="State / County"
                  errors={errors}
                >
                  <Input
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    placeholder="Montserrado"
                  />
                </FormField>
                <FormField
                  name="postal_code"
                  label="Postal Code"
                  errors={errors}
                >
                  <Input
                    value={form.postal_code}
                    onChange={(e) => update("postal_code", e.target.value)}
                    placeholder="1000"
                  />
                </FormField>
                <FormField name="country" label="Country" errors={errors}>
                  <Input
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    placeholder="Liberia"
                  />
                </FormField>
              </div>
            )}

            {/* ── Step 3: Enrollment ── */}
            {currentStep === "enrollment" && (
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <SectionHeader
                  title="Entry Information"
                  description="When and how the student enters the school."
                />
                <FormField
                  name="entry_date"
                  label="Entry Date"
                  errors={errors}
                >
                  <DatePicker
                    value={form.entry_date}
                    onChange={(date) => update("entry_date", date)}
                    placeholder="Select entry date"
                  />
                </FormField>
                <FormField
                  name="entry_as"
                  label="Entry Type"
                  required
                  errors={errors}
                >
                  <Select
                    value={form.entry_as}
                    onValueChange={(v) => {
                      update("entry_as", v!);
                      if (v === "new") {
                        update("prev_id_number", "");
                      }
                    }}
                    items={ENTRY_AS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.entry_as}
                    >
                      <SelectValue placeholder="Select entry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTRY_AS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                {form.entry_as === "transferred" && (
                  <FormField
                    name="prev_id_number"
                    label="Previous Student ID"
                    required
                    errors={errors}
                    className="sm:col-span-2"
                  >
                    <Input
                      value={form.prev_id_number}
                      onChange={(e) =>
                        update("prev_id_number", e.target.value)
                      }
                      placeholder="ID from previous school"
                      aria-invalid={!!errors.prev_id_number}
                    />
                  </FormField>
                )}

                <div className="sm:col-span-2 mt-2 mb-1">
                  <div className="h-px bg-border" />
                </div>

                <SectionHeader
                  title="Grade Placement"
                  description="Assign the student to a grade level."
                />
                <FormField
                  name="grade_level"
                  label="Grade Level"
                  required
                  errors={errors}
                >
                  <GradeLevelSelect
                    useUrlState={false}
                    value={form.grade_level}
                    onChange={(v) => {
                      update("grade_level", v);
                      update("section", "");
                    }}
                    showActiveOnly
                    searchable
                    noTitle
                    placeholder="Search grade level..."
                  />
                </FormField>

                {/* Enroll toggle – only in create mode */}
                {!isEdit && (
                  <>
                    <div className="sm:col-span-2 mt-2 mb-1">
                      <div className="h-px bg-border" />
                    </div>

                    <div className="sm:col-span-2">
                      <div
                        className={cn(
                          "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                          form.enroll_student
                            ? "border-primary/30 bg-primary/5"
                            : "bg-muted/30"
                        )}
                      >
                        <Checkbox
                          id="enroll_student"
                          checked={form.enroll_student}
                          onCheckedChange={(checked) =>
                            update("enroll_student", checked === true)
                          }
                          className="mt-0.5"
                        />
                        <div className="grid gap-1 leading-none">
                          <label
                            htmlFor="enroll_student"
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            Enroll student immediately
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Creates an enrollment in the current academic year
                            for the selected grade level.
                          </p>
                        </div>
                      </div>
                    </div>

                    {form.enroll_student && (
                      <FormField
                        name="section"
                        label="Section"
                        errors={errors}
                        className="sm:col-span-2"
                      >
                        <SectionSelect
                          gradeLevelId={form.grade_level}
                          useUrlState={false}
                          value={form.section}
                          onChange={(v) => update("section", v)}
                          noTitle
                          placeholder="Select section (optional)"
                          selectClassName="max-w-[300px]"
                        />
                      </FormField>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Step 4: Review ── */}
            {currentStep === "review" && (
              <div className="flex flex-col gap-4">
                <ReviewSection title="Personal Information" icon={UserIcon}>
                  <ReviewRow label="First Name" value={form.first_name} />
                  <ReviewRow label="Last Name" value={form.last_name} />
                  <ReviewRow label="Middle Name" value={form.middle_name} />
                  <ReviewRow label="Email" value={form.email} />
                  <ReviewRow label="Phone" value={form.phone_number} />
                  <ReviewRow
                    label="Date of Birth"
                    value={fmtDate(form.date_of_birth)}
                  />
                  <ReviewRow
                    label="Gender"
                    value={
                      form.gender
                        ? form.gender.charAt(0).toUpperCase() +
                          form.gender.slice(1)
                        : null
                    }
                  />
                  <ReviewRow
                    label="Place of Birth"
                    value={form.place_of_birth}
                  />
                </ReviewSection>

                <ReviewSection title="Address" icon={Home01Icon}>
                  <ReviewRow label="Street" value={form.address} />
                  <ReviewRow label="City" value={form.city} />
                  <ReviewRow label="State" value={form.state} />
                  <ReviewRow label="Postal Code" value={form.postal_code} />
                  <ReviewRow label="Country" value={form.country} />
                </ReviewSection>

                <ReviewSection title="Enrollment Details" icon={MortarboardIcon}>
                  <ReviewRow
                    label="Entry Date"
                    value={fmtDate(form.entry_date)}
                  />
                  <ReviewRow
                    label="Entry Type"
                    value={
                      ENTRY_AS_OPTIONS.find(
                        (o) => o.value === form.entry_as
                      )?.label ?? form.entry_as
                    }
                  />
                  {form.entry_as === "transferred" && (
                    <ReviewRow
                      label="Previous ID"
                      value={form.prev_id_number}
                    />
                  )}
                  <ReviewRow
                    label="Grade Level"
                    value={gradeLevelName(form.grade_level)}
                  />
                  {!isEdit && (
                    <ReviewRow
                      label="Enroll Immediately"
                      value={form.enroll_student ? "Yes" : "No"}
                    />
                  )}
                  {!isEdit && form.enroll_student && form.section && (
                    <ReviewRow
                      label="Section"
                      value={sectionName(form.section)}
                    />
                  )}
                </ReviewSection>
              </div>
            )}
          </AnimatedStepContent>
        </ScrollArea>

        {/* ── Footer ── */}
        <DialogFooter className="border-t px-6 py-4 sm:justify-between">
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

          <div className="flex items-center gap-2">
            {/* Step counter for mobile */}
            <span className="text-xs text-muted-foreground sm:hidden">
              {stepIndex + 1} / {STEPS.length}
            </span>
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
                loadingText={isEdit ? "Saving\u2026" : "Creating\u2026"}
                iconLeft={
                  isEdit ? (
                    <HugeiconsIcon icon={PencilEdit01Icon} />
                  ) : (
                    <HugeiconsIcon icon={UserAdd01Icon} />
                  )
                }
              >
                {isEdit ? "Save Changes" : "Add Student"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildInitialForm(student?: StudentDto | null) {
  return {
    first_name: student?.first_name ?? "",
    last_name: student?.last_name ?? "",
    middle_name: student?.middle_name ?? "",
    email: student?.email ?? "",
    phone_number: student?.phone_number ?? "",
    date_of_birth: student?.date_of_birth
      ? new Date(student.date_of_birth)
      : (undefined as Date | undefined),
    gender: student?.gender ?? "",
    place_of_birth: student?.place_of_birth ?? "",
    address: student?.address ?? "",
    city: student?.city ?? "",
    state: student?.state ?? "",
    postal_code: student?.postal_code ?? "",
    country: student?.country ?? "Liberia",
    entry_date: student?.entry_date
      ? new Date(student.entry_date)
      : (new Date() as Date | undefined),
    grade_level: student?.grade_level?.id ?? "",
    entry_as: student?.entry_as ?? "new",
    prev_id_number: student?.prev_id_number ?? "",
    enroll_student: false,
    section: "",
  };
}
