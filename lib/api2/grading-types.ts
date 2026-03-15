/* ------------------------------------------------------------------ */
/*  Types for Grading API endpoints                                    */
/*  Backend: /grading/*                                                 */
/* ------------------------------------------------------------------ */

/* ============================= ENUMS ============================= */

export const GradeStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  SUBMITTED: "submitted",
  REVIEWED: "reviewed",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type GradeStatusType = (typeof GradeStatus)[keyof typeof GradeStatus];

export const CalculationMethod = {
  WEIGHTED: "weighted",
  UNWEIGHTED: "unweighted",
  POINTS_BASED: "points_based",
} as const;

export type CalculationMethodType =
  (typeof CalculationMethod)[keyof typeof CalculationMethod];

/* ============================= SHARED NESTED TYPES ============================= */

export interface RankInfo {
  rank: number;
  total_students: number;
  score: number;
  formatted_score: string;
  percentile: number;
  scope_type: string;
  label: string;
}

export interface GradingConfig {
  grading_style: string;
  use_letter_grades: boolean;
  grading_style_display?: string;
  single_entry_assessment_name?: string;
  use_default_templates?: boolean;
  auto_calculate_final_grade?: boolean;
  default_calculation_method?: string;
  require_grade_approval?: boolean;
  require_grade_review?: boolean;
  display_assessment_on_single_entry?: boolean;
  allow_assessment_delete?: boolean;
  allow_assessment_create?: boolean;
  allow_assessment_edit?: boolean;
  allow_teacher_override?: boolean;
  lock_grades_after_semester?: boolean;
  display_grade_status?: boolean;
  cumulative_average_calculation?: boolean;
  [key: string]: unknown;
}

export interface NestedSubject {
  id: string;
  name: string;
  code: string;
}

export interface NestedSection {
  id: string;
  name: string;
}

export interface NestedGradeLevel {
  id: string;
  name: string;
  code: string;
}

export interface NestedAcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface NestedMarkingPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface NestedTeacher {
  id: string;
  full_name: string;
  email: string | null;
}

export interface NestedStudent {
  id: string;
  id_number: string;
  full_name: string;
  photo_url: string | null;
}

/* ============================= GRADEBOOK ============================= */

export interface GradebookDto {
  id: string;
  section_subject: string; // ID of the SectionSubject record
  subject: NestedSubject;
  section: NestedSection;
  grade_level: NestedGradeLevel;
  academic_year: NestedAcademicYear;
  teacher: NestedTeacher | null;
  calculation_method: CalculationMethodType;
  status: GradeStatusType;
  created_at: string;
  updated_at: string;
  // Optional statistics (include_stats=true)
  total_assessments?: number;
  calculated_assessments?: number;
  overall_average?: number;
  students_with_grades?: number;
  // Optional workflow status summary (include_stats=true)
  workflow_status?: {
    predominant_status?: string;
    [key: string]: unknown;
  };
  // Legacy statistics wrapper
  statistics?: {
    total_enrolled_students?: number;
    students_with_grades?: number;
    total_assessments?: number;
    calculated_assessments?: number;
    overall_average?: number;
  };
  total_enrolled_students?: number;
  name?: string;
  active?: boolean;
}

export interface GradebookListParams {
  page?: number;
  page_size?: number;
  academic_year?: string;
  section?: string;
  subject?: string;
  teacher?: string;
  status?: GradeStatusType | "any";
  include_stats?: boolean;
}

export interface CreateGradebookCommand {
  subject: string;
  section: string;
  teacher?: string;
  calculation_method?: CalculationMethodType;
}

export interface UpdateGradebookCommand {
  teacher?: string;
  calculation_method?: CalculationMethodType;
  status?: GradeStatusType;
}

/* ============================= ASSESSMENT TYPE ============================= */

export interface AssessmentTypeDto {
  id: string;
  name: string;
  code: string;
  weight: number;
  description: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAssessmentTypeCommand {
  name: string;
  code: string;
  weight: number;
  description?: string;
  color?: string;
  is_active?: boolean;
}

export interface UpdateAssessmentTypeCommand {
  name?: string;
  code?: string;
  weight?: number;
  description?: string;
  color?: string;
  is_active?: boolean;
}

/* ============================= ASSESSMENT ============================= */

export interface AssessmentStatistics {
  total_students: number;
  graded_students: number;
  ungraded_students: number;
  pending_approval: number;
  highest_score: number | null;
  lowest_score: number | null;
  average_score: number;
  highest_percentage: number;
  lowest_percentage: number;
  average_percentage: number;
  passing_grades: number;
  failing_grades: number;
  pass_rate: number;
}

export interface AssessmentDto {
  id: string;
  active: boolean;
  name: string;
  assessment_type: {
    id: string;
    name: string;
  };
  gradebook: {
    id: string;
    name: string;
  };
  marking_period: {
    id: string;
    name: string;
    short_name: string;
    start_date: string;
    end_date: string;
  };
  grade_level: NestedGradeLevel;
  section: NestedSection;
  max_score: string;
  weight: string;
  due_date: string | null;
  is_calculated: boolean;
  created_at: string;
  updated_at: string;
  statistics?: AssessmentStatistics;
}

export interface AssessmentListParams {
  marking_period?: string;
  assessment_type?: string;
  include_stats?: boolean;
}

export interface CreateAssessmentCommand {
  gradebook: string;
  assessment_type: string;
  marking_period: string;
  name: string;
  max_score: number;
  weight?: number;
  date?: string;
  description?: string;
}

export interface UpdateAssessmentCommand {
  name?: string;
  assessment_type?: string;
  max_score?: number;
  weight?: number;
  date?: string;
  description?: string;
  status?: GradeStatusType;
}

/* ============================= GRADE ============================= */

export interface GradeDto {
  id: string;
  student: NestedStudent;
  assessment: {
    id: string;
    name: string;
    max_score: number;
  };
  score: number | null;
  letter_grade: string | null;
  percentage: number | null;
  status: GradeStatusType;
  comment: string | null;
  is_excused: boolean;
  is_absent: boolean;
  created_at: string;
  updated_at: string;
}

export interface GradeListParams {
  page?: number;
  page_size?: number;
  assessment?: string;
  student?: string;
  status?: GradeStatusType | "any";
}

export interface UpdateGradeCommand {
  score?: number | null;
  comment?: string;
  is_excused?: boolean;
  is_absent?: boolean;
}

export interface BulkCreateGradeCommand {
  assessment: string;
  grades: Array<{
    student: string;
    score?: number | null;
    comment?: string;
    is_excused?: boolean;
    is_absent?: boolean;
  }>;
}

export interface BulkUploadGradesCommand {
  file: File;
}

/* ============================= GRADE LETTER ============================= */

export interface GradeLetterDto {
  id: string;
  letter: string;
  min_score: number;
  max_score: number;
  gpa_value: number | null;
  description: string | null;
  is_passing: boolean;
  academic_year: NestedAcademicYear | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGradeLetterCommand {
  letter: string;
  min_score: number;
  max_score: number;
  gpa_value?: number;
  description?: string;
  is_passing?: boolean;
  academic_year?: string;
}

export interface UpdateGradeLetterCommand {
  letter?: string;
  min_score?: number;
  max_score?: number;
  gpa_value?: number;
  description?: string;
  is_passing?: boolean;
}

/* ============================= DEFAULT ASSESSMENT TEMPLATE ============================= */

export interface DefaultAssessmentTemplateDto {
  id: string;
  name: string;
  assessment_type: AssessmentTypeDto;
  name_template: string;
  max_score: number;
  weight: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDefaultAssessmentTemplateCommand {
  assessment_type: string;
  name_template: string;
  default_max_score: number;
  default_weight?: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdateDefaultAssessmentTemplateCommand {
  name_template?: string;
  default_max_score?: number;
  default_weight?: number;
  description?: string;
  is_active?: boolean;
}

/* ============================= FINAL GRADES (STUDENT VIEW) ============================= */

export interface GradeBookRecord {
  id: string;
  name: string;
  calculation_method: CalculationMethodType;
  subject: NestedSubject;
  averages: {
    semester_averages: Array<{
      id: string;
      name: string;
      average: number;
    }>;
    final_average: number;
  };
  marking_period: {
    id: string;
    name: string;
    final_percentage: number;
    letter_grade: string;
    status: GradeStatusType | null;
    semester: {
      id: string;
      name: string;
    };
    rank: RankInfo | null;
  };
}

export interface OverallAverages {
  semester_averages: Array<{
    id: string;
    name: string;
    average: number;
  }>;
  final_average: number;
}

export interface StudentFinalGradesResponse {
  id: string;
  id_number: string;
  full_name: string;
  section: NestedSection;
  grade_level: NestedGradeLevel;
  academic_year: NestedAcademicYear;
  config: GradingConfig;
  gradebooks: GradeBookRecord[];
  overall_averages: OverallAverages;
  total_gradebooks: number;
  ranking: {
    section: RankInfo | null;
    grade_level: RankInfo | null;
  };
}

export interface StudentFinalGradesParams {
  marking_period?: string;
  data_by?: "marking_period";
  include_average?: boolean;
  include_assessment?: boolean;
  status?: GradeStatusType | "any";
}

/* ============================= SECTION FINAL GRADES ============================= */

export interface SectionStudentGrade {
  student: NestedStudent;
  gradebooks: Array<{
    id: string;
    subject: NestedSubject;
    final_percentage: number;
    letter_grade: string;
    status: GradeStatusType;
  }>;
  overall_average: number;
  overall_letter_grade: string;
  rank: RankInfo | null;
}

export interface SectionFinalGradesResponse {
  section: NestedSection;
  grade_level: NestedGradeLevel;
  academic_year: NestedAcademicYear;
  marking_period: NestedMarkingPeriod | null;
  students: SectionStudentGrade[];
  total_students: number;
}

export interface GradeEntryAssessment {
  id: string;
  name: string;
  assessment_type: {
    id: string;
    name: string;
  } | null;
  max_score: number | null;
  weight: number | null;
  due_date: string | null;
  is_calculated: boolean;
  score: number | null;
  status: GradeStatusType | null;
  comment: string | null;
  grade_id: string | null;
  percentage: number | null;
}

export interface GradeHistory {
  id: string;
  change_type: string;
  old_score: string | null;
  new_score: string | null;
  old_status: string | null;
  new_status: string | null;
  old_comment: string | null;
  new_comment: string | null;
  change_reason: string | null;
  changed_by: {
    id: string;
    name: string;
  } | null;
  changed_at: string;
  grade_id: string;
}

export interface GradeEntryMarkingPeriod {
  id: string;
  name: string;
  short_name: string | null;
  final_percentage: number | null;
  letter_grade: string | null;
  status: GradeStatusType | null;
  needs_correction?: boolean;
  history?: GradeHistory[];
  history_count?: number;
  rank?: RankInfo | null;
  rank_label?: string | null;
  semester?: {
    id: string;
    name: string;
  } | null;
  assessments?: GradeEntryAssessment[];
}

export interface GradeEntryStudent {
  id: string;
  id_number: string;
  full_name: string;
  photo?: string | null;
  averages?: {
    semester_averages: Array<{
      id: string;
      name: string;
      average: number | null;
    }>;
    final_average: number | null;
  };
  marking_period?: GradeEntryMarkingPeriod | null;
  marking_periods?: GradeEntryMarkingPeriod[];
}

export interface SectionFinalGradesSubjectResponse {
  section: NestedSection;
  grade_level: NestedGradeLevel;
  subject: NestedSubject;
  academic_year: NestedAcademicYear;
  gradebook: {
    id: string;
    name: string;
    calculation_method: CalculationMethodType;
  };
  config?: GradingConfig;
  students: GradeEntryStudent[];
  class_average: number | null;
  total_students: number;
}

/* ============================= STATUS TRANSITIONS ============================= */

export interface StatusTransitionCommand {
  status: GradeStatusType;
  comment?: string;
}

/* ============================= PAGINATED RESPONSES ============================= */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
