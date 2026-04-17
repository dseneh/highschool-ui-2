"use client";

import * as React from "react";
import {
  Alert02Icon,
  ChartIcon,
  FileIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Plus } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
import PageLayout from "@/components/dashboard/page-layout";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import EmptyStateComponent from "@/components/shared/empty-state";
import RefreshButton from "@/components/shared/refresh-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceReviewFormModal } from "@/components/performance/performance-review-form-modal";
import { PerformanceReviewsTable } from "@/components/performance/performance-reviews-table";
import { useEmployees } from "@/hooks/use-employee";
import {
  useEmployeePerformanceReviewMutations,
  useEmployeePerformanceReviews,
} from "@/hooks/use-employee-performance-reviews";
import type { CreateEmployeePerformanceReviewCommand } from "@/lib/api2/employee-performance-review-types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";

export default function PerformancePage() {
  const { data: records = [], isLoading, error, isFetching, refetch } = useEmployeePerformanceReviews();
  const { data: employees = [] } = useEmployees();
  const { create } = useEmployeePerformanceReviewMutations();

  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const completedCount = records.filter((item) => item.status.toLowerCase() === "completed").length;
  const inProgressCount = records.filter((item) => item.status.toLowerCase() === "in progress").length;
  const needsAttentionCount = records.filter((item) => item.rating.toLowerCase() === "needs improvement").length;
  const averageScore = records.length > 0
    ? records.reduce((sum, item) => sum + (item.overallScore ?? item.ratingScore), 0) / records.length
    : 0;

  const statsItems = React.useMemo<StatsCardItem[]>(
    () => [
      {
        title: "Performance Reviews",
        value: String(records.length),
        subtitle: "Recorded employee assessments",
        icon: FileIcon,
      },
      {
        title: "Completed",
        value: String(completedCount),
        subtitle: "Finalized review cycles",
        icon: ChartIcon,
      },
      {
        title: "In Progress",
        value: String(inProgressCount),
        subtitle: "Reviews still being worked on",
        icon: UserGroupIcon,
      },
      {
        title: "Average Score",
        value: averageScore.toFixed(1),
        subtitle: `${needsAttentionCount} need extra support`,
        icon: Alert02Icon,
      },
    ],
    [averageScore, completedCount, inProgressCount, needsAttentionCount, records.length]
  );

  const handleCreateReview = async (payload: CreateEmployeePerformanceReviewCommand) => {
    setIsSubmitting(true);
    try {
      await create.mutateAsync(payload);
      showToast.success("Review saved", "Employee performance review created successfully");
      setShowReviewModal(false);
      refetch();
    } catch (submitError) {
      showToast.error("Create failed", getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Performance Reviews"
      description="Track employee review cycles, ratings, feedback, and development actions"
      actions={
        <div className="flex items-center gap-2">
          <AuthButton roles="admin" disable onClick={() => setShowReviewModal(true)} icon={<Plus />}>
            Add Review
          </AuthButton>
          <RefreshButton onClick={refetch} loading={isLoading || isFetching} />
        </div>
      }
      error={error}
      loading={isLoading}
      emptyState={
        <EmptyStateComponent
          title="No performance reviews yet"
          description="Start by adding the first employee review cycle."
          actionTitle="Add Review"
          handleAction={() => setShowReviewModal(true)}
        />
      }
      noData={!isLoading && records.length === 0}
    >
      <div className="space-y-6">
        <StatsCards items={statsItems} className="xl:grid-cols-4" />

        <Card>
          <CardHeader>
            <CardTitle>Review Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceReviewsTable records={records} employees={employees} onRefresh={refetch} />
          </CardContent>
        </Card>
      </div>

      <PerformanceReviewFormModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        onSubmit={handleCreateReview}
        isSubmitting={isSubmitting}
        employees={employees}
      />
    </PageLayout>
  );
}
