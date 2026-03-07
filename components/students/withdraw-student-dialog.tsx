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
import type { StudentDto } from "@/lib/api/student-types"

interface WithdrawStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: StudentDto
  onConfirm: (data: { withdrawal_date: string; withdrawal_reason: string }) => void
  loading?: boolean
}

export function WithdrawStudentDialog({
  open,
  onOpenChange,
  student,
  onConfirm,
  loading = false,
}: WithdrawStudentDialogProps) {
  const [confirmed, setConfirmed] = React.useState(false)
  const [withdrawalDate, setWithdrawalDate] = React.useState<Date | undefined>(
    () => new Date()
  )
  const [withdrawalReason, setWithdrawalReason] = React.useState("")

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setConfirmed(false)
      setWithdrawalDate(new Date())
      setWithdrawalReason("")
    }
  }, [open])

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  const handleConfirm = () => {
    if (!withdrawalDate) return
    onConfirm({
      withdrawal_date: format(withdrawalDate, "yyyy-MM-dd"),
      withdrawal_reason: withdrawalReason,
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
          Withdraw Student
        </span>
      }
      description="Withdraw this student from the current enrollment."
      actionLabel="Withdraw Student"
      actionVariant="destructive"
      onAction={handleConfirm}
      actionDisabled={!confirmed || !withdrawalDate}
      actionLoading={loading}
      actionLoadingText="Withdrawing..."
      actionIcon={<HugeiconsIcon icon={UserRemove01Icon} />}
      cancelDisabled={loading}
      roles={["admin", "registrar"]}
    >
      <div className="space-y-4 py-2">
        {/* Warning alert */}
        <Alert className="border-orange-500/50 bg-orange-500/5 text-orange-800 dark:text-orange-300 [&>svg]:text-orange-600">
          <HugeiconsIcon icon={Alert02Icon} className="size-4" />
          <AlertDescription>
            You are about to withdraw{" "}
            <strong>{student.full_name}</strong> ({student.id_number}) from
            their current enrollment. The student will be marked as
            &quot;withdrawn&quot; and will no longer appear in active class
            lists.
          </AlertDescription>
        </Alert>

        {/* Withdrawal date */}
        <div className="space-y-2">
          <Label htmlFor="withdrawal-date">Withdrawal Date</Label>
          <DatePicker
            value={withdrawalDate}
            onChange={(date) => setWithdrawalDate(date)}
            placeholder="Select withdrawal date"
          />
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <Label htmlFor="withdrawal-reason">
            Reason <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Textarea
            id="withdrawal-reason"
            placeholder="e.g. Family relocation, financial reasons, transfer to another school..."
            value={withdrawalReason}
            onChange={(e) => setWithdrawalReason(e.target.value)}
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
                I understand that this will withdraw the student
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The student&apos;s enrollment status will change to
                &quot;withdrawn&quot;. You can re-enroll the student later if
                needed.
              </p>
            </div>
          </label>
        </div>
      </div>
    </DialogBox>
  )
}
