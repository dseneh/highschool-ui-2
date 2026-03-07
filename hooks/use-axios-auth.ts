"use client"

/**
 * Axios HTTP Client Hook for NextAuth
 * 
 * Provides authenticated HTTP client functions that automatically handle
 * JWT tokens and session management for API requests.
 */

import { useCallback } from "react"
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { useTenantStore } from "@/store/tenant-store"
import { useAuth } from "@/components/portable-auth/src/client"

// Token cache with deduplication to prevent concurrent refresh requests
let tokenPromise: Promise<{ accessToken: string | null }> | null = null
let tokenCache: { accessToken: string | null; timestamp: number } | null = null
const TOKEN_CACHE_TTL = 5000 // Cache token for 5 seconds to reduce redundant requests

/**
 * Get access token with deduplication - prevents multiple concurrent refresh requests
 */
async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid
  if (tokenCache && Date.now() - tokenCache.timestamp < TOKEN_CACHE_TTL) {
    return tokenCache.accessToken
  }

  // If there's already a request in progress, wait for it
  if (tokenPromise) {
    const result = await tokenPromise
    return result.accessToken
  }

  // Start new token fetch
  tokenPromise = (async () => {
    try {
      const tokenRes = await fetch('/api/auth/token', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      
      let accessToken: string | null = null
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json()
        accessToken = tokenData?.accessToken ?? null
      }

      // Update cache
      tokenCache = { accessToken, timestamp: Date.now() }
      return { accessToken }
    } catch (error) {
      console.warn('Failed to get access token:', error)
      return { accessToken: null }
    } finally {
      // Clear the promise so next request can start fresh
      tokenPromise = null
    }
  })()

  const result = await tokenPromise
  return result.accessToken
}

/**
 * Ensure URL has trailing slash (but preserve query params)
 * Examples:
 *  /api/users -> /api/users/
 *  /api/users?page=1 -> /api/users/?page=1
 *  /api/users/ -> /api/users/ (no change)
 *  /api/users/#section -> /api/users/#section (no change)
 */
const ensureTrailingSlash = (url: string): string => {
  // Don't modify URLs that already have a trailing slash
  if (url.endsWith('/')) {
    return url
  }

  // Handle URLs with query parameters or fragments
  const questionMarkIndex = url.indexOf('?')
  const hashIndex = url.indexOf('#')

  if (questionMarkIndex > -1 || hashIndex > -1) {
    // Find the path part (before ? or #)
    const splitIndex = questionMarkIndex > -1 
      ? questionMarkIndex 
      : hashIndex

    const path = url.substring(0, splitIndex)
    const suffix = url.substring(splitIndex)

    // Add trailing slash to path if not already there
    if (!path.endsWith('/')) {
      return path + '/' + suffix
    }
    return url
  }

  // Simple case: no query params or fragments
  return url + '/'
}

// Create base axios instance
const createAxiosInstance = (): AxiosInstance => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"
  
  const instance = axios.create({
    baseURL: `${backendUrl}/api/v1`,
    timeout: 120000, // 2 minutes for file uploads
    withCredentials: true,
    // Don't set default Content-Type to allow automatic detection for FormData
    // headers: { "Content-Type": "application/json" },
  })

  // Add request interceptor to append trailing slashes
  instance.interceptors.request.use(
    (config) => {
      if (config.url) {
        config.url = ensureTrailingSlash(config.url)
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  return instance
}

/**
 * NextAuth-compatible useAxiosAuth hook
 * 
 * @returns Object with HTTP methods (get, post, put, patch, delete)
 */
export function useAxiosAuth() {
  const tenant = useTenantStore((state) => state.tenant)
  const { tenant: authTenant } = useAuth()

  const request = useCallback(
    async <T = unknown>(config: AxiosRequestConfig & { skipAuth?: boolean }): Promise<AxiosResponse<T>> => {
      const axiosInstance = createAxiosInstance()

      // Prepare headers
      const headers: Record<string, string> = {
        ...config.headers as Record<string, string>,
      }

      // Check if auth headers should be skipped (for public endpoints)
      const skipAuth = config.skipAuth === true

      // Get access token from /api/auth/token endpoint with deduplication
      // This uses the Option 3 pattern - tokens stay in HttpOnly cookie
      // Skip if explicitly disabled via skipAuth flag
      if (!skipAuth && typeof window !== 'undefined') {
        try {
          const accessToken = await getAccessToken()
          if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`

            // Get tenant from store, fallback to auth workspace (for option 2: x-tenant header support)
            // Priority: tenant.schema_name > authTenant?.workspace
            const tenantId = tenant?.schema_name || authTenant?.workspace
            if (tenantId) {
              headers['x-tenant'] = tenantId
            }
          }
        } catch (err) {
          // Silently fail - request will proceed without auth header
          console.warn('Failed to get access token:', err)
        }
      }

      // Set Content-Type based on data type
      if (config.data instanceof FormData) {
        // Let axios set the correct Content-Type for FormData
      } else if (config.data && typeof config.data === 'object') {
        headers['Content-Type'] = 'application/json'
      }

      return axiosInstance.request<T>({
        ...config,
        headers,
      })
    },
    [tenant, authTenant]
  )

  const get = useCallback(
    <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return request<T>({ ...config, method: "GET", url })
    },
    [request]
  )

  const post = useCallback(
    <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return request<T>({ ...config, method: "POST", url, data })
    },
    [request]
  )

  const put = useCallback(
    <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return request<T>({ ...config, method: "PUT", url, data })
    },
    [request]
  )

  const patch = useCallback(
    <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return request<T>({ ...config, method: "PATCH", url, data })
    },
    [request]
  )

  const del = useCallback(
    <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return request<T>({ ...config, method: "DELETE", url })
    },
    [request]
  )

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    request,
  }
}
