/* ------------------------------------------------------------------ */
/*  Types for Section API                                              */
/*  Base URLs:                                                         */
/*   - /api/v1/grade-levels/{gradeLevelId}/sections/                   */
/*   - /api/v1/sections/{id}/                                          */
/* ------------------------------------------------------------------ */

export interface SectionGradeLevelDto {
  id: string;
  name: string;
  short_name?: string | null;
  level: number;
  active: boolean;
}

export interface SectionSubjectDto {
  id: string;
  section: { id: string; name: string };
  subject: { id: string; name: string };
  grade_level?: { id: string; name: string; level: number };
  active: boolean;
  can_delete?: boolean;
}

export interface SectionFeeDto {
  id: string;
  name: string;
  amount: string;
  active: boolean;
  section: string;
  student_target?: string;
  general_fee?: {
    id: string;
    name: string;
    description?: string;
    student_target?: string;
    active?: boolean;
  };
}

export interface SectionDto {
  id: string;
  name: string;
  description?: string;
  max_capacity?: number | null;
  active: boolean;
  students: number;
  grade_level_id?: string;
  grade_level?: SectionGradeLevelDto;
  subjects?: SectionSubjectDto[];
  fees?: SectionFeeDto[];
}

export interface CreateSectionCommand {
  name: string;
  description?: string;
  max_capacity?: number | null;
  room_number?: string | null;
}

export interface UpdateSectionCommand {
  name?: string;
  description?: string;
  active?: boolean;
}
