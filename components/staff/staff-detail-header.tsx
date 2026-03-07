"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Mail02Icon,
  SmartPhone01Icon,
  Location01Icon,
  Building02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { getStatusBadgeClass, getStatusDotClass } from "@/lib/status-colors"
import type { StaffDto } from "@/lib/api2/staff/types"
import moment from "moment"

interface StaffDetailHeaderProps {
  staff: StaffDto
}

export function StaffDetailHeader({
  staff,
}: StaffDetailHeaderProps) {
  const status = staff?.status

  // Calculate age from date_of_birth
  const getAge = (dob: string | null | undefined) => {
    if (!dob) return null
    return moment().diff(dob, 'years')
  }

  const age = getAge(staff.date_of_birth)

  // Format location
  const location = [staff.city, staff.state, staff.country]
    .filter(Boolean)
    .join(", ")

  // Get position
  const position = typeof staff.position === 'string' 
    ? staff.position 
    : staff.position?.title

  // Get department
  const department = typeof staff.primary_department === 'string'
    ? staff.primary_department
    : staff.primary_department?.name

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Main Header Content */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <Avatar className="size-18 sm:size-24 ring-4 ring-background shadow-lg shrink-0">
            {staff.photo ? (
              <AvatarImage src={staff.photo} alt={staff.full_name} />
            ) : null}
            <AvatarFallback className="text-2xl font-semibold">
              {staff.first_name?.[0]}{staff.last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name and ID */}
            <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between gap-2 sm:gap-4 mb-3">
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight mb-1">
                  {staff.full_name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  ID Number: <b>{staff.id_number}</b>
                </p>
              </div>
              {staff.is_teacher && (
                <Badge
                  variant="outline"
                  className="text-xs uppercase tracking-wider bg-background"
                >
                  Teaching Staff
                </Badge>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
              <Badge
                className={cn(
                  "gap-1.5 border-0 capitalize",
                  getStatusBadgeClass(status)
                )}
              >
                <span className={cn("size-1.5 rounded-full", getStatusDotClass(status))} />
                {status}
              </Badge>
              {position && (
                <Badge variant="secondary" className="font-medium">
                  {position}
                </Badge>
              )}
              {department && (
                <Badge variant="outline" className="gap-1.5">
                  <HugeiconsIcon icon={Building02Icon} className="size-3" />
                  {department}
                </Badge>
              )}
              {staff.gender && (
                <Badge variant="outline" className="capitalize">{staff.gender}</Badge>
              )}
            </div>

            {/* Contact Info Grid */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              {age !== null && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={Calendar03Icon} className="size-4 shrink-0" />
                  {age} year{age !== 1 ? "s" : ""} old
                </div>
              )}
              {staff.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={Mail02Icon} className="size-4 shrink-0" />
                  <a
                    href={`mailto:${staff.email}`}
                    className="hover:text-foreground truncate"
                  >
                    {staff.email}
                  </a>
                </div>
              )}
              {staff.phone_number && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={SmartPhone01Icon} className="size-4 shrink-0" />
                  <a
                    href={`tel:${staff.phone_number}`}
                    className="hover:text-foreground"
                  >
                    {staff.phone_number}
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
