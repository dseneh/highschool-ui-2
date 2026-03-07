"use client";
import { useSemestersApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function useSemesters() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useSemestersApi()

    const getSemesters = (query: { academic_year_id?: string } = {}, options = {}) =>
        useApiQuery(
            ['semesters', query], () => api.getSemestersApi(query).then((res) => res.data), options)

    const getSemester = (id: string, options = {}) =>
        useApiQuery(
            ['semesters', id], () => api.getSemesterApi(id).then((res) => res.data), options)

    const createSemester = (options = {}) =>
        useApiMutation(
            (data: any) => api.createSemesterApi(data).then((res) => res.data), options)

    const updateSemester = (options = {}) =>
        useApiMutation(
            ({id, data}: {id: string, data: any}) => api.editSemesterApi(id, data).then((res) => res.data), options)

    const partialUpdateSemester = (options = {}) =>
        useApiMutation(
            ({id, data}: {id: string, data: any}) => api.updateSemesterApi(id, data).then((res) => res.data), options)

    const deleteSemester = (options = {}) =>
        useApiMutation(
            (id: string) => api.deleteSemesterApi(id).then((res: any) => res.data), options)

    return {
        getSemesters,
        getSemester,
        createSemester,
        updateSemester,
        partialUpdateSemester,
        deleteSemester,
    }
}
