import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const usePeriodTimesApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/period-times'
    const periodsBaseUrl = '/periods'

    const getPeriodTimesApi = async (periodId: string) => {
        return get(`${periodsBaseUrl}/${periodId}/period-times/`)
    }

    const getPeriodTimeApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    const getPeriodTimesByPeriodApi = async (periodId: string) => {
        return get(`${periodsBaseUrl}/${periodId}/period-times/`)
    }

    const createPeriodTimeApi = async (periodId: string, data: any) => {
        return post(`${periodsBaseUrl}/${periodId}/period-times/`, data)
    }

    const editPeriodTimeApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    const updatePeriodTimeApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    const deletePeriodTimeApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    return {
        getPeriodTimesApi,
        getPeriodTimeApi,
        getPeriodTimesByPeriodApi,
        createPeriodTimeApi,
        editPeriodTimeApi,
        updatePeriodTimeApi,
        deletePeriodTimeApi,
    }
}

