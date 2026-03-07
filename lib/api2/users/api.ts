import { useAxiosAuth } from '@/hooks/use-axios-auth'
import type {
  UserDto,
  UserListResponse,
  CreateUserDto,
  UpdateUserDto,
  RecreateUserDto,
  PasswordChangeDto,
} from './types'

export const useUsersApi = () => {
  const { get, post, put, patch, delete: del } = useAxiosAuth()

  /**
   * List users in the current tenant or global users
   */
  const listUsers = async (query?: { 
    search?: string; 
    role?: string | string[];
    account_type?: string | string[];
    is_active?: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
    is_default_password?: boolean;
    scope?: string;
  }) => {
    return get<UserListResponse>('/auth/users/', { params: query })
  }

  /**
   * Get a single user by id_number
   */
  const getUser = async (idNumber: string) => {
    return get<UserDto>(`/auth/users/${idNumber}/`)
  }

  /**
   * Create a new user in the current tenant
   * Automatically assigns to tenant and creates from source record if account_type is STUDENT/STAFF/PARENT
   */
  const createUser = async (data: RecreateUserDto | CreateUserDto) => {
    return post<UserDto>('/auth/users/', data)
  }

  /**
   * Create a global user (public schema only, not assigned to any tenant)
   */
  const createGlobalUser = async (data: CreateUserDto) => {
    return post<UserDto>('/auth/users/global/', data)
  }

  /**
   * Recreate a user account from an existing Student/Staff/Parent source record
   * Requires: account_type, id_number, date_of_birth
   * Automatically populates fields from source data
   */
  const recreateUser = async (data: RecreateUserDto) => {
    return post<UserDto>('/auth/users/recreate/', data)
  }

  /**
   * Update user details
   */
  const updateUser = async (idNumber: string, data: UpdateUserDto) => {
    return put<UserDto>(`/auth/users/${idNumber}/`, data)
  }

  /**
   * Change password for the current user
   */
  const changePassword = async (idNumber: string, data: PasswordChangeDto) => {
    return post<void>(`/auth/users/${idNumber}/password/change/`, data)
  }

  /**
   * Delete a user
   */
  const deleteUser = async (idNumber: string) => {
    return del<void>(`/auth/users/${idNumber}/`)
  }

  /**
   * Soft delete or hard delete a user
   */
  const deleteUserWithOptions = async (idNumber: string, hard: boolean = false) => {
    return del<void>(`/auth/users/${idNumber}/`, { params: { hard } })
  }

  return {
    listUsers,
    getUser,
    createUser,
    createGlobalUser,
    recreateUser,
    updateUser,
    changePassword,
    deleteUser,
    deleteUserWithOptions,
  }
}
