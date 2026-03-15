"use client";
import { usePeriodTimesApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function usePeriodTimes() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = usePeriodTimesApi()

    const getPeriodTimes = (periodId: string, options = {}) =>
        useApiQuery(
            ['period-times', periodId], () => api.getPeriodTimesApi(periodId).then((res) => res.data), options)

    const getPeriodTime = (id: string, options = {}) =>
        useApiQuery(
            ['period-times', id], () => api.getPeriodTimeApi(id).then((res) => res.data), options)

    const getPeriodTimesByPeriod = (periodId: string, options = {}) =>
        useApiQuery(
            ['period-times', 'by-period', periodId], () => api.getPeriodTimesByPeriodApi(periodId).then((res) => res.data), options)

    const createPeriodTime = (periodId: string, options = {}) =>
        useApiMutation(
            (data: any) => api.createPeriodTimeApi(periodId, data).then((res) => res.data), options)

    const updatePeriodTime = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.editPeriodTimeApi(id, data).then((res) => res.data), options)

    const partialUpdatePeriodTime = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.updatePeriodTimeApi(id, data).then((res) => res.data), options)

    const deletePeriodTime = (id: string, options = {}) =>
        useApiMutation(
            () => api.deletePeriodTimeApi(id).then((res: any) => res.data), options)

    return {
        getPeriodTimes,
        getPeriodTime,
        getPeriodTimesByPeriod,
        createPeriodTime,
        updatePeriodTime,
        partialUpdatePeriodTime,
        deletePeriodTime,
    }
}

