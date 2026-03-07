import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useTransactionsApi = (workspace: string) => {
    const { get, post, put, delete: del } = useAxiosAuth()

    const getTransactionsApi = async (query?: any) => {
        return get(`/transactions/`, { params: query })
    }

    const getTransactionApi = async (id: string) => {
        return get(`/transactions/${id}/`)
    }

    const createTransactionApi = async (data: any) => {
        return post(`/transactions/`, data)
    }

    const createBulkTransactionApi = async (transactionType: string, data: any) => {
        return post(`/transactions/bulk/${transactionType}/`, data)
    }
    const createAccountTransferApi = async (data: any) => {
        return post(`/transactions/account-transfer/`, data)
    }

    const editTransactionApi = async (id: string, data: any) => {
        return put(`/transactions/${id}/`, data)
    }

    const editTransactionStatusApi = async (id: string, data: any) => {
        return put(`/transactions/${id}/status/`, data)
    }

    const deleteTransactionApi = async (id: string) => {
        return del(`/transactions/${id}/`)
    }

    const deleteTransferApi = async (referenceId: string) => {
        return del(`/transactions/by-reference/${referenceId}/`)
    }

    const getTransactionTypesApi = async () => {
        return get(`/transaction-types/`)
    }

    const getTransactionTypeApi = async (id: string) => {
        return get(`/transaction-types/${id}/`)
    }

    const createTransactionTypeApi = async (data: any) => {
        return post(`/transaction-types/`, data)
    }

    const editTransactionTypeApi = async (id: string, data: any) => {
        return put(`/transaction-types/${id}/`, data)
    }

    const deleteTransactionTypeApi = async (id: string) => {
        return del(`/transaction-types/${id}/`)
    }

    // payment method
    const getPaymentMethodsApi = async () => {
        return get(`/payment-methods/`)
    }

    const getPaymentMethodApi = async (id: string) => {
        return get(`/payment-methods/${id}/`)
    }

    const createPaymentMethodApi = async (data: any) => {
        return post(`/payment-methods/`, data)
    }

    const editPaymentMethodApi = async (id: string, data: any) => {
        return put(`/payment-methods/${id}/`, data)
    }

    const deletePaymentMethodApi = async (id: string) => {
        return del(`/payment-methods/${id}/`)
    }

    return {
        getTransactionsApi,
        editTransactionApi,
        createTransactionApi,
        createBulkTransactionApi,
        deleteTransactionApi,
        getTransactionApi,
        deleteTransferApi,
        editTransactionStatusApi,
        getTransactionTypesApi,
        getTransactionTypeApi,
        createTransactionTypeApi,
        editTransactionTypeApi,
        deleteTransactionTypeApi,
        getPaymentMethodsApi,
        getPaymentMethodApi,
        createPaymentMethodApi,
        editPaymentMethodApi,
        deletePaymentMethodApi,
        createAccountTransferApi,
    }
}
