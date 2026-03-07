/**
 * Section Subject Service
 * API functions for managing section-subject relationships
 */

import apiClient from "@/lib/api-client";
import type {
  SectionSubjectDto,
  CreateSectionSubjectPayload,
  SectionSubjectListParams,
} from "./section-subject-types";

/**
 * Get section subjects for a specific section
 */
export async function getSectionSubjects(
  _subdomain: string,
  sectionId: string,
  params?: SectionSubjectListParams
): Promise<SectionSubjectDto[]> {
  const { data } = await apiClient.get<SectionSubjectDto[]>(
    `/sections/${sectionId}/section-subjects/`,
    { params }
  );
  return data;
}

/**
 * Assign subjects to a section (bulk operation)
 * This will trigger automatic gradebook, assessment, and grade creation on the backend
 */
export async function assignSubjectsToSection(
  _subdomain: string,
  sectionId: string,
  payload: CreateSectionSubjectPayload
): Promise<{
  success: boolean;
  section_subjects: SectionSubjectDto[];
  created_count?: number;
  existing_count?: number;
  message?: string;
  gradebooks?: {
    created: number;
    assessments_created: number;
    grades_created: number;
    details: Array<{
      subject_name: string;
      gradebook_created: boolean;
      assessments_created: number;
      grades_created: number;
    }>;
  };
}> {
  const { data } = await apiClient.post(
    `/sections/${sectionId}/section-subjects/`,
    payload
  );

  return {
    success: true,
    section_subjects: data?.created ?? [],
    created_count: data?.created_count ?? data?.created?.length ?? 0,
    existing_count: data?.existing_count,
    message: data?.message ?? data?.detail,
    gradebooks: data?.gradebooks,
  };
}

/**
 * Remove a subject from a section
 */
export async function removeSectionSubject(
  _subdomain: string,
  sectionSubjectId: string
): Promise<void> {
  await apiClient.delete(`/section-subjects/${sectionSubjectId}/`);
}
