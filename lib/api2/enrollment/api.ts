import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useEnrollmentsApi = () => {
    const { get, post, put, delete: del } = useAxiosAuth()

    const getEnrollmentsApi = async (studentId: string) => {
        return get(`/students/${studentId}/enrollments/`)
    }

    const getEnrollmentApi = async (id: string) => {
        return get(`/enrollments/${id}/`)
    }
    const createEnrollmentApi = async (studentId: string, data: any) => {
        return post(`/students/${studentId}/enrollments/`, data)
    }

    const editEnrollmentApi = async (id: string, data: any) => {
        return put(`/enrollments/${id}/`, data)
    }

    const deleteEnrollmentApi = async (id: string) => {
        return del(`/enrollments/${id}/`)
    }

    return {
        getEnrollmentApi,
        editEnrollmentApi,
        createEnrollmentApi,
        deleteEnrollmentApi,
        getEnrollmentsApi,
    }
}
