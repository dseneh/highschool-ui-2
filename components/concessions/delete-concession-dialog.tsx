import { useMutation } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { StudentConcessionDto } from "@/lib/api/billing-types"
import { useBillingsApi } from "@/lib/api2/billing/api"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"

interface DeleteConcessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  concession: StudentConcessionDto | null
  onSuccess?: () => void
}

export function DeleteConcessDialog({
  open,
  onOpenChange,
  concession,
  onSuccess,
}: DeleteConcessDialogProps) {
  const { deleteStudentConcessionApi } = useBillingsApi()

  const deleteConcessMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteStudentConcessionApi(id)
    },
    onSuccess: () => {
      toast.success("Concession deleted successfully")
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  const handleDelete = async () => {
    if (!concession) return
    deleteConcessMutation.mutate(concession.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Concession?</DialogTitle>
        </DialogHeader>
        {concession && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Student</p>
              <p className="font-medium">{concession.student?.full_name}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {concession.student?.id_number}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-xs text-red-600 dark:text-red-400 mb-1">Amount to be removed</p>
              <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                ${Number(concession.amount).toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The concession will be permanently deleted.
            </p>
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteConcessMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={deleteConcessMutation.isPending}
            loadingText="Deleting..."
          >
            Delete Concession
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
