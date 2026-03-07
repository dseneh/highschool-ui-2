import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useDivisionsApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/divisions'

    const getDivisionsApi = async () => {
        return get(`${baseUrl}/`)
    }

    const getDivisionApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    const createDivisionApi = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    const editDivisionApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    const updateDivisionApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    const deleteDivisionApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    return {
        getDivisionsApi,
        getDivisionApi,
        createDivisionApi,
        editDivisionApi,
        updateDivisionApi,
        deleteDivisionApi,
    }
}

