"use client";
import { useWorkspaceId } from '../utils'
import { useTransactionsApi } from './api'
import { useApiQuery, useApiMutation } from '../utils'

export function useTransactions() {
    /* eslint-disable react-hooks/rules-of-hooks */
    const workspace = useWorkspaceId()
    const api = useTransactionsApi(workspace!)

    const getTransactions = (query: any, options = {}) =>
        useApiQuery(
            ['transactions', query],
            () => api.getTransactionsApi(query).then((res: any) => res.data),
            options,
        )

    const getTransaction = (id: string, options = {}) =>
        useApiQuery(
            ['transactions', id],
            () =>
                api.getTransactionApi(id).then((res: any) => res.data),
            options,
        )

    const createTransaction = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createTransactionApi(data).then((res: any) => res.data),
            options,
        )

    const createBulkTransaction = (transactionType: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createBulkTransactionApi(transactionType, data).then((res: any) => res.data),
            options,
        )

    const createAccountTransfer = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createAccountTransferApi(data).then((res: any) => res.data),
            options,
        )

    const updateTransaction = (id: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editTransactionApi(id, data).then((res: any) => res.data),
            options,
        )

    const updateTransactionStatus = (id: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editTransactionStatusApi(id, data).then((res: any) => res.data),
            options,
        )

    const deleteTransaction = (id: string, options = {}) =>
        useApiMutation(
            () =>
                api.deleteTransactionApi(id).then((res: any) => res.data),
            options,
        )

    const deleteTransfer = (id: string, options = {}) =>
        useApiMutation(
            () =>
                api.deleteTransferApi(id).then((res: any) => res.data),
            options,
        )

    const getTransactionTypes = (options = {}) =>
        useApiQuery(
            ['transaction-types'],
            () => api.getTransactionTypesApi().then((res: any) => res.data),
            options,
        )

    const getTransactionType = (id: string, options = {}) =>
        useApiQuery(
            ['transaction-types', id],
            () =>
                api.getTransactionTypeApi(id).then((res: any) => res.data),
            options,
        )

    const createTransactionType = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createTransactionTypeApi(data).then((res: any) => res.data),
            options,
        )

    const updateTransactionType = (options = {}) =>
        useApiMutation(
            ({id, data}: {id: string, data: any}) =>
                api.editTransactionTypeApi(id, data).then((res: any) => res.data),
            options,
        )

    const deleteTransactionType = (options = {}) =>
        useApiMutation(
            (id: string) =>
                api.deleteTransactionTypeApi(id).then((res: any) => res.data),
            options,
        )

    const getPaymentMethods = (options = {}) =>
        useApiQuery(
            ['payment-methods'],
            () => api.getPaymentMethodsApi().then((res: any) => res.data),
            options,
        )

    const getPaymentMethod = (id: string, options = {}) =>
        useApiQuery(
            ['payment-methods', id],
            () =>
                api.getPaymentMethodApi(id).then((res: any) => res.data),
            options,
        )

    const createPaymentMethod = (options = {}) =>
        useApiMutation(
            (data: any) =>
                api.createPaymentMethodApi(data).then((res: any) => res.data),
            options,
        )

    const updatePaymentMethod = (id: string, options = {}) =>
        useApiMutation(
            (data: any) =>
                api.editPaymentMethodApi(id, data).then((res: any) => res.data),
            options,
        )

    const deletePaymentMethod = (id: string, options = {}) =>
        useApiMutation(
            () =>
                api.deletePaymentMethodApi(id).then((res: any) => res.data),
            options,
        )

    return {
        getTransactions,
        getTransaction,
        createTransaction,
        createBulkTransaction,
        createAccountTransfer,
        updateTransaction,
        updateTransactionStatus,
        deleteTransaction,
        deleteTransfer,
        getTransactionTypes,
        getTransactionType,
        createTransactionType,
        updateTransactionType,
        deleteTransactionType,
        getPaymentMethods,
        getPaymentMethod,
        createPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
    }
}
