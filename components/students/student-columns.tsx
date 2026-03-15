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
import {MoreHorizontalIcon, ViewIcon, BookOpen02Icon, Delete02Icon, Invoice01Icon, UserAdd01Icon, RepeatIcon} from '@hugeicons/core-free-icons';
import Link from "next/link"
import type { ConditionFilter } from "@/components/shared/advanced-table"

interface StudentColumnsProps {
  onEnroll?: (student: StudentDto) => void
  onFixEnrollment?: (student: StudentDto) => void
  onDelete?: (student: StudentDto) => void
  user?: unknown
  gradeFilterOptions?: Array<{ label: string; value: string }>
  sectionFilterOptions?: Array<{ label: string; value: string }>
}

function getBalance(student: StudentDto): number {
  return Number(student.current_enrollment?.billing_summary?.balance || 0)
}

export function getStudentColumns({
  onEnroll,
  onFixEnrollment,
  onDelete,
  user,
  gradeFilterOptions = [],
  sectionFilterOptions = [],
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
      <AdvancedTableColumnHeader column={column} title="Student #" />
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
            {student.email && (
              <div className="text-sm text-muted-foreground">
                {student.email}
              </div>
            )}
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
      if (!enrollment?.section) return <span className="text-muted-foreground">—</span>
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
      const status = student.status
      const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"

      return (
        <Badge
          variant="secondary"
          className={getStatusBadgeClass(status)}
        >
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      if (!value || !Array.isArray(value) || value.length === 0) return true
      const status = row.original.status || ""
      return value.includes(status.toLowerCase())
    },
    meta: {
      displayName: "Status",
      filterType: "checkbox",
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Enrolled", value: "enrolled" },
        { label: "Not Enrolled", value: "not_enrolled" },
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

      const amount = getBalance(row.original)
      const minRaw = filter.value?.[0]
      const maxRaw = filter.value?.[1]
      const min = Number(minRaw || 0)
      const max = Number(maxRaw || 0)

      switch (filter.condition) {
        case "is-between":
          if (!Number.isFinite(min)) return true
          if (!Number.isFinite(max) || max === 0) return amount >= min
          return amount >= min && amount <= max
        case "is-greater-than":
          return amount > min
        case "is-less-than":
          return amount < min
        case "is-equal-to":
          return amount === min
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
      const menuItems = [
        {
          label: "View Details",
          icon: ViewIcon,
          href: `/students/${student.id_number}`,
        },
        {
          label: "Billing",
          icon: Invoice01Icon,
          href: `/students/${student.id_number}/billing`,
        },
        {
          label: "Grades",
          icon: BookOpen02Icon,
          href: `/students/${student.id_number}/grades`,
        },
      ]

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
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                {/* <DropdownMenuSeparator /> */}
                {!student.is_enrolled && canEnroll && (
                  <>
                    <DropdownMenuItem onClick={() => onEnroll?.(student)}>
                      <HugeiconsIcon icon={UserAdd01Icon} className=" size-4" />
                      Enroll Student
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.label}>
                    <Link href={item.href} className="flex items-center w-full">
                      <HugeiconsIcon icon={item.icon} className="mr-2 size-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {student.is_enrolled && canEnroll && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-orange-600 focus:text-orange-600"
                      onClick={() => onFixEnrollment?.(student)}
                    >
                      <HugeiconsIcon icon={RepeatIcon} className="size-4" />
                      Fix Enrollment
                    </DropdownMenuItem>
                  </>
                )}
                {student.can_delete && canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete?.(student)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className=" size-4" />
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
