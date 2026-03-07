/* ================================================================= */
/*  Staff API v2 Type Definitions                                    */
/*  Generated from backend Staff + Position + Department models      */
/* ================================================================= */

/**
 * Position (Role/Job Title)
 */
export interface Position {
  id: string;
  title: string;
  code?: string | null;
  description?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  department?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
  level?: number;
  employment_type?: string;
  compensation_type?: string;
  salary_min?: number | string | null;
  salary_max?: number | string | null;
  teaching_role?: boolean;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Department
 */
export interface Department {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Position Category
 */
export interface PositionCategory {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * User Account (nested in Staff)
 */
export interface UserAccount {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  role?: string;
  last_login?: string | null;
  last_password_updated?: string | null;
}

/**
 * Manager/Reports To (self-reference)
 */
export interface StaffManager {
  id: string;
  id_number: string;
  full_name: string;
  photo: string | null;
}

/**
 * Single Staff Member (Full Details)
 */
export interface StaffDto {
  id: string;
  id_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  date_of_birth?: string | null; // ISO 8601
  gender?: string | null;
  email: string;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  place_of_birth?: string | null;
  status: string; // active, inactive, on_leave, etc.
  photo?: string | null;
  hire_date: string; // ISO 8601
  primary_department?: Department | string | null;
  position?: Position | string | null;
  user_account?: UserAccount | string | null;
  is_teacher: boolean;
  is_admin?: boolean;
  manager?: StaffManager | string | null;
  reports_to?: StaffManager | string | null; // Manager (self-reference)
  suspension_date?: string | null;
  suspension_reason?: string | null;
  termination_date?: string | null;
  termination_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  sections?: any[];
  subjects?: any[];
  schedules?: any[];
}

export interface StaffListItem {
  id: string;
  id_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  email: string;
  phone_number?: string | null;
  status: string;
  photo?: string | null;
  hire_date: string;
  primary_department?: Department | string | null;
  position?: Position | string | null;
  is_teacher: boolean;
  manager?: StaffManager | null;
}

/**
 * Paginated Staff List Response
 */
export interface StaffListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffListItem[];
}

/**
 * POST /staff - Create Staff Command
 */
export interface CreateStaffCommand {
  id_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  date_of_birth?: string | null; // YYYY-MM-DD
  gender?: string | null;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  place_of_birth?: string | null;
  hire_date: string; // YYYY-MM-DD
  status?: string; // active, inactive, on_leave
  position?: string | null; // UUID
  primary_department?: string | null; // UUID
  photo?: File | null; // FormData
  
  // User Account creation
  initialize_user?: boolean;
  username?: string | null;
  role?: string | null; // admin, teacher, viewer
}

/**
 * PUT /staff/{id} - Update Staff Command
 */
export interface UpdateStaffCommand {
  id_number?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  place_of_birth?: string | null;
  hire_date?: string;
  status?: string;
  position?: string | null;
  primary_department?: string | null;
  manager?: string | null;
  is_teacher?: boolean;
  suspension_date?: string | null;
  suspension_reason?: string | null;
  termination_date?: string | null;
  termination_reason?: string | null;
  photo?: File | null;
}

/**
 * PATCH /staff/{id} - Partial Update
 */
export type PatchStaffCommand = Partial<UpdateStaffCommand>;

/**
 * Query Parameters for Staff List
 */
export interface ListStaffParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string; // e.g., "-hire_date", "full_name"
  status?: string;
  is_teacher?: boolean;
  position?: string; // UUID filter
  department?: string; // UUID filter
}

/**
 * Teacher-specific response (subset of Staff)
 */
export interface TeacherDto extends StaffDto {
  is_teacher: true;
  subjects?: string[]; // Array of subject IDs
  classes?: string[]; // Array of class/section IDs
}

/**
 * Teachers List Response
 */
export interface TeacherListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TeacherDto[];
}

/**
 * Teacher Assignment/Schedule
 */
export interface TeacherSchedule {
  id: string;
  teacher: string; // UUID
  section: string; // UUID
  subject: string; // UUID
  start_date: string; // ISO 8601
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Teacher Subject Assignment
 */
export interface TeacherSubject {
  id: string;
  teacher: string;
  subject: string;
  grade_level?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Teacher Section Assignment
 */
export interface TeacherSection {
  id: string;
  teacher: string;
  section: string;
  assigned_date?: string | null;
  created_at?: string;
  updated_at?: string;
}
