"use client";
import { useWorkspaceId, useApiQuery } from '../utils'
import { useSummaryApi } from './api'

export function useSummary() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const workspace = useWorkspaceId()
    const api = useSummaryApi(workspace!)

    const getStudentBillingSummary = (query: any = {}, options = {}) =>
        useApiQuery(
            ['studentBillingSummary', query],
            () => api.getBillingSummaryApi(query).then((res: any) => res.data),
            options,
        )

    const downloadStudentBillingSummary = (query: any = {}, options = {}) =>
        useApiQuery(
            ['downloadStudentBillingSummary', query],
            () => api.downloadBillingSummaryApi(query).then((res: any) => res.data),
            options,
        )

    return {
        getStudentBillingSummary,
        downloadStudentBillingSummary,
    }
}
