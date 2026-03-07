import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useSubjectsApi = () => {
    const { get, post, put, delete: del } = useAxiosAuth()

    const getSubjectsApi = async () => {
        return get(`/subjects/`)
    }

    const getSectionSubjectsApi = async (sectionId: string) => {
        return get(`/sections/${sectionId}/section-subjects/`)
    }

    const getSectionSubjectApi = async (id: string) => {
        return get(`/section-subjects/${id}/`)
    }

    const deleteSectionSubjectApi = async (id: string) => {
        return del(`/section-subjects/${id}/`)
    }

    const getSubjectApi = async (id: string) => {
        return get(`/subjects/${id}/`)
    }

    const createSubjectApi = async (data: any) => {
        return post(`/subjects/`, data)
    }

    const createSectionSubjectApi = async (sectionId: string, data: any) => {
        return post(`/sections/${sectionId}/section-subjects/`, data)
    }

    const updateSectionSubjectApi = async (id: string, data: any) => {
        return put(`/section-subjects/${id}/`, data)
    }

    const updateSubjectApi = async (id: string, data: any) => {
        return put(`/subjects/${id}/`, data)
    }

    const deleteSubjectApi = async (id: string) => {
        return del(`/subjects/${id}/`)
    }

    return {
        getSubjectApi,
        getSubjectsApi,
        createSubjectApi,
        updateSubjectApi,
        deleteSubjectApi,
        getSectionSubjectsApi,
        getSectionSubjectApi,
        deleteSectionSubjectApi,
        createSectionSubjectApi,
        updateSectionSubjectApi,
    }
}
