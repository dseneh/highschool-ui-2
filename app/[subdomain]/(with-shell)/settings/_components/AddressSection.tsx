'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { Location01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons'

interface TenantData {
  id: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  [key: string]: any
}

interface SectionChanges {
  [key: string]: boolean
}

interface AddressSectionProps {
  tenantData: TenantData | null
  handleFieldChange: (section: string, field: string, value: string) => void
  saveSection: (section: string) => Promise<void>
  sectionChanges: SectionChanges
  isSaving: string | null
}

export function AddressSection({
  tenantData,
  handleFieldChange,
  saveSection,
  sectionChanges,
  isSaving,
}: AddressSectionProps) {
  if (!tenantData) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Location01Icon} className="h-5 w-5" />
          Address Information
        </CardTitle>
        <CardDescription>Update your school&apos;s address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={tenantData?.address || ''}
              onChange={(e) => handleFieldChange('address', 'address', e.target.value)}
              placeholder="Enter street address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={tenantData?.city || ''}
              onChange={(e) => handleFieldChange('address', 'city', e.target.value)}
              placeholder="Enter city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={tenantData?.state || ''}
              onChange={(e) => handleFieldChange('address', 'state', e.target.value)}
              placeholder="Enter state"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={tenantData?.country || ''}
              onChange={(e) => handleFieldChange('address', 'country', e.target.value)}
              placeholder="Enter country"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              value={tenantData?.postal_code || ''}
              onChange={(e) => handleFieldChange('address', 'postal_code', e.target.value)}
              placeholder="Enter postal code"
            />
          </div>
        </div>
        <div className="border-t pt-4">
          <Button
            onClick={() => saveSection('address')}
            disabled={!sectionChanges.address || isSaving === 'address'}
            iconLeft={<HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" />}
          >
            {isSaving === 'address' ? 'Saving...' : 'Save Address'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
