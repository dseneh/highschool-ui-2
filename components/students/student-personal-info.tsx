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
  SmartPhone01Icon,
  Location01Icon,
  MortarboardIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons"
import { showToast } from "@/lib/toast"
import { cn, getErrorMessage } from "@/lib/utils"
import { getStatusBadgeClass } from "@/lib/status-colors"
import { useStudents as useStudentsApi } from "@/lib/api2/student"
import { PersonalInfoForm } from "./forms/personal-info-form"
import { AddressForm } from "./forms/address-form"
import { ContactForm } from "./forms/contact-form"
import type { StudentDto } from "@/lib/api/student-types"
import type { UpdateStudentCommand } from "@/lib/api/student-types"
import { Pencil } from "lucide-react"
import { getQueryClient } from "@/lib/query-client"
import moment from "moment"
import { AuthButton } from "../auth/auth-button"

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
            <AuthButton
              roles={["registrar"]}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground -mr-2"
              onClick={onEdit}
              icon={ <Pencil className="size-3.5" />}
            >
             
              Edit
            </AuthButton>
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

type EditSection = "personal" | "address" | "contact" | null

const sectionConfig: Record<Exclude<EditSection, null>, { title: string; description: string }> = {
  personal: {
    title: "Edit Personal Information",
    description: "Update the student's personal details",
  },
  address: {
    title: "Edit Address",
    description: "Update the student's address information",
  },
  contact: {
    title: "Edit Contact Information",
    description: "Update the student's contact details",
  },
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface StudentPersonalInfoProps {
  student: StudentDto
}

export function StudentPersonalInfo({ student }: StudentPersonalInfoProps) {
  const [editSection, setEditSection] = React.useState<EditSection>(null)
  const studentsApi = useStudentsApi()
  const updateMutation = studentsApi.updateStudent(student.id)

  const queryClient = getQueryClient()

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return null
    return moment(iso).format("MMMM DD, YYYY")
  }

  const handleUpdate = async (values: Partial<UpdateStudentCommand>) => {
    try {
      await updateMutation.mutateAsync({
        first_name: student.first_name,
        last_name: student.last_name,
        date_of_birth: student.date_of_birth,
        gender: student.gender as "male" | "female",
        ...values,
      })
      queryClient.invalidateQueries({
        queryKey: ["students", student.id_number],
      })
      showToast.success("Student updated", "Changes have been saved")
      setEditSection(null)
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error))
    }
  }

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
          <DetailRow label="First Name" value={student.first_name} />
          <DetailRow label="Middle Name" value={student.middle_name} />
          <DetailRow label="Last Name" value={student.last_name} />
          <DetailRow label="Date of Birth" value={moment(student.date_of_birth).format("MMMM Do, YYYY")} />
          <DetailRow label="Place of Birth" value={student.place_of_birth} />
          <DetailRow
            label="Gender"
            value={student.gender ? (
              <Badge variant="secondary" className="capitalize text-xs font-medium">
                {student.gender}
              </Badge>
            ) : null}
          />
        </SectionCard>

        {/* Contact Information */}
        <SectionCard
          title="Contact Information"
          icon={<HugeiconsIcon icon={SmartPhone01Icon} className="size-4" />}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          onEdit={() => setEditSection("contact")}
        >
          <DetailRow
            label="Email Address"
            value={student.email ? (
              <a href={`mailto:${student.email}`} className="text-primary hover:underline">
                {student.email}
              </a>
            ) : null}
          />
          <DetailRow
            label="Phone Number"
            value={student.phone_number ? (
              <a href={`tel:${student.phone_number}`} className="hover:underline">
                {student.phone_number}
              </a>
            ) : null}
          />
        </SectionCard>

        {/* Address Information */}
        <SectionCard
          title="Address"
          icon={<HugeiconsIcon icon={Location01Icon} className="size-4" />}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          onEdit={() => setEditSection("address")}
        >
          <DetailRow label="Address" value={student.address} />
          <DetailRow label="City" value={student.city} />
          <DetailRow label="State" value={student.state} />
          <DetailRow label="Postal Code" value={student.postal_code} />
          <DetailRow label="Country" value={student.country} />
        </SectionCard>

        {/* Academic Details (read-only) */}
        <SectionCard
          title="Academic Information"
          icon={<HugeiconsIcon icon={MortarboardIcon} className="size-4" />}
          iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        >
          <DetailRow label="Student ID" value={
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{student.id_number}</span>
          } />
          <DetailRow label="Current Status" value={
            <Badge
              variant="secondary"
              className={cn(
                "capitalize text-xs font-medium",
                getStatusBadgeClass(student.status)
              )}
            >
              {student.status}
            </Badge>
          } />
          <DetailRow label="Entry Date" value={formatDate(student.entry_date)} />
          <DetailRow label="Enrolled As" value={
            student.entry_as ? (
              <Badge variant="outline" className="capitalize text-xs">{student.entry_as}</Badge>
            ) : null
          } />
          <DetailRow label="Expected Graduation" value={formatDate(student.date_of_graduation)} />
          <DetailRow label="Previous ID" value={student.prev_id_number} />
        </SectionCard>

        {/* Current Enrollment (read-only) */}
        {student.current_enrollment && (
          <SectionCard
            title="Current Enrollment"
            icon={<HugeiconsIcon icon={Calendar03Icon} className="size-4" />}
            iconClassName="bg-rose-500/10 text-rose-600 dark:text-rose-400"
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div className="divide-y divide-border/50">
                <DetailRow
                  label="Academic Year"
                  value={student.current_enrollment.academic_year.name}
                />
                <DetailRow
                  label="Grade Level"
                  value={
                    <Badge variant="secondary" className="text-xs font-medium">
                      {student.current_enrollment.grade_level.name}
                    </Badge>
                  }
                />
                <DetailRow
                  label="Section"
                  value={student.current_enrollment.section.name}
                />
              </div>
              <div className="divide-y divide-border/50">
                <DetailRow
                  label="Enrolled As"
                  value={
                    <Badge variant="outline" className="capitalize text-xs">
                      {student.current_enrollment.enrolled_as}
                    </Badge>
                  }
                />
                <DetailRow
                  label="Date Enrolled"
                  value={formatDate(student.current_enrollment.date_enrolled)}
                />
                <DetailRow
                  label="Year Period"
                  value={`${formatDate(student.current_enrollment.academic_year.start_date)} – ${formatDate(student.current_enrollment.academic_year.end_date)}`}
                />
              </div>
            </div>
          </SectionCard>
        )}
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
                  student={student}
                  onSubmit={(values) => handleUpdate(values)}
                  onCancel={() => setEditSection(null)}
                  isSubmitting={updateMutation.isPending}
                />
              )}

              {editSection === "address" && (
                <AddressForm
                  student={student}
                  onSubmit={(values) => handleUpdate(values)}
                  onCancel={() => setEditSection(null)}
                  isSubmitting={updateMutation.isPending}
                />
              )}

              {editSection === "contact" && (
                <ContactForm
                  student={student}
                  onSubmit={(values) => handleUpdate(values)}
                  onCancel={() => setEditSection(null)}
                  isSubmitting={updateMutation.isPending}
                />
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
