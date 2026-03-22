"use client";

import * as React from "react";
import PageLayout from "@/components/dashboard/page-layout";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGeneralFees, useGeneralFeeMutations } from "@/hooks/use-finance";
import { useGradeLevels } from "@/hooks/use-grade-level";
import type {
  GeneralFeeDto,
  CreateGeneralFeeCommand,
  UpdateGeneralFeeCommand,
} from "@/lib/api2/finance-types";
import { getGeneralFeeColumns } from "@/components/finance/general-fee-columns";
import { GeneralFeeFormDialog } from "@/components/finance/general-fee-form-dialog";
import { SectionFeeList } from "@/components/finance/section-fee-list";
import ClassSectionSidebar from "../setup/period-times/_components/class-section-sidebar";
import { DialogBox } from "@/components/ui/dialog-box";
import { Add01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/utils";
import { getQueryClient } from "@/lib/query-client";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";


export default function GeneralFeesPage() {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(["general", "class"]).withDefault("general")
  );
  const [showInactive, setShowInactive] = React.useState(false);
  const [selectedSectionId] = useQueryState("section", { defaultValue: "" });

  // Data
  const {
    data: fees,
    isLoading: loadingFees,
    refetch: refetchFees,
    isFetching: fetchingFees,
  } = useGeneralFees();
  const {
    data: gradeLevels,
    isLoading: loadingGradeLevels,
    refetch: refetchGradeLevels,
    isFetching: fetchingGradeLevels,
  } = useGradeLevels();
  const { create: createMutation, update: updateMutation, remove: deleteMutation } = useGeneralFeeMutations();
  const queryClient = getQueryClient();

  // Dialog states
  const [showCreate, setShowCreate] = React.useState(false);
  const [editingFee, setEditingFee] = React.useState<GeneralFeeDto | null>(null);
  const [duplicateData, setDuplicateData] = React.useState<Partial<CreateGeneralFeeCommand> | null>(null);
  const [deletingFee, setDeletingFee] = React.useState<GeneralFeeDto | null>(null);
  const [syncingFeeId, setSyncingFeeId] = React.useState<string | null>(null);

  const allFees = React.useMemo(() => fees || [], [fees]);
  const visibleFees = React.useMemo(
    () => (showInactive ? allFees : allFees.filter((fee) => fee.active)),
    [allFees, showInactive]
  );

  const activeFeesCount = React.useMemo(
    () => allFees.filter((fee) => fee.active).length,
    [allFees]
  );

  const gradeLevelsWithSections = React.useMemo(
    () => (gradeLevels || []).filter((gradeLevel) => gradeLevel.sections.length > 0),
    [gradeLevels]
  );

  const selectedSection = (() => {
    if (!selectedSectionId) return null;
    for (const gradeLevel of gradeLevelsWithSections) {
      const section = gradeLevel.sections.find((candidate) => candidate.id === selectedSectionId);
      if (section) {
        return {
          id: section.id,
          name: section.name,
          section_class: section.section_class,
          gradeLevelName: gradeLevel.name,
          students: section.students,
        };
      }
    }
    return null;
  })();

  const isLoadingGeneralTab = loadingFees;
  const isLoadingClassTab = loadingFees || loadingGradeLevels;

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
      { id: editingFee.id, payload: data },
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
    deleteMutation.mutate(deletingFee.id, {
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
      { id, payload: { active } },
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
      { id: fee.id, payload: { amount: fee.amount, apply_to_all_sections: true } },
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
      { id, payload: { amount, apply_to_all_sections: applyToAllSections } },
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
      { id, payload: { student_target: studentTarget, apply_to_all_sections: applyToAllSections } },
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
      await Promise.all([
        refetchFees(),
        refetchGradeLevels(),
      ]);

      if (selectedSectionId) {
        await queryClient.invalidateQueries({ queryKey: ["sectionFees"] });
      }

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

  const isGeneralTabEmpty = visibleFees.length === 0;
  const isClassTabEmpty = !loadingGradeLevels && gradeLevelsWithSections.length === 0;

  return (
    <>
      <PageLayout
        title="Fee Structure"
        description="Configure general fees and class fee assignments in one place"
        className="overflow-visible!"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={fetchingFees || fetchingGradeLevels}
              icon={<HugeiconsIcon icon={RefreshIcon} className="h-5 w-5" />}
            >
              Refresh
            </Button>
            <Button
              onClick={() => setShowCreate(true)}
              icon={<HugeiconsIcon icon={Add01Icon} className="h-5 w-5" />}
              disabled={activeTab !== "general"}
            >
              Create Fee
            </Button>
          </div>
        }
        loading={activeTab === "general" ? isLoadingGeneralTab : isLoadingClassTab}
        skeleton={
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
        noData={activeTab === "general" ? isGeneralTabEmpty : isClassTabEmpty}
        emptyState={
          activeTab === "general" ? (
            <div className="text-center text-muted-foreground py-8">No fees found</div>
          ) : (
            <EmptyState>
              <EmptyStateTitle>No Class Sections Found</EmptyStateTitle>
              <EmptyStateDescription>
                Add sections to grade levels before assigning class fees.
              </EmptyStateDescription>
            </EmptyState>
          )
        }
      >
        <div className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value === "class" ? "class" : "general")
            }
          >
            <TabsList className={'w-full max-w-md'}>
              <TabsTrigger value="general">
                General Fees ({allFees.length})
              </TabsTrigger>
              <TabsTrigger value="class">
                Class Fees
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="text-sm text-muted-foreground">
                  Showing {visibleFees.length} of {allFees.length} fee{allFees.length !== 1 ? "s" : ""}
                  <span className="mx-2">|</span>
                  Active: {activeFeesCount}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show inactive</span>
                  <Switch checked={showInactive} onCheckedChange={setShowInactive} />
                </div>
              </div>
              <DataTable columns={columns} data={visibleFees} />
            </TabsContent>

            <TabsContent value="class" className="mt-6">
              <div className="flex items-start gap-0 -mx-1">
                <div className="sticky top-16 z-20 self-start shrink-0">
                  <ClassSectionSidebar
                    loading={loadingGradeLevels}
                    selectedSectionId={selectedSectionId || null}
                    filteredGradeLevels={gradeLevelsWithSections}
                  />
                </div>

                <div className="flex-1 min-w-0 pl-5">
                  {!selectedSection ? (
                    <div className="flex items-center justify-center rounded-xl border border-dashed py-16 text-center text-muted-foreground">
                      <div className="space-y-2">
                        <p className="font-medium">Select a class section to manage class fees</p>
                        <p className="text-sm">Choose a section from the left sidebar to continue.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* <div className="flex items-center justify-between rounded-md border p-4">
                        <div>
                          <h3 className="text-lg font-semibold">{selectedSection.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedSection.gradeLevelName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {selectedSection.students} students
                          </Badge>
                        </div>
                      </div>
                       */}
                      <SectionFeeList
                        section={{
                          id: selectedSection.id,
                          name: selectedSection.name,
                          section_class: selectedSection.section_class ?? undefined,
                        }}
                        availableFees={allFees}
                      />
                    </div>
                  )}
                </div>
              </div>
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
