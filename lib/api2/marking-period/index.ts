"use client";
import { useMarkingPeriodsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function useMarkingPeriods() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = useMarkingPeriodsApi()

    const getMarkingPeriods = (options = {}) =>
        useApiQuery(
            ['marking-periods'], () => api.getMarkingPeriodsApi().then((res: any) => res.data), options)

    const getMarkingPeriod = (id: string, options = {}) =>
        useApiQuery(
            ['marking-periods', id], () => api.getMarkingPeriodApi(id).then((res: any) => res.data), options)

    const getMarkingPeriodsBySemester = (semesterId: string, options = {}) =>
        useApiQuery(
            ['marking-periods', 'by-semester', semesterId], () => api.getMarkingPeriodsBySemesterApi(semesterId).then((res: any) => res.data), options)

    const getAllMarkingPeriods = (options = {}) =>
        useApiQuery(
            ['marking-periods', 'all'], () => api.getAllMarkingPeriodsApi().then((res: any) => res.data), options)

    const createMarkingPeriod = (options = {}) =>
        useApiMutation(
            (data: any) => api.createMarkingPeriodApi(data).then((res: any) => res.data), options)

    const updateMarkingPeriod = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.editMarkingPeriodApi(id, data).then((res: any) => res.data), options)

    const partialUpdateMarkingPeriod = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.updateMarkingPeriodApi(id, data).then((res: any) => res.data), options)

    const deleteMarkingPeriod = (id: string, options = {}) =>
        useApiMutation(
            () => api.deleteMarkingPeriodApi(id).then((res: any) => res.data), options)

    return {
        getMarkingPeriods,
        getMarkingPeriod,
        getMarkingPeriodsBySemester,
        getAllMarkingPeriods,
        createMarkingPeriod,
        updateMarkingPeriod,
        partialUpdateMarkingPeriod,
        deleteMarkingPeriod,
    }
}