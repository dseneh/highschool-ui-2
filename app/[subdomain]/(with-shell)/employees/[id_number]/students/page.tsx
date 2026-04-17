"use client";

import { useParams, useRouter } from "next/navigation";
import { useEmployee } from "@/lib/api2/employee";
import { useStudents } from "@/lib/api2/student";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import type { SelectFieldItem } from "@/components/ui/select-field";
import PageLayout from "@/components/dashboard/page-layout";
import * as React from "react";
import { DataTable } from "@/components/shared/data-table";
import { useQueryState } from "nuqs";
import { createStudentColumns } from "./_components/columns";
import { StudentActionDialog } from "./_components/student-action-dialog";
import { SectionItem, Student } from "./_components/types";

export default function EmployeeStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const idNumber = params.id_number as string;
  const employeeApi = useEmployee();
  const studentApi = useStudents();

  // Dialog state
  const [dialogStudent, setDialogStudent] = React.useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openStudentDialog = (student: Student) => {
    setDialogStudent(student);
    setDialogOpen(true);
  };

  const [selectedSectionId, setSelectedSectionId] = useQueryState("section", {
    defaultValue: "",
  });

  const {
    data: employee,
    isLoading: employeeLoading,
    error,
    refetch,
    isFetching,
  } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/employees/"),
  });

  const handleRefresh = () => {
    void refetch();
  };

  const sections = React.useMemo(
    () => (employee?.sections as SectionItem[] | undefined) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employee?.sections, employee]
  );

  React.useEffect(() => {
    if (sections.length > 0 && !selectedSectionId) {
      const firstSectionId = sections[0].id;
      if (firstSectionId) {
        setSelectedSectionId(firstSectionId);
      }
    }
  }, [sections, selectedSectionId, setSelectedSectionId]);

  const { data: studentsData, isLoading: studentsLoading } =
    studentApi.getStudents(
      {
        section: selectedSectionId,
        include_billing: false,
        include_grades: true,
      },
      { enabled: !!selectedSectionId },
    );

  const students = React.useMemo(
    () => studentsData?.results ?? [],
    [studentsData],
  );

  const getSectionName = (section: SectionItem) =>
    typeof section.name === "string" && section.name.trim().length > 0
      ? section.name
      : "Section";

  const getSectionGradeLevel = (section: SectionItem) => {
    if (typeof section.grade_level === "string") return section.grade_level;
    if (section.grade_level && typeof section.grade_level.name === "string") {
      return section.grade_level.name;
    }
    return "Grade Level";
  };

  const getSectionGroupName = React.useCallback((section: SectionItem) => {
    return `${getSectionGradeLevel(section)} - ${getSectionName(section)}`;
  }, []);


  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const sectionOptions: SelectFieldItem[] = React.useMemo(
    () =>
      sections.map((section, idx) => ({
        value: section.id ?? `section-${idx}`,
        label: getSectionGroupName(section),
      })),
    [sections, getSectionGroupName],
  );

  const columns = React.useMemo(
    () =>
      createStudentColumns(getInitials, {
        onViewProfile: (student) => router.push(`/students/${student.id_number}`),
        onViewGrades: (student) => router.push(`/students/${student.id_number}/grades`),
      }),
    [router],
  );

  return (
    <PageLayout
      title="Class Students"
      description="View students from assigned classes"
      loading={employeeLoading}
      fetching={isFetching}
      refreshAction={handleRefresh}
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(`/employees/${idNumber}/grades?section=${selectedSectionId}`)}
        >
          Enter Grades
        </Button>
      }
      skeleton={
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
      error={error}
      noData={!employee || !employee.is_teacher}
      emptyStateTitle={"Not a Teacher"}
      emptyStateDescription={"This employee is not marked as a teacher."}
    >
      {employee && employee?.is_teacher && (
        <>
      <div className="space-y-2">
        <DataTable
          columns={columns}
          data={students as Student[]}
          searchKey="full_name"
          searchPlaceholder="Search students..."
          pageSize={20}
          showPagination={students.length > 20}
          loading={studentsLoading}
          noData={students.length === 0}
          emptyStateTitle="No Students Found"
          emptyStateDescription="This class has no students enrolled."
          onRowClick={openStudentDialog}
          filters={
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-nowrap">
                Select Class:
              </label>
              <SelectField
                items={sectionOptions}
                value={selectedSectionId}
                onValueChange={(value) => {
                  if (value && typeof value === "string") {
                    setSelectedSectionId(value);
                  }
                }}
                placeholder="Select a class"
                className="w-70"
                triggerClassName="w-full md:w-60"
              />
            </div>
          }
        />
      </div>
      <StudentActionDialog
        student={dialogStudent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
       </>
      )}
    </PageLayout>
  );
}
