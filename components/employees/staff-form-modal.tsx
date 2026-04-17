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
  UserIcon,
  Home01Icon,
  Building02Icon,
  Settings01Icon,
  CheckListIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { StaffFormSchema } from "@/components/employees/staff-form";
import { useEmployee } from "@/lib/api2/employee";
import type { EmployeeDepartment, EmployeePosition } from "@/lib/api2/employee/types";
import GenderSelect from "../shared/data-reusable/gender-select";
import PositionSelect from "../shared/data-reusable/position-select";
import DepartmentSelect from "../shared/data-reusable/department-select";
import { SelectField } from "../ui/select-field";

const STEPS = [
  {
    key: "personal",
    label: "Personal",
    description: "Identity details",
    icon: UserIcon,
  },
  {
    key: "address",
    label: "Address",
    description: "Home address",
    icon: Home01Icon,
  },
  {
    key: "employment",
    label: "Employment",
    description: "Job details",
    icon: Building02Icon,
  },
  {
    key: "account",
    label: "Account",
    description: "Login & photo",
    icon: Settings01Icon,
  },
  {
    key: "review",
    label: "Review",
    description: "Confirm & submit",
    icon: CheckListIcon,
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const personalSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  middle_name: z.string().optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  date_of_birth: z
    .date({ required_error: "Date of birth is required" })
    .refine(
      (date) => {
        const today = new Date();
        const birthDate = new Date(date);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        
        // Adjust age if birthday hasn't occurred yet this year
        const adjustedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) 
          ? age - 1 
          : age;
        
        return adjustedAge >= 16;
      },
      {
        message: "Staff member must be at least 16 years old",
      }
    ),
  gender: z.enum(["male", "female", "other"]).optional(),
  place_of_birth: z.string().optional(),
});

const addressSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

const employmentSchema = z.object({
  hire_date: z.date({ required_error: "Hire date is required" }),
  status: z.enum(["active", "inactive", "on_leave", "retired"]).optional(),
  position: z.string().optional(),
  primary_department: z.string().optional(),
  is_teacher: z.boolean().optional(),
});

const accountSchema = z
  .object({
    initialize_user_account: z.boolean().optional(),
    username: z.string().optional(),
    role: z.enum(["admin", "teacher", "viewer"]).optional(),
    photo: z.instanceof(File).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.initialize_user_account) {
        return !!data.role;
      }
      return true;
    },
    {
      message: "User role is required",
      path: ["role"],
    }
  );

const STEP_SCHEMAS: Record<StepKey, z.ZodSchema | null> = {
  personal: personalSchema,
  address: addressSchema,
  employment: employmentSchema,
  account: accountSchema,
  review: null,
};

interface StaffFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: StaffFormSchema) => Promise<void>;
  submitting?: boolean;
}

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

function buildInitialForm() {
  return {
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: undefined as Date | undefined,
    gender: "" as "" | "male" | "female" | "other",
    place_of_birth: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    hire_date: undefined as Date | undefined,
    status: "active" as "active" | "inactive" | "on_leave" | "retired",
    position: "",
    primary_department: "",
    is_teacher: false,
    initialize_user_account: false,
    username: "",
    role: undefined as "viewer" | "teacher" | "admin" | undefined,
    photo: null as File | null,
  };
}

export function StaffFormModal({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: StaffFormModalProps) {
  const employeeApi = useEmployee();
  const { data: positionsData } = employeeApi.getEmployeePositions({});
  const { data: departmentsData } = employeeApi.getEmployeeDepartments({});

  const [stepIndex, setStepIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<"forward" | "backward">(
    "forward"
  );
  const [animKey, setAnimKey] = React.useState(0);
  const [errors, setErrors] = React.useState<
    Record<string, string | undefined>
  >({});
  const currentStep = STEPS[stepIndex].key;

  const [form, setForm] = React.useState(buildInitialForm);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  const positions = React.useMemo<EmployeePosition[]>(() => {
    if (!positionsData) return [];
    if (Array.isArray(positionsData)) return positionsData as EmployeePosition[];
    if (Array.isArray((positionsData as any).results)) return (positionsData as any).results as EmployeePosition[];
    return [];
  }, [positionsData]);

  const departmentOptions = React.useMemo<EmployeeDepartment[]>(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData as EmployeeDepartment[];
    if (Array.isArray((departmentsData as any).results)) return (departmentsData as any).results as EmployeeDepartment[];
    return [];
  }, [departmentsData]);

  const positionLabelMap = React.useMemo(() => {
    return new Map(
      positions.map((position) => [
        position.id,
        position.title || position.department?.name || "",
      ])
    );
  }, [positions]);

  const departmentLabelMap = React.useMemo(() => {
    return new Map(
      departmentOptions.map((department) => [department.id, department.name])
    );
  }, [departmentOptions]);

  React.useEffect(() => {
    if (open) {
      setStepIndex(0);
      setDirection("forward");
      setAnimKey(0);
      setErrors({});
      setForm(buildInitialForm());
      setPhotoPreview(null);
    }
  }, [open]);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
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

  function fmtDateISO(d?: Date | null): string {
    if (!d) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function fmtDate(d?: Date | null) {
    if (!d) return null;
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function handleSubmit() {
    const payload: StaffFormSchema = {
      first_name: form.first_name,
      last_name: form.last_name,
      middle_name: form.middle_name,
      email: form.email,
      phone_number: form.phone_number,
      gender: form.gender || undefined,
      date_of_birth: fmtDateISO(form.date_of_birth),
      place_of_birth: form.place_of_birth,
      address: form.address,
      city: form.city,
      state: form.state,
      postal_code: form.postal_code,
      country: form.country,
      hire_date: fmtDateISO(form.hire_date),
      status: form.status,
      position: form.position || undefined,
      primary_department: form.department || undefined,
      is_teacher: form.is_teacher,
      photo: form.photo || undefined,
      initialize_user_account: form.initialize_user_account,
      username: form.initialize_user_account ? form.username : "",
      role: form.initialize_user_account ? form.role : undefined,
    };

    await onSubmit(payload);
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    update("photo", file);
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[90vh] max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-180"
        showCloseButton
      >
        <div className="border-b px-6 pt-5 pb-4 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Add New Staff Member</DialogTitle>
            <DialogDescription className="text-sm">
              Fill in the staff member&#39;s information to create their profile.
            </DialogDescription>
          </DialogHeader>
          <StepIndicator steps={STEPS} currentIndex={stepIndex} />
        </div>

        <ScrollArea className="min-h-0 flex-1 h-0">
          <AnimatedStepContent animKey={animKey} direction={direction}>
            {currentStep === "personal" && (
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <SectionHeader
                  title="Identity"
                  description="Staff member details and contact information."
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
                <FormField name="middle_name" label="Middle Name" errors={errors}>
                  <Input
                    value={form.middle_name}
                    onChange={(e) => update("middle_name", e.target.value)}
                    placeholder="Michael"
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

                <div className="sm:col-span-2 mt-2 mb-1">
                  <div className="h-px bg-border" />
                </div>

                <SectionHeader
                  title="Personal Details"
                  description="Optional demographic information."
                />
                <FormField name="gender" label="Gender" errors={errors}>
                  <SelectField 
                    value={form.gender}
                    onValueChange={(v: any) => update("gender", v)}
                    items={genderOptions}
                  />
                </FormField>

                <div className="sm:col-span-2 mt-2 mb-1">
                  <div className="h-px bg-border" />
                </div>

                <SectionHeader
                  title="Contact & Birth"
                  description="How to reach the staff member and birth details."
                />
                <FormField name="email" label="Email" errors={errors}>
                  <Input
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="john@school.com"
                    aria-invalid={!!errors.email}
                  />
                </FormField>
                <FormField name="phone_number" label="Phone Number" errors={errors}>
                  <Input
                    value={form.phone_number}
                    onChange={(e) => update("phone_number", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </FormField>
                <FormField name="date_of_birth" label="Date of Birth" errors={errors}>
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
                    placeholder="City/Country"
                  />
                </FormField>
              </div>
            )}

            {currentStep === "address" && (
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <SectionHeader
                  title="Home Address"
                  description="Where the staff member currently resides."
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
                <FormField name="state" label="State / County" errors={errors}>
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

            {currentStep === "employment" && (
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <SectionHeader
                  title="Employment Details"
                  description="Position and employment information."
                />
                <FormField
                  name="hire_date"
                  label="Hire Date"
                  required
                  errors={errors}
                >
                  <DatePicker
                    value={form.hire_date}
                    onChange={(date) => update("hire_date", date)}
                    placeholder="Select hire date"
                    allowFutureDates={false}
                  />
                </FormField>
                <FormField
                  name="status"
                  label="Employment Status"
                  errors={errors}
                >
                  <Select
                    value={form.status}
                    onValueChange={(v) => update("status", v!)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField name="position" label="Position" errors={errors}>
                  <PositionSelect
                    noTitle
                    value={form.position}
                    onChange={(value) => update("position", value || "")}
                    useUrlState={false}
                  />
                </FormField>
                <FormField
                  name="primary_department"
                  label="Department"
                  errors={errors}
                >
                  <DepartmentSelect
                    noTitle
                    value={form.department}
                    onChange={(value) => update("primary_department", value || "")}
                    useUrlState={false}
                  />
                </FormField>
                <FormField
                  name="is_teacher"
                  label="Teacher Role"
                  errors={errors}
                  className="sm:col-span-2"
                >
                  <div
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                      form.is_teacher
                        ? "border-primary/30 bg-primary/5"
                        : "bg-muted/30"
                    )}
                  >
                    <Checkbox
                      id="is_teacher"
                      checked={form.is_teacher}
                      onCheckedChange={(checked) =>
                        update("is_teacher", checked === true)
                      }
                      className="mt-0.5"
                    />
                    <div className="grid gap-1 leading-none">
                      <label
                        htmlFor="is_teacher"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        This staff member teaches classes
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Enables teacher-specific scheduling and assignments.
                      </p>
                    </div>
                  </div>
                </FormField>
              </div>
            )}

            {currentStep === "account" && (
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <SectionHeader
                  title="Account & Access"
                  description="Create a user account and upload a photo."
                />

                <div className="sm:col-span-2">
                  <div
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                      form.initialize_user_account
                        ? "border-primary/30 bg-primary/5"
                        : "bg-muted/30"
                    )}
                  >
                    <Checkbox
                      id="initialize_user_account"
                      checked={form.initialize_user_account}
                      onCheckedChange={(checked) =>
                        update("initialize_user_account", checked === true)
                      }
                      className="mt-0.5"
                    />
                    <div className="grid gap-1 leading-none">
                      <label
                        htmlFor="initialize_user_account"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Create user account for this staff member
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Generates login access using the staff ID number.
                      </p>
                    </div>
                  </div>
                </div>

                {form.initialize_user_account && (
                  <>
                    <FormField
                      name="username"
                      label="Username"
                      errors={errors}
                    >
                      <Input
                        value={form.username}
                        onChange={(e) => update("username", e.target.value)}
                        placeholder="john.doe"
                      />
                    </FormField>
                    <FormField
                      name="role"
                      label="User Role"
                      required
                      errors={errors}
                    >
                      <Select
                        value={form.role}
                        onValueChange={(v) => update("role", v!)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </>
                )}

                <div className="sm:col-span-2 mt-2 mb-1">
                  <div className="h-px bg-border" />
                </div>

                <SectionHeader
                  title="Profile Photo"
                  description="Upload a staff photo (optional)."
                />
                <div className="sm:col-span-2 flex items-start gap-4">
                  {photoPreview && (
                    <div className="flex flex-col gap-2">
                      <Image
                        src={photoPreview}
                        alt="Staff photo preview"
                        className="h-20 w-20 rounded-lg object-cover"
                        width={80}
                        height={80}
                        unoptimized
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          update("photo", null);
                          setPhotoPreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <FormField name="photo" label="Upload Photo" errors={errors}>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}

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
                  <ReviewRow label="Place of Birth" value={form.place_of_birth} />
                </ReviewSection>

                <ReviewSection title="Address" icon={Home01Icon}>
                  <ReviewRow label="Street" value={form.address} />
                  <ReviewRow label="City" value={form.city} />
                  <ReviewRow label="State" value={form.state} />
                  <ReviewRow label="Postal Code" value={form.postal_code} />
                  <ReviewRow label="Country" value={form.country} />
                </ReviewSection>

                <ReviewSection title="Employment Details" icon={Building02Icon}>
                  <ReviewRow label="Hire Date" value={fmtDate(form.hire_date)} />
                  <ReviewRow label="Status" value={form.status} />
                  <ReviewRow
                    label="Position"
                    value={
                      positionLabelMap.get(form.position) ||
                      form.position ||
                      "--"
                    }
                  />
                  <ReviewRow
                    label="Department"
                    value={
                      departmentLabelMap.get(form.department) ||
                      form.department ||
                      "--"
                    }
                  />
                  <ReviewRow
                    label="Teacher"
                    value={form.is_teacher ? "Yes" : "No"}
                  />
                </ReviewSection>

                <ReviewSection title="Account & Access" icon={Settings01Icon}>
                  <ReviewRow
                    label="User Account"
                    value={form.initialize_user_account ? "Yes" : "No"}
                  />
                  {form.initialize_user_account && (
                    <>
                      <ReviewRow label="Username" value={form.username} />
                      <ReviewRow
                        label="Role"
                        value={
                          form.role
                            ? form.role.charAt(0).toUpperCase() +
                              form.role.slice(1)
                            : null
                        }
                      />
                    </>
                  )}
                </ReviewSection>
              </div>
            )}
          </AnimatedStepContent>
        </ScrollArea>

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
                loadingText="Creating..."
                iconLeft={<HugeiconsIcon icon={UserAdd01Icon} />}
              >
                Add Staff
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
