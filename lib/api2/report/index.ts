"use client";
import { useWorkspaceId, useApiQuery } from '../utils'
import { useReportsApi } from './api';

export function useReports() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const workspace = useWorkspaceId()
    const api = useReportsApi(workspace!)

    const getTransactionsReport = (query: any, options = {}) =>
        useApiQuery(
            ['transactions-report', query],
            () => api.getTransactionsReportApi(query).then((res: any) => res.data),
            options,
        )


    return {
        getTransactionsReport,
    }
}
