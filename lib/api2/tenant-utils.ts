"use client";

import { useAxiosAuth } from "@/hooks/use-axios-auth";
import { useTenantStore } from "@/store/tenant-store";

/**
 * Tenant-aware API factory for api2 modules
 * Each API module should call this to get tenant-aware axios methods
 * 
 * This ensures all API requests automatically include X-Tenant header
 */
export function useTenantAwareApi() {
  return useAxiosAuth();
}

/**
 * Get tenant from store or workspace ID
 * Used as fallback if tenant store is not available
 */
export function getTenantFromContext() {
  if (typeof window !== "undefined") {
    // Try to get from tenant store
    try {
      const tenant = useTenantStore.getState().tenant;
      if (tenant?.schema_name) {
        return tenant.schema_name;
      }
    } catch (e) {
      console.warn("Could not get tenant from store:", e);
    }
  }
  return null;
}
