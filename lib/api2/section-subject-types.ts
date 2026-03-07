/**
 * Section Subject Types
 * Manages the relationship between sections and subjects
 */

import { SubjectDto } from "./subject-types";

/**
 * Section Subject DTO
 * Represents a subject assigned to a section
 */
export interface SectionSubjectDto {
  id: string;
  section: string;
  subject: SubjectDto;
  created_at: string;
  updated_at: string;
  can_delete: boolean; // False if subject has grades, True otherwise
  active?: boolean;
}

/**
 * Create Section Subject Payload
 * For assigning subjects to a section (bulk operation)
 */
export interface CreateSectionSubjectPayload {
  subjects: string[]; // Array of subject IDs
}

/**
 * Section Subject List Params
 * Query parameters for fetching section subjects
 */
export interface SectionSubjectListParams {
  section?: string;
}
