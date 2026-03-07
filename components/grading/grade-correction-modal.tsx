import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { showToast } from "@/lib/toast"
import { correctGrade } from "@/lib/api/grading-service"
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain"
import { getErrorMessage } from "@/lib/utils"
import { DialogBox } from "../ui/dialog-box"
import { getQueryClient } from "@/lib/query-client"

interface GradeCorrectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeId: string
  studentName: string
  currentScore: number | null
  maxScore: number
  onSuccess?: () => void
}

export function GradeCorrectionModal({
  open,
  onOpenChange,
  gradeId,
  studentName,
  currentScore,
  maxScore,
  onSuccess,
}: GradeCorrectionModalProps) {
  const subdomain = useTenantSubdomain()
  const queryClient = getQueryClient()
  const [newScore, setNewScore] = useState<string>(currentScore?.toString() || "")
  const [comment, setComment] = useState<string>("")
  const [reason, setReason] = useState<string>("")

  const correction = useMutation({
    mutationFn: async () => {
      return await correctGrade(subdomain, gradeId, {
        score: newScore ? parseFloat(newScore) : null,
        comment: comment || null,
        change_reason: reason,
      })
    },
    onSuccess: () => {
      showToast.success("Grade corrected successfully")
      setNewScore("")
      setComment("")
      setReason("")
      onOpenChange(false)
      
      // Invalidate queries to reflect changes
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      queryClient.invalidateQueries({ queryKey: ['grade-history'] })
      queryClient.invalidateQueries({ queryKey: ['final-grades'] })
      
      onSuccess?.()
    },
    onError: (error: any) => {
      showToast.error(getErrorMessage(error))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (newScore && parseFloat(newScore) > maxScore) {
      showToast.error(`Score cannot exceed ${maxScore}`)
      return
    }

    if (newScore && parseFloat(newScore) < 0) {
      showToast.error("Score cannot be negative")
      return
    }

    if (!reason.trim()) {
      showToast.error("Please provide a reason for the correction")
      return
    }

    correction.mutate()
    queryClient.invalidateQueries({ queryKey: ["sectionFinalGrades"] });
  }

  return (
    <DialogBox 
    open={open} 
    onOpenChange={onOpenChange}
    title={<div>Correct Grade for {studentName}</div>}
    description={`Make grade corrections`}
    cancelLabel={false}
    >
       <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Score Display */}
          <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-xl text-sm">
            <span className="text-muted-foreground">Current Score: </span>
            <span className="font-medium">
              {currentScore !== null ? `${currentScore} / ${maxScore}` : "Not set"}
            </span>
          </div>

          {/* New Score */}
          <div className="space-y-3 fmax-w-[150px]">
            <label className="text-sm font-semibold">New Score</label>
            <InputGroup className="py-4">
              <InputGroupInput
                type="number"
                step="0.01"
                
                min="0"
                max={maxScore}
                value={newScore}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewScore(e.target.value)}
                placeholder={`0 to ${maxScore}`}
                className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&]:[-moz-appearance:textfield]"
              />
              <InputGroupAddon align="inline-end" className="h-full text-xs text-muted-foreground pointer-events-none bg-transparent">
                / {maxScore}
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Comment (Optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any notes about this correction"
              className="resize-none h-20"
            />
          </div>

          {/* Reason for Correction */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for Correction</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., 'Student appealed', 'Grading error', 'Re-graded assignment'"
              className="resize-none h-20"
              required
            />
            <div className="text-[12px] text-muted-foreground">Please provide a reason for the correction.</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={correction.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={correction.isPending || !newScore || !reason.trim()}
              loading={correction.isPending}
            >
              Submit change
            </Button>
          </div>
        </form>
    </DialogBox>
  )
}
