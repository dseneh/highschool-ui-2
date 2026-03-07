import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useAcademicYearsApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/academic-years'

    const getCurrentAcademicYear = async () => {
        return get(`${baseUrl}/current/`)
    }

    const getAcademicYears = async () => {
        return get(`${baseUrl}/`)
    }

    const getAcademicYear = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    const createAcademicYear = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    const editAcademicYear = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    const updateAcademicYear = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    const deleteAcademicYear = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    return {
        getAcademicYear,
        getAcademicYears,
        getCurrentAcademicYear,
        createAcademicYear,
        editAcademicYear,
        updateAcademicYear,
        deleteAcademicYear,
    }
}
