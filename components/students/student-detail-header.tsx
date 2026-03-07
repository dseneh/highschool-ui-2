"use client"

import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Mail02Icon,
  SmartPhone01Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { getStatusBadgeClass, getStatusDotClass } from "@/lib/status-colors"
import type { StudentDto } from "@/lib/api/student-types"
import moment from "moment"
import AvatarImg from "../shared/avatar-img"

interface StudentDetailHeaderProps {
  student: StudentDto
}

export function StudentDetailHeader({
  student,
}: StudentDetailHeaderProps) {
  const enrollmentStatus = student?.status
  const gradeLevel = student?.current_enrollment?.grade_level?.name || student?.grade_level
  const section = student?.current_enrollment?.section?.name

  // Calculate age from date_of_birth
  const getAge = (dob: string | null) => {
    return moment().diff(dob, 'years')
  }

  const age = getAge(student.date_of_birth)

  // Format location
  const location = [student.city, student.state, student.country]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="rounded-xl border bg-card overflow-hidden">

      {/* Main Header Content */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
          <AvatarImg
            src={student.photo}
            alt={student.full_name}
            className="size-18 sm:size-24 ring-4 ring-background shadow-lg shrink-0"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name and ID */}
            <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between gap-2 sm:gap-4 mb-3">
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight mb-1">
                  {student.full_name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  ID Number: <b>{student.id_number}</b>
                </p>
              </div>
              {student.entry_as && (
                <Badge
                  variant="outline"
                  className="text-xs uppercase tracking-wider bg-background"
                >
                  {student.entry_as}
                </Badge>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
              <Badge
                className={cn(
                  "gap-1.5 border-0 capitalize",
                  getStatusBadgeClass(enrollmentStatus)
                )}
              >
                <span className={cn("size-1.5 rounded-full", getStatusDotClass(enrollmentStatus))} />
                {enrollmentStatus}
              </Badge>
              {gradeLevel && (
                <Badge variant="secondary" className="font-medium">
                  {gradeLevel} - {section}
                </Badge>
              )}
              {/* {section && (
                <Badge variant="outline">{section}</Badge>
              )} */}
              {student.gender && (
                <Badge variant="outline" className="capitalize">{student.gender}</Badge>
              )}
            </div>

            {/* Contact Info Grid */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              {age !== null && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={Calendar03Icon} className="size-4 shrink-0" />
                  {age} year{age > 1 ? "s" : ""} old
                </div>
              )}
              {student.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={Mail02Icon} className="size-4 shrink-0" />
                  <a
                    href={`mailto:${student.email}`}
                    className="hover:text-foreground truncate"
                  >
                    {student.email}
                  </a>
                </div>
              )}
              {student.phone_number && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={SmartPhone01Icon} className="size-4 shrink-0" />
                  <a
                    href={`tel:${student.phone_number}`}
                    className="hover:text-foreground"
                  >
                    {student.phone_number}
                  </a>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2 text-muted-foreground md:col-span-2 lg:col-span-3">
                  <HugeiconsIcon icon={Location01Icon} className="size-4 shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
