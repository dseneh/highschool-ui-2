import { useAxiosAuth } from '@/hooks/use-axios-auth'

export const useGeneralFeesApi = () => {
    const { get, post, put, delete: del } = useAxiosAuth()

    const getGeneralFeesApi = async () => {
        return get(`/general-fees/`)
    }

    const getGeneralFeeApi = async (id: string) => {
        return get(`/general-fees/${id}/`)
    }

    const createGeneralFeeApi = async (data: any) => {
        return post(`/general-fees/`, data)
    }

    const editGeneralFeeApi = async (id: string, data: any) => {
        return put(`/general-fees/${id}/`, data)
    }

    const editGeneralFeeTuitionApi = async (id: string, data: any) => {
        return put(`/general-fees/${id}/tuition/`, data)
    }

    const deleteGeneralFeeApi = async (id: string) => {
        return del(`/general-fees/${id}/`)
    }

    const syncGeneralFeeToSectionsApi = async (id: string, amount: number) => {
        return put(`/general-fees/${id}/`, { 
            apply_to_all_sections: true,
            amount
        })
    }

    return {
        getGeneralFeeApi,
        getGeneralFeesApi,
        createGeneralFeeApi,
        editGeneralFeeApi,
        deleteGeneralFeeApi,
        editGeneralFeeTuitionApi,
        syncGeneralFeeToSectionsApi,
    }
}
