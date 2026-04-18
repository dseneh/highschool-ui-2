"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  Call02Icon,
  MapPinIcon,
  Building02Icon,
} from "@hugeicons/core-free-icons"
import { showToast } from "@/lib/toast"
import { cn, getErrorMessage } from "@/lib/utils"
import { useStaff } from "@/lib/api2/staff"
import type { StaffDto, UpdateStaffCommand } from "@/lib/api2/staff/types"
import { Pencil } from "lucide-react"
import { getQueryClient } from "@/lib/query-client"
import { format } from "date-fns"
import { PersonalInfoForm } from "./forms/personal-info-form"
import { ContactForm } from "./forms/contact-form"
import { AddressForm } from "./forms/address-form"
import { EmploymentForm } from "./forms/employment-form"

/* ------------------------------------------------------------------ */
/*  Detail row                                                         */
/* ------------------------------------------------------------------ */

interface DetailRowProps {
  label: string
  value: string | null | undefined | React.ReactNode
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-right">{value || <span className="text-muted-foreground/50">—</span>}</dd>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section Card                                                       */
/* ------------------------------------------------------------------ */

interface SectionCardProps {
  title: string
  icon: React.ReactNode
  iconClassName?: string
  onEdit?: () => void
  children: React.ReactNode
  className?: string
}

function SectionCard({ title, icon, iconClassName, onEdit, children, className }: SectionCardProps) {
  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center justify-center size-8 rounded-lg", iconClassName || "bg-primary/10 text-primary")}>
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
        {onEdit && (
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground -mr-2"
              onClick={onEdit}
              icon={<Pencil className="size-3.5" />}
            >
              Edit
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border/50">{children}</dl>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Edit drawer types                                                  */
/* ------------------------------------------------------------------ */

type EditSection = "personal" | "contact" | "address" | "employment" | null

const sectionConfig: Record<Exclude<EditSection, null>, { title: string; description: string }> = {
  personal: {
    title: "Edit Personal Information",
    description: "Update the staff member's personal details",
  },
  contact: {
    title: "Edit Contact Information",
    description: "Update the staff member's contact details",
  },
  address: {
    title: "Edit Address",
    description: "Update the staff member's address information",
  },
  employment: {
    title: "Edit Employment Details",
    description: "Update the staff member's employment information",
  },
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface StaffPersonalInfoProps {
  staff: StaffDto
  entityLabel?: string
}

export function StaffPersonalInfo({ staff, entityLabel = "Staff" }: StaffPersonalInfoProps) {
  const [editSection, setEditSection] = React.useState<EditSection>(null)
  const staffApi = useStaff()
  const patchMutation = staffApi.updateStaff(staff.id)

  const queryClient = getQueryClient()

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return null
    return format(new Date(iso), "MMMM d, yyyy")
  }

  const handleUpdate = async (values: Partial<UpdateStaffCommand>) => {
    try {
      await patchMutation.mutateAsync(values)
      queryClient.invalidateQueries({
        queryKey: ["staff", staff.id_number],
      })
      showToast.success(`${entityLabel} updated`, "Changes have been saved")
      setEditSection(null)
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error))
    }
  }

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    active: { label: "Active", variant: "default" },
    inactive: { label: "Inactive", variant: "secondary" },
    suspended: { label: "Suspended", variant: "destructive" },
    on_leave: { label: "On Leave", variant: "outline" },
    retired: { label: "Retired", variant: "destructive" },
    terminated: { label: "Terminated", variant: "destructive" },
  }

  const managerDisplay =
    typeof staff.manager === "string"
      ? staff.manager
      : staff.manager?.full_name || staff.manager?.id_number

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <SectionCard
          title="Personal Information"
          icon={<HugeiconsIcon icon={UserIcon} className="size-4" />}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          onEdit={() => setEditSection("personal")}
        >
          <DetailRow label="First Name" value={staff.first_name} />
          <DetailRow label="Middle Name" value={staff.middle_name} />
          <DetailRow label="Last Name" value={staff.last_name} />
          <DetailRow label="Date of Birth" value={formatDate(staff.date_of_birth)} />
          <DetailRow label="Place of Birth" value={staff.place_of_birth} />
          <DetailRow
            label="Gender"
            value={staff.gender ? (
              <Badge variant="secondary" className="capitalize text-xs font-medium">
                {staff.gender}
              </Badge>
            ) : null}
          />
        </SectionCard>

        {/* Contact Information */}
        <SectionCard
          title="Contact Information"
          icon={<HugeiconsIcon icon={Call02Icon} className="size-4" />}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          onEdit={() => setEditSection("contact")}
        >
          <DetailRow
            label="Email Address"
            value={staff.email ? (
              <a href={`mailto:${staff.email}`} className="text-primary hover:underline">
                {staff.email}
              </a>
            ) : null}
          />
          <DetailRow
            label="Phone Number"
            value={staff.phone_number ? (
              <a href={`tel:${staff.phone_number}`} className="hover:underline">
                {staff.phone_number}
              </a>
            ) : null}
          />
        </SectionCard>

        {/* Address Information */}
        <SectionCard
          title="Address"
          icon={<HugeiconsIcon icon={MapPinIcon} className="size-4" />}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          onEdit={() => setEditSection("address")}
        >
          <DetailRow label="Address" value={staff.address} />
          <DetailRow label="City" value={staff.city} />
          <DetailRow label="State" value={staff.state} />
          <DetailRow label="Postal Code" value={staff.postal_code} />
          <DetailRow label="Country" value={staff.country} />
        </SectionCard>

        {/* Employment Details */}
        <SectionCard
          title="Employment Information"
          icon={<HugeiconsIcon icon={Building02Icon} className="size-4" />}
          iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          onEdit={() => setEditSection("employment")}
        >
          <DetailRow
            label={entityLabel === "Employee" ? "Employee ID" : "Staff ID"}
            value={
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{staff.id_number}</span>
            }
          />
          <DetailRow
            label="Position"
            value={typeof staff.position === 'string' ? staff.position : staff.position?.title}
          />
          <DetailRow
            label="Department"
            value={
              staff.primary_department
                ? typeof staff.primary_department === "string"
                  ? staff.primary_department
                  : staff.primary_department.name
                : undefined
            }
          />
          <DetailRow
            label="Status"
            value={
              <Badge variant={statusConfig[staff.status]?.variant || "outline"}>
                {statusConfig[staff.status]?.label || staff.status}
              </Badge>
            }
          />
          <DetailRow label="Hire Date" value={formatDate(staff.hire_date)} />
          <DetailRow label="Manager" value={managerDisplay} />
          <DetailRow
            label="Role"
            value={staff.is_teacher ? <Badge variant="secondary">Teacher</Badge> : entityLabel}
          />
        </SectionCard>
      </div>

      {/* Edit Drawer */}
      <Sheet open={editSection !== null} onOpenChange={(open) => !open && setEditSection(null)}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0">
          {editSection && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
                <SheetTitle>{sectionConfig[editSection].title}</SheetTitle>
                <SheetDescription>
                  {sectionConfig[editSection].description}
                </SheetDescription>
              </SheetHeader>

              {editSection === "personal" && (
                <PersonalInfoForm
                  staff={staff}
                  onSubmit={(values) => handleUpdate(values)}
                  onCancel={() => setEditSection(null)}
                  isSubmitting={patchMutation.isPending}
                />
              )}

              {editSection === "contact" && (
                <ContactForm
                  staff={staff}
                  onSubmit={(values) => handleUpdate(values)}
                  onCancel={() => setEditSection(null)}
                  isSubmitting={patchMutation.isPending}
                />
              )}

              {editSection === "address" && (
                <AddressForm
                  staff={staff}
                  onSubmit={(values) => handleUpdate(values)}
                  onCancel={() => setEditSection(null)}
                  isSubmitting={patchMutation.isPending}
                />
              )}

              {editSection === "employment" && (
                <EmploymentForm
                  staff={staff}
                  onSubmit={(values) => handleUpdate(values)}
                  onCancel={() => setEditSection(null)}
                  isSubmitting={patchMutation.isPending}
                />
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
