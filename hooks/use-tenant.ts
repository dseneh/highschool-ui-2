'use client'

import { useTenantStore } from '@/store/tenant-store'

export function useTenant() {
  const tenant = useTenantStore((state) => state.tenant)
  return tenant
}
