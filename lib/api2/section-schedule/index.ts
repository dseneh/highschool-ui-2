"use client";
import { useSectionSchedulesApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

type SectionSchedulePayload = Record<string, unknown>

export function useSectionSchedules() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useSectionSchedulesApi()

    const getSectionSchedules = (options = {}) =>
        useApiQuery(
            ['section-schedules'], () => api.getSectionSchedulesApi().then((res) => res.data), options)

    const getSectionSchedule = (id: string, options = {}) =>
        useApiQuery(
            ['section-schedules', id], () => api.getSectionScheduleApi(id).then((res) => res.data), options)

    const getSectionSchedulesBySection = (sectionId: string, options = {}) =>
        useApiQuery(
            ['section-schedules', 'by-section', sectionId], () => api.getSectionSchedulesBySectionApi(sectionId).then((res) => res.data), options)

    const createSectionSchedule = (sectionId: string, options = {}) =>
        useApiMutation(
            (data: SectionSchedulePayload) => api.createSectionScheduleApi(sectionId, data).then((res) => res.data), options)

    const updateSectionSchedule = (id: string, options = {}) =>
        useApiMutation(
            (data: SectionSchedulePayload) => api.editSectionScheduleApi(id, data).then((res) => res.data), options)

    const partialUpdateSectionSchedule = (id: string, options = {}) =>
        useApiMutation(
            (data: SectionSchedulePayload) => api.updateSectionScheduleApi(id, data).then((res) => res.data), options)

    const deleteSectionSchedule = (id: string, options = {}) =>
        useApiMutation(
            () => api.deleteSectionScheduleApi(id).then((res) => res.data), options)

    return {
        getSectionSchedules,
        getSectionSchedule,
        getSectionSchedulesBySection,
        createSectionSchedule,
        updateSectionSchedule,
        partialUpdateSectionSchedule,
        deleteSectionSchedule,
    }
}

