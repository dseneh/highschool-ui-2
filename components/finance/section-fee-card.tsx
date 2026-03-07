"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSectionFees, useSectionFeeMutations } from "@/hooks/use-finance";
import { AddFeeDialog } from "@/components/finance/add-fee-dialog";
import { EditFeeAmountDialog } from "@/components/finance/edit-fee-amount-dialog";
import { DialogBox } from "@/components/ui/dialog-box";
import type { SectionDto } from "@/lib/api2/grade-level-types";
import type { GeneralFeeDto, SectionFeeDto } from "@/lib/api2/finance-types";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import {
  Add01Icon,
  Delete02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface SectionFeeCardProps {
  section: SectionDto;
  availableFees: GeneralFeeDto[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SectionFeeCard({ section, availableFees }: SectionFeeCardProps) {
  const { data: sectionFees, isLoading } = useSectionFees(section.id);
  const { assign, update, remove } = useSectionFeeMutations();

  // Dialog states
  const [showAddFee, setShowAddFee] = React.useState(false);
  const [editingFee, setEditingFee] = React.useState<SectionFeeDto | null>(null);
  const [deletingFee, setDeletingFee] = React.useState<SectionFeeDto | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                           */
  /* ------------------------------------------------------------------ */

  const handleAddFees = (feeIds: string[]) => {
    assign?.mutate(
      { sectionId: section.id, feeIds },
      {
        onSuccess: () => {
          toast.success("Fees assigned successfully");
          setShowAddFee(false);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleUpdateAmount = (amount: number) => {
    if (!editingFee) return;
    update.mutate(
      {
        id: editingFee.id,
        sectionId: section.id,
        payload: { amount },
      },
      {
        onSuccess: () => {
          toast.success("Fee amount updated");
          setEditingFee(null);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
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
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  // Filter out already assigned fees
  const unassignedFees = React.useMemo(() => {
    if (!sectionFees || !availableFees) return availableFees;
    const assignedFeeIds = sectionFees.map((sf) => sf.general_fee.id);
    return availableFees.filter((f) => !assignedFeeIds.includes(f.id) && f.active);
  }, [sectionFees, availableFees]);

  const totalFees = React.useMemo(() => {
    if (!sectionFees) return 0;
    return sectionFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
  }, [sectionFees]);

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{section.name}</CardTitle>
              {sectionFees && sectionFees.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {sectionFees.length} fee(s) • Total: {formatCurrency(totalFees)}
                </p>
              )}
            </div>
            <Button
              onClick={() => setShowAddFee(true)}
              size="sm"
              variant="outline"
              icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
              disabled={unassignedFees.length === 0}
            >
              Add Fee
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : !sectionFees || sectionFees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No fees assigned to this section yet.</p>
              <p className="text-sm mt-1">Click &ldquo;Add Fee&rdquo; to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Name</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectionFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">
                      {fee.general_fee.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {fee.general_fee.student_target || "All"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(fee.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={fee.active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {fee.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingFee(fee)}
                        >
                          <HugeiconsIcon
                            icon={Edit02Icon}
                            className="h-4 w-4"
                          />
                          <span className="sr-only">Edit amount</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingFee(fee)}
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            className="h-4 w-4"
                          />
                          <span className="sr-only">Remove fee</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Fee Dialog */}
      <AddFeeDialog
        open={showAddFee}
        onOpenChange={setShowAddFee}
        onSubmit={handleAddFees}
        loading={assign?.isPending}
        availableFees={unassignedFees}
      />

      {/* Edit Amount Dialog */}
      {editingFee && (
        <EditFeeAmountDialog
          open={!!editingFee}
          onOpenChange={(open: boolean) => !open && setEditingFee(null)}
          onSubmit={handleUpdateAmount}
          loading={update?.isPending}
          currentAmount={editingFee.amount}
          feeName={editingFee.general_fee.name}
        />
      )}

      {/* Delete Confirmation */}
      <DialogBox
        open={!!deletingFee}
        onOpenChange={(open: boolean) => !open && setDeletingFee(null)}
        title="Remove Fee"
        description={`Remove "${deletingFee?.general_fee.name}" from ${section.name}? Students will no longer be billed for this fee.`}
        onAction={handleDelete}
        actionLoading={remove?.isPending}
        actionVariant="destructive"
        actionLabel="Remove"
      />
    </>
  );
}
