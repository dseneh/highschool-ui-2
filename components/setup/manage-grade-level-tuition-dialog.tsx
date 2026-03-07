"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGradeLevelMutations } from "@/hooks/use-grade-level"
import type { GradeLevelDto } from "@/lib/api/grade-level-types"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const tuitionSchema = z.object({
  tuitions: z.array(
    z.object({
      id: z.string(),
      amount: z.coerce
        .number()
        .min(0, "Amount must be a positive number")
        .multipleOf(0.01, "Amount must have at most 2 decimal places"),
    })
  ),
})

type TuitionFormInput = z.infer<typeof tuitionSchema>

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ManageGradeLevelTuitionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeLevel: GradeLevelDto
}

export function ManageGradeLevelTuitionDialog({
  open,
  onOpenChange,
  gradeLevel,
}: ManageGradeLevelTuitionDialogProps) {
  const { updateTuitions } = useGradeLevelMutations()

  const form = useForm<TuitionFormInput>({
    resolver: zodResolver(tuitionSchema),
    defaultValues: {
      tuitions: gradeLevel.tuition_fees.map((fee) => ({
        id: fee.id,
        amount: fee.amount,
      })),
    },
  })

  const { control, watch, formState: { errors, isDirty }, handleSubmit, reset } = form

  // Watch tuition values to check if all are empty
  const watchedTuitions = watch("tuitions")
  const allTuititionsEmpty = watchedTuitions.every((tuition) => {
    const amount = tuition.amount
    return !amount || amount === 0
  })

  const onSubmit = async (values: TuitionFormInput) => {
    try {
      await updateTuitions.mutateAsync({
        id: gradeLevel.id,
        payload: {
          tuition_fees: values.tuitions,
        },
      })
      toast.success("Tuition fees updated successfully")
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const currencySymbol = gradeLevel.currency?.symbol || ""

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96 sm:w-96 px-3">
        <SheetHeader>
          <SheetTitle>{gradeLevel.name} Tuition Fees</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {allTuititionsEmpty && (
            <div className="flex items-start gap-2 rounded-md bg-warning/10 p-2">
              <AlertCircle className="size-4 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-warning">At least one tuition amount should have a value</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {gradeLevel.tuition_fees.map((fee, index) => (
              <div key={fee.id} className="space-y-2">
                <Label htmlFor={`tuition-${fee.id}`} className="text-sm capitalize">
                  {fee.fee_type === "new"
                    ? "New Student"
                    : fee.fee_type === "returning"
                      ? "Returning Student"
                      : fee.fee_type === "transferred"
                        ? "Transferred Student"
                        : fee.fee_type}
                </Label>
                <div className="relative">
                  {currencySymbol && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      {currencySymbol}
                    </span>
                  )}
                  <Controller
                    name={`tuitions.${index}.amount`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id={`tuition-${fee.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={currencySymbol ? "pl-8" : ""}
                        aria-invalid={!!errors.tuitions?.[index]?.amount}
                      />
                    )}
                  />
                </div>
                {errors.tuitions?.[index]?.amount && (
                  <p className="text-xs text-destructive">
                    {errors.tuitions[index]?.amount?.message}
                  </p>
                )}
              </div>
            ))}

            {gradeLevel.tuition_fees.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tuition fees configured for this grade level yet.
              </p>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  reset()
                  onOpenChange(false)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || updateTuitions.isPending}
                loading={updateTuitions.isPending}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
