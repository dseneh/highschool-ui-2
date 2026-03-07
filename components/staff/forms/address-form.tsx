"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { StaffDto, UpdateStaffCommand } from "@/lib/api2/staff/types"

const addressSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
})

type AddressFields = z.infer<typeof addressSchema>

interface AddressFormProps {
  staff: StaffDto
  onSubmit: (values: Partial<UpdateStaffCommand>) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function AddressForm({
  staff,
  onSubmit,
  onCancel,
  isSubmitting,
}: AddressFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<AddressFields>({
    defaultValues: {
      address: staff.address || "",
      city: staff.city || "",
      state: staff.state || "",
      postal_code: staff.postal_code || "",
      country: staff.country || "",
    },
    resolver: zodResolver(addressSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 space-y-5 p-6 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="country">
            Country <span className="text-destructive">*</span>
          </Label>
          <Controller name="country" control={control} render={({ field }) => <Input {...field} placeholder="Country" />} />
          {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">
            Address <span className="text-destructive">*</span>
          </Label>
          <Controller name="address" control={control} render={({ field }) => <Input {...field} placeholder="Street address" />} />
          {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-destructive">*</span>
          </Label>
          <Controller name="city" control={control} render={({ field }) => <Input {...field} placeholder="City" />} />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">
            State <span className="text-destructive">*</span>
          </Label>
          <Controller name="state" control={control} render={({ field }) => <Input {...field} placeholder="State / Province" />} />
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">
            Postal Code <span className="text-destructive">*</span>
          </Label>
          <Controller name="postal_code" control={control} render={({ field }) => <Input {...field} placeholder="Postal / ZIP code" />} />
          {errors.postal_code && <p className="text-xs text-destructive">{errors.postal_code.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 p-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isDirty} loading={isSubmitting} loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </form>
  )
}
