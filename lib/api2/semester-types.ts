/* ------------------------------------------------------------------ */
/*  Types for Semester API                                             */
/*  Base URL: /api/v1/semesters                                        */
/* ------------------------------------------------------------------ */

export interface SemesterDto {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  academic_year: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  } | null;
}
