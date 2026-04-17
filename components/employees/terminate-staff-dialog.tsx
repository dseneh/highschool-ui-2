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
import { Alert02Icon, UserRemove01Icon } from "@hugeicons/core-free-icons"
import type { EmployeeDto } from "@/lib/api2/employee/types"

interface TerminateStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: EmployeeDto
  onConfirm: (data: { effectiveDate: string; reason: string }) => void
  loading?: boolean
}

export function TerminateStaffDialog({
  open,
  onOpenChange,
  staff,
  onConfirm,
  loading = false,
}: TerminateStaffDialogProps) {
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
        <span className="text-destructive flex items-center gap-2">
          <HugeiconsIcon icon={Alert02Icon} className="size-5" />
          Terminate Employment
        </span>
      }
      description="Permanently end this staff member's employment."
      actionLabel="Terminate Employment"
      actionVariant="destructive"
      onAction={handleConfirm}
      actionDisabled={!confirmed || !effectiveDate}
      actionLoading={loading}
      actionLoadingText="Terminating..."
      actionIcon={<HugeiconsIcon icon={UserRemove01Icon} />}
      cancelDisabled={loading}
    >
      <div className="space-y-4 py-2">
        {/* Warning alert */}
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} className="size-4" />
          <AlertDescription>
            You are about to terminate the employment of{" "}
            <strong>{staff.full_name}</strong> ({staff.id_number}). The staff
            member will be marked as &quot;terminated&quot; and will lose all
            system access immediately.
          </AlertDescription>
        </Alert>

        {/* Effective date */}
        <div className="space-y-2">
          <Label htmlFor="termination-date">Termination Date</Label>
          <DatePicker
            value={effectiveDate}
            onChange={(date) => setEffectiveDate(date)}
            placeholder="Select termination date"
          />
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <Label htmlFor="termination-reason">
            Reason <span className="text-muted-foreground text-xs">(required)</span>
          </Label>
          <Textarea
            id="termination-reason"
            placeholder="e.g. Resignation, dismissal, end of contract, retirement..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
          />
        </div>

        {/* Confirmation checkbox */}
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <span className="text-sm font-semibold">
                I understand this will terminate the employment
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The staff member&apos;s employment will be terminated and their
                status will change to &quot;terminated&quot;. This action should
                not be taken lightly.
              </p>
            </div>
          </label>
        </div>
      </div>
    </DialogBox>
  )
}
