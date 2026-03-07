/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useBillingsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

/**
 * Student Billing React Query hooks (Updated for backend-v2)
 * All endpoints use /api/v1/students/bills/ prefix
 */
export function useBillings() {
    const api = useBillingsApi()

    // Query: Get all bills (with optional filters)
    const getBillings = (query: any = {}, options = {}) =>
        useApiQuery(
            ['bills', query], () =>
                api.getBillingsApi(query).then((res: any) => res.data), options)

    // Query: Get bills for a specific student
    const getStudentBills = (studentId: string, query: any = {}, options = {}) =>
        useApiQuery(
            ['bills', 'student', studentId, query], () =>
                api.getStudentBillsApi(studentId, query).then((res: any) => res.data), options)

    // Query: Get bills for a specific enrollment
    const getEnrollmentBills = (enrollmentId: string, query: any = {}, options = {}) =>
        useApiQuery(
            ['bills', 'enrollment', enrollmentId, query], () =>
                api.getEnrollmentBillsApi(enrollmentId, query).then((res: any) => res.data), options)

    // Query: Get single bill
    const getBilling = (id: string, options = {}) =>
        useApiQuery(
            ['bills', id], () =>
                api.getBillingApi(id).then((res: any) => res.data), options)

    // Mutation: Create bill
    const createBilling = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createBillingApi(data).then((res: any) => res.data), options)

    // Mutation: Update bill (full update)
    const updateBilling = (id: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editBillingApi(id, data).then((res: any) => res.data), options)

    // Mutation: Partial update bill
    const patchBilling = (id: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.patchBillingApi(id, data).then((res: any) => res.data), options)

    // Mutation: Delete bill
    const deleteBilling = (id: string, options = {}) =>
        useApiMutation(
            () =>
                api.deleteBillingApi(id).then((res: any) => res.data), options)

    // Legacy: Regenerate bills
    const reGenerateBilling = (options = {}) =>
        useApiMutation(
            (query: any) =>
                api.reGenerateBillingApi(query).then((res: any) => res.data), options)

    // Legacy: Preview bill regeneration
    const reGenerateBillingPreview = (query: any, options = {}) =>
        useApiQuery(
            ['bills', 'regenerate', 'preview', query], () =>
                api.reGenerateBillingPreviewApi(query).then((res: any) => res.data), options)

    // Query: Get student concessions for a specific academic year
    const getStudentConcessions = (academicYearId: string, query: any = {}, options = {}) =>
        useApiQuery(
            ['concessions', 'academicYear', academicYearId, query], () =>
                api.getStudentConcessionsApi(academicYearId, query).then((res: any) => res.data), options)

    const deleteStudentConcession = (id: string, options = {}) =>
        useApiMutation(
            () => api.deleteStudentConcessionApi(id).then((res: any) => res.data), options)
    
    const createStudentConcession = (studentId: string, data: any, options = {}) =>
        useApiMutation(
            () => api.createStudentConcessionApi(studentId, data).then((res: any) => res.data), options)
    
    const updateStudentConcession = (id: string, data: any, options = {}) =>
        useApiMutation(
            () =>
                api.updateStudentConcessionApi(id, data).then((res: any) => res.data), options)

    // Query: Get concession stats for a specific academic year
    const getStudentConcessionStats = (academicYearId: string, options = {}) =>
        useApiQuery(
            ['concessions', 'stats', academicYearId], () =>
                api.getStudentConcessionStatsApi(academicYearId).then((res: any) => res.data), options)
    
    return {
        getBilling,
        getBillings,
        getStudentBills,
        getEnrollmentBills,
        createBilling,
        updateBilling,
        patchBilling,
        deleteBilling,
        reGenerateBilling,
        reGenerateBillingPreview,
        getStudentConcessions,
        getStudentConcessionStats,
        createStudentConcession,
        updateStudentConcession,
        deleteStudentConcession,
    }
}
