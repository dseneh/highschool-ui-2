import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useReportsApi = (workspace: string) => {
    const { get } = useAxiosAuth()

    const getTransactionsReportApi = async (query?: any) => {
        return get(`/reports/transactions/`, { params: query })
    }


    return {
        getTransactionsReportApi,
    }
}
