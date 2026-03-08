import { useAxiosAuth } from '@/hooks/use-axios-auth'
import { djangoPublicApiClient as pub } from "@/lib/api2/http-clients";

export const useTenantApi = () => {
    const { get } = useAxiosAuth()

    const getTenantsApi = async (query: any) => {
        return get(`/tenants/`, { params: query })
    }

    const getTenantApi = async (subdomain: string) => {
        return get(`/tenants/${subdomain}/`)
    }
    
    
    return {
      getTenantsApi,
      getTenantApi,
      searchTenantApi,
    }
  }
  
    export const getTenantApi = async (subdomain: string) => {
          return pub.get(`/tenants/${subdomain}/`)
      }
  export const searchTenantApi = async (query: any) => {
      return pub.get(`/tenants/search/`, { params: query })
  }
