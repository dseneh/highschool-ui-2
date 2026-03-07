"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StudentDto } from "@/lib/api2/student-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getStatusBadgeClass } from "@/lib/status-colors"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
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

/** Callbacks passed via table.options.meta */
export interface StudentTableMeta {
  onEnroll?: (student: StudentDto) => void
  onFixEnrollment?: (student: StudentDto) => void
  onDelete?: (student: StudentDto) => void
  user?: any
}

export const studentColumns: ColumnDef<StudentDto>[] = [
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
      <DataTableColumnHeader column={column} title="Student #" />
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
      <DataTableColumnHeader column={column} title="Full Name" />
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
    accessorKey: "current_grade_level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Grade Level" />
    ),
    cell: ({ row }) => {
      const gradeLevel = row.original.current_grade_level
      if (!gradeLevel) return <span className="text-muted-foreground">—</span>
      return <Badge variant="secondary">{gradeLevel.name}</Badge>
    },
    filterFn: (row, id, value) => {
      const gradeLevel = row.original.current_grade_level
      return value.includes(gradeLevel?.name || "")
    },
  },
  {
    accessorKey: "current_enrollment",
    header: "Section",
    cell: ({ row }) => {
      const enrollment = row.original.current_enrollment
      if (!enrollment?.section) return <span className="text-muted-foreground">—</span>
      return <span className="text-sm">{enrollment.section.name}</span>
    },
  },
  {
    id: "enrollment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const student = row.original
      // const enrollmentStatus = student.current_enrollment?.status
      const studentStatus = student.status
      
      const status = studentStatus
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
      const enrollmentStatus = row.original.current_enrollment?.status
      const studentStatus = row.original.status
      const status = enrollmentStatus || studentStatus
      return value.includes(status)
    },
  },
  {
    id: "balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Balance" />
    ),
    cell: ({ row }) => {
      const billing = row.original.current_enrollment?.billing_summary
      const balance = billing?.balance
      if (balance === undefined || balance === null) {
        return <span className="text-muted-foreground">—</span>
      }
      const currency = billing?.currency || '$'
      const isOverdue = balance > 0 && !billing?.payment_status?.is_on_time
      return (
        <span className={`text-sm font-medium ${isOverdue ? 'text-destructive' : balance === 0 ? 'text-green-600' : ''}`}>
          {currency}{balance.toLocaleString()}
        </span>
      )
    },
  },
  {
    accessorKey: "date_of_birth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ row }) => {
      const dob = row.getValue("date_of_birth") as string
      if (!dob) return <span className="text-muted-foreground">—</span>
      return (
        <span className="text-sm">
          {new Date(dob).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const student = row.original
      const meta = table.options.meta as StudentTableMeta | undefined
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

      const canEnroll = ["admin", "registrar", "superadmin"].includes(meta?.user?.role)
      const canDelete = ["admin", "superadmin"].includes(meta?.user?.role)
      
      // Show action menu if user has any permission
      const hasAnyPermission = canEnroll || canDelete

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
                    <DropdownMenuItem onClick={() => meta?.onEnroll?.(student)}>
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
                      onClick={() => meta?.onFixEnrollment?.(student)}
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
                      onClick={() => meta?.onDelete?.(student)}
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
