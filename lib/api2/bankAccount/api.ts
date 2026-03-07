import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useAccountsApi = (workspace: string) => {
    const { get, post, put, delete: del } = useAxiosAuth()

    const getAccountsApi = async (query: any) => {
        return get(`/bankaccounts/`, { params: query } )
    }

    const getAccountApi = async (id: string, query: any = {}) => {
        return get(`/bankaccounts/${id}/`, { params: query })
    }

    const createAccountApi = async (data: any) => {
        return post(`/bankaccounts/`, data)
    }

    const editAccountApi = async (id: string, data: any) => {
        return put(`/bankaccounts/${id}/`, data)
    }

    const deleteAccountApi = async (id: string) => {
        return del(`/bankaccounts/${id}/`)
    }

    return {
        getAccountApi,
        getAccountsApi,
        createAccountApi,
        editAccountApi,
        deleteAccountApi,
    }
}
