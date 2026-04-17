"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, MessageSquareText, Star, TrendingUp } from "lucide-react";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployeePerformanceReviews } from "@/hooks/use-employee-performance-reviews";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

function formatDate(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EmployeePerformanceDetailPage() {
  const params = useParams<{ id_number: string }>();
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const employeeId = params.id_number;
  const { data: reviews = [] } = useEmployeePerformanceReviews({ employeeId });

  const averageScore = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + (review.overallScore ?? review.ratingScore), 0) / reviews.length
    : 0;

  const stats = React.useMemo<StatsCardItem[]>(() => {
    const completed = reviews.filter((review) => review.status.toLowerCase() === "completed").length;

    return [
      { title: "Reviews", value: String(reviews.length), subtitle: "Total performance cycles", icon: MessageSquareText },
      { title: "Completed", value: String(completed), subtitle: "Closed review cycles", icon: CheckCircle2 },
      { title: "Avg Score", value: averageScore.toFixed(1), subtitle: "Average recorded score", icon: Star },
      { title: "Growth", value: reviews.length > 0 ? "Tracked" : "Not started", subtitle: "Performance history status", icon: TrendingUp },
    ];
  }, [averageScore, reviews]);

  return (
    <EmployeeSubpageShell
      title="Performance"
      description="Review manager feedback, ratings, and growth history for this employee."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(subdomain ? `/${subdomain}/performance` : "/performance")}
        >
          Open Performance Hub
        </Button>
      }
    >
      {() => (
        <div className="space-y-6">
          <StatsCards items={stats} className="xl:grid-cols-4" />

          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No performance reviews have been logged for this employee yet.</p>
              ) : (
                reviews.slice(0, 8).map((review) => (
                  <div key={review.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{review.reviewTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {review.rating} • Reviewed {formatDate(review.reviewDate)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">{(review.overallScore ?? review.ratingScore).toFixed(1)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </EmployeeSubpageShell>
  );
}
