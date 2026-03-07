"use client";
import { useAxiosAuth } from '@/hooks/use-axios-auth'

/**
 * Student Billing API (Updated for backend-v2)
 * All endpoints use /api/v1/students/bills/ prefix
 * Tenant is determined by X-Tenant header (no workspace in URL)
 */
export const useBillingsApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/students/bills'

    // List student bills with query parameters
    const getBillingsApi = async (query?: any) => {
        return get(`${baseUrl}/`, { params: query })
    }

    // Get bills for a specific student
    const getStudentBillsApi = async (studentId: string, query?: any) => {
        return get(`${baseUrl}/`, { 
            params: { ...query, student_id: studentId } 
        })
    }

    // Get bills for a specific enrollment
    const getEnrollmentBillsApi = async (enrollmentId: string, query?: any) => {
        return get(`${baseUrl}/`, { 
            params: { ...query, enrollment_id: enrollmentId } 
        })
    }

    // Get single bill by ID
    const getBillingApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    // Create new bill
    const createBillingApi = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    // Update bill (full update)
    const editBillingApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    // Partial update bill
    const patchBillingApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    // Delete bill
    const deleteBillingApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    // Legacy: Bill recreation endpoints (if still needed)
    const reGenerateBillingApi = async (query: any) => {
        // This endpoint may need to be implemented separately
        // For now, keeping the old endpoint path
        return post(`/students/bills/recreate/`, {}, { params: query })
    }

    const reGenerateBillingPreviewApi = async (query: any) => {
        // This endpoint may need to be implemented separately
        // For now, keeping the old endpoint path
        return get(`/students/bills/recreate/preview/`, { params: query })
    }

    // Student Concessions

    const getStudentConcessionsApi = async (academicYearId: string, query?: any) => {
        return get(`/concessions/academic-years/${academicYearId}/`, { params: query })
    }

    const createStudentConcessionApi = async (academicYearId: string, data: any) => {
        return post(`/concessions/academic-years/${academicYearId}/`, data)
    }

    const updateStudentConcessionApi = async (concessionId: string, data: any) => {
        return put(`/concessions/${concessionId}/`, data)
    }

    const deleteStudentConcessionApi = async (concessionId: string) => {
        return del(`/concessions/${concessionId}/`)
    }

    const getStudentConcessionStatsApi = async (academicYearId: string) => {
        return get(`/concessions/${academicYearId}/stats/`)
    }

    return {
        getBillingApi,
        getBillingsApi,
        getStudentBillsApi,
        getEnrollmentBillsApi,
        editBillingApi,
        patchBillingApi,
        createBillingApi,
        deleteBillingApi,
        reGenerateBillingApi,
        reGenerateBillingPreviewApi,
        getStudentConcessionsApi,
        createStudentConcessionApi,
        updateStudentConcessionApi,
        deleteStudentConcessionApi,
        getStudentConcessionStatsApi,
    }
}
