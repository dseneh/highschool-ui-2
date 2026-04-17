/* ================================================================= */
/*  Employee (HR) API v2 Type Definitions                            */
/*  Mirrors Staff types but with employee-specific field names       */
/* ================================================================= */

/**
 * Employee Department
 */
export interface EmployeeDepartment {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Employee Position
 */
export interface EmployeePosition {
  id: string;
  title: string;
  code?: string | null;
  description?: string | null;
  department?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
  employment_type?: string;
  can_teach?: boolean;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Employee Manager (nested in Employee)
 */
export interface EmployeeManager {
  id: string;
  id_number: string;
  full_name: string;
}

/**
 * Employee Contact (nested read-only)
 */
export interface EmployeeContact {
  id: string;
  contact_type: string;
  name: string;
  relationship: string;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  is_emergency_contact?: boolean;
}

/**
 * Employee Dependent (nested read-only)
 */
export interface EmployeeDependent {
  id: string;
  name: string;
  relationship: string;
  date_of_birth?: string | null;
  gender?: string | null;
}

/**
 * Single Employee (Full Details) — returned by GET /employees/{id}/
 */
export interface EmployeeDto {
  id: string;
  id_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
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
  employment_status: string; // active, inactive, suspended, terminated, on_leave, retired
  photo?: string | null;
  photo_url?: string | null;
  has_photo?: boolean;
  hire_date?: string | null;
  termination_date?: string | null;
  termination_reason?: string | null;
  department?: EmployeeDepartment | string | null;
  position?: EmployeePosition | string | null;
  manager?: EmployeeManager | string | null;
  job_title?: string | null;
  employment_type?: string | null;
  national_id?: string | null;
  passport_number?: string | null;
  user_account_id_number?: string | null;
  is_teacher?: boolean;
  is_teaching_staff?: boolean;
  contacts?: EmployeeContact[];
  dependents?: EmployeeDependent[];
  sections?: {
    id: string;
    name: string;
    grade_level?: { id: string; name: string } | null;
  }[];
  subjects?: {
    id: string;
    section_subject?: {
      id: string;
      section?: { id: string; name: string; grade_level?: { id: string; name: string } | null };
      subject?: { id: string; name: string };
    } | null;
    subject?: { id: string; name: string } | null;
  }[];
  leave_requests?: any[];
  leave_balances?: any[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Employee List Item (returned in paginated list)
 */
export interface EmployeeListItem {
  id: string;
  id_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  email?: string | null;
  phone_number?: string | null;
  employment_status: string;
  photo?: string | null;
  photo_url?: string | null;
  has_photo?: boolean;
  hire_date?: string | null;
  department?: EmployeeDepartment | string | null;
  position?: EmployeePosition | string | null;
  manager?: EmployeeManager | null;
  job_title?: string | null;
  employment_type?: string | null;
  is_teacher?: boolean;
  is_teaching_staff?: boolean;
}

/**
 * Paginated Employee List Response
 */
export interface EmployeeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EmployeeListItem[];
}

/**
 * POST /employees/ - Create Employee Command
 */
export interface CreateEmployeeCommand {
  id_number?: string | null; // Auto-generated if blank
  first_name: string;
  last_name: string;
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
  hire_date?: string | null;
  employment_status?: string;
  position?: string | null; // UUID
  department?: string | null; // UUID
  manager?: string | null; // UUID
  job_title?: string | null;
  employment_type?: string | null;
  national_id?: string | null;
  passport_number?: string | null;
  user_account_id_number?: string | null;
  is_teacher?: boolean;
  photo?: File | null;
}

/**
 * PUT/PATCH /employees/{id}/ - Update Employee Command
 */
export interface UpdateEmployeeCommand {
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
  hire_date?: string | null;
  employment_status?: string;
  position?: string | null;
  department?: string | null;
  manager?: string | null;
  job_title?: string | null;
  employment_type?: string | null;
  national_id?: string | null;
  passport_number?: string | null;
  user_account_id_number?: string | null;
  is_teacher?: boolean;
  termination_date?: string | null;
  termination_reason?: string | null;
  photo?: File | null;
}

/**
 * PATCH - Partial Update
 */
export type PatchEmployeeCommand = Partial<UpdateEmployeeCommand>;

/**
 * Query Parameters for Employee List
 */
export interface ListEmployeeParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  employment_status?: string;
  is_teacher?: boolean;
  position?: string;
  department?: string;
  gender?: string;
}
