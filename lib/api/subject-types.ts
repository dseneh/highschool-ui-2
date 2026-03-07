/* ------------------------------------------------------------------ */
/*  Types for Subject API                                              */
/*  Base URL: /api/v1/subjects                                         */
/* ------------------------------------------------------------------ */

export interface SubjectDto {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  status: "active" | "disabled";
  // Computed fields for deletion logic
  can_delete: boolean;
  can_force_delete: boolean;
  must_deactivate: boolean;
  has_grades: boolean;
  has_scored_grades: boolean;
}

export interface CreateSubjectCommand {
  name: string;
  description?: string;
}

export interface UpdateSubjectCommand {
  name?: string;
  description?: string;
  active?: boolean;
}
