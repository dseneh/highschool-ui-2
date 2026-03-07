import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useSectionSubjectsApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/section-subjects'

    const getSectionSubjectsApi = async () => {
        return get(`${baseUrl}/`)
    }

    const getSectionSubjectApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    const getSectionSubjectsBySectionApi = async (sectionId: string) => {
        return get(`${baseUrl}/by-section/${sectionId}/`)
    }

    const createSectionSubjectApi = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    const bulkCreateSectionSubjectsApi = async (data: any) => {
        return post(`${baseUrl}/bulk-create/`, data)
    }

    const editSectionSubjectApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    const updateSectionSubjectApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    const deleteSectionSubjectApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    return {
        getSectionSubjectsApi,
        getSectionSubjectApi,
        getSectionSubjectsBySectionApi,
        createSectionSubjectApi,
        bulkCreateSectionSubjectsApi,
        editSectionSubjectApi,
        updateSectionSubjectApi,
        deleteSectionSubjectApi,
    }
}

