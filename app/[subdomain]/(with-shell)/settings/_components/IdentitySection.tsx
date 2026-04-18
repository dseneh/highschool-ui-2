'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { Building02Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'

interface Domain {
  id: number
  domain: string
  is_primary: boolean
}

interface TenantData {
  id_number?: string
  workspace?: string
  domain?: string
  domains?: Domain[]
  [key: string]: any
}

interface IdentitySectionProps {
  tenantData: TenantData | null
}

export function IdentitySection({ tenantData }: IdentitySectionProps) {
  if (!tenantData) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Building02Icon} className="h-5 w-5" />
          Organization Identity
        </CardTitle>
        <CardDescription>Identification information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ID Number</label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm font-mono">
              {tenantData?.id_number || 'N/A'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Workspace</label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm font-mono">
              {tenantData?.workspace || 'N/A'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Primary Domain</label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm font-mono">
              {tenantData?.domain || 'N/A'}
            </div>
          </div>
        </div>

        {tenantData?.domains && tenantData.domains.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">All Domains</label>
            <div className="flex flex-wrap gap-2">
              {tenantData.domains.map((domain) => (
                <div key={domain.id} className="flex items-center gap-2">
                  <Badge variant={domain.is_primary ? 'default' : 'secondary'}>
                    {domain.domain}
                    {domain.is_primary && ' (Primary)'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
