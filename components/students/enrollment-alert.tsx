"use client"

import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { useCurrentAcademicYear } from "@/hooks/use-academic-year"
import { EnrollmentDialog } from "./enrollment-dialog"
import type { StudentDto } from "@/lib/api2/student-types"
import { AuthButton } from "../auth/auth-button"

interface EnrollmentAlertProps {
  student: StudentDto | undefined
}

export function EnrollmentAlert({ student }: EnrollmentAlertProps) {
  const [open, setOpen] = React.useState(false)
  const { data: currentYear } = useCurrentAcademicYear()

  // Guard against undefined student
  if (!student) return null

  // Don't show enrollment alert for withdrawn/inactive students (they have their own banner)
  const inactiveStatuses = ["withdrawn", "graduated", "transferred", "inactive", "deleted"]
  if (student.is_enrolled || inactiveStatuses.includes(student.status)) return null

  return (
    <>
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-2 shrink-0">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Not Enrolled
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                <span className="font-medium">{student.full_name}</span> has not
                yet enrolled for the{" "}
                <span className="font-medium">
                  {currentYear?.name || "current"}
                </span>{" "}
                academic year. Click the button to enroll the student now.
              </p>
            </div>
          </div>
          <AuthButton
            roles={["registrar"]}
            size="sm"
            variant="warning-outline"
            className="border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-900 shrink-0"
            onClick={() => setOpen(true)}
          >
            Enroll Student
          </AuthButton>
        </div>
      </div>

      <EnrollmentDialog
        open={open}
        onOpenChange={setOpen}
        student={student}
        currentYear={currentYear}
        isReEnroll={false}
      />
    </>
  )
}
