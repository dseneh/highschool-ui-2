"use client";
import { useWorkspaceId } from '../utils'
import { useGeneralFeesApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export { useGeneralFeesApi }

export function useGeneralFees() {
    /* eslint-disable react-hooks/rules-of-hooks */

    const api = useGeneralFeesApi()

    const getGeneralFees = (options = {}) =>
        useApiQuery(
            ['general-fees'], () =>
                api.getGeneralFeesApi().then((res: any) => res.data), options)

    const getGeneralFee = (id: string, options = {}) =>
        useApiQuery(
            ['general-fees', id], () =>
                api.getGeneralFeeApi(id).then((res: any) => res.data), options)

    const createGeneralFee = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createGeneralFeeApi(data).then((res) => res.data), options)

    const updateGeneralFee = (options = {}) =>
        useApiMutation(
            ({ id, data }: { id: string; data: any }) =>
                api.editGeneralFeeApi(id, data).then(
                    (res: any) => res.data,
                ), options)


    const deleteGeneralFee = (options = {}) =>
        useApiMutation(
            ({id}: {id: string}) =>
                api.deleteGeneralFeeApi(id).then((res: any) => res.data), options)

    const syncGeneralFeeToSections = (options = {}) =>
        useApiMutation(
            ({ id, amount }: { id: string; amount: number }) =>
                api.syncGeneralFeeToSectionsApi(id, amount).then((res: any) => res.data), options)

    return {
        getGeneralFees,
        getGeneralFee,
        createGeneralFee,
        updateGeneralFee,
        deleteGeneralFee,
        syncGeneralFeeToSections
    }
}
