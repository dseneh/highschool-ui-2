"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { Select } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import { useEnrollments } from "@/lib/api2/enrollment"
import type { StudentDto } from "@/lib/api2/student-types"
import { GradeLevelSelect, SectionSelect } from "../shared/data-reusable"

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const enrollmentSchema = z.object({
  grade_level: z.string().min(1, "Grade level is required"),
  enrolled_as: z.enum(["new", "returning", "transferred"], {
    required_error: "Please select enrollment type",
  }),
  section: z.string().optional(),
})

type EnrollmentFields = z.infer<typeof enrollmentSchema>

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EnrollmentFormRef {
  submitForm: () => void
  isSubmitting: boolean
}

interface EnrollmentFormProps {
  student: StudentDto
  currentYear: { id: string; name: string } | null | undefined
  onClose: () => void
}

/* ------------------------------------------------------------------ */
/*  Enrollment status options                                          */
/* ------------------------------------------------------------------ */

const enrollmentStatusOptions = [
  { label: "New Student", value: "new" },
  { label: "Returning Student", value: "returning" },
  { label: "Transferred Student", value: "transferred" },
] as const

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const EnrollmentForm = React.forwardRef<
  EnrollmentFormRef,
  EnrollmentFormProps
>(({ student, currentYear, onClose }, ref) => {
  const enrollmentApi = useEnrollments()
  const createMutation = enrollmentApi.createEnrollment(student.id)

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EnrollmentFields>({
    defaultValues: {
      grade_level: student.current_grade_level?.id || "",
      enrolled_as: (student.entry_as as "new" | "returning" | "transferred") || "new",
      section: "",
    },
    resolver: zodResolver(enrollmentSchema),
  })

  const selectedGradeLevelId = watch("grade_level")

  const onSubmit = async (values: EnrollmentFields) => {
    try {
      const isReEnroll = student.is_enrolled
      await createMutation.mutateAsync({
        academic_year: currentYear?.id || "",
        grade_level: values.grade_level,
        section: values.section || undefined,
        enrolled_as: values.enrolled_as,
        ...(isReEnroll && { re_enroll: true, force: true }),
      })
      toast.success(
        `${student.full_name} has been enrolled successfully`
      )
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  React.useImperativeHandle(ref, () => ({
    submitForm: () => handleSubmit(onSubmit)(),
    isSubmitting: createMutation.isPending,
  }))

  return (
    <div className="space-y-5 py-4">
      {/* Grade Level */}
      <div className="space-y-2">
        <Label>
          Grade Level <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="grade_level"
          control={control}
          render={({ field }) => (
            <GradeLevelSelect
              value={field.value}
              onChange={(val) => {
                field.onChange(val)
                setValue("section", "")
              }}
              useUrlState={false}
              noTitle
            />
          )}
        />
        {errors.grade_level && (
          <p className="text-xs text-destructive">{errors.grade_level.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          The grade level the student will be enrolled in.
        </p>
      </div>

      {/* Enrollment Status */}
      <div className="space-y-2">
        <Label>
          Enrollment Type <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="enrolled_as"
          control={control}
          render={({ field }) => (
            <Select.Root
              value={field.value}
              onValueChange={field.onChange}
              items={enrollmentStatusOptions.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            >
              <Select.Trigger
                className={cn(
                  "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.enrolled_as && "border-destructive"
                )}
              >
                <Select.Value placeholder="Select enrollment type" />
                <Select.Icon>
                  <ChevronDown className="size-4 opacity-50" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner sideOffset={4} className="z-[100]">
                  <Select.Popup className="min-w-(--anchor-width) rounded-md border bg-popover p-1 shadow-md">
                    {enrollmentStatusOptions.map((opt) => (
                      <Select.Item
                        key={opt.value}
                        value={opt.value}
                        className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent data-highlighted:bg-accent"
                      >
                        <Select.ItemIndicator className="absolute left-2 flex items-center">
                          <Check className="size-3.5" />
                        </Select.ItemIndicator>
                        <Select.ItemText>{opt.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          )}
        />
        {errors.enrolled_as && (
          <p className="text-xs text-destructive">{errors.enrolled_as.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Whether this is a new, returning, or transferred student enrollment.
        </p>
      </div>

      {/* Section */}
      <div className="space-y-2">
        <Label>Section</Label>
        <Controller
          name="section"
          control={control}
          render={({ field }) => (
            <SectionSelect
              value={field.value || ""}
              onChange={field.onChange}
              gradeLevelId={selectedGradeLevelId}
              useUrlState={false}
              noTitle
              placeholder="Select section (optional)"
              disabled={!selectedGradeLevelId}
            />
          )}
        />
        {errors.section && (
          <p className="text-xs text-destructive">{errors.section.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Optional — only required if the grade level has multiple sections.
        </p>
      </div>
    </div>
  )
})

EnrollmentForm.displayName = "EnrollmentForm"
