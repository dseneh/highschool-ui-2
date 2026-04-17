"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/components/portable-auth/src/client"
import { useEmployee } from "@/lib/api2/employee"
import { useEmployeeMutations } from "@/hooks/use-employee-mutations"
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
  Cancel01Icon,
  UserRemove01Icon,
  RefreshIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { showToast } from "@/lib/toast"
import { getErrorMessage } from "@/lib/utils"
import { DeleteStaffDialog } from "@/components/employees/delete-staff-dialog"
import { SuspendStaffDialog } from "@/components/employees/suspend-staff-dialog"
import { TerminateStaffDialog } from "@/components/employees/terminate-staff-dialog"
import { ReinstateStaffDialog } from "@/components/employees/reinstate-staff-dialog"
import PageLayout from "@/components/dashboard/page-layout"

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

export default function EmployeeSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const idNumber = params.id_number as string
  const { user: currentUser } = useAuth()

  const isAdmin = String(currentUser?.role || "").toLowerCase() === "admin" || 
                  String(currentUser?.role || "").toLowerCase() === "superadmin" ||
                  currentUser?.is_superuser === true

  const employeeApi = useEmployee()
  const { data: employee, isLoading } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/employees/")
  })
  const { remove, suspend, terminate, reinstate } = useEmployeeMutations()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)
  const [showReinstateDialog, setShowReinstateDialog] = useState(false)

  if (isLoading) return <SettingsSkeleton />

  if (!employee) {
    return (
      <PageContent>
        <Card className="p-6 border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Error Loading Employee</h3>
              <p className="text-sm text-muted-foreground">Employee not found</p>
            </div>
          </div>
        </Card>
      </PageContent>
    )
  }

  const handleDelete = (force: boolean) => {
    remove.mutate({ id: employee.id, force }, {
      onSuccess: () => {
        showToast.success("Employee deleted", "The employee has been permanently removed")
        setShowDeleteDialog(false)
        router.push("/employees")
      },
      onError: (err: Error) => {
        showToast.error("Delete failed", getErrorMessage(err))
      },
    })
  }

  const handleSuspend = (data: { effectiveDate: string; reason: string }) => {
    suspend.mutate(
      { id: employee.id, reason: data.reason, effectiveDate: data.effectiveDate },
      {
        onSuccess: () => {
          showToast.success("Employee suspended", `${employee.full_name} has been suspended`)
          setShowSuspendDialog(false)
        },
        onError: (err: Error) => {
          showToast.error("Suspend failed", getErrorMessage(err))
        },
      }
    )
  }

  const handleTerminate = (data: { effectiveDate: string; reason: string }) => {
    terminate.mutate(
      { id: employee.id, reason: data.reason, effectiveDate: data.effectiveDate },
      {
        onSuccess: () => {
          showToast.success("Employment terminated", `${employee.full_name}'s employment has been terminated`)
          setShowTerminateDialog(false)
        },
        onError: (err: Error) => {
          showToast.error("Termination failed", getErrorMessage(err))
        },
      }
    )
  }

  const isActive = employee.employment_status?.toLowerCase() === "active"
  const isSuspended = employee.employment_status?.toLowerCase() === "suspended"
  const isTerminated = employee.employment_status?.toLowerCase() === "terminated"
  const canBeReinstated = isSuspended || isTerminated

  const handleReinstate = () => {
    reinstate.mutate(
      { id: employee.id },
      {
        onSuccess: () => {
          showToast.success("Employee reinstated", `${employee.full_name} has been reinstated to active status`)
          setShowReinstateDialog(false)
        },
        onError: (err: Error) => {
          showToast.error("Reinstate failed", getErrorMessage(err))
        },
      }
    )
  }

  return (
    <PageLayout
      title="Employee Settings"
      description={`Manage settings and actions for ${employee.full_name}`}
      loading={isLoading}
      skeleton={<SettingsSkeleton />}
    >
      <div className="space-y-4 w-full max-w-3xl">

        {/* Reinstate Banner */}
        {canBeReinstated && (
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardContent >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-orange-600" />
                    <h3 className="font-semibold text-orange-600 dark:text-orange-400">
                      Employee {isSuspended ? "Suspended" : "Terminated"}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This employee is currently {employee.employment_status?.toLowerCase()}. You can reinstate them to active status if needed.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
                  onClick={() => isAdmin && setShowReinstateDialog(true)}
                  disabled={!isAdmin}
                  icon={<HugeiconsIcon icon={RefreshIcon} />}
                >
                  Reinstate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employee Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={UserCircleIcon} className="size-5" />
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Employee Number</span>
                <span className="text-sm font-mono">{employee.id_number}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {employee.employment_status?.replace(/_/g, ' ')}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Position</span>
                <span className="text-sm">{typeof employee.position === 'object' ? employee.position?.title : employee.position || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Department</span>
                <span className="text-sm">
                  {employee.department && typeof employee.department === 'object'
                    ? employee.department.name || "N/A"
                    : employee.department || "N/A"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hire Date</span>
                <span className="text-sm">{employee.hire_date || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Manager</span>
                <span className="text-sm">
                  {typeof employee.manager === "string"
                    ? employee.manager
                    : employee.manager?.full_name || employee.manager?.id_number || "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {isActive && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HugeiconsIcon icon={Settings01Icon} className="size-5" />
                Employment Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center flex-col md:flex-row justify-between p-4 rounded-lg border gap-4">
                <div>
                  <p className="font-medium">Suspend Employee</p>
                  <p className="text-sm text-muted-foreground">
                    Temporarily suspend this employee from their duties. They can be reinstated later.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 shrink-0"
                  onClick={() => isAdmin && setShowSuspendDialog(true)}
                  disabled={!isAdmin}
                  icon={<HugeiconsIcon icon={Cancel01Icon} />}
                >
                  Suspend
                </Button>
              </div>

              <div className="flex items-center flex-col md:flex-row justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5 gap-4">
                <div>
                  <p className="font-medium">Terminate Employment</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently end this employee&apos;s employment. This action should be well documented.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => isAdmin && setShowTerminateDialog(true)}
                  disabled={!isAdmin}
                  icon={<HugeiconsIcon icon={UserRemove01Icon} />}
                >
                  Terminate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center flex-col md:flex-row justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5 gap-4">
              <div>
                <p className="font-medium">Delete Employee</p>
                <p className="text-sm text-muted-foreground">
                  Permanently remove this employee and all associated data.
                  This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => isAdmin && setShowDeleteDialog(true)}
                disabled={!isAdmin}
                icon={<HugeiconsIcon icon={Delete02Icon} />}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        <DeleteStaffDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          staff={employee}
          onConfirm={handleDelete}
          loading={remove.isPending}
        />

        {/* Suspend Dialog */}
        <SuspendStaffDialog
          open={showSuspendDialog}
          onOpenChange={setShowSuspendDialog}
          staff={employee}
          onConfirm={handleSuspend}
          loading={suspend.isPending}
        />

        {/* Terminate Dialog */}
        <TerminateStaffDialog
          open={showTerminateDialog}
          onOpenChange={setShowTerminateDialog}
          staff={employee}
          onConfirm={handleTerminate}
          loading={terminate.isPending}
        />

        {/* Reinstate Dialog */}
        <ReinstateStaffDialog
          open={showReinstateDialog}
          onOpenChange={setShowReinstateDialog}
          staff={employee}
          onConfirm={handleReinstate}
          loading={reinstate.isPending}
        />
      </div>
    </PageLayout>
  )
}
