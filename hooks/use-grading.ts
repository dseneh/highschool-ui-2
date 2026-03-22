"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { showToast } from "@/lib/toast";
import {
  getGradebooks,
  getGradebook,
  createGradebook,
  updateGradebook,
  deleteGradebook,
  getAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getGrades,
  updateGrade,
  bulkCreateGrades,
  bulkUploadGrades,
  getAssessmentTypes,
  createAssessmentType,
  updateAssessmentType,
  deleteAssessmentType,
  getGradeLetters,
  createGradeLetter,
  updateGradeLetter,
  deleteGradeLetter,
  getDefaultAssessmentTemplates,
  createDefaultAssessmentTemplate,
  updateDefaultAssessmentTemplate,
  deleteDefaultAssessmentTemplate,
  getStudentFinalGrades,
  getStudentReportCardPdf,
  getSectionFinalGrades,
} from "@/lib/api2/grading-service";
import type {
  GradebookListParams,
  CreateGradebookCommand,
  UpdateGradebookCommand,
  AssessmentDto,
  AssessmentListParams,
  CreateAssessmentCommand,
  UpdateAssessmentCommand,
  GradeListParams,
  UpdateGradeCommand,
  BulkCreateGradeCommand,
  CreateAssessmentTypeCommand,
  UpdateAssessmentTypeCommand,
  CreateGradeLetterCommand,
  UpdateGradeLetterCommand,
  CreateDefaultAssessmentTemplateCommand,
  UpdateDefaultAssessmentTemplateCommand,
  StudentFinalGradesParams,
  GradeStatusType,
} from "@/lib/api2/grading-types";
import { getQueryClient } from "@/lib/query-client";

/* ============================= QUERY KEYS ============================= */

const gradingKeys = {
  all: (sub: string) => ["grading", sub] as const,
  
  gradebooks: (sub: string) => [...gradingKeys.all(sub), "gradebooks"] as const,
  gradebookList: (sub: string, params?: GradebookListParams) =>
    [...gradingKeys.gradebooks(sub), "list", params] as const,
  gradebookDetail: (sub: string, id: string) =>
    [...gradingKeys.gradebooks(sub), "detail", id] as const,

  assessments: (sub: string) => [...gradingKeys.all(sub), "assessments"] as const,
  assessmentList: (sub: string, gradebookId: string, params?: AssessmentListParams) =>
    [...gradingKeys.assessments(sub), "list", gradebookId, params] as const,
  assessmentDetail: (sub: string, id: string) =>
    [...gradingKeys.assessments(sub), "detail", id] as const,

  grades: (sub: string) => [...gradingKeys.all(sub), "grades"] as const,
  gradeList: (sub: string, params?: GradeListParams) =>
    [...gradingKeys.grades(sub), "list", params] as const,

  assessmentTypes: (sub: string) =>
    [...gradingKeys.all(sub), "assessment-types"] as const,
  gradeLetters: (sub: string) =>
    [...gradingKeys.all(sub), "grade-letters"] as const,
  defaultTemplates: (sub: string) =>
    [...gradingKeys.all(sub), "default-templates"] as const,

  studentFinalGrades: (
    sub: string,
    studentId: string,
    yearId: string,
    markingPeriodId: string
  ) =>
    ["grading", "final-grades", sub, studentId, yearId, markingPeriodId] as const,

  sectionFinalGrades: (
    sub: string,
    sectionId: string,
    params?: {
      academic_year?: string;
      marking_period?: string;
      data_by?: "subject" | "all_subjects";
      subject?: string;
      include_assessment?: boolean;
      include_average?: boolean;
      status?: "any" | GradeStatusType;
      student?: string;
    }
  ) =>
    [...gradingKeys.all(sub), "section-final-grades", sectionId, params] as const,
};

/* ============================= GRADEBOOK HOOKS ============================= */

export function useGradebooks(academicYearId: string | undefined, params?: GradebookListParams, options = {}) {
  const subdomain = useTenantSubdomain();

  return useQuery({
    queryKey: gradingKeys.gradebookList(subdomain, params),
    queryFn: () => getGradebooks(subdomain, academicYearId!, params),
    enabled: Boolean(subdomain) && Boolean(academicYearId),
    ...options,
  });
}

export function useGradebook(id: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery({
    queryKey: gradingKeys.gradebookDetail(subdomain, id ?? ""),
    queryFn: () => getGradebook(subdomain, id!),
    enabled: Boolean(subdomain) && Boolean(id),
  });
}

export function useCreateGradebook(academicYearId: string) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (command: CreateGradebookCommand) =>
      createGradebook(subdomain, academicYearId, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.gradebooks(subdomain),
      });
      showToast.success("Gradebook created successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to create gradebook");
    },
  });
}

export function useUpdateGradebook() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: UpdateGradebookCommand }) =>
      updateGradebook(subdomain, id, command),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.gradebookDetail(subdomain, id),
      });
      queryClient.invalidateQueries({
        queryKey: gradingKeys.gradebooks(subdomain),
      });
      showToast.success("Gradebook updated successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to update gradebook");
    },
  });
}

export function useDeleteGradebook() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGradebook(subdomain, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.gradebooks(subdomain),
      });
      showToast.success("Gradebook deleted successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to delete gradebook");
    },
  });
}

/* ============================= ASSESSMENT HOOKS ============================= */

export function useAssessments(gradebookId: string | undefined, params?: AssessmentListParams) {
  const subdomain = useTenantSubdomain();

  return useQuery<AssessmentDto[]>({
    queryKey: gradingKeys.assessmentList(subdomain, gradebookId ?? "", params),
    queryFn: () => getAssessments(subdomain, gradebookId!, params),
    // Backend requires both gradebookId and marking_period parameter
    enabled: Boolean(subdomain) && Boolean(gradebookId) && Boolean(params?.marking_period),
  });
}

export function useAssessment(id: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery({
    queryKey: gradingKeys.assessmentDetail(subdomain, id ?? ""),
    queryFn: () => getAssessment(subdomain, id!),
    enabled: Boolean(subdomain) && Boolean(id),
  });
}

export function useCreateAssessment(gradebookId: string) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (command: CreateAssessmentCommand) =>
      createAssessment(subdomain, gradebookId, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.assessments(subdomain),
      });
      showToast.success("Assessment created successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to create assessment");
    },
  });
}

export function useUpdateAssessment() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: UpdateAssessmentCommand }) =>
      updateAssessment(subdomain, id, command),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.assessmentDetail(subdomain, id),
      });
      queryClient.invalidateQueries({
        queryKey: gradingKeys.assessments(subdomain),
      });
      showToast.success("Assessment updated successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to update assessment");
    },
  });
}

export function useDeleteAssessment() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAssessment(subdomain, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.assessments(subdomain),
      });
      showToast.success("Assessment deleted successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to delete assessment");
    },
  });
}

/* ============================= GRADE HOOKS ============================= */

export function useGrades(assessmentId: string | undefined, params?: GradeListParams) {
  const subdomain = useTenantSubdomain();

  return useQuery({
    queryKey: gradingKeys.gradeList(subdomain, params),
    queryFn: () => getGrades(subdomain, assessmentId!, params),
    enabled: Boolean(subdomain) && Boolean(assessmentId),
  });
}

export function useSectionFinalGrades(
  sectionId: string | undefined,
  params?: {
    academic_year?: string;
    marking_period?: string;
    data_by?: "subject" | "all_subjects";
    subject?: string;
    include_assessment?: boolean;
    include_average?: boolean;
    status?: "any" | GradeStatusType;
    student?: string;
  }
) {
  const subdomain = useTenantSubdomain();

  return useQuery({
    queryKey: gradingKeys.sectionFinalGrades(subdomain, sectionId ?? "", params),
    queryFn: () => getSectionFinalGrades(subdomain, sectionId!, params),
    enabled: Boolean(subdomain) && Boolean(sectionId) && Boolean(params?.academic_year),
  });
}

export function useUpdateGrade() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: UpdateGradeCommand }) =>
      updateGrade(subdomain, id, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.grades(subdomain),
      });
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to update grade");
    },
  });
}

export function useBulkCreateGrades(assessmentId: string) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (command: BulkCreateGradeCommand) =>
      bulkCreateGrades(subdomain, assessmentId, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.grades(subdomain),
      });
      showToast.success("Grades created successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to create grades");
    },
  });
}

export function useBulkUploadGrades() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      sectionId,
      overrideGrades,
    }: {
      file: File;
      sectionId: string;
      overrideGrades?: boolean;
    }) => bulkUploadGrades(subdomain, sectionId, file, overrideGrades),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.all(subdomain),
      });
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to upload grades");
    },
  });
}

/* ============================= ASSESSMENT TYPE HOOKS ============================= */

export function useAssessmentTypes() {
  const subdomain = useTenantSubdomain();

  return useQuery({
    queryKey: gradingKeys.assessmentTypes(subdomain),
    queryFn: () => getAssessmentTypes(subdomain),
    enabled: Boolean(subdomain),
  });
}

export function useCreateAssessmentType() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (command: CreateAssessmentTypeCommand) =>
      createAssessmentType(subdomain, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.assessmentTypes(subdomain),
      });
      showToast.success("Assessment type created successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to create assessment type");
    },
  });
}

export function useUpdateAssessmentType() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: UpdateAssessmentTypeCommand }) =>
      updateAssessmentType(subdomain, id, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.assessmentTypes(subdomain),
      });
      showToast.success("Assessment type updated successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to update assessment type");
    },
  });
}

export function useDeleteAssessmentType() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAssessmentType(subdomain, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.assessmentTypes(subdomain),
      });
      showToast.success("Assessment type deleted successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to delete assessment type");
    },
  });
}

/* ============================= GRADE LETTER HOOKS ============================= */

export function useGradeLetters() {
  const subdomain = useTenantSubdomain();

  return useQuery({
    queryKey: gradingKeys.gradeLetters(subdomain),
    queryFn: () => getGradeLetters(subdomain),
    enabled: Boolean(subdomain),
  });
}

export function useCreateGradeLetter() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (command: CreateGradeLetterCommand) =>
      createGradeLetter(subdomain, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.gradeLetters(subdomain),
      });
      showToast.success("Grade letter created successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to create grade letter");
    },
  });
}

export function useUpdateGradeLetter() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: UpdateGradeLetterCommand }) =>
      updateGradeLetter(subdomain, id, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.gradeLetters(subdomain),
      });
      showToast.success("Grade letter updated successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to update grade letter");
    },
  });
}

export function useDeleteGradeLetter() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGradeLetter(subdomain, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.gradeLetters(subdomain),
      });
      showToast.success("Grade letter deleted successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to delete grade letter");
    },
  });
}

/* ============================= DEFAULT TEMPLATE HOOKS ============================= */

export function useDefaultAssessmentTemplates() {
  const subdomain = useTenantSubdomain();

  return useQuery({
    queryKey: gradingKeys.defaultTemplates(subdomain),
    queryFn: () => getDefaultAssessmentTemplates(subdomain),
    enabled: Boolean(subdomain),
  });
}

export function useCreateDefaultAssessmentTemplate() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (command: CreateDefaultAssessmentTemplateCommand) =>
      createDefaultAssessmentTemplate(subdomain, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.defaultTemplates(subdomain),
      });
      showToast.success("Template created successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to create template");
    },
  });
}

export function useUpdateDefaultAssessmentTemplate() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: UpdateDefaultAssessmentTemplateCommand }) =>
      updateDefaultAssessmentTemplate(subdomain, id, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.defaultTemplates(subdomain),
      });
      // showToast.success("Template updated successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to update template");
    },
  });
}

export function useDeleteDefaultAssessmentTemplate() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDefaultAssessmentTemplate(subdomain, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradingKeys.defaultTemplates(subdomain),
      });
      showToast.success("Template deleted successfully");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to delete template");
    },
  });
}

/* ============================= FINAL GRADES HOOKS ============================= */

export function useStudentFinalGrades(
  studentId: string | undefined,
  academicYearId: string | undefined,
  markingPeriodId: string | undefined
) {
  const subdomain = useTenantSubdomain();

  const params: StudentFinalGradesParams = {
    marking_period: markingPeriodId,
    data_by: "marking_period",
    include_average: true,
    include_assessment: false,
    status: "approved",
  };

  return useQuery({
    queryKey: gradingKeys.studentFinalGrades(
      subdomain,
      studentId ?? "",
      academicYearId ?? "",
      markingPeriodId ?? ""
    ),
    queryFn: () =>
      getStudentFinalGrades(subdomain, studentId!, academicYearId!, params),
    enabled:
      Boolean(subdomain) &&
      Boolean(studentId) &&
      Boolean(academicYearId) &&
      Boolean(markingPeriodId),
  });
}

export function useStudentReportCard(
  studentId: string | undefined,
  academicYearId: string | undefined,
  enabled = false
) {
  const subdomain = useTenantSubdomain();

  return useQuery<Blob>({
    queryKey: ["grading", "report-card", subdomain, studentId, academicYearId],
    queryFn: () => getStudentReportCardPdf(subdomain, studentId!, academicYearId!),
    enabled:
      enabled &&
      Boolean(subdomain) &&
      Boolean(studentId) &&
      Boolean(academicYearId),
  });
}

