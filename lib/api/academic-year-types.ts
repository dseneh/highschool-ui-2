/* ------------------------------------------------------------------ */
/*  Types for Academic Year API                                        */
/*  Base URL: /api/v1/academic-years                                   */
/* ------------------------------------------------------------------ */

export interface MarkingPeriodDto {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  semester: {
    id: string;
    name: string;
  };
}

export interface SemesterDto {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  marking_periods?: MarkingPeriodDto[];
  academic_year: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
}

export interface AcademicYearStatsDto {
  total_semesters: number;
  total_marking_periods: number;
  total_sections: number;
  total_grade_levels: number;
  total_students: number;
  total_active_sections: number;
}

export interface AcademicYearDurationDto {
  total_days: number;
  days_elapsed: number;
  completion_percentage: number;
}

export interface AcademicYearDto {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  current: boolean;
  status: "active" | "inactive" | "onhold";
  semesters: SemesterDto[];
  stats?: AcademicYearStatsDto;
  duration?: AcademicYearDurationDto;
}
