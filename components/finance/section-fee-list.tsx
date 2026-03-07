"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StudentTargetCellPopover } from "@/components/finance/student-target-cell-popover";
import { formatCurrency } from "@/lib/utils";
import { useSectionFees, useSectionFeeMutations, useGeneralFeeMutations } from "@/hooks/use-finance";
import { Add01Icon, Edit02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddFeeDialog } from "@/components/finance/add-fee-dialog";
import { EditFeeAmountDialog } from "@/components/finance/edit-fee-amount-dialog";
import { DialogBox } from "@/components/ui/dialog-box";
import { toast } from "sonner";
import {getErrorMessage, cn} from '@/lib/utils';
import type { GeneralFeeDto, SectionFeeDto } from "@/lib/api2/finance-types";
import {STUDENT_TARGET_LABELS, TARGET_COLORS} from '@/components/finance/utils';
import { Pencil, Trash2 } from "lucide-react";

interface SectionFeeListProps {
  section: {
    id: string;
    name: string;
    tuition_fees?: number;
  };
  availableFees: GeneralFeeDto[];
}

export function SectionFeeList({ section, availableFees }: SectionFeeListProps) {
  const { data: sectionFees, isLoading } = useSectionFees(section.id);
  const { assign, update, remove } = useSectionFeeMutations();
  const { update: updateGeneralFee } = useGeneralFeeMutations();

  // Dialog states
  const [showAddFee, setShowAddFee] = React.useState(false);
  const [editingFee, setEditingFee] = React.useState<SectionFeeDto | null>(null);
  const [deletingFee, setDeletingFee] = React.useState<SectionFeeDto | null>(null);

  // Get unassigned fees
  const unassignedFees = React.useMemo(() => {
    const assignedFeeIds = (sectionFees || []).map((sf) => sf.general_fee.id);
    return availableFees.filter((f) => !assignedFeeIds.includes(f.id) && f.active);
  }, [availableFees, sectionFees]);

  // Calculate total
  const totalFees = React.useMemo(() => {
    return (sectionFees || [])
      .filter((sf) => sf.active)
      .reduce((sum, sf) => sum + sf.amount, 0);
  }, [sectionFees]);

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                           */
  /* ------------------------------------------------------------------ */

  const handleAddFees = (feeIds: string[]) => {
    assign.mutate(
      { sectionId: section.id, feeIds },
      {
        onSuccess: () => {
          toast.success("Fees added successfully");
          setShowAddFee(false);
        },
        onError: (error: unknown) => {
          toast.error(`Failed to add fees. ${getErrorMessage(error)}`);
        },
      }
    );
  };

  const handleUpdateAmount = (amount: number) => {
    if (!editingFee) return;
    update.mutate(
      { id: editingFee.id, sectionId: section.id, payload: { amount } },
      {
        onSuccess: () => {
          toast.success("Fee amount updated successfully");
          setEditingFee(null);
        },
        onError: (error: unknown) => {
          toast.error(`Failed to update amount. ${getErrorMessage(error)}`);
        },
      }
    );
  };

  const handleToggleActive = (fee: SectionFeeDto, active: boolean) => {
    update.mutate(
      { id: fee.id, sectionId: section.id, payload: { active } },
      {
        onSuccess: () => {
          toast.success(`Fee ${active ? "activated" : "deactivated"} successfully`);
        },
        onError: (error: unknown) => {
          toast.error(`Failed to toggle fee. ${getErrorMessage(error)}`);
        },
      }
    );
  };

  const handleUpdateTarget = (feeId: string, studentTarget: string, applyToAllSections: boolean) => {
    updateGeneralFee.mutate(
      { id: feeId, payload: { student_target: studentTarget, apply_to_all_sections: applyToAllSections } },
      {
        onSuccess: () => {
          if (applyToAllSections) {
            toast.success("Student target updated and synced to all sections!");
          } else {
            toast.success("Student target updated successfully!");
          }
        },
        onError: (error: unknown) => {
          toast.error(`Failed to update student target. ${getErrorMessage(error)}`);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deletingFee) return;
    remove.mutate(
      { id: deletingFee.id, sectionId: section.id },
      {
        onSuccess: () => {
          toast.success("Fee removed from section");
          setDeletingFee(null);
        },
        onError: (error: unknown) => {
          toast.error(`Failed to remove fee. ${getErrorMessage(error)}`);
        },
      }
    );
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  if (isLoading) {
    return <div className="py-4 text-muted-foreground text-sm">Loading fees...</div>;
  }
  const feeCount = sectionFees?.length || 0;     

  return (
    <>
      <div className="space-y-4">
        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {feeCount} fee{feeCount !== 1 ? "s" : ""} assigned | Total: {formatCurrency(totalFees)}
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddFee(true)}
            disabled={unassignedFees.length === 0}
            icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
          >
            Add Fees
          </Button>
        </div>

        {/* Fees Table */}
        {sectionFees && sectionFees.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-2 px-4 font-medium">Fee Name</th>
                  <th className="text-center py-2 px-4 font-medium">Target</th>
                  <th className="text-right py-2 px-4 font-medium">Amount</th>
                  <th className="text-center py-2 px-4 font-medium">Status</th>
                  <th className="text-center py-2 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sectionFees.map((fee) => (
                  <tr key={fee.id} className="border-t">
                    <td className="py-2 px-4">
                      <div className="font-medium">{fee.general_fee.name}</div>
                      {fee.general_fee.description && (
                        <div className="text-xs text-muted-foreground">
                          {fee.general_fee.description}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                       <Badge className={cn("text-xs font-normal capitalize", TARGET_COLORS[fee.general_fee.student_target])}>
                        {fee.general_fee.student_target || "All"} Students
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-right font-semibold">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant={fee.active ? "default" : "secondary"} className="text-xs">
                          {fee.active ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={fee.active}
                          onCheckedChange={(checked) => handleToggleActive(fee, checked)}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingFee(fee)}
                          title="Edit amount"
                          icon={<Pencil className="size-3" />}
                        >
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingFee(fee)}
                          title="Remove fee"
                          icon={<Trash2 className="size-3" />}
                        >
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No fees assigned to this section yet.
          </div>
        )}
      </div>

      {/* Add Fee Dialog */}
      <AddFeeDialog
        open={showAddFee}
        onOpenChange={setShowAddFee}
        onSubmit={handleAddFees}
        availableFees={unassignedFees}
        loading={assign.isPending}
      />

      {/* Edit Amount Dialog */}
      {editingFee && (
        <EditFeeAmountDialog
          open={!!editingFee}
          onOpenChange={(open: boolean) => !open && setEditingFee(null)}
          onSubmit={handleUpdateAmount}
          loading={update.isPending}
          currentAmount={editingFee.amount}
          feeName={editingFee.general_fee.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DialogBox
        open={!!deletingFee}
        onOpenChange={(open: boolean) => !open && setDeletingFee(null)}
        title="Remove Fee"
        description={`Are you sure you want to remove "${deletingFee?.general_fee.name}" from this section?`}
        onAction={handleDelete}
        actionLoading={remove.isPending}
        actionVariant="destructive"
        actionLabel="Yes, remove"
      />
    </>
  );
}
