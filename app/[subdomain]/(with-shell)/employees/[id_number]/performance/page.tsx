"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { ChartIcon, Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import PageLayout from "@/components/dashboard/page-layout";
import RefreshButton from "@/components/shared/refresh-button";
import EmptyStateComponent from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PerformanceReviewFormModal } from "@/components/employees/employee-performance-review-form-modal";
import { useEmployee } from "@/lib/api2/employee";
import { usePerformanceReviews, usePerformanceReviewMutations } from "@/hooks/use-hr";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type {
  CreatePerformanceReviewCommand,
  PerformanceReviewDto,
} from "@/lib/api2/hr-types";

const STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
  Draft: { variant: "outline" },
  "In Progress": { variant: "secondary" },
  Completed: { variant: "default" },
  Acknowledged: { variant: "default" },
};

const RATING_COLOR: Record<string, string> = {
  "Needs Improvement": "text-red-600",
  "Meets Expectations": "text-yellow-600",
  "Exceeds Expectations": "text-emerald-600",
  Outstanding: "text-emerald-700 font-semibold",
};

export default function EmployeePerformancePage() {
  const params = useParams();
  const idNumber = params.id_number as string;

  const employeeApi = useEmployee();
  const { data: employee, isLoading: employeeLoading } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/employees/"),
  });

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    isFetching,
    error,
    refetch,
  } = usePerformanceReviews(
    { employeeId: employee?.id ?? "" },
    { enabled: !!employee?.id },
  );

  const { create, update, remove } = usePerformanceReviewMutations(employee?.id);

  const isLoading = employeeLoading || reviewsLoading;

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState<PerformanceReviewDto | undefined>();

  const handleCreate = () => {
    setEditingReview(undefined);
    setModalOpen(true);
  };

  const handleEdit = (review: PerformanceReviewDto) => {
    setEditingReview(review);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      showToast.success("Deleted", "Performance review has been deleted");
      refetch();
    } catch (err) {
      showToast.error("Failed", getErrorMessage(err));
    }
  };

  const handleSubmit = async (data: CreatePerformanceReviewCommand) => {
    try {
      if (editingReview) {
        await update.mutateAsync({ id: editingReview.id, cmd: data });
        showToast.success("Updated", "Performance review updated");
      } else {
        await create.mutateAsync(data);
        showToast.success("Created", "Performance review added");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      showToast.error("Failed", getErrorMessage(err));
    }
  };

  return (
    <PageLayout
      title="Performance"
      description="Reviews and development tracking"
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon={<HugeiconsIcon icon={Add01Icon} size={16} />}
            onClick={handleCreate}
          >
            New Review
          </Button>
          <RefreshButton onClick={refetch} loading={isLoading || isFetching} />
        </div>
      }
      error={error}
      loading={isLoading}
      emptyState={
        <EmptyStateComponent
          title="No Performance Reviews"
          description="This employee has no performance reviews yet. Start a new review cycle."
          icon={<HugeiconsIcon icon={ChartIcon} />}
        />
      }
      noData={reviews.length === 0}
    >
      <div className="space-y-4">
        {reviews.map((review) => {
          const statusBadge = STATUS_BADGE[review.status] ?? { variant: "outline" as const };
          const ratingColor = review.rating ? RATING_COLOR[review.rating] ?? "" : "";

          return (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold">{review.reviewTitle}</h3>
                    <Badge variant={statusBadge.variant}>{review.status}</Badge>
                    {review.rating ? (
                      <span className={`text-xs ${ratingColor}`}>{review.rating}</span>
                    ) : null}
                    {review.overallScore != null ? (
                      <Badge variant="secondary">{review.overallScore}/5</Badge>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Date: {review.reviewDate}</span>
                    {review.reviewPeriod ? <span>Period: {review.reviewPeriod}</span> : null}
                    {review.reviewerName ? <span>Reviewer: {review.reviewerName}</span> : null}
                    {review.nextReviewDate ? (
                      <span>Next: {review.nextReviewDate}</span>
                    ) : null}
                  </div>

                  {review.goalsSummary ? (
                    <div>
                      <p className="text-xs font-medium">Goals</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {review.goalsSummary}
                      </p>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {review.strengths ? (
                      <div>
                        <p className="text-xs font-medium text-emerald-700">Strengths</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {review.strengths}
                        </p>
                      </div>
                    ) : null}
                    {review.improvementAreas ? (
                      <div>
                        <p className="text-xs font-medium text-amber-700">Areas for Improvement</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {review.improvementAreas}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {review.managerComments ? (
                    <div>
                      <p className="text-xs font-medium">Manager Comments</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {review.managerComments}
                      </p>
                    </div>
                  ) : null}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(review)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          );
        })}
      </div>

      {employee ? (
        <PerformanceReviewFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={handleSubmit}
          isSubmitting={create.isPending || update.isPending}
          employeeId={employee.id}
          initialData={editingReview}
        />
      ) : null}
    </PageLayout>
  );
}
