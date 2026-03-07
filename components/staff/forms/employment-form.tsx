"use client"

import { useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { useStaff } from "@/lib/api2/staff"
import type { StaffDto, UpdateStaffCommand } from "@/lib/api2/staff/types"
import PositionSelect from "@/components/shared/data-reusable/position-select"
import DepartmentSelect from "@/components/shared/data-reusable/department-select"
import { SelectField } from "@/components/ui/select-field"

const employmentSchema = z.object({
  hire_date: z.string().min(1, "Hire date is required"),
  status: z.enum(["active", "inactive", "suspended", "terminated", "on_leave", "retired"]),
  position: z.string().optional(),
  primary_department: z.string().optional(),
  manager: z.string().optional(),
  is_teacher: z.boolean().optional(),
})

type EmploymentFields = z.infer<typeof employmentSchema>

interface EmploymentFormProps {
  staff: StaffDto
  onSubmit: (values: Partial<UpdateStaffCommand>) => void
  onCancel: () => void
  isSubmitting?: boolean
}

const NONE_VALUE = "__none__"

export function EmploymentForm({
  staff,
  onSubmit,
  onCancel,
  isSubmitting,
}: EmploymentFormProps) {
  const staffApi = useStaff()
  const { data: positionsData } = staffApi.getPositions({})
  const { data: departmentsData } = staffApi.getDepartments({})
  const { data: staffListData } = staffApi.getStaff({ page_size: 1000 })

  const staffList = useMemo<StaffDto[]>(() => {
    if (!staffListData) return []
    if (Array.isArray(staffListData)) return staffListData as StaffDto[]
    if (Array.isArray((staffListData as { results?: StaffDto[] }).results)) return (staffListData as { results: StaffDto[] }).results
    return []
  }, [staffListData])

  // Filter out current staff and those with circular dependencies
  const availableManagers = useMemo(() => {
    return staffList.filter(s => s.id !== staff.id && s.status === 'active')
  }, [staffList, staff.id])

  const positionId = typeof staff.position === "object" ? staff.position?.id : undefined
  const departmentId = typeof staff.primary_department === "object" ? staff.primary_department?.id : undefined
  const managerId = typeof staff.manager === "object" ? staff.manager?.id : (typeof staff.manager === "string" ? staff.manager : undefined)

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EmploymentFields>({
    defaultValues: {
      hire_date: staff.hire_date ? staff.hire_date.split("T")[0] : "",
      status: (staff.status as EmploymentFields["status"]) || "active",
      position: positionId || NONE_VALUE,
      primary_department: departmentId || NONE_VALUE,
      manager: managerId || NONE_VALUE,
      is_teacher: !!staff.is_teacher,
    },
    resolver: zodResolver(employmentSchema),
  })

  const employmentStatusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
    { value: "terminated", label: "Terminated" },
    { value: "on_leave", label: "On Leave" },
    { value: "retired", label: "Retired" },
  ]

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit({
          hire_date: values.hire_date,
          status: values.status,
          position: values.position === NONE_VALUE ? null : values.position,
          primary_department: values.primary_department === NONE_VALUE ? null : values.primary_department,
          manager: values.manager === NONE_VALUE ? null : values.manager,
          is_teacher: values.is_teacher,
        })
      })}
      className="flex flex-col h-full"
    >
      <div className="flex-1 space-y-5 px-6 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="hire_date">
            Hire Date <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="hire_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value ? new Date(field.value + "T00:00:00") : undefined}
                onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                placeholder="Select hire date"
              />
            )}
          />
          {errors.hire_date && <p className="text-xs text-destructive">{errors.hire_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Employment Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                items={employmentStatusOptions}
                placeholder="Select status"
              />
            )}
          />
          {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <PositionSelect
                value={field.value || NONE_VALUE}
                onChange={(value: unknown) => {
                  const nextValue = typeof value === "string" ? value : NONE_VALUE
                  field.onChange(nextValue)
                }}
                placeholder="Select position"
                useUrlState={false}
                noTitle
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_department">Primary Department</Label>
          <Controller
            name="primary_department"
            control={control}
            render={({ field }) => (
              <DepartmentSelect
                value={field.value || NONE_VALUE}
                onChange={(value: unknown) => {
                  const nextValue = typeof value === "string" ? value : NONE_VALUE
                  field.onChange(nextValue)
                }}
                placeholder="Select department"
                useUrlState={false}
                noTitle
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager">Manager</Label>
          <Controller
            name="manager"
            control={control}
            render={({ field }) => (
              <SelectField
                value={field.value || NONE_VALUE}
                onValueChange={(value) => field.onChange(value)}
                items={[
                  { value: NONE_VALUE, label: "No Manager" },
                  ...availableManagers.map(s => ({
                    value: s.id,
                    label: `${(s as any).full_name || s.id_number} (${s.id_number})`
                  }))
                ]}
                placeholder="Select a manager"
              />
            )}
          />
          {errors.manager && <p className="text-xs text-destructive">{errors.manager.message}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            Select the staff member who manages this person.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-lg border p-3">
          <Controller
            name="is_teacher"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="mt-0.5"
              />
            )}
          />
          <div>
            <Label className="font-medium">Teaching Role</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Mark this staff member as a teacher to enable class, subject, and schedule assignments.
            </p>
          </div>
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
