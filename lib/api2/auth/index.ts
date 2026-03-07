"use client";
import { useUsersApi } from './api'
import { useWorkspaceId } from '../utils'
import { useApiQuery, useApiMutation } from '../utils'

export function useUsers() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const workspace = useWorkspaceId()
    const api = useUsersApi()


    const getUsers = (query: any, options = {}) =>
        useApiQuery(
            ['users', query], () =>
                api.getUsersApi(query).then((res: any) => res.data), options)

    const getUser = (userId: string, options = {}) =>
        useApiQuery(
            ['users', userId], () =>
                api.getUserApi(userId).then((res: any) => res.data), options)
    
    const getSchoolUsers = (query: any, options = {}) =>
        useApiQuery(
            ['users', workspace, query], () =>
                api.getSchoolUsersApi(workspace, query).then((res: any) => res.data), options)

    const createUser = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createUserApi(data).then((res: any) => res.data), options)

    const updateUser = (options = {}) =>
        useApiMutation(
            ({id, data}: {id: string; data: any}) =>
                api.editUserApi(id, data).then(
                    (res: any) => res.data,
                ), options)

    const updateUserStatus = (options = {}) =>
        useApiMutation(
            ({id, status}: {id: string; status: string}) =>
                api.updateUserStatusApi(id, status).then(
                    (res: any) => res.data,
                ), options)
    
     const setUserDefaultPassword = (options = {}) =>
        useApiMutation(
            (id: string) =>
                api
                    .resetPasswordToDefaultApi(id)
                    .then((res: any) => res.data), options)

    const updateUserPassword = (options = {}) =>
        useApiMutation(
            ({id, data}: {id: string; data: { current_password: string; new_password: string; confirm_password: string }}) =>
                api.updateUserPasswordApi(id, data).then(
                    (res: any) => res.data,
                ), options)

    const deleteUser = (options = {}) =>
        useApiMutation(
            ({id}: {id: string}) =>
                api.deleteUserApi(id).then((res: any) => res.data), options)

    // ================== ROLES ==================

    const getRole = (id: string, options = {}) =>
        useApiQuery(
            ['roles', id], () => api.getRoleApi(id).then((res: any) => res.data), options)
    const getRoles = (query: any, options = {}) =>
        useApiQuery(
            ['roles', query], () => api.getRolesApi(query).then((res: any) => res.data), options)

    const createRole = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createRoleApi(data).then((res: any) => res.data), options)
    
        const assignRoles = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.assignRolesApi(data).then((res: any) => res.data), options)

    const updateRole = (options = {}) =>
        useApiMutation(
            ({id, data}: {id: string; data: any}) =>
                api.editRoleApi(id, data).then(
                    (res: any) => res.data,
                ), options)

    const deleteRole = (options = {}) =>
        useApiMutation(
            ({id}: {id: string}) =>
                api.deleteRoleApi(id).then((res: any) => res.data), options)

    // ================== PERMISSIONS ==================
    
    const getPermissions = (query: any, options = {}) =>
        useApiQuery(
            ['permissions', query], () =>
                api.getPermissionsApi(query).then((res: any) => res.data), options)
    const assignPermissions = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.assignPermissionsApi(data).then((res: any) => res.data), options)

    return {
        getUsers,
        getUser,
        createUser,
        updateUser,
        deleteUser,
        getSchoolUsers,
        updateUserStatus,
        updateUserPassword,
        setUserDefaultPassword,
        // Roles
        getRole,
        getRoles,
        createRole,
        updateRole,
        deleteRole,
        assignRoles,
        // Permissions
        getPermissions,
        assignPermissions,
    }
}
