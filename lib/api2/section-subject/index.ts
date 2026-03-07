"use client";
import { useSectionSubjectsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function useSectionSubjects() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useSectionSubjectsApi()

    const getSectionSubjects = (options = {}) =>
        useApiQuery(
            ['section-subjects'], () => api.getSectionSubjectsApi().then((res) => res.data), options)

    const getSectionSubject = (id: string, options = {}) =>
        useApiQuery(
            ['section-subjects', id], () => api.getSectionSubjectApi(id).then((res) => res.data), options)

    const getSectionSubjectsBySection = (sectionId: string, options = {}) =>
        useApiQuery(
            ['section-subjects', 'by-section', sectionId], () => api.getSectionSubjectsBySectionApi(sectionId).then((res) => res.data), options)

    const createSectionSubject = (options = {}) =>
        useApiMutation(
            (data: any) => api.createSectionSubjectApi(data).then((res) => res.data), options)

    const bulkCreateSectionSubjects = (options = {}) =>
        useApiMutation(
            (data: any) => api.bulkCreateSectionSubjectsApi(data).then((res) => res.data), options)

    const updateSectionSubject = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.editSectionSubjectApi(id, data).then((res) => res.data), options)

    const partialUpdateSectionSubject = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.updateSectionSubjectApi(id, data).then((res) => res.data), options)

    const deleteSectionSubject = (id: string, options = {}) =>
        useApiMutation(
            () => api.deleteSectionSubjectApi(id).then((res: any) => res.data), options)

    return {
        getSectionSubjects,
        getSectionSubject,
        getSectionSubjectsBySection,
        createSectionSubject,
        bulkCreateSectionSubjects,
        updateSectionSubject,
        partialUpdateSectionSubject,
        deleteSectionSubject,
    }
}

