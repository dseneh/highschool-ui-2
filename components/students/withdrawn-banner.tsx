"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserRemove01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { DialogBox } from "@/components/ui/dialog-box"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { StudentDto } from "@/lib/api/student-types"
import { AuthButton } from "../auth/auth-button"

/** Statuses where the student is considered inactive / read-only. */
const INACTIVE_STATUSES = ["withdrawn", "graduated", "transferred", "inactive", "deleted"] as const

/** Statuses that allow re-enrollment (student can come back). */
const RE_ENROLLABLE_STATUSES = ["withdrawn", "transferred"] as const

/** Check whether a student is in a read-only (withdrawn / inactive) state. */
export function isStudentReadOnly(student: StudentDto | undefined): boolean {
  if (!student) return false
  return INACTIVE_STATUSES.includes(student.status as (typeof INACTIVE_STATUSES)[number])
}

/** Check whether a withdrawn/transferred student can be re-enrolled. */
export function canReEnroll(student: StudentDto | undefined): boolean {
  if (!student) return false
  return RE_ENROLLABLE_STATUSES.includes(student.status as (typeof RE_ENROLLABLE_STATUSES)[number])
}

const statusLabels: Record<string, { title: string; description: string; dateLabel: string }> = {
  withdrawn: {
    title: "Student Withdrawn",
    description: "was withdrawn from the school. Records are read-only.",
    dateLabel: "Withdrawal date",
  },
  graduated: {
    title: "Student Graduated",
    description: "has graduated. Records are read-only.",
    dateLabel: "Graduation date",
  },
  transferred: {
    title: "Student Transferred",
    description: "has been transferred. Records are read-only.",
    dateLabel: "Transfer date",
  },
  inactive: {
    title: "Student Inactive",
    description: "is currently inactive. Records are read-only.",
    dateLabel: "",
  },
  deleted: {
    title: "Student Deleted",
    description: "has been deleted. Records are read-only.",
    dateLabel: "",
  },
}

interface WithdrawnBannerProps {
  student: StudentDto | undefined
  onReEnroll?: () => void
  loading?: boolean
}

/**
 * Banner displayed on student detail pages when the student is in a
 * read-only state (withdrawn, graduated, transferred, etc.).
 */
export function WithdrawnBanner({ student, onReEnroll, loading }: WithdrawnBannerProps) {
  const [showConfirm, setShowConfirm] = React.useState(false)

  if (!isStudentReadOnly(student)) return null
  if (!student) return null

  const config = statusLabels[student.status] ?? statusLabels.inactive
  const showReEnroll = canReEnroll(student) && onReEnroll

  const handleConfirmReinstate = () => {
    onReEnroll?.()
    setShowConfirm(false)
  }

  return (
    <>
      <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-100 dark:bg-red-900/50 p-2 shrink-0">
              <HugeiconsIcon icon={UserRemove01Icon} className="size-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
                {config.title}
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
                <span className="font-medium">{student.full_name}</span> {config.description}
              </p>
              {student.status === "withdrawn" && student.withdrawal_date && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {config.dateLabel}: {new Date(student.withdrawal_date).toLocaleDateString()}
                  {student.withdrawal_reason && (
                    <span className="ml-2">— {student.withdrawal_reason}</span>
                  )}
                </p>
              )}
            </div>
          </div>
          {showReEnroll && (
            <AuthButton
              roles={["registrar"]}
              size="sm"
              variant="outline"
              className="border-red-300 bg-red-100 text-red-800 hover:bg-red-200 dark:border-red-700 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900 shrink-0"
              onClick={() => setShowConfirm(true)}
              loading={loading}
              loadingText="Reinstating…"
            >
              Reinstate Student
            </AuthButton>
          )}
        </div>
      </div>

      {/* Reinstate Confirmation Dialog */}
      <DialogBox
        open={showConfirm}
        onOpenChange={setShowConfirm}
        className="sm:max-w-md"
        title={
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={UserAdd01Icon} className="size-5" />
            Reinstate Student
          </span>
        }
        description="Bring this student back to active status."
        actionLabel="Reinstate"
        actionVariant="default"
        onAction={handleConfirmReinstate}
        actionLoading={loading}
        actionLoadingText="Reinstating…"
        actionIcon={<HugeiconsIcon icon={UserAdd01Icon} />}
        cancelDisabled={loading}
      >
        <div className="space-y-4 py-2">
          <Alert>
            <AlertDescription>
              You are about to reinstate{" "}
              <strong>{student.full_name}</strong> ({student.id_number}).
              Their status will change from <strong>&quot;{student.status}&quot;</strong> to{" "}
              <strong>&quot;enrolled&quot;</strong> and they will appear in active class lists again.
            </AlertDescription>
          </Alert>

          {student.withdrawal_reason && (
            <div className="rounded-lg border p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Original withdrawal reason</p>
              <p className="text-sm">{student.withdrawal_reason}</p>
            </div>
          )}
        </div>
      </DialogBox>
    </>
  )
}
