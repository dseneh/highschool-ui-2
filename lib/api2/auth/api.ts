import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useUsersApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()

    const getUsersApi = async (query?: any) => {
        return get(`/auth/users/`, { params: query })
    }

    const getUserApi = async (id: string) => {
        return get(`/auth/users/${id}/`)
    }

    const getSchoolUsersApi = async (schoolId: string, query?: any) => {
        return get(`/schools/${schoolId}/users/`, { params: query })
    }

    const createUserApi = async (data: any) => {
        return post(`/auth/users/`, data)
    }

    const editUserApi = async (id: string, data: any) => {
        return put(`/auth/users/${id}/`, data)
    }

    const updateUserStatusApi = async (id: string, status: string) => {
        return patch(`/auth/users/${id}/status/`, { status })
    }

    const updateUserPasswordApi = async (
        id: string,
        data: { current_password: string; new_password: string; confirm_password: string },
    ) => {
        return post(`/auth/users/${id}/password/change/`, data)
    }

    const deleteUserApi = async (id: string) => {
        return del(`/auth/users/${id}/`)
    }
    
    // ================= AUTH ==================

    const resetPasswordToDefaultApi = async (id: string) => {
        return put(`/auth/users/${id}/password-reset/`)
    }

    // ================== ROLES ==================

    const getRolesApi = async (query: any) => {
        return get(`/auth/roles/`, { params: query })
    }
    const getRoleApi = async (id: string) => {
        return get(`/auth/roles/${id}/`)
    }

    const createRoleApi = async (data: any) => {
        return post(`/auth/roles/`, data)
    }
    const assignRolesApi = async (data: any) => {
        return post(`/auth/roles/assign/`, data)
    }

    const editRoleApi = async (id: string, data: any) => {
        return put(`/auth/roles/${id}/`, data)
    }

    const deleteRoleApi = async (id: string) => {
        return del(`/auth/roles/${id}/`)
    }

    // ================== PERMISSIONS ==================
    const assignPermissionsApi = async (data: any) => {
        return post(`/auth/permissions/assign/`, data)
    }
    const getPermissionsApi = async (query: any) => {
        return get(`/auth/permissions/`, { params: query })
    }

    return {
        getUserApi,
        getUsersApi,
        createUserApi,
        editUserApi,
        deleteUserApi,
        updateUserStatusApi,
        getSchoolUsersApi,
        updateUserPasswordApi,
        // Auth
        resetPasswordToDefaultApi,
        // Roles
        getRoleApi,
        getRolesApi,
        createRoleApi,
        editRoleApi,
        deleteRoleApi,
        assignRolesApi,
        // Permissions
        getPermissionsApi,
        assignPermissionsApi,
    }
}
