import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useSectionsApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const baseUrl = '/sections'

    const getSectionsApi = async (gradeLevelId: string) => {
        return get(`/grade-levels/${gradeLevelId}/sections/`)
    }

    const getSectionApi = async (id: string) => {
        return get(`${baseUrl}/${id}/`)
    }

    const getSectionsByGradeLevelApi = async (gradeLevelId: string) => {
        return get(`${baseUrl}/by-grade-level/${gradeLevelId}/`)
    }

    const createSectionApi = async (gradeLevelId: string, data: any) => {
        return post(`/grade-levels/${gradeLevelId}/sections/`, data)
    }

    const editSectionApi = async (id: string, data: any) => {
        return put(`${baseUrl}/${id}/`, data)
    }

    const updateSectionApi = async (id: string, data: any) => {
        return patch(`${baseUrl}/${id}/`, data)
    }

    const deleteSectionApi = async (id: string) => {
        return del(`${baseUrl}/${id}/`)
    }

    // Section Fees APIs
    const getSectionFeesApi = async (sectionId: string) => {
        return get(`${baseUrl}/${sectionId}/section-fees/`)
    }

    const getSectionFeeApi = async (id: string) => {
        return get(`/section-fees/${id}/`)
    }

    const createSectionFeeApi = async (sectionId: string, data: any) => {
        return post(`${baseUrl}/${sectionId}/section-fees/`, data)
    }

    const editSectionFeeApi = async (id: string, data: any) => {
        return patch(`/section-fees/${id}/`, data)
    }

    const deleteSectionFeeApi = async (id: string) => {
        return del(`/section-fees/${id}/`)
    }

    return {
        getSectionApi,
        getSectionsApi,
        getSectionsByGradeLevelApi,
        createSectionApi,
        editSectionApi,
        updateSectionApi,
        deleteSectionApi,
        getSectionFeesApi,
        getSectionFeeApi,
        createSectionFeeApi,
        editSectionFeeApi,
        deleteSectionFeeApi,
    }
}
