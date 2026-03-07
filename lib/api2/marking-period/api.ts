import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useMarkingPeriodsApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/marking-periods'

    const getMarkingPeriodsApi = async () => {
        return get(`${baseUrl}/`)
    }

    const getMarkingPeriodApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    const getMarkingPeriodsBySemesterApi = async (semesterId: string) => {
        return get(`${baseUrl}/by-semester/${semesterId}/`)
    }

    const getAllMarkingPeriodsApi = async () => {
        return get(`${baseUrl}?academic_year_id=current`)
    }

    const createMarkingPeriodApi = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    const editMarkingPeriodApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    const updateMarkingPeriodApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    const deleteMarkingPeriodApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    return {
        getMarkingPeriodApi,
        getMarkingPeriodsApi,
        getMarkingPeriodsBySemesterApi,
        getAllMarkingPeriodsApi,
        editMarkingPeriodApi,
        createMarkingPeriodApi,
        updateMarkingPeriodApi,
        deleteMarkingPeriodApi,
    }
}
