"use client";
import { useAccountsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'
import {decryptAESClient} from '@/lib/utils/decrypt/decrypt-client';
import { useWorkspaceId } from '../utils';

export function useAccounts() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const workspace = useWorkspaceId()
    const api = useAccountsApi(workspace!)

    const getAccounts = (query = {},options = {}) =>
        useApiQuery(
            ['bankaccounts'], () => api.getAccountsApi(query).then(async (res: any) => {
                return await decryptAESClient(res.data);
            }), options)

    const getAccount = (id: string, options = {}) =>
        useApiQuery(
            ['bankaccounts', id], () => api.getAccountApi(id, { include_analysis: true }).then((res: any) => res.data), options)

    const createAccount = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createAccountApi(data).then((res) => res.data), options)

    const updateAccount = (id: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editAccountApi(id, data).then((res: any) => res.data), options)

    const deleteAccount = (id: string, options = {}) =>
        useApiMutation(
            () =>
                api.deleteAccountApi(id).then((res: any) => res.data), options)

    return {
        getAccounts,
        getAccount,
        createAccount,
        updateAccount,
        deleteAccount,
    }
}
