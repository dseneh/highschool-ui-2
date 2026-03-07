"use client";

import * as React from "react";
import { useStaff } from "@/lib/api2/staff";
import {
  BriefcaseIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { PositionsTable } from "@/components/positions/positions-table";
import { PositionFormModal } from "@/components/positions/position-form-modal";
import { AuthButton } from "@/components/auth/auth-button";
import { useMemo, useCallback } from "react";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type { Position } from "@/lib/api2/staff/types";
import PageLayout from "@/components/dashboard/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import RefreshButton from "@/components/shared/refresh-button";
import EmptyStateComponent from "@/components/shared/empty-state";
import { Plus } from "lucide-react";

export default function PositionsPage() {
  const staffApi = useStaff();
  const { data, isLoading, error, isFetching, refetch } = staffApi.getPositions({});
  const createMutation = staffApi.createPosition();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCreateSubmit = async (formData: Partial<Position>) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(formData as any);
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

  const positionsList = useMemo<Position[]>(() => {
    if (Array.isArray(data)) return data as Position[];
    return data?.results || [];
  }, [data]);
  
  const isEmpty = !isLoading && positionsList.length === 0;

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
          description="Create your first position to get started with staff management."
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
