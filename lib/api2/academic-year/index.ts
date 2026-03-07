"use client";
import { useAcademicYearsApi } from './api'
import { useApiMutation, useApiQuery } from '../utils'

export function useAcademicYears() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useAcademicYearsApi()

    // Query: Get current academic year
    const getCurrentAcademicYear = (options = {}) =>
        
        useApiQuery(
            ['academic-years', 'current'],
            () =>
                api.getCurrentAcademicYear().then(
                    (res: any) => res.data,
                ),
            options,
        )

    const getAcademicYears = (options = {}) =>
        useApiQuery(
            ['academic-years'],
            () =>
                api.getAcademicYears().then((res: any) => res.data),
            options,
        )

    const getAcademicYear = (yearId: string, options = {}) =>
        useApiQuery(
            ['academic-years', yearId],
            () =>
                api.getAcademicYear(yearId).then((res: any) => res.data),
            options,
        )

    const createAcademicYear = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createAcademicYear(data).then((res) => res.data),
            options,
        )

    const updateAcademicYear = (yearId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editAcademicYear(yearId, data).then(
                    (res: any) => res.data,
                ),
            options,
        )

    const partialUpdateAcademicYear = (yearId: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.updateAcademicYear(yearId, data).then(
                    (res: any) => res.data,
                ),
            options,
        )

    const deleteAcademicYear = (yearId: string, options = {}) =>
        useApiMutation(
            () =>
                api.deleteAcademicYear(yearId).then((res: any) => res.data),
            options,
        )

    return {
        getCurrentAcademicYear,
        getAcademicYears,
        getAcademicYear,
        createAcademicYear,
        updateAcademicYear,
        partialUpdateAcademicYear,
        deleteAcademicYear,
    }
}
