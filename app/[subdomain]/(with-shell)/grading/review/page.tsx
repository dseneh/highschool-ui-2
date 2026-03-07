"use client";

import { useMemo } from "react";
import { useQueryState } from "nuqs";
import { useGradebooks } from "@/hooks/use-grading";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import PageLayout from "@/components/dashboard/page-layout";
import { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GradeLevelSelect,
  SectionSelect,
} from "@/components/shared/data-reusable";
import {
  FileIcon,
} from "@hugeicons/core-free-icons";
import { GradeStatus } from "@/lib/api2/grading-types";
import RefreshButton from "@/components/shared/refresh-button";
import { GradebookCard } from "@/components/grading/gradebook-card";

export default function ReviewGradesPage() {
  const [gradeLevelFilter, setGradeLevelFilter] = useQueryState("gradeLevel", {
    defaultValue: "",
  });
  const [sectionFilter, setSectionFilter] = useQueryState("section", {
    defaultValue: "",
  });

  const { data: currentYear } = useCurrentAcademicYear();

  const apiParams: Record<string, string | boolean> = {
    status: GradeStatus.PENDING,
    include_stats: true,
    ...(sectionFilter && { section: sectionFilter }),
  };

  const { 
    data: gradebooksData, 
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGradebooks(
    currentYear?.id,
    apiParams
  );

  // Filter gradebooks client-side by grade level
  const filteredGradebooks = useMemo(() => {
    const allGradebooks = Array.isArray(gradebooksData)
      ? gradebooksData
      : gradebooksData?.results || [];
    if (!gradeLevelFilter) {
      return allGradebooks;
    }
    return allGradebooks.filter(
      (gb: any) => gb.grade_level?.id === gradeLevelFilter,
    );
  }, [gradebooksData, gradeLevelFilter]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "outline", label: string }> = {
      [GradeStatus.PENDING]: { variant: "secondary", label: "Pending Review" },
      [GradeStatus.SUBMITTED]: { variant: "secondary", label: "Submitted" },
      [GradeStatus.REVIEWED]: { variant: "outline", label: "Reviewed" },
    };
    const config = statusMap[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <PageLayout
      title="Review Grades"
      description="Review and approve gradebooks submitted by teachers"
      loading={isLoading}
      noData={
        filteredGradebooks.length === 0 || !sectionFilter || !gradeLevelFilter
      }
      error={error}
      emptyState={
        <EmptyState>
          <EmptyStateIcon>
            <HugeiconsIcon icon={FileIcon} className="h-12 w-12" />
          </EmptyStateIcon>
          <EmptyStateTitle>
            {sectionFilter
              ? "No gradebooks found"
              : "Select a grade level and section"}
          </EmptyStateTitle>
          <EmptyStateDescription>
            {sectionFilter
              ? "No gradebooks are awaiting review for this section"
              : "Choose a grade level and section to load gradebooks"}
          </EmptyStateDescription>
        </EmptyState>
      }
      skeleton={
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      }
      actions={
        <RefreshButton
          onClick={() => refetch()}
          loading={isLoading || isFetching}
        />
      }
      filterActions={
        <div className="mb-6 flex flex-wrap items-center gap-4 w-full">
          <GradeLevelSelect
            useUrlState={false}
            value={gradeLevelFilter}
            onChange={(value) => {
              setGradeLevelFilter(value);
              setSectionFilter("");
            }}
            placeholder="Select grade level"
            selectClassName="w-full md:w-xs"
          />
          <SectionSelect
            useUrlState={false}
            gradeLevelId={gradeLevelFilter || ""}
            value={sectionFilter}
            onChange={setSectionFilter}
            placeholder="Select section"
            selectClassName="w-full md:w-xs"
          />
        </div>
      }
    >
      {sectionFilter && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredGradebooks.map((gradebook: any) => (
            <GradebookCard
              key={gradebook.id}
              gradebook={gradebook}
              statusBadge={getStatusBadge(gradebook.status)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
