"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import PageLayout from "@/components/dashboard/page-layout";
import { useEmployee } from "@/lib/api2/employee";
import { useGrading } from "@/lib/api2/grading";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import { useQueryState } from "nuqs";
import { SelectField } from "@/components/ui/select-field";
import type { SelectFieldItem } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { GradebookCard } from "@/components/grading/gradebook-card";
import EmptyStateComponent from "@/components/shared/empty-state";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";


type SectionItem = {
  id?: string;
  name?: string;
  grade_level?: { id?: string; name?: string } | string;
};

type GradebookItem = {
  id: string;
  subject: { id?: string; name?: string };
  section: { id?: string; name?: string };
  grade_level: { id?: string; name?: string };
  statistics?: {
    total_enrolled_students?: number;
    students_with_grades?: number;
  };
};

export default function EmployeeGradesPage() {
  const params = useParams();
  const idNumber = params.id_number as string;

  const employeeApi = useEmployee();
  const grading = useGrading();
  const { data: currentAcademicYear } = useCurrentAcademicYear();

  const [sectionId, setSectionId] = useQueryState("section", {
    defaultValue: "",
  });

  const [statusFilter, setStatusFilter] = useQueryState("status", {
    defaultValue: "all",
  });

    // Build the current page URL for back navigation
    const currentPageUrl = React.useMemo(() => {
      const params = new URLSearchParams();
      if (sectionId) params.set("section", sectionId);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      const queryString = params.toString();
      return `/employees/${idNumber}/grades${queryString ? `?${queryString}` : ""}`;
    }, [idNumber, sectionId, statusFilter]);

  const {
    data: employee,
    isLoading: employeeLoading,
    error,
    refetch,
    isFetching,
  } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/employees/"),
  });

  const sections = React.useMemo(
    () => ((employee?.sections as SectionItem[] | undefined) ?? []),
    [employee?.sections],
  );

  React.useEffect(() => {
    if (!sectionId && sections.length > 0 && sections[0].id) {
      setSectionId(sections[0].id);
    }
  }, [sectionId, sections, setSectionId]);

  const sectionOptions: SelectFieldItem[] = React.useMemo(
    () =>
      sections.map((section, index) => ({
        value: section.id ?? `section-${index}`,
        label:
          typeof section.grade_level === "string"
            ? `${section.grade_level} - ${section.name ?? "Section"}`
            : `${section.grade_level?.name ?? "Grade"} - ${section.name ?? "Section"}`,
      })),
    [sections],
  );

  const { data: gradebooksData, isLoading: gradebooksLoading, error: gradebooksError } = grading.getTeacherGradeBooks(
    {
      include_stats: true,
      academic_year: currentAcademicYear?.id,
      teacher_id_number: idNumber,
    },
    {
      enabled: !!currentAcademicYear?.id,
    },
  );

  const gradebooks = React.useMemo(() => {
    const result = gradebooksData?.results;
    if (!Array.isArray(result)) return [];
    
    let filtered = result as GradebookItem[];
    
    // Filter by selected section
    if (sectionId) {
      filtered = filtered.filter((gb) => gb.section?.id === sectionId);
    }
    
    // Filter by workflow status
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(
        (gb: any) => gb.workflow_status?.predominant_status === statusFilter
      );
    }
    
    return filtered;
  }, [gradebooksData, sectionId, statusFilter]);

  const statusOptions: SelectFieldItem[] = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending Review" },
    { value: "reviewed", label: "Reviewed" },
    { value: "submitted", label: "Submitted" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <PageLayout
      title="My Classes & Grades"
      description="Enter and submit grades for your assigned classes"
      loading={employeeLoading}
      fetching={isFetching}
      refreshAction={() => {
        void refetch();
      }}
      error={error}
      noData={!employee || !employee.is_teacher}
      emptyStateTitle="Not a Teacher"
      emptyStateDescription="This employee is not marked as a teacher."
      skeleton={
        <div className="space-y-4">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
      filterActions={
        <div className="flex w-full flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Class</div>
            <SelectField
              items={sectionOptions}
              value={sectionId}
              onValueChange={(value) => {
                if (value && typeof value === "string") {
                  setSectionId(value);
                }
              }}
              placeholder="Select a class"
              triggerClassName="w-full md:w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Status</div>
            <SelectField
              items={statusOptions}
              value={statusFilter}
              onValueChange={(value) => {
                if (value && typeof value === "string") {
                  setStatusFilter(value);
                }
              }}
              placeholder="All Statuses"
              triggerClassName="w-full md:w-48"
            />
          </div>
        </div>
      }
    >
      {gradebooksLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : gradebooksError ? (
        <EmptyStateComponent
          title="Could not load gradebooks"
          description={
            (gradebooksError as any)?.response?.data?.detail ??
            "An error occurred while fetching gradebooks. The teacher may not have valid assignments."
          }
          icon={<HugeiconsIcon icon={Alert02Icon} />}
        />
      ) : gradebooks.length === 0 ? (
        <EmptyStateComponent
          title="No gradebooks found"
          description={
            sectionId
              ? "No gradebooks match the selected class and status filters."
              : "This teacher has no gradebook assignments for the current academic year."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gradebooks.map((gradebook) => (
              <GradebookCard 
                key={gradebook.id} 
                gradebook={gradebook}
                fromUrl={currentPageUrl}
              />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
