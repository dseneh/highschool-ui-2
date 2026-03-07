"use client"

import * as React from "react"
import { DialogBox } from "@/components/ui/dialog-box"
import { SelectField } from "@/components/ui/select-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { CreateStudentConcessionCommand, StudentConcessionDto } from "@/lib/api2/billing-types"
import type { StudentDto } from "@/lib/api2/student-types"
import { useStudents } from "@/lib/api2/student"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import AvatarImg from "../shared/avatar-img"

interface AddConcessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreateStudentConcessionCommand & { student: string }) => void
  submitting?: boolean
  student?: StudentDto // Optional: pre-populate student
  skipSearch?: boolean // Optional: skip search step entirely
  mode?: "create" | "edit" // Optional: edit mode
  initialValue?: StudentConcessionDto | null // Optional: pre-populate form with existing concession
  studentBalance?: number // Optional: student's current balance
  totalBill?: number // Optional: student's total bill
  currencySymbol?: string // Optional: currency symbol
}

export function AddConcessionDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  student: initialStudent,
  skipSearch = false,
  mode = "create",
  initialValue = null,
  studentBalance: initialBalance = 0,
  totalBill: initialTotalBill = 0,
  currencySymbol: initialCurrency = "$",
}: AddConcessionDialogProps) {
  const studentsApi = useStudents()

  // Step: "search" | "form"
  const [step, setStep] = React.useState<"search" | "form">(skipSearch ? "form" : "search")
  const [searchId, setSearchId] = React.useState("")
  const [queryId, setQueryId] = React.useState("")
  const [student, setStudent] = React.useState<StudentDto | null>(initialStudent ?? null)

  // Use React Query for student fetching
  const { data: studentData, refetch, isLoading: searching, isError } = studentsApi.getStudent(
    queryId,
    { enabled: false }
  )

  // Watch for student data changes
  React.useEffect(() => {
    if (studentData && !isError) {
      setStudent(studentData as StudentDto)
      toast.success(`Student found: ${(studentData as StudentDto).full_name}`)
      setStep("form")
    } else if (isError && queryId) {
      toast.error("Student not found with this ID")
    }
  }, [studentData, isError, queryId])

  // Form state
  const [concessionType, setConcessionType] = React.useState<"percentage" | "flat">("percentage")
  const [target, setTarget] = React.useState<"entire_bill" | "tuition" | "other_fees">("entire_bill")
  const [value, setValue] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [studentBalance, setStudentBalance] = React.useState(0)
  const [totalBill, setTotalBill] = React.useState(0)
  const [currencySymbol, setCurrencySymbol] = React.useState("$")

  // Reset on open/close
  React.useEffect(() => {
    if (open) {
      // In edit mode: pre-populate from initialValue
      if (mode === "edit" && initialValue) {
        setStudent(initialStudent || null)
        setStep("form")
        setConcessionType(initialValue.concession_type)
        setTarget(initialValue.target)
        setValue(String(initialValue.value))
        setNotes(initialValue.notes ?? "")
        setStudentBalance(initialBalance)
        setTotalBill(initialTotalBill)
        setCurrencySymbol(initialCurrency)
        return
      }
      
      // In create mode: handle student pre-selection
      if (initialStudent) {
        setStudent(initialStudent)
        setStep("form")
      } else {
        setStep(skipSearch ? "form" : "search")
        setSearchId("")
        setQueryId("")
        setStudent(null)
      }
      // Always reset form fields (for create mode)
      setConcessionType("percentage")
      setTarget("entire_bill")
      setValue("")
      setNotes("")
      setStudentBalance(initialBalance)
      setTotalBill(initialTotalBill)
      setCurrencySymbol(initialCurrency)
    }
  }, [open, initialStudent, skipSearch, mode, initialValue, initialBalance, initialTotalBill, initialCurrency])

  async function handleSearch() {
    if (!searchId.trim()) {
      toast.error("Please enter a student ID")
      return
    }

    setQueryId(searchId.trim())
    refetch()
  }

  const numericValue = Number(value)
  const isValueValid =
    concessionType === "percentage"
      ? numericValue > 0 && numericValue <= 100
      : numericValue > 0

  const isValid = value.trim().length > 0 && Number.isFinite(numericValue) && isValueValid

  // Calculate the concession amount
  const projectedConcessionAmount =
    concessionType === "percentage"
      ? (totalBill * numericValue) / 100
      : numericValue

  // Calculate projected balance
  const projectedBalance = studentBalance - projectedConcessionAmount

  // Check if concession amount equals or exceeds balance
  const concessionCoversBalance = projectedConcessionAmount >= studentBalance && studentBalance > 0

  const handleSubmit = () => {
    if (!isValid || !student) return
    onSubmit({
      concession_type: concessionType,
      target,
      value: numericValue,
      notes: notes.trim() || undefined,
      active: true,
      student: student.id,
    })
  }

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit Concession" : "Add Concession"}
      description={
        step === "search"
          ? "Enter the student ID to apply a concession."
          : mode === "edit"
          ? `Editing concession for ${student?.full_name}`
          : `Concession for ${student?.full_name}`
      }
      actionLabel={step === "form" ? (mode === "edit" ? "Save Changes" : "Apply Concession") : undefined}
      onAction={step === "form" ? handleSubmit : undefined}
      actionLoading={submitting}
      actionLoadingText={mode === "edit" ? "Saving…" : "Applying…"}
      actionDisabled={step === "form" ? !isValid : true}
      footer={step === "search" ? null : undefined}
      className="sm:max-w-lg"
      roles={["finance", "registrar", "accountant"]}
    >
      {step === "search" ? (
        <div className="flex flex-col items-center justify-center py-8 gap-6">
          <div className="max-w-sm w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-search">Student ID *</Label>
              <Input
                id="student-search"
                placeholder="Enter student ID number"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                disabled={searching}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the student&apos;s ID number to search and continue with the concession.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleSearch}
              loading={searching}
              loadingText="Searching…"
              disabled={!searchId.trim() || searching}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 py-2">
          {/* Student banner */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2">
                <AvatarImg 
                  src={student?.photo}
                  alt={student?.full_name}
                  className="w-12 h-12 rounded-full"
                />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {student?.full_name}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  ID: {student?.id_number}
                </p>
              </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStudent(null)
                  setQueryId("")
                  setStep("search")
                }}
                disabled={skipSearch || !!initialStudent}
              >
                Change
              </Button>
            </div>
          </div>

          {/* Balance Information Card */}
          {studentBalance > 0 && (
            <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Current Balance
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {currencySymbol}
                    {studentBalance.toLocaleString()}
                  </span>
                </div>

                {value && isValueValid && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Concession Amount
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        -{currencySymbol}
                        {projectedConcessionAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Projected Balance
                      </span>
                      <span
                        className={cn(
                          "text-sm font-bold",
                          projectedBalance > 0 ? "text-red-600" : "text-green-600"
                        )}
                      >
                        {currencySymbol}
                        {Math.max(0, projectedBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Balance Coverage Alert */}
          {concessionCoversBalance && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                This concession will fully cover the student balance.
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Alert */}
          {value && !isValueValid && (
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                {concessionType === "percentage"
                  ? "Percentage must be between 0 and 100"
                  : "Amount must be greater than 0"}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label>Concession Type *</Label>
            <SelectField
              value={concessionType}
              onValueChange={(v) => setConcessionType(v as "percentage" | "flat")}
              items={[
                { value: "percentage", label: "Percentage" },
                { value: "flat", label: "Flat Value" },
              ]}
              placeholder="Select concession type"
            />
          </div>

          <div className="grid gap-2">
            <Label>Target *</Label>
            <SelectField
              value={target}
              onValueChange={(v) => setTarget(v as "entire_bill" | "tuition" | "other_fees")}
              items={[
                { value: "entire_bill", label: "Entire Bill" },
                { value: "tuition", label: "Tuition Only" },
                { value: "other_fees", label: "Other Fees Only" },
              ]}
              placeholder="Select target"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="concession-value">
              Value * {concessionType === "percentage" ? "(%)" : "(Amount)"}
            </Label>
            <Input
              id="concession-value"
              type="number"
              min="0"
              step="0.01"
              max={concessionType === "percentage" ? "100" : undefined}
              placeholder={concessionType === "percentage" ? "e.g. 10" : "e.g. 5000"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
            {concessionType === "percentage" && totalBill > 0 && (
              <p className="text-xs text-muted-foreground">
                Calculated amount: {currencySymbol}
                {((totalBill * numericValue) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              rows={2}
              placeholder="Reason or context for this concession"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}
    </DialogBox>
  )
}
