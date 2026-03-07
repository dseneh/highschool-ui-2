"use client"

import React, { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useStudentMutations } from "@/hooks/use-student"
import { useCurrentAcademicYear } from "@/hooks/use-academic-year"
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  RefreshIcon,
  Delete02Icon,
  UserAdd01Icon,
  Coins01Icon,
  UserRemove01Icon,
  Download04Icon,
  IdIcon,
  Notification03Icon,
} from "@hugeicons/core-free-icons"
import type { StudentDto } from "@/lib/api/student-types"
import { showToast } from "@/lib/toast"
import { getErrorMessage } from "@/lib/utils"
import { exportSingleStudentCSV } from "@/lib/export-utils"
import { isStudentReadOnly, canReEnroll } from "@/components/students/withdrawn-banner"
import { Button } from "@/components/ui/button"
import {getQueryClient} from '@/lib/query-client';

export { isStudentReadOnly, canReEnroll }

export interface StudentPageAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
  visible?: boolean
  disabled?: boolean
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined
}

/**
 * Hook that returns student page actions for use in a PageHeader.
 * Unlike useStudentHeaderActions, this does NOT push actions into the
 * global header context — instead it returns them for local rendering.
 */
export function useStudentPageActions(student: StudentDto | undefined) {
  const router = useRouter()
  const { remove, withdraw, reinstate } = useStudentMutations()
  const { data: currentYear } = useCurrentAcademicYear()
  const subdomain = useTenantSubdomain()
  const queryClient = getQueryClient()

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [idCardDialogOpen, setIdCardDialogOpen] = useState(false)

  // Extract stable primitives for memoisation
  const studentId = student?.id
  const studentFullName = student?.full_name
  const isEnrolled = student?.is_enrolled
  const studentIdNumber = student?.id_number
  const canDelete = student?.can_delete
  const isReadOnly = isStudentReadOnly(student)
  const isReEnrollable = canReEnroll(student)

  const removeMutate = remove.mutate

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["students", subdomain, studentId],
    })
    showToast.info("Refreshing", "Fetching latest student data…")
  }, [queryClient, subdomain, studentId])

  const handleDelete = useCallback(() => {
    if (!studentId || !studentFullName) return
    if (!confirm(`Are you sure you want to delete ${studentFullName}? This action cannot be undone.`)) return
    removeMutate({ id: studentId }, {
      onSuccess: () => {
        showToast.success("Student deleted", `${studentFullName} has been permanently removed`)
        router.push("/students")
      },
      onError: (err: unknown) => {
        showToast.error("Delete failed", getErrorMessage(err))
      },
    })
  }, [removeMutate, router, studentId, studentFullName])

  const handleExport = useCallback(() => {
    if (!student) return
    exportSingleStudentCSV(student)
    showToast.success("Exported", `${student.full_name}'s data has been downloaded`)
  }, [student])

  const handleSendNotification = useCallback(() => {
    showToast.info("Coming soon", "Notification sending will be available soon.")
  }, [])

  const reinstateMutate = reinstate.mutate

  const handleReinstate = useCallback(() => {
    if (!studentId || !studentFullName) return
    reinstateMutate(
      { id: studentId },
      {
        onSuccess: () => {
          showToast.success("Student reinstated", `${studentFullName} has been reinstated`)
        },
        onError: (err: unknown) => {
          showToast.error("Reinstate failed", getErrorMessage(err))
        },
      }
    )
  }, [reinstateMutate, studentId, studentFullName])

  const visibleActions = useMemo(() => {
    if (!student) return [] as StudentPageAction[]

    const actions: StudentPageAction[] = [
      {
        id: "enroll",
        label: isReEnrollable ? "Reinstate" : "Enroll",
        icon: <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />,
        onClick: isReEnrollable ? handleReinstate : () => setEnrollDialogOpen(true),
        variant: "default" as const,
        visible: !isEnrolled && (!isReadOnly || isReEnrollable),
        disabled: isReEnrollable && reinstate.isPending,
      },
      {
        id: "payment",
        label: "Make Payment",
        icon: <HugeiconsIcon icon={Coins01Icon} className="size-4" />,
        onClick: () => router.push(`/students/${studentIdNumber}/billing`),
        variant: "default" as const,
        visible: !!isEnrolled && !isReadOnly,
      },
      {
        id: "withdraw",
        label: "Withdraw",
        icon: <HugeiconsIcon icon={UserRemove01Icon} className="size-4" />,
        onClick: () => setWithdrawDialogOpen(true),
        variant: "outline" as const,
        visible: !!isEnrolled && !isReadOnly,
      },
      {
        id: "id-card",
        label: "ID Card",
        icon: <HugeiconsIcon icon={IdIcon} className="size-4" />,
        onClick: () => setIdCardDialogOpen(true),
        variant: "outline" as const,
      },
      {
        id: "export",
        label: "Export",
        icon: <HugeiconsIcon icon={Download04Icon} className="size-4" />,
        onClick: handleExport,
        variant: "outline" as const,
      },
      {
        id: "notify",
        label: "",
        icon: <HugeiconsIcon icon={Notification03Icon} className="size-4" />,
        onClick: handleSendNotification,
        variant: "outline" as const,
        size: "icon" as const,
      },
      {
        id: "refresh",
        label: "",
        icon: <HugeiconsIcon icon={RefreshIcon} className="size-4" />,
        onClick: handleRefresh,
        variant: "outline" as const,
        size: "icon" as const,
      },
      {
        id: "delete",
        label: "Delete",
        icon: <HugeiconsIcon icon={Delete02Icon} className="size-4" />,
        onClick: handleDelete,
        variant: "destructive" as const,
        visible: !!canDelete,
      },
    ]

    return actions.filter((a) => a.visible !== false)
  }, [student, isEnrolled, isReadOnly, isReEnrollable, studentIdNumber, canDelete, handleRefresh, handleDelete, handleExport, handleSendNotification, handleReinstate, reinstate.isPending, router])

  return {
    actions: visibleActions,
    enrollDialogOpen,
    setEnrollDialogOpen,
    withdrawDialogOpen,
    setWithdrawDialogOpen,
    idCardDialogOpen,
    setIdCardDialogOpen,
    withdraw,
    reinstate,
    handleReinstate,
    currentYear,
  }
}

/**
 * Renders action buttons inline. Used inside PageHeader's children slot.
 */
export function StudentPageActionButtons({ actions }: { actions: StudentPageAction[] }) {
  if (actions.length === 0) return null

  return (
    <>
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant || "outline"}
          size={action.size || "sm"}
          onClick={action.onClick}
          disabled={action.disabled}
          className="h-8"
          icon={action.icon}
        >
          <span className="hidden sm:inline">{action.label}</span>
        </Button>
      ))}
    </>
  )
}

/**
 * Renders all shared student page dialogs (Enroll, Withdraw, ID Card).
 * Place this once in any page that uses `useStudentPageActions`.
 */

// Hoisted to module scope so lazy references are stable across renders
const LazyEnrollmentDialog = React.lazy(() =>
  import("@/components/students/enrollment-dialog").then((m) => ({
    default: m.EnrollmentDialog,
  }))
)
const LazyWithdrawStudentDialog = React.lazy(() =>
  import("@/components/students/withdraw-student-dialog").then((m) => ({
    default: m.WithdrawStudentDialog,
  }))
)
const LazyStudentIdCardDialog = React.lazy(() =>
  import("@/components/students/student-id-card").then((m) => ({
    default: m.StudentIdCardDialog,
  }))
)

export function StudentPageDialogs({
  student,
  hookResult,
}: {
  student: StudentDto | undefined
  hookResult: ReturnType<typeof useStudentPageActions>
}) {
  const {
    enrollDialogOpen,
    setEnrollDialogOpen,
    withdrawDialogOpen,
    setWithdrawDialogOpen,
    idCardDialogOpen,
    setIdCardDialogOpen,
    withdraw,
    currentYear,
  } = hookResult

  if (!student) return null

  const handleWithdraw = (data: { withdrawal_date: string; withdrawal_reason: string }) => {
    withdraw.mutate(
      { id: student.id, payload: data },
      {
        onSuccess: () => {
          showToast.success("Student withdrawn", `${student.full_name} has been withdrawn`)
          setWithdrawDialogOpen(false)
        },
        onError: (err: unknown) => {
          showToast.error("Withdraw failed", getErrorMessage(err))
        },
      }
    )
  }

  return (
    <React.Suspense fallback={null}>
      <LazyEnrollmentDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        student={student}
        currentYear={currentYear}
        isReEnroll={student.number_of_enrollments > 0}
      />
      <LazyWithdrawStudentDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        student={student}
        onConfirm={handleWithdraw}
        loading={withdraw.isPending}
      />
      <LazyStudentIdCardDialog
        open={idCardDialogOpen}
        onOpenChange={setIdCardDialogOpen}
        student={student}
      />
    </React.Suspense>
  )
}
