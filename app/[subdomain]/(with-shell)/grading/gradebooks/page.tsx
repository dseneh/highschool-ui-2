"use client";

import { useState, useMemo } from "react";
import { useQueryState } from "nuqs";
import { useGrading } from "@/lib/api2/grading";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import PageLayout from "@/components/dashboard/page-layout";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GradeLevelSelect,
  SectionSelect,
} from "@/components/shared/data-reusable";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen02Icon,
  MoreVerticalIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { CreateGradebookDialog } from "@/components/grading/create-gradebook-dialog";
import { WandSparkles } from "lucide-react";
import RefreshButton from "@/components/shared/refresh-button";
import { GradebookCard } from "@/components/grading/gradebook-card";

export default function GradebooksPage() {
  const [gradeLevelFilter, setGradeLevelFilter] = useQueryState("gradeLevel", {
    defaultValue: "",
  });
  const [sectionFilter, setSectionFilter] = useQueryState("section", {
    defaultValue: "",
  });

  const { data: currentYear } = useCurrentAcademicYear();
  const grading = useGrading();

  const apiParams: Record<string, string | boolean> = {
    include_stats: true,
    ...(sectionFilter && { section: sectionFilter }),
  };

  const {
    data: gradebooksData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = grading.getGradeBooks(currentYear?.id || "", apiParams, {
    enabled: !!currentYear?.id,
  });

  // TODO: Implement deleteGradebook mutation in api2/grading module
  // const deleteGradebookMutation = grading.deleteGradebook();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleDelete = async () => {
    // TODO: Implement gradebook deletion once api2 mutation is available
    alert("Delete functionality coming soon");
    // if (confirm("Are you sure you want to delete this gradebook? This action cannot be undone.")) {
    //   await deleteGradebookMutation.mutateAsync(id);
    // }
  };

  // Filter gradebooks client-side by grade level
  const filteredGradebooks = useMemo(() => {
    const allGradebooks = Array.isArray(gradebooksData)
      ? gradebooksData
      : gradebooksData?.results || [];
    if (!gradeLevelFilter) {
      return allGradebooks;
    }
    return allGradebooks.filter(
      (gb: any) => gb.grade_level.id === gradeLevelFilter,
    );
  }, [gradebooksData, gradeLevelFilter]);

  return (
    <>
      <PageLayout
        title="Gradebooks"
        description="Manage gradebooks and grade entry"
        loading={isLoading}
        noData={
          filteredGradebooks.length === 0 || !sectionFilter || !gradeLevelFilter
        }
        error={error}
        emptyState={
          <EmptyState>
            <EmptyStateIcon>
              <HugeiconsIcon icon={BookOpen02Icon} className="h-12 w-12" />
            </EmptyStateIcon>
            <EmptyStateTitle>
              {sectionFilter
                ? "No gradebooks found"
                : "Select a grade level and section"}
            </EmptyStateTitle>
            <EmptyStateDescription>
              {sectionFilter
                ? "Create your first gradebook to start entering grades"
                : "Choose a grade level and section to load gradebooks"}
            </EmptyStateDescription>
            {sectionFilter && (
              <EmptyStateAction onClick={() => setCreateDialogOpen(true)}>
                Create Gradebook
              </EmptyStateAction>
            )}
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
          <div className="flex items-center gap-2">
            <Button
              icon={<WandSparkles className="h-4 w-4" />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Generate Gradebook
            </Button>
            <RefreshButton
              onClick={() => refetch()}
              loading={isLoading || isFetching}
            />
          </div>
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
        {/* Filters */}

        {sectionFilter && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredGradebooks.map((gradebook: any) => (
              <GradebookCard
                key={gradebook.id}
                gradebook={gradebook}
                actionMenu={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        <HugeiconsIcon
                          icon={MoreVerticalIcon}
                          className="h-4 w-4"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete();
                        }}
                        disabled
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          className="mr-2 h-4 w-4"
                        />
                        Delete (Coming soon)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              />
            ))}
          </div>
        )}
      </PageLayout>

      <CreateGradebookDialog
        academicYearId={currentYear?.id || ""}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
