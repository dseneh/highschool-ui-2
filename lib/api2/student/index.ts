"use client";
import { useApiMutation, useApiQuery } from '../utils'
import { useStudentsApi } from './api'

export function useStudents() {
    /* eslint-disable react-hooks/rules-of-hooks */
    
    const api = useStudentsApi()

    const getStudents = (query: any, options = {}) =>
        useApiQuery(
            ['students', query],
            () => api.getStudentsApi(query).then((res: any) => res.data),
            options,
        )

    const getStudent = (studentId: string, options = {}) =>
        useApiQuery(
            ['students', studentId],
            () => api.getStudentApi(studentId).then((res: any) => res.data),
            options,
        )

    const getStudentBills = (studentId: string, query: any = {}, options = {}) =>
        useApiQuery(
            ['students', studentId, 'bills', query],
            () => api.getStudentBillsApi(studentId, query).then((res: any) => res.data),
            options,
        )

    const getStudentTransactions = (studentId: string, options = {}) =>
        useApiQuery(
            ['students', studentId, 'transactions'],
            () => api.getStudentTransactionsApi(studentId).then((res: any) => res.data),
            options,
        )

    const createStudent = (options = {}) =>
        useApiMutation(
            (data: any) => api.createStudentApi(data).then((res: any) => res.data),
            options,
        )
    const createStudentUpload = (options = {}) =>
        useApiMutation(
            ({ data, gradeLevelId }: { data: any; gradeLevelId: string }) =>
                api
                    .createStudentUploadApi(gradeLevelId, data)
                    .then((res: any) => res.data),
            options,
        )

    const updateStudent = (studentId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editStudentApi(studentId, data).then((res: any) => res.data),
            options,
        )

    const patchStudent = (studentId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchStudentApi(studentId, data).then((res: any) => res.data),
            options,
        )

    const deleteStudent = (studentId: string, options = {}) =>
        useApiMutation(
            (forceDelete: boolean = false) => api.deleteStudentApi(studentId, forceDelete).then((res: any) => res.data),
            options,
        )
    const getStudentPaymentStatus = (options = {}) =>
        useApiQuery(
            ['students', 'payment-status', options],
            () => api.getStudentPaymentStatusApi(options).then((res: any) => res.data),
            options,
        )

    const downloadStudentBillingPDF = (studentId: string, options = {}) =>
        useApiQuery(
            ['downloadStudentBilling', studentId],
            () => api.downloadStudentBillingPDFApi(studentId).then((res: any) => res.data),
            options,
        )

    return {
        getStudents,
        getStudent,
        createStudent,
        updateStudent,
        patchStudent,
        deleteStudent,
        getStudentBills,
        getStudentTransactions,
        createStudentUpload,
        getStudentPaymentStatus,
        downloadStudentBillingPDF,
    }
}

// export default useStudents
