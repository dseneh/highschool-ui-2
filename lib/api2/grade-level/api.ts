import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useGradeLevelsApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/grade-levels'

    const getGradeLevelsApi = async () => {
        return get(`${baseUrl}/`)
    }

    const getGradeLevelApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    const createGradeLevelApi = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    const editGradeLevelApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    const updateGradeLevelApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    const getGradeLevelTuitionFeesApi = async (id: string) => {
        return get(`${baseUrl}/${id}/tuition/`)
    }

    const updateGradeLevelTuitionFeesApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/tuition/`, data)
    }

    const deleteGradeLevelApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    return {
        getGradeLevelApi,
        getGradeLevelsApi,
        createGradeLevelApi,
        editGradeLevelApi,
        updateGradeLevelApi,
        deleteGradeLevelApi,
        getGradeLevelTuitionFeesApi,
        updateGradeLevelTuitionFeesApi,
    }
}
