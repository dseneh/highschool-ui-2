"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/components/portable-auth/src/client"
import { useStudents as useStudentsApi } from "@/lib/api2/student"
import { useStudentMutations } from "@/hooks/use-student"
import { useStudentPageActions } from "@/hooks/use-student-page-actions"
import { PageContent } from "@/components/dashboard/page-content"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  Settings01Icon,
  Delete02Icon,
  UserCircleIcon,
  RepairIcon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons"
import { AlertTriangle } from "lucide-react"
import { showToast } from "@/lib/toast"
import { getErrorMessage } from "@/lib/utils"
import { DeleteStudentDialog } from "@/components/students/delete-student-dialog"
import { WithdrawStudentDialog } from "@/components/students/withdraw-student-dialog"
import { WithdrawnBanner, isStudentReadOnly } from "@/components/students/withdrawn-banner"
import { EnrollmentDialog } from "@/components/students/enrollment-dialog"
import PageLayout from "@/components/dashboard/page-layout"
import { AuthButton } from "@/components/auth/auth-button"
import { useResolvedStudentIdNumber } from "@/hooks/use-resolved-student-id-number"

function SettingsSkeleton() {
  return (
    <PageContent>
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </PageContent>
  )
}

export default function StudentSettingsPage() {
  const router = useRouter()
  const idNumber = useResolvedStudentIdNumber()
  const { user: currentUser } = useAuth()

  const isAdmin = String(currentUser?.role || "").toLowerCase() === "admin" || 
                  String(currentUser?.role || "").toLowerCase() === "superadmin" ||
                  currentUser?.is_superuser === true

  const studentsApi = useStudentsApi()
  const { data: student, isLoading, error, refetch, isFetching } = studentsApi.getStudent(idNumber, {
    enabled: !!idNumber,
  })
  const { currentYear } = useStudentPageActions(student)
  const { remove, withdraw, reinstate } = useStudentMutations()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showFixEnrollment, setShowFixEnrollment] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)

  if (isLoading) return <SettingsSkeleton />

  if (!student) {
    return (
      <PageContent>
        <Card className="p-6 border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Error Loading Student</h3>
              <p className="text-sm text-muted-foreground">Student not found</p>
            </div>
          </div>
        </Card>
      </PageContent>
    )
  }

  const handleDelete = (force: boolean) => {
    remove.mutate({ id: student.id, force }, {
      onSuccess: () => {
        showToast.success("Student deleted", "The student has been permanently removed")
        setShowDeleteDialog(false)
        router.push("/students")
      },
      onError: (err: Error) => {
        showToast.error("Delete failed", getErrorMessage(err))
      },
    })
  }

  const handleWithdraw = (data: { withdrawal_date: string; withdrawal_reason: string }) => {
    withdraw.mutate(
      { id: student.id, payload: data },
      {
        onSuccess: () => {
          showToast.success("Student withdrawn", `${student.full_name} has been withdrawn`)
          setShowWithdrawDialog(false)
        },
        onError: (err: Error) => {
          showToast.error("Withdraw failed", getErrorMessage(err))
        },
      }
    )
  }

  const isActive = student.status === "Active" || student.status === "active"

  const handleReinstate = () => {
    reinstate.mutate(
      { id: student.id },
      {
        onSuccess: () => {
          showToast.success("Student reinstated", `${student.full_name} has been reinstated`)
        },
        onError: (err: Error) => {
          showToast.error("Reinstate failed", getErrorMessage(err))
        },
      }
    )
  }

  return (
    <PageLayout
      title="Student Settings"
      description={`Manage settings for ${student?.full_name}`}
      error={error}
      loading={isLoading}
      refreshAction={refetch}
      fetching={isFetching}
    >
      <div className="space-y-4 w-full max-w-3xl">

        {/* Withdrawn Banner */}
        <WithdrawnBanner student={student} onReEnroll={handleReinstate} loading={reinstate.isPending} />

        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={UserCircleIcon} className="size-5" />
              Student Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID Number</span>
                <span className="text-sm font-mono">{student.id_number}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {student.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Enrolled</span>
                <Badge variant={student.is_enrolled ? "default" : "secondary"}>
                  {student.is_enrolled ? "Yes" : "No"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Enrollments</span>
                <span className="text-sm">{student.number_of_enrollments}</span>
              </div>
              {student.user_account && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">User Account</span>
                    <span className="text-sm">{student.user_account.username}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={Settings01Icon} className="size-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.is_enrolled && !isStudentReadOnly(student) && (
              <div className="flex items-center flex-col md:flex-row justify-between p-4 rounded-lg border gap-4">
                <div>
                  <p className="font-medium">Withdraw Student</p>
                  <p className="text-sm text-muted-foreground">
                    Remove this student from their current enrollment. They can be re-enrolled later.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 shrink-0"
                  onClick={() => isAdmin && setShowWithdrawDialog(true)}
                  disabled={!isAdmin}
                  icon={<HugeiconsIcon icon={UserRemove01Icon} />}
                >
                  Withdraw
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Fix Enrollment – Warning Zone */}
        {isAdmin && student.is_enrolled && !isStudentReadOnly(student) && (
          <Card className="border-orange-500/50">
            <CardHeader>
              <CardTitle className="text-base text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <AlertTriangle className="size-4" />
                Fix Enrollment
              </CardTitle>
              <CardDescription>
                Use this if this student&apos;s enrollment has issues such as missing billing, gradebooks, or incorrect data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center flex-col md:flex-row justify-between p-4 rounded-lg border border-orange-500/30 bg-orange-500/5 gap-4">
                <div>
                  <p className="font-medium">Re-Enroll Student</p>
                  <p className="text-sm text-muted-foreground">
                    This will delete the current enrollment (including billing records
                    and gradebooks) and create a new one from scratch.
                  </p>
                </div>
                <AuthButton
                  roles={["admin", "registrar"]}
                  variant="outline"
                  className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 shrink-0"
                  onClick={() => isAdmin && setShowFixEnrollment(true)}
                  disabled={!isAdmin}
                  icon={<HugeiconsIcon icon={RepairIcon} />}
                >
                  Fix Enrollment
                </AuthButton>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        {isAdmin && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex  items-center flex-col md:flex-row justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div>
                <p className="font-medium">Delete Student</p>
                <p className="text-sm text-muted-foreground">
                  Permanently remove this student and all associated data.
                  This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                className="fw-full"
                onClick={() => isAdmin && setShowDeleteDialog(true)}
                disabled={!isAdmin}
                icon={<HugeiconsIcon icon={Delete02Icon} />}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Fix Enrollment Dialog (re-enroll mode) */}
        {student && (
          <EnrollmentDialog
            open={showFixEnrollment}
            onOpenChange={setShowFixEnrollment}
            student={student}
            currentYear={currentYear}
            isReEnroll
          />
        )}

        {/* Delete Student Dialog */}
        <DeleteStudentDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          student={student}
          onConfirm={handleDelete}
          loading={remove.isPending}
        />

        {/* Withdraw Student Dialog */}
        <WithdrawStudentDialog
          open={showWithdrawDialog}
          onOpenChange={setShowWithdrawDialog}
          student={student}
          onConfirm={handleWithdraw}
          loading={withdraw.isPending}
        />
      </div>
    </PageLayout>
  )
}
