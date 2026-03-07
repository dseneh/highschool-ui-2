"use client";

import * as React from "react";
import PageLayout from "@/components/dashboard/page-layout";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGeneralFees } from "@/lib/api2/general-fee";
import type {
  GeneralFeeDto,
  CreateGeneralFeeCommand,
  UpdateGeneralFeeCommand,
} from "@/lib/api2/finance-types";
import { getGeneralFeeColumns } from "@/components/finance/general-fee-columns";
import { GeneralFeeFormDialog } from "@/components/finance/general-fee-form-dialog";
import { DialogBox } from "@/components/ui/dialog-box";
import { Add01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/utils";
import { getQueryClient } from "@/lib/query-client";


export default function GeneralFeesPage() {
  // Data
  const feesApi = useGeneralFees();
  const { data: fees, isLoading, refetch, isFetching } = feesApi.getGeneralFees();
  const createMutation = feesApi.createGeneralFee();
  const updateMutation = feesApi.updateGeneralFee();
  const deleteMutation = feesApi.deleteGeneralFee();
  const queryClient = getQueryClient();

  const [activeTab, setActiveTab] = React.useState<string>("active");

  // Dialog states
  const [showCreate, setShowCreate] = React.useState(false);
  const [editingFee, setEditingFee] = React.useState<GeneralFeeDto | null>(null);
  const [duplicateData, setDuplicateData] = React.useState<Partial<CreateGeneralFeeCommand> | null>(null);
  const [deletingFee, setDeletingFee] = React.useState<GeneralFeeDto | null>(null);
  const [syncingFeeId, setSyncingFeeId] = React.useState<string | null>(null);

  // Separate fees by active status
  const activeFees = React.useMemo(
    () => (fees || []).filter((fee: any) => fee.active),
    [fees]
  );

  const inactiveFees = React.useMemo(
    () => (fees || []).filter((fee: any) => !fee.active),
    [fees]
  );

  const currentFees = activeTab === "active" ? activeFees : inactiveFees;

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                           */
  /* ------------------------------------------------------------------ */

  const handleCreate = (data: CreateGeneralFeeCommand | UpdateGeneralFeeCommand) => {
    createMutation.mutate(data as CreateGeneralFeeCommand, {
      onSuccess: () => {
        toast.success("Fee created successfully");
        setShowCreate(false);
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  const handleUpdate = (data: UpdateGeneralFeeCommand) => {
    if (!editingFee) return;
    updateMutation.mutate(
      { id: editingFee.id, data },
      {
        onSuccess: () => {
          toast.success("Fee updated successfully");
          setEditingFee(null);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deletingFee) return;
    deleteMutation.mutate({ id: deletingFee.id }, {
      onSuccess: () => {
        toast.success("Fee deleted successfully");
        setDeletingFee(null);
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  const handleToggleActive = React.useCallback((id: string, active: boolean) => {
    updateMutation.mutate(
      { id, data: { active } },
      {
        onSuccess: () => {
          toast.success(`Fee ${active ? "activated" : "deactivated"} successfully`);
        },
        onError: (error: unknown) => {
          toast.error(`Failed to ${active ? "activate" : "deactivate"} fee. ${getErrorMessage(error)}`);
        },
      }
    );
  }, [updateMutation]);

  const handleSyncToSections = React.useCallback((fee: GeneralFeeDto) => {
    setSyncingFeeId(fee.id);
    updateMutation.mutate(
      { id: fee.id, data: { amount: fee.amount, apply_to_all_sections: true } },
      {
        onSuccess: () => {
          toast.success(`Fee "${fee.name}" synced to all sections successfully!`);
          // Invalidate sections to refresh tuition_fees
          queryClient.invalidateQueries({ queryKey: ["sections"] });
        },
        onError: (error: unknown) => {
          toast.error(`Failed to sync fee. ${getErrorMessage(error)}`);
        },
        onSettled: () => {
          setSyncingFeeId(null);
        },
      }
    );
  }, [updateMutation, queryClient]);

  const handleUpdateAmount = React.useCallback((id: string, amount: number, applyToAllSections: boolean) => {
    updateMutation.mutate(
      { id, data: { amount, apply_to_all_sections: applyToAllSections } },
      {
        onSuccess: () => {
          if (applyToAllSections) {
            toast.success("Amount updated and synced to all sections!");
            queryClient.invalidateQueries({ queryKey: ["sections"] });
          } else {
            toast.success("Amount updated successfully!");
          }
        },
        onError: (error: unknown) => {
          toast.error(`Failed to update amount. ${getErrorMessage(error)}`);
        },
      }
    );
  }, [updateMutation, queryClient]);

  const handleUpdateTarget = React.useCallback((id: string, studentTarget: string, applyToAllSections: boolean) => {
    updateMutation.mutate(
      { id, data: { student_target: studentTarget, apply_to_all_sections: applyToAllSections } },
      {
        onSuccess: () => {
          if (applyToAllSections) {
            toast.success("Student target updated and synced to all sections!");
            queryClient.invalidateQueries({ queryKey: ["sections"] });
          } else {
            toast.success("Student target updated successfully!");
          }
        },
        onError: (error: unknown) => {
          toast.error(`Failed to update student target. ${getErrorMessage(error)}`);
        },
      }
    );
  }, [updateMutation, queryClient]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Data refreshed successfully!");
    } catch (error) {
      toast.error(`Failed to refresh data. ${getErrorMessage(error)}`);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Column actions                                                     */
  /* ------------------------------------------------------------------ */

  const handleEdit = React.useCallback((fee: GeneralFeeDto) => {
    setEditingFee(fee);
  }, []);

  const handleDeleteClick = React.useCallback((fee: GeneralFeeDto) => {
    setDeletingFee(fee);
  }, []);

  const handleDuplicate = React.useCallback((fee: GeneralFeeDto) => {
    // Create a duplicate with modified name for the create dialog (without ID)
    const duplicateFee = {
      name: `${fee.name} (Copy)`,
      amount: fee.amount,
      student_target: fee.student_target,
      description: fee.description ?? undefined,
    };
    setDuplicateData(duplicateFee);
    setShowCreate(true);
  }, []);

  const columns = React.useMemo(
    () =>
      getGeneralFeeColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
        onDuplicate: handleDuplicate,
        onToggleActive: handleToggleActive,
        onSyncToSections: handleSyncToSections,
        onUpdateAmount: handleUpdateAmount,
        onUpdateTarget: handleUpdateTarget,
        isUpdating: updateMutation.isPending,
        syncingFeeId,
      }),
    [
      handleEdit,
      handleDeleteClick,
      handleDuplicate,
      handleToggleActive,
      handleSyncToSections,
      handleUpdateAmount,
      handleUpdateTarget,
      updateMutation.isPending,
      syncingFeeId,
    ]
  );

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  const isEmpty = currentFees.length === 0;

  return (
    <>
      <PageLayout
        title="Fee Structure"
        description="Manage general fees for your school"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={isFetching}
              icon={<HugeiconsIcon icon={RefreshIcon} className="h-5 w-5" />}
            >
              Refresh
            </Button>
            <Button
              onClick={() => setShowCreate(true)}
              icon={<HugeiconsIcon icon={Add01Icon} className="h-5 w-5" />}
            >
              Create Fee
            </Button>
          </div>
        }
        loading={isLoading}
        skeleton={
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
        noData={isEmpty}
        emptyState={<div className="text-center text-muted-foreground py-8">No fees found</div>}
      >
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">
                Active Fees ({activeFees.length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive Fees ({inactiveFees.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <DataTable columns={columns} data={currentFees} />
            </TabsContent>

            <TabsContent value="inactive" className="mt-6">
              <DataTable columns={columns} data={currentFees} />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>

      {/* Create Dialog */}
      <GeneralFeeFormDialog
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) setDuplicateData(null);
        }}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
        initialData={duplicateData || undefined}
        // initialData={editingFee || undefined}
      />

      {/* Edit Dialog */}
      <GeneralFeeFormDialog
        open={!!editingFee && !!editingFee.id}
        onOpenChange={(open: boolean) => !open && setEditingFee(null)}
        onSubmit={handleUpdate}
        loading={updateMutation.isPending}
        initialData={editingFee || undefined}
        mode="edit"
      />

      {/* Delete Dialog */}
      <DialogBox
        open={!!deletingFee}
        onOpenChange={(open: boolean) => !open && setDeletingFee(null)}
        title="Delete Fee"
        description={`Are you sure you want to delete "${deletingFee?.name}"? This will also remove it from all sections.`}
        onAction={handleDelete}
        actionLoading={deleteMutation.isPending}
        actionVariant="destructive"
      />
    </>
  );
}
