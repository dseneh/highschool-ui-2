"use client"

import * as React from "react"
import { format } from "date-fns"
import { DialogBox } from "@/components/ui/dialog-box"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import type { EmployeeDto } from "@/lib/api2/employee/types"

interface SuspendStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: EmployeeDto
  onConfirm: (data: { effectiveDate: string; reason: string }) => void
  loading?: boolean
}

export function SuspendStaffDialog({
  open,
  onOpenChange,
  staff,
  onConfirm,
  loading = false,
}: SuspendStaffDialogProps) {
  const [confirmed, setConfirmed] = React.useState(false)
  const [effectiveDate, setEffectiveDate] = React.useState<Date | undefined>(
    () => new Date()
  )
  const [reason, setReason] = React.useState("")

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setConfirmed(false)
      setEffectiveDate(new Date())
      setReason("")
    }
  }, [open])

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  const handleConfirm = () => {
    if (!effectiveDate) return
    onConfirm({
      effectiveDate: format(effectiveDate, "yyyy-MM-dd"),
      reason: reason,
    })
  }

  return (
    <DialogBox
      open={open}
      onOpenChange={handleClose}
      className="sm:max-w-lg"
      title={
        <span className="text-orange-600 dark:text-orange-400 flex items-center gap-2">
          <HugeiconsIcon icon={Alert02Icon} className="size-5" />
          Suspend Staff Member
        </span>
      }
      description="Temporarily suspend this staff member from their duties."
      actionLabel="Suspend Staff"
      actionVariant="destructive"
      onAction={handleConfirm}
      actionDisabled={!confirmed || !effectiveDate}
      actionLoading={loading}
      actionLoadingText="Suspending..."
      actionIcon={<HugeiconsIcon icon={Cancel01Icon} />}
      cancelDisabled={loading}
    >
      <div className="space-y-4 py-2">
        {/* Warning alert */}
        <Alert className="border-orange-500/50 bg-orange-500/5 text-orange-800 dark:text-orange-300 [&>svg]:text-orange-600">
          <HugeiconsIcon icon={Alert02Icon} className="size-4" />
          <AlertDescription>
            You are about to suspend{" "}
            <strong>{staff.full_name}</strong> ({staff.id_number}) from
            their duties. The staff member will be marked as
            &quot;suspended&quot; and will not be able to access the system.
          </AlertDescription>
        </Alert>

        {/* Effective date */}
        <div className="space-y-2">
          <Label htmlFor="suspension-date">Effective Date</Label>
          <DatePicker
            value={effectiveDate}
            onChange={(date) => setEffectiveDate(date)}
            placeholder="Select suspension date"
          />
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <Label htmlFor="suspension-reason">
            Reason <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Textarea
            id="suspension-reason"
            placeholder="e.g. Pending investigation, disciplinary action, policy violation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
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
                I understand that this will suspend the staff member
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The staff member&apos;s status will change to
                &quot;suspended&quot; and they will lose system access. You can
                reinstate them later if needed.
              </p>
            </div>
          </label>
        </div>
      </div>
    </DialogBox>
  )
}
