import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useSummaryApi = (workspace: string) => {
    const { get } = useAxiosAuth()

    const getBillingSummaryApi = async (query: any) => {
        return get(`/bill-summary/`, { params: query })
    }

    const downloadBillingSummaryApi = async (query: any) => {
        return get(`/bill-summary/download/`, { 
            params: query,
            responseType: 'blob' // Important: tell axios to expect binary data
        })
    }


    return {
        getBillingSummaryApi,
        downloadBillingSummaryApi,
    }
}
