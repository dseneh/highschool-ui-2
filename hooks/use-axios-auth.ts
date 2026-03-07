"use client"

/**
 * Axios HTTP Client Hook for NextAuth
 * 
 * Provides authenticated HTTP client functions that automatically handle
 * JWT tokens and session management for API requests.
 */

import { useCallback } from "react"
import { type AxiosRequestConfig, type AxiosResponse } from "axios"
import { authenticatedApiClient } from "@/lib/api2/http-clients"
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
 * NextAuth-compatible useAxiosAuth hook
 * 
 * @returns Object with HTTP methods (get, post, put, patch, delete)
 */
export function useAxiosAuth() {
  const tenant = useTenantStore((state) => state.tenant)
  const { tenant: authTenant } = useAuth()

  const request = useCallback(
    async <T = unknown>(config: AxiosRequestConfig & { skipAuth?: boolean }): Promise<AxiosResponse<T>> => {
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

      // Use centralized authenticated client from lib/api2/http-clients
      return authenticatedApiClient.request<T>({
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
