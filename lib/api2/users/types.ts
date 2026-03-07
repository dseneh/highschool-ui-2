/**
 * User management types and DTOs
 */

export type UserAccountType = 'STUDENT' | 'STAFF' | 'PARENT';
export type UserRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN' | 'VIEWER';

export interface UserDto {
  id: number;
  username: string;
  email: string;
  id_number: string;
  first_name: string;
  last_name: string;
  account_type: UserAccountType;
  role: UserRole;
  photo?: string | null;
  gender?: 'male' | 'female' | 'other';
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_default_password: boolean;
  last_password_updated?: string | null;
  last_login?: string | null;
  status: any
  is_bio_editable?: boolean;
  /** Identifies the currently logged-in user */
  is_current_user?: boolean;
}

export interface UserListResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: UserDto[];
}

export interface CreateUserDto {
  id_number: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: UserAccountType;
  role: UserRole;
  gender?: 'male' | 'female' | 'other';
  username?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  first_name?: string;
  last_name?: string;
  gender?: 'male' | 'female' | 'other';
  username?: string;
  is_active?: boolean;
  status?: 'active' | 'inactive' | 'suspended' | 'deleted';
  role?: string;
  account_type?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface RecreateUserDto {
  account_type: UserAccountType;
  id_number: string;
  date_of_birth: string;
  username?: string;
}

export interface PasswordChangeDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserStatsDto {
  total_users: number;
  active_users: number;
  inactive_users: number;
  staff_count: number;
  parent_count: number;
  student_count: number;
}
