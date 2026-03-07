"use client"

import * as React from "react"
import { DialogBox } from "@/components/ui/dialog-box"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import type { StaffDto } from "@/lib/api2/staff/types"

interface ReinstateStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: StaffDto
  onConfirm: () => void
  loading?: boolean
}

export function ReinstateStaffDialog({
  open,
  onOpenChange,
  staff,
  onConfirm,
  loading = false,
}: ReinstateStaffDialogProps) {
  const [confirmed, setConfirmed] = React.useState(false)

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setConfirmed(false)
    }
  }, [open])

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  const handleConfirm = () => {
    onConfirm()
  }

  const isSuspended = staff.status?.toLowerCase() === "suspended"
  const statusLabel = isSuspended ? "suspended" : "terminated"

  return (
    <DialogBox
      open={open}
      onOpenChange={handleClose}
      className="sm:max-w-lg"
      title={
        <span className="text-primary flex items-center gap-2">
          <HugeiconsIcon icon={Alert02Icon} className="size-5" />
          Reinstate Staff Member
        </span>
      }
      description="Restore this staff member to active status."
      actionLabel="Reinstate Staff"
      actionVariant="default"
      onAction={handleConfirm}
      actionDisabled={!confirmed}
      actionLoading={loading}
      actionLoadingText="Reinstating..."
      actionIcon={<HugeiconsIcon icon={RefreshIcon} />}
      cancelDisabled={loading}
    >
      <div className="space-y-4 py-2">
        {/* Info alert */}
        <Alert>
          <HugeiconsIcon icon={Alert02Icon} className="size-4" />
          <AlertDescription>
            You are about to reinstate <strong>{staff.full_name}</strong> ({staff.id_number}) 
            who is currently <strong>{statusLabel}</strong>. This will restore them to 
            active status and they will be able to resume their duties.
          </AlertDescription>
        </Alert>

        {/* Confirmation checkbox */}
        <div className="rounded-lg border p-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <span className="text-sm font-medium">
                I confirm this reinstatement
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I understand that this will restore {staff.full_name} to active 
                status and they will regain access to all their duties and 
                responsibilities.
              </p>
            </div>
          </label>
        </div>

        {/* Additional info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>After reinstatement:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Status will be changed to &quot;Active&quot;</li>
            <li>Access to systems will be restored</li>
            <li>Teaching assignments will be available</li>
            <li>Previous {statusLabel} record will remain in history</li>
          </ul>
        </div>
      </div>
    </DialogBox>
  )
}
