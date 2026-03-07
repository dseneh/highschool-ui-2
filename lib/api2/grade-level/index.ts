"use client";
import { useGradeLevelsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function useGradeLevels() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useGradeLevelsApi()

    const getGradeLevels = (options = {}) =>
        useApiQuery(
            ['grade-levels'], () =>
                api.getGradeLevelsApi().then((res: any) => {
                    const data = res.data
                    return Array.isArray(data) ? data : (data?.results || data || [])
                }), options)

    const getGradeLevel = (id: string, options = {}) =>
        useApiQuery(
            ['grade-levels', id], () =>
                api.getGradeLevelApi(id).then((res: any) => res.data), options)

    const createGradeLevel = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createGradeLevelApi(data).then((res) => res.data), options)

    const updateGradeLevel = (options = {}) =>
        useApiMutation(
            ({ id, data }: { id: string; data: any }) =>
                api.editGradeLevelApi(id, data).then(
                    (res: any) => res.data,
                ), options)
    
    const getGradeLevelTuitionFees = (id: string, options = {}) =>
        useApiQuery(
            ['grade-levels', id, 'tuition-fees'], () => api.getGradeLevelTuitionFeesApi(id).then((res) => res.data), options)

    const updateGradeLevelTuitionFees = (id: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updateGradeLevelTuitionFeesApi(id, data).then(
                    (res: any) => res.data,
                ), options)

    // Alias for backward compatibility - creates mutation without requiring id upfront
    const updateGradeTuitionLevel = (options = {}) =>
        useApiMutation(
            ({ id, data }: { id: string; data: any }) =>
                api.updateGradeLevelTuitionFeesApi(id, data).then(
                    (res: any) => res.data,
                ), options)

    const deleteGradeLevel = (id: string, options = {}) =>
        useApiMutation(
            () =>
                api.deleteGradeLevelApi(id).then((res: any) => res.data), options)

    return {
        getGradeLevels,
        getGradeLevel,
        createGradeLevel,
        updateGradeLevel,
        deleteGradeLevel,
        getGradeLevelTuitionFees,
        updateGradeLevelTuitionFees,
        updateGradeTuitionLevel, 
    }
}
