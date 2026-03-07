import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const usePeriodsApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/periods'

    const getPeriodsApi = async () => {
        return get(`${baseUrl}/`)
    }

    const getPeriodApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    const createPeriodApi = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    const editPeriodApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    const updatePeriodApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    const deletePeriodApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    return {
        getPeriodsApi,
        getPeriodApi,
        createPeriodApi,
        editPeriodApi,
        updatePeriodApi,
        deletePeriodApi,
    }
}

