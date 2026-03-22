"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { usePathname, useSearchParams } from "next/navigation";
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
} from "@hugeicons/core-free-icons";
import { CreateGradebookDialog } from "@/components/grading/create-gradebook-dialog";
import { AssignTeacherDialog } from "@/components/grading/assign-teacher-dialog";
import { BookOpen, CalendarDays, User, WandSparkles } from "lucide-react";
import RefreshButton from "@/components/shared/refresh-button";
import { GradebookCard } from "@/components/grading/gradebook-card";

export default function GradebooksPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

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

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignTeacherGradebook, setAssignTeacherGradebook] = useState<any>(null);

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

  const buildGradebookUrl = (gradebook: any, tab?: string) => {
    const params = new URLSearchParams({
      section: gradebook.section.id,
      gradeLevel: gradebook.grade_level.id,
    });

    if (tab) {
      params.set("tab", tab);
    }

    params.set("from", encodeURIComponent(currentUrl));

    return `/grading/gradebooks/${gradebook.id}?${params.toString()}`;
  };

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
        // actions={
        //   <div className="flex items-center gap-2">
        //     <Button
        //       icon={<WandSparkles className="h-4 w-4" />}
        //       onClick={() => setCreateDialogOpen(true)}
        //     >
        //       Generate Gradebook
        //     </Button>
        //     <RefreshButton
        //       onClick={() => refetch()}
        //       loading={isLoading || isFetching}
        //     />
        //   </div>
        // }
        refreshAction={refetch}
        fetching={isFetching}
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
                fromUrl={currentUrl}
                onAssignTeacher={(gb) => setAssignTeacherGradebook(gb)}
                actionMenu={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <HugeiconsIcon
                          icon={MoreVerticalIcon}
                          className="h-4 w-4"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setAssignTeacherGradebook(gradebook);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {gradebook.teacher ? "Change Teacher" : "Assign Teacher"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          href={buildGradebookUrl(gradebook, "entry")}
                          className="flex w-full items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Open Grade Entry
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          href={buildGradebookUrl(gradebook, "details")}
                          className="flex w-full items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          Details & Schedule
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          href={buildGradebookUrl(gradebook, "viewGrades")}
                          className="flex w-full items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          View Final Grades
                        </Link>
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

      {assignTeacherGradebook && (
        <AssignTeacherDialog
          open={Boolean(assignTeacherGradebook)}
          onOpenChange={(open) => {
            if (!open) setAssignTeacherGradebook(null);
          }}
          gradebook={assignTeacherGradebook}
          onSuccess={() => {
            refetch();
            setAssignTeacherGradebook(null);
          }}
        />
      )}
    </>
  );
}
