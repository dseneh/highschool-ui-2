import { useAxiosAuth } from '@/hooks/use-axios-auth'

type SectionSchedulePayload = Record<string, unknown>

export const useSectionSchedulesApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const detailBase = '/class-schedules'

    const getSectionSchedulesApi = async () => {
        return get(`${detailBase}/`)
    }

    const getSectionScheduleApi = async (id: string) => {
        return get(`${detailBase}/${id}/`)
    }

    const getSectionSchedulesBySectionApi = async (sectionId: string) => {
        return get(`/sections/${sectionId}/class-schedules/`)
    }

    const createSectionScheduleApi = async (sectionId: string, data: SectionSchedulePayload) => {
        return post(`/sections/${sectionId}/class-schedules/`, data)
    }

    const editSectionScheduleApi = async (id: string, data: SectionSchedulePayload) => {
        return put(`${detailBase}/${id}/`, data)
    }

    const updateSectionScheduleApi = async (id: string, data: SectionSchedulePayload) => {
        return patch(`${detailBase}/${id}/`, data)
    }

    const deleteSectionScheduleApi = async (id: string) => {
        return del(`${detailBase}/${id}/`)
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

