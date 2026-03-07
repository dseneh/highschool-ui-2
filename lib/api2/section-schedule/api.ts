import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useSectionSchedulesApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/section-schedules'

    const getSectionSchedulesApi = async () => {
        return get(`${baseUrl}/`)
    }

    const getSectionScheduleApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    const getSectionSchedulesBySectionApi = async (sectionId: string) => {
        return get(`${baseUrl}/by-section/${sectionId}/`)
    }

    const createSectionScheduleApi = async (data: any) => {
        return post(`${baseUrl}/`, data)
    }

    const editSectionScheduleApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    const updateSectionScheduleApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    const deleteSectionScheduleApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    return {
        getSectionSchedulesApi,
        getSectionScheduleApi,
        getSectionSchedulesBySectionApi,
        createSectionScheduleApi,
        editSectionScheduleApi,
        updateSectionScheduleApi,
        deleteSectionScheduleApi,
    }
}

