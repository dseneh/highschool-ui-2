import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useSemestersApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/semesters'

    const getSemestersApi = async (query: { academic_year_id?: string } = {}) => {
        const params = new URLSearchParams()
        if (query.academic_year_id) {
            params.append('academic_year_id', query.academic_year_id)
        }
        const queryString = params.toString()
        const url = queryString ? `${baseUrl}/?${queryString}` : `${baseUrl}/`
        return get(url)
    }

    const getSemesterApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    const createSemesterApi = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    const editSemesterApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    const updateSemesterApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    const deleteSemesterApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    return {
        getSemesterApi,
        getSemestersApi,
        createSemesterApi,
        editSemesterApi,
        updateSemesterApi,
        deleteSemesterApi,
    }
}
