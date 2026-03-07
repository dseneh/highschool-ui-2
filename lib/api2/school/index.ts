"use client";
import { useSchoolsApi } from './api'
import { useWorkspaceId } from '../utils'
import { useApiQuery, useApiMutation } from '../utils'

export function useSchools() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const workspace = useWorkspaceId()
    const api = useSchoolsApi()

    const getWorkspaces = (options = {}) =>
        useApiQuery(
            ['workspaces'], () => api.getWorkspacesApi().then((res: any) => res.data), options)
    const getTenants = (options = {}) =>
        useApiQuery(
            ['tenants'], () => api.getTenantsApi().then((res: any) => res.data), options)
    const getTenant = (tenantId: string, options = {}) =>
        useApiQuery(
            ['tenants', tenantId], () => api.getTenantApi(tenantId).then((res: any) => res.data), options)
    const getPublicTenant = (tenantId: string, options = {}) =>
        useApiQuery(
            ['tenants', tenantId], () => api.getPublicTenantApi(tenantId).then((res: any) => res.data), options)
    const getWorkspace = (workspaceId: string, options = {}) =>
        useApiQuery(
            ['workspace', workspaceId], () => api.getWorkspaceApi(workspaceId).then((res: any) => res.data), options)

    const getSchools = (query: any, options = {}) =>
        useApiQuery(
            ['schools', query], () => api.getSchoolsApi(query).then((res: any) => res.data), options)

    const getCurrentSchool = (options = {}) =>
        useApiQuery(
            ['tenants', workspace], () => api.getSchoolApi(workspace!).then((res: any) => res.data), options)

    const getSchool = (schoolId: string, options = {}) =>
        useApiQuery(
            ['schools', schoolId], () => api.getSchoolApi(schoolId).then((res: any) => res.data), options)

    const getSchoolUsers = (schoolId: string, options = {}) =>
        useApiQuery(
            ['schools', schoolId, 'users'], () => api.getSchoolUsersApi(schoolId).then((res: any) => res.data), options)

    const lookupWorkspace = (options = {}) =>
        useApiMutation(
            (id: string) =>
                api.lookupWorkspaceApi(id).then((res: any) => res.data), options)

    const createSchool = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createSchoolApi(data).then((res: any) => res.data), options)

    const updateCurrentSchool = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editSchoolApi(workspace!, data).then((res: any) => res.data), options)
    const updateSchool = (schoolId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editSchoolApi(schoolId, data).then((res: any) => res.data), options)
    const updateSchoolLogo = (schoolId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editSchoolLogoApi(schoolId, data).then((res: any) => res.data), options)

    const deleteSchool = (schoolId: string, options = {}) =>
        useApiMutation(
            () =>
                api.deleteSchoolApi(schoolId).then((res: any) => res.data), options)

    const createSchoolInstallments = (academicYearId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createSchoolInstallmentsApi(academicYearId, data).then((res: any) => res.data), options)

    const getSchoolInstallments = (academicYearId: string, options = {}) =>
        useApiQuery(
            ['schools', 'academic-years', academicYearId, 'installments'], () => api.getSchoolInstallmentsApi(academicYearId).then((res: any) => res.data), options)

    const editSchoolInstallments = (installmentId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editSchoolInstallmentsApi(installmentId, data).then((res: any) => res.data), options)

    const bulkUpdateSchoolInstallments = (academicYearId: string, options = {}) =>
        useApiMutation(
            (data: any[]) =>
                api.bulkUpdateSchoolInstallmentsApi(academicYearId, data).then((res: any) => res.data), options)

    const deleteSchoolInstallments = (options = {}) =>
        useApiMutation(
            (installmentId: string) =>
                api.deleteSchoolInstallmentsApi(installmentId).then((res: any) => res.data), options)

    return {
        getSchools,
        getCurrentSchool,
        getSchool,
        createSchool,
        updateCurrentSchool,
        updateSchool,
        deleteSchool,
        updateSchoolLogo,
        getSchoolUsers,
        getWorkspace,
        lookupWorkspace,
        getWorkspaces,
        createSchoolInstallments,
        getSchoolInstallments,
        editSchoolInstallments,
        bulkUpdateSchoolInstallments,
        deleteSchoolInstallments,
        getTenants,
        getTenant,
        getPublicTenant,
    }
}
