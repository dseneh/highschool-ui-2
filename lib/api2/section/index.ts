"use client";
import { useSectionsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function useSections() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useSectionsApi()

    const getSections = (gradeLevelId: string, options = {}) =>
        useApiQuery(
            ['sections', gradeLevelId], () => api.getSectionsApi(gradeLevelId).then((res: any) => res.data), options)

    const getSection = (id: string, options = {}) =>
        useApiQuery(
            ['sections', id], () => api.getSectionApi(id).then((res: any) => res.data), options)

    const getSectionsByGradeLevel = (gradeLevelId: string, options = {}) =>
        useApiQuery(
            ['sections', 'by-grade-level', gradeLevelId], () => api.getSectionsByGradeLevelApi(gradeLevelId).then((res: any) => res.data), options)

    const createSection = (gradeLevelId: string, options = {}) =>
        useApiMutation(
            (data: any) => api.createSectionApi(gradeLevelId, data).then((res) => res.data), options)

    const updateSection = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.editSectionApi(id, data).then((res: any) => res.data), options)

    const partialUpdateSection = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.updateSectionApi(id, data).then((res: any) => res.data), options)

    const deleteSection = (id: string, options = {}) =>
        useApiMutation(
            () => api.deleteSectionApi(id).then((res: any) => res.data), options)

    // Section Fees Hooks
    const getSectionFees = (sectionId: string, options = {}) =>
        useApiQuery(
            ['sections', sectionId, 'fees'], () => api.getSectionFeesApi(sectionId).then((res: any) => res.data), options)

    const getSectionFee = (id: string, options = {}) =>
        useApiQuery(
            ['section-fees', id], () => api.getSectionFeeApi(id).then((res: any) => res.data), options)

    const createSectionFee = (options = {}) =>
        useApiMutation(
            ({ sectionId, data }: { sectionId: string; data: any }) =>
                api.createSectionFeeApi(sectionId, data).then((res) => res.data), options)

    const updateSectionFee = (options = {}) =>
        useApiMutation(
            ({ id, data }: { id: string; data: any }) =>
                api.editSectionFeeApi(id, data).then((res: any) => res.data), options)

    const deleteSectionFee = (options = {}) =>
        useApiMutation(
            ({ id }: { id: string }) =>
                api.deleteSectionFeeApi(id).then((res: any) => res.data), options)

    return {
        getSections,
        getSection,
        getSectionsByGradeLevel,
        createSection,
        updateSection,
        partialUpdateSection,
        deleteSection,
        getSectionFees,
        getSectionFee,
        createSectionFee,
        updateSectionFee,
        deleteSectionFee,
    }
}
