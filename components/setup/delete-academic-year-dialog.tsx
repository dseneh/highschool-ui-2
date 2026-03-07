"use client";

import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DialogBox } from "@/components/ui/dialog-box";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAcademicYearMutations } from "@/hooks/use-academic-year";
import { getErrorMessage } from "@/lib/utils";
import type { AcademicYearDto } from "@/lib/api/academic-year-types";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

interface DeleteAcademicYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: AcademicYearDto | null;
}

export function DeleteAcademicYearDialog({
  open,
  onOpenChange,
  year,
}: DeleteAcademicYearDialogProps) {
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const { deleteYear } = useAcademicYearMutations();
  const [forceDelete, setForceDelete] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [showForceOption, setShowForceOption] = React.useState(false);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setForceDelete(false);
      setConfirmText("");
      setShowForceOption(false);
    }
  }, [open]);

  const handleDelete = () => {
    if (!year?.id) return;

    deleteYear.mutate(
      { id: year.id, force: forceDelete },
      {
        onSuccess: () => {
          toast.success(`Academic year "${year.name}" has been deleted`);
          onOpenChange(false);
          // Redirect to academic years page after deletion
          router.push(`/${subdomain}/setup/academic-years`);
          router.refresh();
        },
        onError: (error: unknown) => {
          const errorMessage = getErrorMessage(error);
          
          // If error indicates there are related records, show force option
          if (
            errorMessage.toLowerCase().includes("student") ||
            errorMessage.toLowerCase().includes("enrollment") ||
            errorMessage.toLowerCase().includes("grade") ||
            errorMessage.toLowerCase().includes("cannot delete")
          ) {
            setShowForceOption(true);
            toast.error("Cannot delete: Academic year has related data");
          } else {
            toast.error(errorMessage);
          }
        },
      }
    );
  };

  if (!year) return null;

  const isConfirmed = confirmText === year.name;
  const totalSemesters = year.semesters?.length ?? 0;
  const totalMarkingPeriods = year.semesters?.reduce(
    (sum, sem) => sum + (sem.marking_periods?.length ?? 0),
    0
  ) ?? 0;

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Academic Year"
      description="This action cannot be undone. All related data will be permanently removed."
      actionLabel="Delete Academic Year"
      actionLoading={deleteYear.isPending}
      onAction={handleDelete}
      actionDisabled={!isConfirmed}
      actionVariant="destructive"
      cancelLabel="Cancel"
      onCancel={() => onOpenChange(false)}
    >
      <div className="space-y-4">
        {/* Warning Alert */}
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
          <AlertDescription>
            <strong className="font-semibold">Warning:</strong> Deleting this
            academic year will permanently remove:
          </AlertDescription>
        </Alert>

        {/* Impact List */}
        <div className="ml-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Delete02Icon} className="size-4 text-destructive" />
            <span><strong>{totalSemesters}</strong> semester{totalSemesters !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Delete02Icon} className="size-4 text-destructive" />
            <span><strong>{totalMarkingPeriods}</strong> marking period{totalMarkingPeriods !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Delete02Icon} className="size-4 text-destructive" />
            <span>All <strong>student enrollments</strong> for this year</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Delete02Icon} className="size-4 text-destructive" />
            <span>All <strong>grades and assessments</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Delete02Icon} className="size-4 text-destructive" />
            <span>All <strong>billing records</strong> and transactions</span>
          </div>
        </div>

        {/* Force Delete Option (shown after first failed attempt) */}
        {showForceOption && (
          <Alert>
            <AlertDescription className="space-y-3">
              <p className="text-sm">
                This academic year has active data (students, grades, or billing).
                Check the box below to force delete.
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="force-delete"
                  checked={forceDelete}
                  onCheckedChange={(checked) => setForceDelete(checked === true)}
                />
                <Label
                  htmlFor="force-delete"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I understand that this will delete all student data, grades, and billing records
                </Label>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Confirmation Input */}
        <div className="space-y-2">
          <Label htmlFor="confirm-delete">
            Type <strong>{year.name}</strong> to confirm:
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={year.name}
            autoComplete="off"
          />
        </div>
      </div>
    </DialogBox>
  );
}
