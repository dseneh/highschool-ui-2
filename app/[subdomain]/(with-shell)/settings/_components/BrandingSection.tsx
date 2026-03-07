'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { CloudUploadIcon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons'

interface TenantData {
  id: string
  logo?: string
  logo_shape?: string
  [key: string]: any
}

interface SectionChanges {
  [key: string]: boolean
}

interface BrandingSectionProps {
  tenantData: TenantData | null
  logoFile: File | null
  logoPreview: string | null
  handleLogoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFieldChange: (section: string, field: string, value: string) => void
  saveSection: (section: string) => Promise<void>
  sectionChanges: SectionChanges
  isSaving: string | null
}

export function BrandingSection({
  tenantData,
  logoFile,
  logoPreview,
  handleLogoSelect,
  handleFieldChange,
  saveSection,
  sectionChanges,
  isSaving,
}: BrandingSectionProps) {
  if (!tenantData) return null
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo & Branding</CardTitle>
        <CardDescription>Customize your school&apos;s branding assets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="space-y-4">
            <Label>Logo</Label>
            <p className="text-sm text-muted-foreground">Upload your school&apos;s logo (PNG, JPG, SVG)</p>

            <div
              className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={openFilePicker}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openFilePicker()
                }
              }}
            >
              {logoPreview ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 mx-auto object-cover rounded"
                  />
                  <div className="text-sm text-muted-foreground">{logoFile?.name || 'Current logo'}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <HugeiconsIcon icon={CloudUploadIcon} className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag and drop or click to upload logo</p>
                </div>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                ref={fileInputRef}
                className="hidden"
              />
            </div>

            <Button variant="outline" onClick={openFilePicker} type="button">
              Choose File
            </Button>
          </div>

          {/* Logo Shape */}
          <div className="space-y-4">
            <Label>Logo Shape</Label>
            <p className="text-sm text-muted-foreground">Choose how your logo should be displayed</p>

            <div className="space-y-2">
              {['square', 'landscape'].map((shape) => (
                <label
                  key={shape}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name="logo_shape"
                    value={shape}
                    checked={tenantData?.logo_shape === shape}
                    onChange={(e) => handleFieldChange('branding', 'logo_shape', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm capitalize font-medium">{shape === 'square' ? 'Square' : 'Landscape'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button
            onClick={() => saveSection('branding')}
            disabled={!sectionChanges.branding || isSaving === 'branding'}
            iconLeft={<HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" />}
          >
            {isSaving === 'branding' ? 'Saving...' : 'Save Branding'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
