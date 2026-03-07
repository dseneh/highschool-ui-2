import apiClient from "@/lib/api-client";
import type {
  GradebookDto,
  GradebookListParams,
  CreateGradebookCommand,
  UpdateGradebookCommand,
  AssessmentDto,
  AssessmentListParams,
  CreateAssessmentCommand,
  UpdateAssessmentCommand,
  GradeDto,
  GradeListParams,
  UpdateGradeCommand,
  BulkCreateGradeCommand,
  AssessmentTypeDto,
  CreateAssessmentTypeCommand,
  UpdateAssessmentTypeCommand,
  GradeLetterDto,
  CreateGradeLetterCommand,
  UpdateGradeLetterCommand,
  DefaultAssessmentTemplateDto,
  CreateDefaultAssessmentTemplateCommand,
  UpdateDefaultAssessmentTemplateCommand,
  StudentFinalGradesResponse,
  StudentFinalGradesParams,
  SectionFinalGradesResponse,
  SectionFinalGradesSubjectResponse,
  PaginatedResponse,
  GradeStatusType,
} from "./grading-types";

/* ============================= GRADEBOOKS ============================= */

/** GET /grading/academic-years/{academic_year_id}/gradebooks/ */
export async function getGradebooks(
  _subdomain: string,
  academicYearId: string,
  params?: GradebookListParams
) {
  const { data } = await apiClient.get<PaginatedResponse<GradebookDto>>(
    `grading/academic-years/${academicYearId}/gradebooks/`,
    { params }
  );
  return data;
}

/** GET /grading/gradebooks/{id}/ */
export async function getGradebook(_subdomain: string, id: string) {
  const { data } = await apiClient.get<GradebookDto>(
    `grading/gradebooks/${id}/`
  );
  return data;
}

/** POST /grading/academic-years/{academic_year_id}/gradebooks/ */
export async function createGradebook(
  _subdomain: string,
  academicYearId: string,
  command: CreateGradebookCommand
) {
  const { data } = await apiClient.post<GradebookDto>(
    `grading/academic-years/${academicYearId}/gradebooks/`,
    command
  );
  return data;
}

/** PATCH /grading/gradebooks/{id}/ */
export async function updateGradebook(
  _subdomain: string,
  id: string,
  command: UpdateGradebookCommand
) {
  const { data } = await apiClient.patch<GradebookDto>(
    `grading/gradebooks/${id}/`,
    command
  );
  return data;
}

/** DELETE /grading/gradebooks/{id}/ */
export async function deleteGradebook(_subdomain: string, id: string) {
  await apiClient.delete(`grading/gradebooks/${id}/`);
}

/* ============================= ASSESSMENTS ============================= */

/** GET /grading/gradebooks/{gradebook_id}/assessments/ */
export async function getAssessments(
  _subdomain: string,
  gradebookId: string,
  params?: AssessmentListParams
) {
  const { data } = await apiClient.get<AssessmentDto[]>(
    `grading/gradebooks/${gradebookId}/assessments/`,
    { params }
  );
  return data;
}

/** GET /grading/assessments/{id}/ */
export async function getAssessment(_subdomain: string, id: string) {
  const { data } = await apiClient.get<AssessmentDto>(
    `grading/assessments/${id}/`
  );
  return data;
}

/** POST /grading/gradebooks/{gradebook_id}/assessments/ */
export async function createAssessment(
  _subdomain: string,
  gradebookId: string,
  command: CreateAssessmentCommand
) {
  const { data } = await apiClient.post<AssessmentDto>(
    `grading/gradebooks/${gradebookId}/assessments/`,
    command
  );
  return data;
}

/** PATCH /grading/assessments/{id}/ */
export async function updateAssessment(
  _subdomain: string,
  id: string,
  command: UpdateAssessmentCommand
) {
  const { data } = await apiClient.patch<AssessmentDto>(
    `grading/assessments/${id}/`,
    command
  );
  return data;
}

/** DELETE /grading/assessments/{id}/ */
export async function deleteAssessment(_subdomain: string, id: string) {
  await apiClient.delete(`grading/assessments/${id}/`);
}

/* ============================= GRADES ============================= */

/** GET /grading/assessments/{assessment_id}/grades/ */
export async function getGrades(
  _subdomain: string,
  assessmentId: string,
  params?: GradeListParams
) {
  const { data } = await apiClient.get<PaginatedResponse<GradeDto>>(
    `grading/assessments/${assessmentId}/grades/`,
    { params }
  );
  return data;
}

/** GET /grading/grades/{id}/ */
export async function getGrade(_subdomain: string, id: string) {
  const { data } = await apiClient.get<GradeDto>(`grading/grades/${id}/`);
  return data;
}

/** PATCH /grading/grades/{id}/ */
export async function updateGrade(
  _subdomain: string,
  id: string,
  command: UpdateGradeCommand
) {
  const { data } = await apiClient.patch<GradeDto>(
    `grading/grades/${id}/`,
    command
  );
  return data;
}

/** DELETE /grading/grades/{id}/ */
export async function deleteGrade(_subdomain: string, id: string) {
  await apiClient.delete(`grading/grades/${id}/`);
}

/** POST /grading/assessments/{assessment_id}/grades/ (bulk create via grades array) */
export async function bulkCreateGrades(
  _subdomain: string,
  assessmentId: string,
  command: BulkCreateGradeCommand
) {
  const { data } = await apiClient.post<GradeDto[]>(
    `grading/assessments/${assessmentId}/grades/`,
    command
  );
  return data;
}

/** POST /grading/sections/{section_id}/grades-upload/ */
export async function bulkUploadGrades(
  _subdomain: string,
  sectionId: string,
  file: File
) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<{ message: string; grades: GradeDto[] }>(
    `grading/sections/${sectionId}/grades-upload/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

/* ============================= ASSESSMENT TYPES ============================= */

/** GET /grading/assessment-types/ */
export async function getAssessmentTypes(_subdomain: string) {
  const { data } = await apiClient.get<AssessmentTypeDto[]>(
    "grading/assessment-types/"
  );
  return data;
}

/** GET /grading/assessment-types/{id}/ */
export async function getAssessmentType(_subdomain: string, id: string) {
  const { data } = await apiClient.get<AssessmentTypeDto>(
    `grading/assessment-types/${id}/`
  );
  return data;
}

/** POST /grading/assessment-types/ */
export async function createAssessmentType(
  _subdomain: string,
  command: CreateAssessmentTypeCommand
) {
  const { data } = await apiClient.post<AssessmentTypeDto>(
    "grading/assessment-types/",
    command
  );
  return data;
}

/** PATCH /grading/assessment-types/{id}/ */
export async function updateAssessmentType(
  _subdomain: string,
  id: string,
  command: UpdateAssessmentTypeCommand
) {
  const { data } = await apiClient.patch<AssessmentTypeDto>(
    `grading/assessment-types/${id}/`,
    command
  );
  return data;
}

/** DELETE /grading/assessment-types/{id}/ */
export async function deleteAssessmentType(_subdomain: string, id: string) {
  await apiClient.delete(`grading/assessment-types/${id}/`);
}

/* ============================= GRADE LETTERS ============================= */

/** GET /grading/grade-letters/ */
export async function getGradeLetters(_subdomain: string) {
  const { data } = await apiClient.get<GradeLetterDto[]>(
    "grading/grade-letters/"
  );
  return data;
}

/** GET /grading/grade-letters/{id}/ */
export async function getGradeLetter(_subdomain: string, id: string) {
  const { data } = await apiClient.get<GradeLetterDto>(
    `grading/grade-letters/${id}/`
  );
  return data;
}

/** POST /grading/grade-letters/ */
export async function createGradeLetter(
  _subdomain: string,
  command: CreateGradeLetterCommand
) {
  const { data } = await apiClient.post<GradeLetterDto>(
    "grading/grade-letters/",
    command
  );
  return data;
}

/** PATCH /grading/grade-letters/{id}/ */
export async function updateGradeLetter(
  _subdomain: string,
  id: string,
  command: UpdateGradeLetterCommand
) {
  const { data } = await apiClient.patch<GradeLetterDto>(
    `grading/grade-letters/${id}/`,
    command
  );
  return data;
}

/** DELETE /grading/grade-letters/{id}/ */
export async function deleteGradeLetter(_subdomain: string, id: string) {
  await apiClient.delete(`grading/grade-letters/${id}/`);
}

/* ============================= DEFAULT ASSESSMENT TEMPLATES ============================= */

/** GET /grading/default-templates/ */
export async function getDefaultAssessmentTemplates(_subdomain: string) {
  const { data } = await apiClient.get<DefaultAssessmentTemplateDto[]>(
    "grading/default-templates/"
  );
  return data;
}

/** GET /grading/default-templates/{id}/ */
export async function getDefaultAssessmentTemplate(
  _subdomain: string,
  id: string
) {
  const { data } = await apiClient.get<DefaultAssessmentTemplateDto>(
    `grading/default-templates/${id}/`
  );
  return data;
}

/** POST /grading/default-templates/ */
export async function createDefaultAssessmentTemplate(
  _subdomain: string,
  command: CreateDefaultAssessmentTemplateCommand
) {
  const { data } = await apiClient.post<DefaultAssessmentTemplateDto>(
    "grading/default-templates/",
    command
  );
  return data;
}

/** PATCH /grading/default-templates/{id}/ */
export async function updateDefaultAssessmentTemplate(
  _subdomain: string,
  id: string,
  command: UpdateDefaultAssessmentTemplateCommand
) {
  const { data } = await apiClient.patch<DefaultAssessmentTemplateDto>(
    `grading/default-templates/${id}/`,
    command
  );
  return data;
}

/** DELETE /grading/default-templates/{id}/ */
export async function deleteDefaultAssessmentTemplate(
  _subdomain: string,
  id: string
) {
  await apiClient.delete(`grading/default-templates/${id}/`);
}

/* ============================= STUDENT FINAL GRADES ============================= */

/** GET /grading/students/{studentId}/final-grades/academic-years/{academicYearId}/ */
export async function getStudentFinalGrades(
  _subdomain: string,
  studentId: string,
  academicYearId: string,
  params?: StudentFinalGradesParams
) {
  const { data } = await apiClient.get<StudentFinalGradesResponse>(
    `grading/students/${studentId}/final-grades/academic-years/${academicYearId}`,
    { params }
  );
  return data;
}

/** GET /grading/students/{studentId}/final-grades/academic-years/{academicYearId}/report-card/ */
export async function getStudentReportCardPdf(
  _subdomain: string,
  studentId: string,
  academicYearId: string
): Promise<Blob> {
  const { data } = await apiClient.get(
    `grading/students/${studentId}/final-grades/academic-years/${academicYearId}/report-card`,
    { responseType: "blob" }
  );
  return data;
}

/* ============================= SECTION FINAL GRADES ============================= */

/** GET /grading/sections/{sectionId}/final-grades/ */
export async function getSectionFinalGrades(
  _subdomain: string,
  sectionId: string,
  params?: {
    academic_year?: string;
    marking_period?: string;
    data_by?: "subject" | "all_subjects";
    subject?: string;
    include_assessment?: boolean;
    include_average?: boolean;
    status?: GradeStatusType | "any";
    student?: string;
  }
) {
  const { data } = await apiClient.get<
    SectionFinalGradesResponse | SectionFinalGradesSubjectResponse
  >(
    `grading/sections/${sectionId}/final-grades/`,
    { params }
  );
  return data;
}

/* ============================= GRADE CORRECTIONS ============================= */

/** POST /grading/grades/{gradeId}/mark-for-correction/ */
export async function markGradeForCorrection(
  _subdomain: string,
  gradeId: string,
  needsCorrection: boolean,
  reason?: string
) {
  const { data } = await apiClient.post<GradeDto>(
    `grading/grades/${gradeId}/mark-for-correction/`,
    { needs_correction: needsCorrection, reason }
  );
  return data;
}

/** POST /grading/grades/{gradeId}/correct/ */
export async function correctGrade(
  _subdomain: string,
  gradeId: string,
  payload: {
    score?: number | null;
    comment?: string | null;
    change_reason?: string;
  }
) {
  const { data } = await apiClient.post<GradeDto>(
    `grading/grades/${gradeId}/correct/`,
    payload
  );
  return data;
}
