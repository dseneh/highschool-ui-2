"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state"
import { HugeiconsIcon } from "@hugeicons/react"
import { Coins01Icon, ArrowDown01Icon, Invoice01Icon } from "@hugeicons/core-free-icons"
import type { StudentConcessionDto } from "@/lib/api2/billing-types"
import apiClient from "@/lib/api2/client"
import { toast } from "sonner"
import { getErrorMessage, cn } from "@/lib/utils"
import { Pencil, Trash } from "lucide-react"
import { AuthButton } from "../auth/auth-button"

interface ConcessionsTabProps {
  concessions: StudentConcessionDto[]
  loading?: boolean
  currencySymbol?: string
  onEdit?: (concession: StudentConcessionDto) => void
  onDelete?: (concession: StudentConcessionDto) => void
  onDeleteSuccess?: () => void
}

// Concession Card Component
function ConcessionCard({
  concession,
  currencySymbol,
  onEdit,
  onDelete,
}: {
  concession: StudentConcessionDto
  currencySymbol: string
  onEdit?: (concession: StudentConcessionDto) => void
  onDelete?: (concession: StudentConcessionDto) => void
}) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="size-10 shrink-0 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-semibold text-base capitalize">
                  {concession.target.replace(/_/g, " ")}
                </h4>
                <Badge
                  variant={concession.active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {concession.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="capitalize text-xs">
                  {concession.concession_type}
                </Badge>
                <span>•</span>
                <span className="font-medium">
                  {concession.concession_type === "percentage"
                    ? `${concession.value}%`
                    : `${currencySymbol}${Number(concession.value).toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <AuthButton
              disable
              variant="ghost"
              size="sm"
              icon={<Pencil className="size-4" />}
              onClick={() => onEdit?.(concession)}
              roles={["finance", "registrar", "accountant"]}
              className="h-8 w-8 p-0"
            />
            <AuthButton
              disable
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
              icon={<Trash className="size-4" />}
              onClick={() => onDelete?.(concession)}
              roles={["finance", "registrar", "accountant"]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
              Concession Amount
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {currencySymbol}{Number(concession.amount).toLocaleString()}
            </p>
          </div>
          {concession.notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                Notes
              </p>
              <p className="text-sm text-foreground">{concession.notes}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export function ConcessionsTab({
  concessions,
  loading = false,
  currencySymbol = "$",
  onEdit,
  onDelete,
  onDeleteSuccess,
}: ConcessionsTabProps) {
  const [selectedForDelete, setSelectedForDelete] = useState<StudentConcessionDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (concession: StudentConcessionDto) => {
    setSelectedForDelete(concession)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedForDelete) return

    setIsDeleting(true)
    try {
      await apiClient.delete(`concessions/${selectedForDelete.id}/`)
      toast.success("Concession deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedForDelete(null)
      onDeleteSuccess?.()
      onDelete?.(selectedForDelete)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="h-40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (concessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState className="h-64 border-none p-0">
            <EmptyStateIcon>
              <HugeiconsIcon icon={Coins01Icon} />
            </EmptyStateIcon>
            <EmptyStateTitle className="text-sm font-medium">
              No concessions applied
            </EmptyStateTitle>
            <EmptyStateDescription className="text-xs">
              Start by adding a concession for this student.
            </EmptyStateDescription>
          </EmptyState>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {concessions.map((concession) => (
          <ConcessionCard
            key={concession.id}
            concession={concession}
            currencySymbol={currencySymbol}
            onEdit={onEdit}
            onDelete={() => handleDeleteClick(concession)}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Concession?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to delete the concession for{" "}
              <span className="font-medium">{selectedForDelete?.target.replace(/_/g, " ")}</span>.
              This action cannot be undone.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-2">
              <p className="text-sm font-medium text-red-900 dark:text-red-300">
                Concession Details
              </p>
              <p className="text-sm text-red-800 dark:text-red-400">
                <span className="font-medium">Type:</span>{" "}
                <span className="capitalize">{selectedForDelete?.concession_type}</span>
              </p>
              <p className="text-sm text-red-800 dark:text-red-400">
                <span className="font-medium">Amount:</span>{" "}
                {currencySymbol}
                {selectedForDelete?.amount ? Number(selectedForDelete.amount).toLocaleString() : "0"}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedForDelete(null)
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                loading={isDeleting}
                loadingText="Deleting..."
              >
                Delete Concession
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
