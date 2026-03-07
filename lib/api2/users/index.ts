"use client";
import { useUsersApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'
import type {
  UserDto,
  UserListResponse,
  CreateUserDto,
  UpdateUserDto,
  RecreateUserDto,
  PasswordChangeDto,
} from './types'

export function useUsers() {
  /* eslint-disable react-hooks/rules-of-hooks */
  const api = useUsersApi()

  /**
   * Get list of users in the current tenant
   */
  const getUsers = (query?: any, options = {}) =>
    useApiQuery(
      ['users', query],
      () => api.listUsers(query).then((res: any) => res.data),
      options,
    )

  /**
   * Get a single user by id_number
   */
  const getUser = (idNumber: string, options = {}) =>
    useApiQuery(
      ['users', idNumber],
      () => api.getUser(idNumber).then((res: any) => res.data),
      options,
    )

  /**
   * Create a new user in the current tenant
   */
  const createUser = (options = {}) =>
    useApiMutation(
      (data: RecreateUserDto | CreateUserDto) =>
        api.createUser(data).then((res: any) => res.data),
      options,
    )

  /**
   * Create a global user (public schema only)
   */
  const createGlobalUser = (options = {}) =>
    useApiMutation(
      (data: CreateUserDto) =>
        api.createGlobalUser(data).then((res: any) => res.data),
      options,
    )

  /**
   * Recreate a user from a source record (Student/Staff/Parent)
   */
  const recreateUser = (options = {}) =>
    useApiMutation(
      (data: RecreateUserDto) =>
        api.recreateUser(data).then((res: any) => res.data),
      options,
    )

  /**
   * Update user details
   */
  const updateUser = (options = {}) =>
    useApiMutation(
      ({ idNumber, data }: { idNumber: string; data: UpdateUserDto }) =>
        api.updateUser(idNumber, data).then((res: any) => res.data),
      options,
    )

  /**
   * Change password
   */
  const changePassword = (options = {}) =>
    useApiMutation(
      ({ idNumber, data }: { idNumber: string; data: PasswordChangeDto }) =>
        api.changePassword(idNumber, data).then((res: any) => res.data),
      options,
    )

  /**
   * Delete a user
   */
  const deleteUser = (options = {}) =>
    useApiMutation(
      ({ idNumber, hard }: { idNumber: string; hard?: boolean }) =>
        api.deleteUserWithOptions(idNumber, hard).then((res: any) => res.data),
      options,
    )

  return {
    getUsers,
    getUser,
    createUser,
    createGlobalUser,
    recreateUser,
    updateUser,
    changePassword,
    deleteUser,
  }
}

export type { UserDto, UserListResponse, CreateUserDto, UpdateUserDto, RecreateUserDto, PasswordChangeDto }
