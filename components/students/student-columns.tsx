"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StudentDto } from "@/lib/api2/student-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getStatusBadgeClass } from "@/lib/status-colors"
import { AdvancedTableColumnHeader } from "@/components/shared/advanced-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {MoreHorizontalIcon, ViewIcon, BookOpen02Icon, Delete02Icon, Invoice01Icon, UserAdd01Icon, RepeatIcon, Calendar03Icon, Settings01Icon, CheckListIcon, Contact01Icon, UserGroup03Icon, Analytics01Icon, UserCheck01Icon} from '@hugeicons/core-free-icons';
import Link from "next/link"
import type { ConditionFilter } from "@/components/shared/advanced-table"
import { cn, getGradeTextColorClass } from "@/lib/utils"

interface StudentColumnsProps {
  onEnroll?: (student: StudentDto) => void
  onFixEnrollment?: (student: StudentDto) => void
  onReinstate?: (student: StudentDto) => void
  onDelete?: (student: StudentDto) => void
  user?: unknown
  gradeFilterOptions?: Array<{ label: string; value: string }>
  sectionFilterOptions?: Array<{ label: string; value: string }>
  returnToUrl?: string
}

function getBalance(student: StudentDto): number {
  if (typeof student.balance === "number" && Number.isFinite(student.balance)) {
    return Number(student.balance)
  }
  return Number(student.current_enrollment?.billing_summary?.balance || 0)
}

function getPaid(student: StudentDto): number {
  const paid = (student as StudentDto & { paid?: number | null }).paid
  if (typeof paid === "number" && Number.isFinite(paid)) {
    return Number(paid)
  }
  return Number(student.current_enrollment?.billing_summary?.paid || 0)
}

export function getStudentColumns({
  onEnroll,
  onFixEnrollment,
  onReinstate,
  onDelete,
  user,
  gradeFilterOptions = [],
  sectionFilterOptions = [],
  returnToUrl,
}: StudentColumnsProps = {}): ColumnDef<StudentDto>[] {
  const gradeLabelById = new Map(gradeFilterOptions.map((option) => [option.value, option.label]))
  const sectionLabelById = new Map(sectionFilterOptions.map((option) => [option.value, option.label]))

  return [
  {
    id: "select",
    header: ({ table }) => (
      <div className="px-1" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-1" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id_number",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="ID #" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.getValue("id_number") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Full Name" />
    ),
    cell: ({ row }) => {
      const student = row.original
      const displayName = student.full_name
      const initials = [student.first_name, student.last_name]
        .filter(Boolean)
        .map((n) => n[0])
        .join("")

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            {student.photo && (
              <AvatarImage src={student.photo} alt={displayName} />
            )}
            <AvatarFallback>{initials || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{displayName}</div>
            {/* {student.email && (
              <div className="text-xs text-muted-foreground">
                {student.email}
              </div>
            )} */}
          </div>
        </div>
      )
    },
  },
  {
    id: "grade_level",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Grade Level" />
    ),
    cell: ({ row }) => {
      const gradeLevel = row.original.current_grade_level
      if (!gradeLevel) return <span className="text-muted-foreground">—</span>
      return <Badge variant="secondary">{gradeLevel.name}</Badge>
    },
    filterFn: (row, id, value) => {
      if (!value || !Array.isArray(value) || value.length === 0) return true
      const gradeLevelId = row.original.current_grade_level?.id || ""
      return value.includes(gradeLevelId)
    },
    meta: {
      displayName: "Grade Level",
      filterType: "checkbox",
      filterOptions: gradeFilterOptions,
      formatter: (value: string) => gradeLabelById.get(String(value)) || String(value),
      filterSummaryMode: "count",
    } as any,
  },
  {
    id: "section",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Section" />
    ),
    cell: ({ row }) => {
      const enrollment = row.original.current_enrollment
      if (!enrollment?.section) return <span className="text-muted-foreground">-</span>
      return <span className="text-sm">{enrollment.section.name}</span>
    },
    filterFn: (row, id, value) => {
      if (!value || !Array.isArray(value) || value.length === 0) return true
      const sectionId = row.original.current_enrollment?.section?.id || ""
      return value.includes(sectionId)
    },
    meta: {
      displayName: "Section",
      filterType: "checkbox",
      filterOptions: sectionFilterOptions,
      formatter: (value: string) => sectionLabelById.get(String(value)) || String(value),
      filterSummaryMode: "count",
    } as any,
  },
  {
    id: "enrollment_status",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const student = row.original
      const terminalStatuses = ["withdrawn", "graduated", "dropped", "transferred", "expelled"]
      const isTerminal = terminalStatuses.includes(student.status?.toLowerCase())

      // Show enrollment-based status for non-terminal students (clearer than raw student.status)
      let displayStatus: string
      if (isTerminal) {
        displayStatus = student.status
      } else if (student.is_enrolled) {
        displayStatus = "enrolled"
      } else {
        displayStatus = "not enrolled"
      }

      const label = displayStatus
        .split(/[_\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")

      return (
        <Badge
          variant="secondary"
          className={getStatusBadgeClass(displayStatus)}
        >
          {label}
        </Badge>
      )
    },
    // Filtering is server-side; always pass rows through client-side
    filterFn: () => true,
    meta: {
      displayName: "Status",
      filterType: "checkbox",
      filterOptions: [
        { label: "All", value: "all" },
        { label: "Enrolled (this year)", value: "enrolled" },
        { label: "Not Enrolled (this year)", value: "not_enrolled" },
        { label: "Withdrawn", value: "withdrawn" },
        { label: "Graduated", value: "graduated" },
        { label: "Dropped", value: "dropped" },
      ],
    } as any,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => {
      const gender = (row.getValue("gender") as string | null) || ""
      if (!gender) return <span className="text-muted-foreground">—</span>
      return <span className="text-sm capitalize">{gender}</span>
    },
    filterFn: (row, id, value) => {
      if (!value || !Array.isArray(value) || value.length === 0) return true
      const gender = (row.getValue("gender") as string | null)?.toLowerCase() || "unknown"
      return value.includes(gender)
    },
    meta: {
      displayName: "Gender",
      filterType: "checkbox",
      filterOptions: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Unknown", value: "unknown" },
      ],
    } as any,
  },
  {
    accessorKey: "grade_average",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Grade Avg" className="justify-center" />
    ),
    cell: ({ row }) => {
      const rawValue = row.getValue("grade_average") as number | null | undefined
      if (rawValue === null || rawValue === undefined) {
        return <span className="text-muted-foreground flex justify-center">-</span>
      }

      const value = Number(rawValue)
      return <span className={cn("text-sm flex justify-center font-semibold", getGradeTextColorClass(value))}>{value.toFixed(1)}%</span>
    },
    meta: {
      displayName: "Grade Avg",
    } as any,
  },
  {
    accessorKey: "rank",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Rank" className="justify-center" />
    ),
    cell: ({ row }) => {
      const rawValue = row.getValue("rank") as number | null | undefined
      if (rawValue === null || rawValue === undefined) {
        return <span className="text-muted-foreground flex justify-center">-</span>
      }

      return <span className="text-sm font-medium flex justify-center items-center ">
        {rawValue}
        </span>
    },
    meta: {
      displayName: "Rank",
    } as any,
  },
  {
    id: "balance_owed",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Balance Owed" />
    ),
    cell: ({ row }) => {
      const hasBalance = getBalance(row.original) > 0
      return hasBalance ? <Badge variant="destructive">Yes</Badge> : <Badge variant="secondary">No</Badge>
    },
    filterFn: (row, id, value) => {
      if (!value) return true
      const hasBalance = getBalance(row.original) > 0
      return (value === "owed" && hasBalance) || (value === "clear" && !hasBalance)
    },
    meta: {
      displayName: "Balance Owed",
      filterType: "select",
      filterOptions: [
        { label: "Yes", value: "owed" },
        { label: "No", value: "clear" },
      ],
    } as any,
  },
  {
    id: "balance",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Balance" />
    ),
    cell: ({ row }) => {
      const balance = getBalance(row.original)
      if (balance === undefined || balance === null) {
        return <span className="text-muted-foreground">—</span>
      }
      const isOverdue = balance > 0 && !row.original.current_enrollment?.billing_summary?.payment_status?.is_on_time

      return (
        <span className={`text-sm font-medium ${isOverdue ? 'text-destructive' : balance === 0 ? 'text-green-600' : ''}`}>
          {(row.original.current_enrollment?.billing_summary?.currency || '$')}{balance.toLocaleString()}
        </span>
      )
    },
    filterFn: (row, id, value) => {
      const filter = value as ConditionFilter | undefined
      if (!filter || !filter.condition) return true

      const isPct = filter.condition.startsWith("pct-")
      const actualCondition = isPct ? filter.condition.slice(4) : filter.condition

      let amount: number
      if (isPct) {
        const balance = getBalance(row.original)
        const totalBill = Number(row.original.current_enrollment?.billing_summary?.total_bill || 0)
        amount = totalBill > 0 ? (balance / totalBill) * 100 : 0
      } else {
        amount = getBalance(row.original)
      }

      const minRaw = filter.value?.[0]
      const maxRaw = filter.value?.[1]
      const minValue = minRaw === "" || minRaw === undefined || minRaw === null ? null : Number(minRaw)
      const maxValue = maxRaw === "" || maxRaw === undefined || maxRaw === null ? null : Number(maxRaw)
      const hasMin = minValue !== null && Number.isFinite(minValue)
      const hasMax = maxValue !== null && Number.isFinite(maxValue)

      switch (actualCondition) {
        case "is-between":
          if (hasMin && hasMax) return amount >= (minValue as number) && amount <= (maxValue as number)
          if (hasMin) return amount >= (minValue as number)
          if (hasMax) return amount <= (maxValue as number)
          return true
        case "is-greater-than":
          return hasMin ? amount > (minValue as number) : true
        case "is-less-than":
          return hasMin ? amount < (minValue as number) : true
        case "is-equal-to":
          return hasMin ? amount === (minValue as number) : true
        default:
          return true
      }
    },
    meta: {
      displayName: "Balance",
      filterType: "number",
      filterConditions: [
        { label: "Is Between", value: "is-between" },
        { label: "Is Greater Than", value: "is-greater-than" },
        { label: "Is Less Than", value: "is-less-than" },
        { label: "Is Equal To", value: "is-equal-to" },
        { label: "% Is Between", value: "pct-is-between" },
        { label: "% Is Greater Than", value: "pct-is-greater-than" },
        { label: "% Is Less Than", value: "pct-is-less-than" },
        { label: "% Is Equal To", value: "pct-is-equal-to" },
      ],
      formatter: (amount: number | string) => {
        const value = Number(amount || 0)
        return value.toLocaleString()
      },
    } as any,
  },
  {
    id: "paid",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Paid" />
    ),
    cell: ({ row }) => {
      const paid = getPaid(row.original)
      if (paid === undefined || paid === null) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <span className={`text-sm font-medium ${paid > 0 ? "text-emerald-600" : ""}`}>
          {(row.original.current_enrollment?.billing_summary?.currency || '$')}{paid.toLocaleString()}
        </span>
      )
    },
    filterFn: (row, id, value) => {
      const filter = value as ConditionFilter | undefined
      if (!filter || !filter.condition) return true

      const isPct = filter.condition.startsWith("pct-")
      const actualCondition = isPct ? filter.condition.slice(4) : filter.condition

      let amount: number
      if (isPct) {
        const paid = getPaid(row.original)
        const totalBill = Number(row.original.current_enrollment?.billing_summary?.total_bill || 0)
        amount = totalBill > 0 ? (paid / totalBill) * 100 : 0
      } else {
        amount = getPaid(row.original)
      }

      const minRaw = filter.value?.[0]
      const maxRaw = filter.value?.[1]
      const minValue = minRaw === "" || minRaw === undefined || minRaw === null ? null : Number(minRaw)
      const maxValue = maxRaw === "" || maxRaw === undefined || maxRaw === null ? null : Number(maxRaw)
      const hasMin = minValue !== null && Number.isFinite(minValue)
      const hasMax = maxValue !== null && Number.isFinite(maxValue)

      switch (actualCondition) {
        case "is-between":
          if (hasMin && hasMax) return amount >= (minValue as number) && amount <= (maxValue as number)
          if (hasMin) return amount >= (minValue as number)
          if (hasMax) return amount <= (maxValue as number)
          return true
        case "is-greater-than":
          return hasMin ? amount > (minValue as number) : true
        case "is-less-than":
          return hasMin ? amount < (minValue as number) : true
        case "is-equal-to":
          return hasMin ? amount === (minValue as number) : true
        default:
          return true
      }
    },
    meta: {
      displayName: "Paid",
      filterType: "number",
      filterConditions: [
        { label: "Is Between", value: "is-between" },
        { label: "Is Greater Than", value: "is-greater-than" },
        { label: "Is Less Than", value: "is-less-than" },
        { label: "Is Equal To", value: "is-equal-to" },
        { label: "% Is Between", value: "pct-is-between" },
        { label: "% Is Greater Than", value: "pct-is-greater-than" },
        { label: "% Is Less Than", value: "pct-is-less-than" },
        { label: "% Is Equal To", value: "pct-is-equal-to" },
      ],
      formatter: (amount: number | string) => {
        const value = Number(amount || 0)
        return value.toLocaleString()
      },
    } as any,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original
      const isWithdrawn = student.status?.toLowerCase() === "withdrawn"

      const role = (user as { role?: string } | undefined)?.role || ""
      const canEnroll = ["admin", "registrar", "superadmin"].includes(role)
      const canDelete = ["admin", "superadmin"].includes(role)

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" icon={<HugeiconsIcon icon={MoreHorizontalIcon} />} aria-label="Open menu" />
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                {/* <DropdownMenuItem>
                  <Link href={`/students/${student.id_number}${returnToUrl ? `?returnTo=${encodeURIComponent(returnToUrl)}` : ''}`} className="flex items-center w-full">
                    <HugeiconsIcon icon={ViewIcon} className="mr-2 size-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator /> */}
                {studentActions.map((action) => {
                  if (action.requireEnrollment && !student.is_enrolled) return null
                  if (action.requireRole && !["admin", "registrar", "superadmin"].includes(role)) return null

                  return (
                    <div key={action.label}>
                    <DropdownMenuItem key={action.label}>
                      <Link href={`${action.href(student)}${returnToUrl ? `?returnTo=${encodeURIComponent(returnToUrl)}` : ''}`} className="flex items-center w-full">
                        <HugeiconsIcon icon={action.icon} className="mr-2 size-4" />
                        {action.label}
                      </Link>
                    </DropdownMenuItem>
                    {action?.hasDivider && <DropdownMenuSeparator />}
                    </div>
                  )
                })}
{/* 
                {student.is_enrolled && (
                  <DropdownMenuItem>
                    <Link href={`/students/${student.id_number}/attendance`} className="flex items-center w-full">
                      <HugeiconsIcon icon={CheckListIcon} className="mr-2 size-4" />
                      Attendance
                    </Link>
                  </DropdownMenuItem>
                )}
                {student.is_enrolled && (
                  <DropdownMenuItem>
                    <Link href={`/students/${student.id_number}/schedule`} className="flex items-center w-full">
                      <HugeiconsIcon icon={Calendar03Icon} className="mr-2 size-4" />
                      Schedule
                    </Link>
                  </DropdownMenuItem>
                )}

                {student.is_enrolled && (
                  <DropdownMenuItem>
                    <Link href={`/students/${student.id_number}/billing`} className="flex items-center w-full">
                      <HugeiconsIcon icon={Invoice01Icon} className="mr-2 size-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                )}
                {student.is_enrolled && (
                  <DropdownMenuItem>
                    <Link href={`/students/${student.id_number}/grades`} className="flex items-center w-full">
                      <HugeiconsIcon icon={BookOpen02Icon} className="mr-2 size-4" />
                      Grades
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem>
                  <Link href={`/students/${student.id_number}/contacts`} className="flex items-center w-full">
                    <HugeiconsIcon icon={Contact01Icon} className="mr-2 size-4" />
                    Contacts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/students/${student.id_number}/guardians`} className="flex items-center w-full">
                    <HugeiconsIcon icon={UserGroup03Icon} className="mr-2 size-4" />
                    Guardians
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/students/${student.id_number}/settings`} className="flex items-center w-full">
                    <HugeiconsIcon icon={Settings01Icon} className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem> */}

                {/* Enrollment management */}
                {canEnroll && (
                  <>
                    <DropdownMenuSeparator />
                    {isWithdrawn ? (
                      <DropdownMenuItem
                        className="text-green-600 focus:text-green-600"
                        onClick={() => onReinstate?.(student)}
                      >
                        <HugeiconsIcon icon={UserCheck01Icon} className="size-4" />
                        Reinstate Student
                      </DropdownMenuItem>
                    ) : !student.is_enrolled ? (
                      <DropdownMenuItem onClick={() => onEnroll?.(student)}>
                        <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
                        Enroll Student
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="text-orange-600 focus:text-orange-600"
                        onClick={() => onFixEnrollment?.(student)}
                      >
                        <HugeiconsIcon icon={RepeatIcon} className="size-4" />
                        Fix Enrollment
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {student.can_delete && canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete?.(student)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
}

const studentActions = [
  {
    label: "View Details",
    icon: ViewIcon,
    href: (student: StudentDto) => `/students/${student.id_number}`,
    requireEnrollment: true,
    requireRole: true,
    hasDivider: true,
  },
  {
    label: "Billing",
    icon: Invoice01Icon,
    href: (student: StudentDto) => `/students/${student.id_number}/billing`,
    requireEnrollment: true,
    requireRole: true,
  },
  {
    label: "Grades",
    icon: BookOpen02Icon,
    href: (student: StudentDto) => `/students/${student.id_number}/grades`,
    requireEnrollment: true,
    requireRole: true,
    hasDivider: true,
  },
  {
    label: "Attendance",
    icon: CheckListIcon,
    href: (student: StudentDto) => `/students/${student.id_number}/attendance`,
    requireEnrollment: true,
    requireRole: true,
  },
  {
    label: "Schedule",
    icon: Calendar03Icon,
    href: (student: StudentDto) => `/students/${student.id_number}/schedule`,
    requireEnrollment: true,
    requireRole: true,
    hasDivider: true,
  },
  {
    label: "Contacts",
    icon: Contact01Icon,
    href: (student: StudentDto) => `/students/${student.id_number}/contacts`,
    requireEnrollment: false,
    requireRole: true,
  },
  {
    label: "Guardians",
    icon: UserGroup03Icon,
    href: (student: StudentDto) => `/students/${student.id_number}/guardians`,
    requireEnrollment: false,
    requireRole: true,
  },
  // {
  //   label: "Settings",
  //   icon: Settings01Icon,
  //   href: (student: StudentDto) => `/students/${student.id_number}/settings`,
  //   requireEnrollment: false,
  //   requireRole: true,
  // },
]