"use client"

import * as React from "react"
import { DialogBox } from "@/components/ui/dialog-box"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import type { EmployeeDto } from "@/lib/api2/employee/types"

interface DeleteStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: EmployeeDto
  onConfirm: (force: boolean) => void
  loading?: boolean
}

export function DeleteStaffDialog({
  open,
  onOpenChange,
  staff,
  onConfirm,
  loading = false,
}: DeleteStaffDialogProps) {
  const [forceDelete, setForceDelete] = React.useState(false)
  const [confirmed, setConfirmed] = React.useState(false)

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setForceDelete(false)
      setConfirmed(false)
    }
  }, [open])

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  const handleConfirm = () => {
    onConfirm(forceDelete)
  }

  return (
    <DialogBox
      open={open}
      onOpenChange={handleClose}
      className="sm:max-w-lg"
      title={
        <span className="text-destructive flex items-center gap-2">
          <HugeiconsIcon icon={Alert02Icon} className="size-5" />
          Delete Staff Member
        </span>
      }
      description="This action is permanent and cannot be undone."
      actionLabel="Delete Staff"
      actionVariant="destructive"
      onAction={handleConfirm}
      actionDisabled={!confirmed}
      actionLoading={loading}
      actionLoadingText="Deleting..."
      actionIcon={<HugeiconsIcon icon={Delete02Icon} />}
      cancelDisabled={loading}
    >
        <div className="space-y-4 py-2">
          {/* Warning alert */}
          <Alert variant="destructive">
            <HugeiconsIcon icon={Alert02Icon} className="size-4" />
            <AlertDescription>
              You are about to <strong>permanently delete</strong>{" "}
              <strong>{staff.full_name}</strong> ({staff.id_number}). All
              associated data including employment records, teaching assignments,
              and user account will be removed.
            </AlertDescription>
          </Alert>

          {/* Force delete checkbox */}
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={forceDelete}
                onCheckedChange={(checked) => setForceDelete(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <span className="text-sm font-semibold">Force Delete</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Forcibly delete this staff member even if they have active
                  teaching assignments or associated records. This will
                  permanently remove all related data and cannot be recovered.
                </p>
              </div>
            </label>
          </div>

          {/* Confirmation checkbox */}
          <div className="rounded-lg border p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <span className="text-sm font-semibold">
                  I understand this action cannot be undone
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Once deleted, <strong>{staff.full_name}</strong> and all
                  associated data will be permanently removed from the system.
                </p>
              </div>
            </label>
          </div>
        </div>
    </DialogBox>
  )
}
