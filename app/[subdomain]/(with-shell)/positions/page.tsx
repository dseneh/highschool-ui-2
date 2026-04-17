"use client";

import * as React from "react";
import { PositionsTable } from "@/components/positions/positions-table";
import { PositionFormModal } from "@/components/positions/position-form-modal";
import { AuthButton } from "@/components/auth/auth-button";
import { useMemo, useCallback } from "react";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type {
  CreateEmployeePositionCommand,
  EmployeePositionDto,
} from "@/lib/api2/employee-types";
import PageLayout from "@/components/dashboard/page-layout";
import RefreshButton from "@/components/shared/refresh-button";
import EmptyStateComponent from "@/components/shared/empty-state";
import { Plus } from "lucide-react";
import {
  useEmployeeMutations,
  useEmployeePositions,
} from "@/hooks/use-employee";

export default function PositionsPage() {
  const { data, isLoading, error, isFetching, refetch } = useEmployeePositions();
  const { createPosition } = useEmployeeMutations();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCreateSubmit = async (formData: CreateEmployeePositionCommand) => {
    setIsSubmitting(true);
    try {
      await createPosition.mutateAsync(formData);
      showToast.success(
        "Position created",
        "The position has been added to the system",
      );
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      showToast.error("Create failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const positionsList = useMemo<EmployeePositionDto[]>(() => data ?? [], [data]);
  
  if (error) {
    return (
      <PageLayout
        title="Positions"
        description="Manage position titles and roles in your institution"
      >
        <div className="text-center text-red-500">
          Error loading positions: {getErrorMessage(error)}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Positions"
      description="Manage position titles and roles in your institution"
      actions={
       <div className="flex items-center gap-2">
         <AuthButton
          roles="admin"
          disable
          onClick={() => setShowCreateModal(true)}
          icon={<Plus />}
        >
          Add Position
        </AuthButton>
        <RefreshButton
              onClick={handleRefresh}
              loading={isLoading || isFetching}
              />
       </div>
      }
      error={error}
      emptyState={
        <EmptyStateComponent 
         title="No positions yet"
          description="Create your first position to support employee onboarding and organization setup."
          actionTitle="Add Position"
          handleAction={() => setShowCreateModal(true)}
        />
      }
      loading={isLoading}
      filterActions={
        <PositionFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
      />
      }
    >
      <PositionsTable positions={positionsList} onRefresh={refetch} />
    </PageLayout>
  );
}
