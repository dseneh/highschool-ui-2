"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { StudentDto } from "@/lib/api2/student-types"

const contactSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .or(z.literal(""))
    .optional(),
  phone_number: z.string().min(1, "Phone number is required"),
})

type ContactFields = z.infer<typeof contactSchema>

interface ContactFormProps {
  student: StudentDto
  onSubmit: (values: ContactFields) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ContactForm({
  student,
  onSubmit,
  onCancel,
  isSubmitting,
}: ContactFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ContactFields>({
    defaultValues: {
      email: student.email || "",
      phone_number: student.phone_number || "",
    },
    resolver: zodResolver(contactSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 space-y-5 p-6 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="phone_number">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <Input {...field} type="tel" placeholder="Phone number" />
            )}
          />
          {errors.phone_number && (
            <p className="text-xs text-destructive">
              {errors.phone_number.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input {...field} type="email" placeholder="Email address" />
            )}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
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
