"use client";
import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useStudentsApi = () => {
    const { get, post, put, delete: del } = useAxiosAuth()

    const getStudentsApi = async (query?: any) => {
        return get(`/students/`, { params: query })
    }

    const getStudentBillsApi = async (id: string, query?: any) => {
        return get(`/students/${id}/bills/`, { params: query })
    }

    const downloadStudentBillingPDFApi = async (id: string) => {
        return get(`/students/${id}/bills/download-pdf/`, { 
            responseType: 'blob' 
        })
    }

    const getStudentTransactionsApi = async (id: string) => {
        return get(`/transactions/students/${id}/`)
    }

    const getStudentApi = async (id: string) => {
        return get(`/students/${id}/`)
    }
    const createStudentApi = async (data: any) => {
        return post(`/students/`, data)
    }

    const createStudentUploadApi = async (gradeLevelId: string, data: any) => {
        return post(`/grade-levels/${gradeLevelId}/student-uploads/`, data)
    }

    const editStudentApi = async (id: string, data: any) => {
        return put(`/students/${id}/`, data)
    }

    const deleteStudentApi = async (id: string, forceDelete: boolean = false) => {
        return del(`/students/${id}/`, { 
            params: { force_delete: forceDelete } 
        })
    }

    const getStudentPaymentStatusApi = async (options = {}) => {
        return get(`/payment-status/`, { params: options })
    }

    return {
        getStudentApi,
        editStudentApi,
        createStudentApi,
        deleteStudentApi,
        getStudentsApi,
        getStudentBillsApi,
        downloadStudentBillingPDFApi,
        getStudentTransactionsApi,
        createStudentUploadApi,
        getStudentPaymentStatusApi,
    }
}

// Add explicit return type for useStudentsApi
export type UseStudentsApiReturn = ReturnType<typeof useStudentsApi>
