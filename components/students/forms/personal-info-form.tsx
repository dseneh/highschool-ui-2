"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import type { StudentDto } from "@/lib/api/student-types"

const personalInfoSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female"], {
    required_error: "Please select a gender",
  }),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  place_of_birth: z.string().optional(),
})

type PersonalInfoFields = z.infer<typeof personalInfoSchema>

interface PersonalInfoFormProps {
  student: StudentDto
  onSubmit: (values: PersonalInfoFields) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function PersonalInfoForm({
  student,
  onSubmit,
  onCancel,
  isSubmitting,
}: PersonalInfoFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<PersonalInfoFields>({
    defaultValues: {
      first_name: student.first_name,
      middle_name: student.middle_name || "",
      last_name: student.last_name,
      gender: student.gender as "male" | "female",
      date_of_birth: student.date_of_birth
        ? student.date_of_birth.split("T")[0]
        : "",
      place_of_birth: student.place_of_birth || "",
    },
    resolver: zodResolver(personalInfoSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 space-y-5 p-6 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="first_name">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="First name" />
            )}
          />
          {errors.first_name && (
            <p className="text-xs text-destructive">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middle_name">Middle Name</Label>
          <Controller
            name="middle_name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Middle name" />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Last name" />
            )}
          />
          {errors.last_name && (
            <p className="text-xs text-destructive">{errors.last_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Gender <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => field.onChange("male")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    field.value === "male"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange("female")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    field.value === "female"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Female
                </button>
              </div>
            )}
          />
          {errors.gender && (
            <p className="text-xs text-destructive">{errors.gender.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">
            Date of Birth <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="date_of_birth"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value ? new Date(field.value + "T00:00:00") : undefined}
                onChange={(date) => {
                  field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                }}
                placeholder="Select date of birth"
                allowFutureDates={false}
              />
            )}
          />
          {errors.date_of_birth && (
            <p className="text-xs text-destructive">{errors.date_of_birth.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="place_of_birth">Place of Birth</Label>
          <Controller
            name="place_of_birth"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Place of birth" />
            )}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 p-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!isDirty} loading={isSubmitting} loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </form>
  )
}
