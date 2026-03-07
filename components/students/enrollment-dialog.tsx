"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { EnrollmentForm, type EnrollmentFormRef } from "./enrollment-form"
import type { StudentDto } from "@/lib/api2/student-types"
import { AuthButton } from "../auth/auth-button"

interface EnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: StudentDto
  currentYear: { id: string; name: string } | null | undefined
  isReEnroll?: boolean
}

export function EnrollmentDialog({
  open,
  onOpenChange,
  student,
  currentYear,
  isReEnroll = false,
}: EnrollmentDialogProps) {
  const formRef = React.useRef<EnrollmentFormRef>(null)
  const [showWarning, setShowWarning] = React.useState(isReEnroll)
  const [warningConfirmed, setWarningConfirmed] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    setShowWarning(isReEnroll)
    setWarningConfirmed(false)
  }, [isReEnroll, open])

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false)
      setTimeout(() => setShowWarning(false), 200)
    }
  }

  const handleConfirm = () => {
    formRef.current?.submitForm()
  }

  // Poll submitting state from ref
  React.useEffect(() => {
    if (!open) return
    const interval = setInterval(() => {
      if (formRef.current) {
        setSubmitting(formRef.current.isSubmitting)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {currentYear?.name}{" "}
            {isReEnroll ? "Re-Enrollment" : "Enrollment"}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to enroll{" "}
            <span className="font-medium text-foreground">
              {student.full_name}
            </span>{" "}
            for the {currentYear?.name || "current"} academic year.
          </DialogDescription>
        </DialogHeader>

        {showWarning ? (
          <div className="space-y-4 fpy-2">
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-destructive shrink-0 " />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-destructive">
                    Re-Enrollment Warning
                  </p>
                  <div className="mt-2 rounded-md fbg-destructive/10 p-3">
                    <p className="text-sm font-medium text-destructive mb-2">
                      This action will:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-destructive/80">
                      <li>Delete the student&apos;s existing enrollment</li>
                      <li>Remove all associated billing records</li>
                      <li>Clear all gradebooks and grades</li>
                      <li>Create a new enrollment from scratch</li>
                    </ul>
                  </div>
                  <p className="text-sm font-medium mt-2">
                    This action cannot be undone. Are you sure you want to
                    continue?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="confirm-reenroll"
                checked={warningConfirmed}
                onCheckedChange={(checked) => setWarningConfirmed(checked === true)}
              />
              <Label htmlFor="confirm-reenroll" className="text-sm leading-tight cursor-pointer select-none">
                I understand that this will permanently delete the existing enrollment and all associated data.
              </Label>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              size='lg'
              disabled={!warningConfirmed}
              onClick={() => setShowWarning(false)}
            >
              Continue
            </Button>
          </div>
        ) : (
          <EnrollmentForm
            ref={formRef}
            student={student}
            currentYear={currentYear}
            onClose={handleClose}
          />
        )}

        {!showWarning && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <AuthButton
              roles={["registrar"]}
              onClick={handleConfirm}
              disabled={showWarning}
              loading={submitting}
              loadingText="Enrolling..."
            >
              Enroll Student
            </AuthButton>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
