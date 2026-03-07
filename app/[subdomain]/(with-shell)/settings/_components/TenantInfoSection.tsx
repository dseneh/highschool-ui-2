'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { Building02Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons'
import { SelectField } from '@/components/ui/select-field'

interface TenantData {
  id: string
  name: string
  short_name?: string
  email?: string
  phone?: string
  website?: string
  slogan?: string
  description?: string
  funding_type?: string
  school_type?: string
  status?: string
  [key: string]: any
}

interface SectionChanges {
  [key: string]: boolean
}

interface TenantInfoSectionProps {
  tenantData: TenantData | null
  handleFieldChange: (section: string, field: string, value: string) => void
  saveSection: (section: string) => Promise<void>
  sectionChanges: SectionChanges
  isSaving: string | null
}

export function TenantInfoSection({
  tenantData,
  handleFieldChange,
  saveSection,
  sectionChanges,
  isSaving,
}: TenantInfoSectionProps) {
  if (!tenantData) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Building02Icon} className="h-5 w-5" />
          Basic Information
        </CardTitle>
        <CardDescription>Update your basic organization information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={tenantData?.name || ''}
              onChange={(e) => handleFieldChange('basic', 'name', e.target.value)}
              placeholder="Enter organization name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="short_name">Short Name</Label>
            <Input
              id="short_name"
              value={tenantData?.short_name || ''}
              onChange={(e) => handleFieldChange('basic', 'short_name', e.target.value)}
              placeholder="Enter short name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={tenantData?.email || ''}
              onChange={(e) => handleFieldChange('basic', 'email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={tenantData?.phone || ''}
              onChange={(e) => handleFieldChange('basic', 'phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={tenantData?.website || ''}
              onChange={(e) => handleFieldChange('basic', 'website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input
              id="slogan"
              value={tenantData?.slogan || ''}
              onChange={(e) => handleFieldChange('basic', 'slogan', e.target.value)}
              placeholder="Enter school slogan"
            />
          </div>
          <div className="space-y-2">
            <Label >Funding Type</Label>
            <SelectField
            items={[
                { value: 'public', label: 'Public' },
                { value: 'private', label: 'Private' },
                { value: 'ngo', label: 'NGO' },
                { value: 'hybrid', label: 'Hybrid' },
              ]}
              value={tenantData?.funding_type || ''}
              onValueChange={(value: any) => value && handleFieldChange('basic', 'funding_type', value)}
            />
          </div>
          <div className="space-y-2">
            <Label >School Type</Label>
            <SelectField
              items={[
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
                { value: 'higher_education', label: 'Higher Education' },
                { value: 'vocational', label: 'Vocational' },
                { value: 'k12', label: 'K-12' },
              ]}
              value={tenantData?.school_type || ''}
              onValueChange={(value: any) => value && handleFieldChange('basic', 'school_type', value)}
            />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border rounded-lg resize-none font-mono text-sm"
              rows={4}
              value={tenantData?.description || ''}
              onChange={(e) => handleFieldChange('basic', 'description', e.target.value)}
              placeholder="Enter school description"
            />
          </div>
        </div>
        <div className="border-t pt-4">
          <Button
            onClick={() => saveSection('basic')}
            disabled={!sectionChanges.basic || isSaving === 'basic'}
            iconLeft={<HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" />}
          >
            {isSaving === 'basic' ? 'Saving...' : 'Save Basic Info'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
