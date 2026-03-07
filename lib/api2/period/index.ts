"use client";
import { usePeriodsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function usePeriods() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const api = usePeriodsApi()

    const getPeriods = (options = {}) =>
        useApiQuery(
            ['periods'],
            () => api.getPeriodsApi().then((res) => res.data),
            options,
        )

    const getPeriod = (id: string, options = {}) =>
        useApiQuery(
            ['periods', id],
            () => api.getPeriodApi(id).then((res) => res.data),
            options,
        )

    const createPeriod = (options = {}) =>
        useApiMutation(
            (data: any) => api.createPeriodApi(data).then((res) => res.data),
            options,
        )

    const updatePeriod = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.editPeriodApi(id, data).then((res) => res.data),
            options,
        )

    const partialUpdatePeriod = (id: string, options = {}) =>
        useApiMutation(
            (data: any) => api.updatePeriodApi(id, data).then((res) => res.data),
            options,
        )

    const deletePeriod = (id: string, options = {}) =>
        useApiMutation(
            () => api.deletePeriodApi(id).then((res: any) => res.data),
            options,
        )

    return {
        getPeriods,
        getPeriod,
        createPeriod,
        updatePeriod,
        partialUpdatePeriod,
        deletePeriod,
    }
}

