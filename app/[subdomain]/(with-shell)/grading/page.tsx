"use client";

import { useMemo } from "react";
import { useGradebooks } from "@/hooks/use-grading";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import PageLayout from "@/components/dashboard/page-layout";
import { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateAction } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen02Icon,
  FileIcon,
  CheckmarkCircle02Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { GradeStatus } from "@/lib/api/grading-types";

export default function GradingOverviewPage() {
  const { data: currentYear, isLoading: yearLoading } = useCurrentAcademicYear();
  const { data: gradebooksData, isLoading: gradebooksLoading } = useGradebooks(
    currentYear?.id,
    {
      include_stats: true,
    }
  );

  const stats = useMemo(() => {
    if (!gradebooksData?.results) {
      return {
        total: 0,
        draft: 0,
        submitted: 0,
        approved: 0,
        needsReview: 0,
      };
    }

    const gradebooks = gradebooksData.results;
    return {
      total: gradebooks.length,
      draft: gradebooks.filter((g) => g.status === GradeStatus.DRAFT).length,
      submitted: gradebooks.filter((g) => g.status === GradeStatus.SUBMITTED)
        .length,
      approved: gradebooks.filter((g) => g.status === GradeStatus.APPROVED)
        .length,
      needsReview: gradebooks.filter(
        (g) =>
          g.status === GradeStatus.SUBMITTED || g.status === GradeStatus.REVIEWED
      ).length,
    };
  }, [gradebooksData]);

  const recentGradebooks = useMemo(() => {
    if (!gradebooksData?.results) return [];
    return gradebooksData.results.slice(0, 5);
  }, [gradebooksData]);

  const isLoading = yearLoading || gradebooksLoading;

  return (
    <PageLayout
      title="Grading"
      description="Manage gradebooks, assessments, and student grades"
      loading={isLoading}
      actions={
        <Link href="/grading/gradebooks">
          <Button icon={<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}>View All Gradebooks</Button>
        </Link>
      }
    >

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Gradebooks"
          value={stats.total}
          icon={BookOpen02Icon}
          loading={isLoading}
        />
        <StatsCard
          title="Draft"
          value={stats.draft}
          icon={FileIcon}
          loading={isLoading}
          variant="warning"
        />
        <StatsCard
          title="Needs Review"
          value={stats.needsReview}
          icon={FileIcon}
          loading={isLoading}
          variant="info"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={CheckmarkCircle02Icon}
          loading={isLoading}
          variant="success"
        />
      </div>

      {/* Recent Gradebooks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Gradebooks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentGradebooks.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <HugeiconsIcon icon={BookOpen02Icon} className="h-12 w-12" />
              </EmptyStateIcon>
              <EmptyStateTitle>No gradebooks yet</EmptyStateTitle>
              <EmptyStateDescription>Create your first gradebook to get started</EmptyStateDescription>
              <Link href="/grading/gradebooks">
                <EmptyStateAction>Create Gradebook</EmptyStateAction>
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-2">
              {recentGradebooks.map((gradebook) => (
                <Link
                  key={gradebook.id}
                  href={`/grading/gradebooks/${gradebook.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {gradebook.subject.name} - {gradebook.section.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {gradebook.grade_level.name} •{" "}
                      {gradebook.teacher?.full_name || "No teacher assigned"}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {gradebook.total_assessments !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        {gradebook.calculated_assessments || 0}/
                        {gradebook.total_assessments} assessments
                      </div>
                    )}
                    <Badge variant={getStatusVariant(gradebook.status)}>
                      {gradebook.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Manage Gradebooks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Create and manage gradebooks for your classes
            </p>
            <Link href="/grading/gradebooks">
              <Button variant="outline" className="w-full">
                Go to Gradebooks
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Review Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Review grades submitted by teachers
            </p>
            <Link href="/grading/review">
              <Button variant="outline" className="w-full">
                Review Grades
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Grading Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Configure assessment types and grade letters
            </p>
            <Link href="/grading/settings">
              <Button variant="outline" className="w-full">
                Manage Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  loading,
  variant = "default",
}: {
  title: string;
  value: number;
  icon: any; // HugeIcons IconSvgElement type
  loading?: boolean;
  variant?: "default" | "success" | "warning" | "info";
}) {
  const colorClass = {
    default: "text-foreground",
    success: "text-green-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  }[variant];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <HugeiconsIcon icon={Icon} className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case GradeStatus.APPROVED:
      return "default";
    case GradeStatus.SUBMITTED:
    case GradeStatus.REVIEWED:
      return "secondary";
    case GradeStatus.DRAFT:
      return "outline";
    default:
      return "outline";
  }
}
