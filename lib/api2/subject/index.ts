"use client";

import { useSubjectsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function useSubjects() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useSubjectsApi()

    const getSubjects = (options = {}) =>
        useApiQuery(
            ['subjects'], () =>
                api.getSubjectsApi().then((res: any) => res.data), options)

    const getSectionSubjects = (sectionId: string, options = {}) =>
        useApiQuery(
            ['section-subjects', sectionId], () =>
                api.getSectionSubjectsApi(sectionId).then((res: any) => res.data), options)

    const getSectionSubject = (id: string, options = {}) =>
        useApiQuery(
            ['section-subjects', id], () =>
                api.getSectionSubjectApi(id).then((res: any) => res.data), options)

    const getSubject = (subjectId: string, options = {}) =>
        useApiQuery(
            ['subjects', subjectId], () =>
                api.getSubjectApi(subjectId).then((res: any) => res.data), options)

    const createSubject = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createSubjectApi(data).then((res) => res.data), options)

    const createSectionSubject = (options = {}) =>
        useApiMutation(
            ({id, data}: {id: string, data: any}) =>
                api
                    .createSectionSubjectApi(id, data)
                    .then((res) => res.data), options)

    const updateSubject = (options = {}) =>
        useApiMutation(
            ({id, data}: {id: string, data: any}) =>
                api.updateSubjectApi(id, data).then((res: any) => res.data), options)

    const updateSectionSubject = (options = {}) =>
        useApiMutation(
            ({id, data}: {id: string, data: any}) =>
                api.updateSectionSubjectApi(id, data).then((res: any) => res.data), options)

    const deleteSubject = (options = {}) =>
        useApiMutation(
            (subjectId: string) =>
                api.deleteSubjectApi(subjectId).then((res: any) => res.data), options)

    const deleteSectionSubject = (options = {}) =>
        useApiMutation(
            (id: string) =>
                api.deleteSectionSubjectApi(id).then((res: any) => res.data), options)

    return {
        getSubjects,
        getSubject,
        createSubject,
        updateSubject,
        deleteSubject,
        getSectionSubjects,
        getSectionSubject,
        deleteSectionSubject,
        createSectionSubject,
        updateSectionSubject,
    }
}