import { useAxiosAuth } from '@/hooks/use-axios-auth'
import { useWorkspaceId } from '../utils'

export const useSchoolsApi = () => {
    const { get, post, put, delete: del } = useAxiosAuth()
    const workspace = useWorkspaceId()

    const getWorkspacesApi = async () => {
        return get(`/workspaces/`)
    }
    const getTenantsApi = async () => {
        return get(`/tenants/`)
    }
    const getTenantApi = async (schema_name: string) => {
        return get(`/tenants/${schema_name}/`)
    }
    const getPublicTenantApi = async (schema_name: string) => {
        return get(`/tenants/${schema_name}/`, {
            skipAuth: true,
        } as any)
    }

    const getWorkspaceApi = async (id: string) => {
        return get(`/workspaces/${id}/`)
    }
    const lookupWorkspaceApi = async (id: string) => {
        return post(`/workspaces/${id}/`,)
    }
    const getSchoolApi = async (id: string) => {
        return get(`/tenants/${id}/`, {
            skipAuth: true,
        } as any)
    }
    const createSchoolApi = async (data: any) => {
        return post(`/tenants/`, data)
    }

    const editSchoolApi = async (id: string, data: any) => {
        return put(`/tenants/${id}/`, data)
    }

    const editSchoolLogoApi = async (id: string, data: any) => {
        return put(`/tenants/${id}/logo/`, data)
    }
    const deleteSchoolApi = async (id: string) => {
        return del(`/tenants/${id}/`)
    }
    const getSchoolsApi = async (query: any) => {
        return get(`/tenants/`, { params: query })
    }

    const getSchoolUsersApi = async (schoolId: string) => {
        return get(`/tenants/${schoolId}/users/`)
    }

    const createSchoolInstallmentsApi = async (academicYearId: string, data: any) => {
        return post(`/academic-years/${academicYearId}/installments/`, data)
    }

    const getSchoolInstallmentsApi = async (academicYearId: string) => {
        return get(`/academic-years/${academicYearId}/installments/`)
    }
    const editSchoolInstallmentsApi = async (installmentId: string, data: any) => {
        return put(`/installments/${installmentId}/`, data)
    }

    const bulkUpdateSchoolInstallmentsApi = async (academicYearId: string, data: any[]) => {
        return put(`/academic-years/${academicYearId}/installments/`, data)
    }

    const deleteSchoolInstallmentsApi = async (installmentId: string) => {
        return del(`/installments/${installmentId}/`)
    }

    const getTenantSettingsApi = async (tenantId: string) => {
        return get(`/tenants/${tenantId}/`)
    }

    const updateTenantOrganizationInfoApi = async (tenantId: string, data: any) => {
        return put(`/tenants/${tenantId}/`, data)
    }

    const updateTenantBrandingApi = async (tenantId: string, data: any) => {
        return put(`/tenants/${tenantId}/`, data)
    }

    const updateTenantThemeApi = async (tenantId: string, data: any) => {
        return put(`/tenants/${tenantId}/`, data)
    }

    const uploadTenantLogoApi = async (tenantId: string, file: File) => {
        const formData = new FormData()
        formData.append('logo', file)
        return put(`/tenants/${tenantId}/logo/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        } as any)
    }

    const invalidateCacheApi = async (dataType: string = 'all') => {
        return post(`/cache/invalidate/`, { data_type: dataType })
    }

    return {
        getSchoolApi,
        editSchoolApi,
        createSchoolApi,
        deleteSchoolApi,
        getSchoolsApi,
        editSchoolLogoApi,
        getSchoolUsersApi,
        getWorkspaceApi,
        lookupWorkspaceApi,
        getWorkspacesApi,
        createSchoolInstallmentsApi,
        getSchoolInstallmentsApi,
        editSchoolInstallmentsApi,
        deleteSchoolInstallmentsApi,
        bulkUpdateSchoolInstallmentsApi,
        getTenantsApi,
        getTenantApi,
        getPublicTenantApi,
        getTenantSettingsApi,
        updateTenantOrganizationInfoApi,
        updateTenantBrandingApi,
        updateTenantThemeApi,
        uploadTenantLogoApi,
        invalidateCacheApi,
    }
}
