'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle01Icon, Mail01Icon } from '@hugeicons/core-free-icons'

interface TenantData {
  id: string
  email?: string
  phone?: string
  website?: string
  [key: string]: any
}

interface SectionChanges {
  [key: string]: boolean
}

interface ContactSectionProps {
  tenantData: TenantData | null
  handleFieldChange: (section: string, field: string, value: string) => void
  saveSection: (section: string) => Promise<void>
  sectionChanges: SectionChanges
  isSaving: string | null
}

export function ContactSection({
  tenantData,
  handleFieldChange,
  saveSection,
  sectionChanges,
  isSaving,
}: ContactSectionProps) {
  if (!tenantData) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Mail01Icon} className="h-5 w-5" />
          Contact Information
        </CardTitle>
        <CardDescription>Manage your contact details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={tenantData?.email || ''}
              onChange={(e) => handleFieldChange('contact', 'email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={tenantData?.phone || ''}
              onChange={(e) => handleFieldChange('contact', 'phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={tenantData?.website || ''}
              onChange={(e) => handleFieldChange('contact', 'website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>
        <div className="border-t pt-4">
          <Button
            onClick={() => saveSection('contact')}
            disabled={!sectionChanges.contact || isSaving === 'contact'}
            iconLeft={<HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" />}
          >
            {isSaving === 'contact' ? 'Saving...' : 'Save Contact Info'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
