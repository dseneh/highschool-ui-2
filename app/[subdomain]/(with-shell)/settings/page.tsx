'use client'

import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/dashboard/page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQueryState } from 'nuqs'
import {
  CloudUploadIcon,
  SparklesIcon,
  Building02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSchoolsApi } from '@/lib/api2/school/api'
import { useTenantSubdomain } from '@/hooks/use-tenant-subdomain'
import { useSchools } from '@/lib/api2'
import RefreshButton from '@/components/shared/refresh-button'
import {
  IdentitySection,
  GeneralInfoSection,
  ContactSection,
  AddressSection,
  BrandingSection,
  ThemeSection,
} from './_components'
import { Badge } from '@/components/ui/badge'
import {getStatusBadgeClass} from '@/lib/status-colors';
import { getErrorMessage } from '@/lib/utils/error-handler'
import { showToast } from '@/lib/toast'
import { useTenantStore } from '@/store/tenant-store'
import { useAuthStore } from '@/store/auth-store'
import { useTheme } from '@/contexts/theme-context'
import { cn } from '@/lib/utils'
import { getQueryClient } from '@/lib/query-client'

type TabValue = 'info' | 'branding' | 'theme'

interface TenantData {
  id: string
  name: string
  short_name?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  slogan?: string
  description?: string
  funding_type?: string
  school_type?: string
  status?: string
  logo?: string
  logo_shape?: string
  theme_config?: ThemeConfigPreview
}

interface SectionChanges {
  [key: string]: boolean
}

type ThemeConfigPreview = {
  dark_mode?: boolean
  border_radius?: 'small' | 'medium' | 'large'
  color_theme?: 'ocean' | 'sunset' | 'forest' | 'royal' | 'slate'
  background_style?: 'clean' | 'paper' | 'mist' | 'graphite'
  font_family?: 'sans' | 'serif' | 'mono'
  font_size?: 'small' | 'normal' | 'large'
  shadow_intensity?: 'subtle' | 'medium' | 'bold'
  spacing_scale?: 'compact' | 'comfortable' | 'spacious'
  animation_speed?: 'slow' | 'normal' | 'fast' | 'none'
}

export default function SettingsPage() {
  const queryClient = getQueryClient()
  const { updateTheme } = useTheme()
  const [activeTab, setActiveTab] = useQueryState<TabValue>('tab', {
    defaultValue: 'info',
    parse: (value) => {
      const validTabs: TabValue[] = ['info', 'branding', 'theme']
      return validTabs.includes(value as TabValue) ? (value as TabValue) : 'info'
    },
    shallow: false,
  })

  const { updateTenantOrganizationInfoApi, updateTenantBrandingApi, updateTenantThemeApi, uploadTenantLogoApi, invalidateCacheApi } = useSchoolsApi()
  const { getTenant } = useSchools()
  const tenantSubdomain = useTenantSubdomain()
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [tenantData, setTenantData] = useState<TenantData | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [themePreview, setThemePreview] = useState<ThemeConfigPreview | null>(null)
  const [originalTheme, setOriginalTheme] = useState<ThemeConfigPreview | null>(null)
  const [sectionChanges, setSectionChanges] = useState<SectionChanges>({
    general: false,
    contact: false,
    address: false,
    branding: false,
    theme: false,
  })

  const { data: tenant, isLoading: isTenantLoading, error, refetch, isFetching } = getTenant(tenantSubdomain, {
        enabled: !!tenantSubdomain,
  })

  const applyThemeConfig = useCallback((config?: ThemeConfigPreview | null) => {
    const themeConfig = config || {}
    const shapeMap: { [key: string]: 'rounded' | 'sharp' | 'pill' } = {
      'small': 'sharp',
      'medium': 'rounded',
      'large': 'pill'
    }

    updateTheme({
      darkMode: themeConfig.dark_mode || false,
      shape: shapeMap[themeConfig.border_radius || 'medium'] || 'rounded',
      color: themeConfig.color_theme || 'ocean',
      backgroundStyle: themeConfig.background_style || 'clean',
      fontFamily: themeConfig.font_family || 'sans',
      fontSize: themeConfig.font_size || 'normal',
      shadowIntensity: themeConfig.shadow_intensity || 'medium',
      spacingScale: themeConfig.spacing_scale || 'comfortable',
      animationSpeed: themeConfig.animation_speed || 'normal',
    })
  }, [updateTheme])

  // Load tenant data and initialize all form states
  useEffect(() => {
    if (tenant) {
      // Ensure we have a properly typed tenant object
      setTenantData(tenant as TenantData)
      
      // Initialize logo preview from tenant data
      if (tenant.logo) {
        setLogoPreview(tenant.logo)
      }
      
      // Initialize theme preview from tenant data AND apply theme to UI
      if (tenant.theme_config) {
        setThemePreview(tenant.theme_config)
        setOriginalTheme(tenant.theme_config)
        try {
          applyThemeConfig(tenant.theme_config)
        } catch (themeError) {
          console.warn('Theme load warning:', themeError)
        }
      } else {
        // Initialize with default theme settings if not present
        const defaultTheme: ThemeConfigPreview = {
          dark_mode: false,
          border_radius: 'medium',
          color_theme: 'ocean',
          background_style: 'clean',
          font_family: 'sans',
          font_size: 'normal',
          shadow_intensity: 'medium',
          spacing_scale: 'comfortable',
          animation_speed: 'normal',
        }
        setThemePreview(defaultTheme)
        setOriginalTheme(defaultTheme)
        try {
          applyThemeConfig(defaultTheme)
        } catch (themeError) {
          console.warn('Theme load warning:', themeError)
        }
      }
    }
  }, [tenant, applyThemeConfig])

  const handleFieldChange = (section: string, field: string, value: string) => {
    if (!tenantData) return

    setTenantData({
      ...tenantData,
      [field]: value,
    })

    setSectionChanges({
      ...sectionChanges,
      [section]: true,
    })
  }

  const handleThemeChange = (
    key: keyof ThemeConfigPreview,
    value: ThemeConfigPreview[keyof ThemeConfigPreview]
  ) => {
    const nextTheme: ThemeConfigPreview = {
      ...(themePreview || {}),
      [key]: value,
    }
    setThemePreview(nextTheme)
    try {
      applyThemeConfig(nextTheme)
    } catch (themeError) {
      console.warn('Theme preview warning:', themeError)
    }

    setSectionChanges({
      ...sectionChanges,
      theme: true,
    })
  }

  const handleBulkThemeChange = (updates: Partial<ThemeConfigPreview>) => {
    const nextTheme: ThemeConfigPreview = {
      ...(themePreview || {}),
      ...updates,
    }
    setThemePreview(nextTheme)
    try {
      applyThemeConfig(nextTheme)
    } catch (themeError) {
      console.warn('Theme preview warning:', themeError)
    }

    setSectionChanges({
      ...sectionChanges,
      theme: true,
    })
  }

  const revertTheme = () => {
    if (originalTheme) {
      setThemePreview(originalTheme)
      try {
        applyThemeConfig(originalTheme)
      } catch (themeError) {
        console.warn('Theme revert warning:', themeError)
      }
      setSectionChanges({
        ...sectionChanges,
        theme: false,
      })
    }
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }

    setSectionChanges({
      ...sectionChanges,
      branding: true,
    })
  }

  const saveSection = async (section: string) => {
    if (!tenantData || !tenantSubdomain) return

    try {
      setIsSaving(section)

      let response
      if (section === 'general') {
        response = await updateTenantOrganizationInfoApi(tenantSubdomain, {
          name: tenantData.name,
          short_name: tenantData.short_name,
          slogan: tenantData.slogan,
          description: tenantData.description,
          funding_type: tenantData.funding_type,
          school_type: tenantData.school_type,
        })
      } else if (section === 'contact') {
        response = await updateTenantOrganizationInfoApi(tenantSubdomain, {
          email: tenantData.email,
          phone: tenantData.phone,
          website: tenantData.website,
        })
      } else if (section === 'address') {
        response = await updateTenantOrganizationInfoApi(tenantSubdomain, {
          address: tenantData.address,
          city: tenantData.city,
          state: tenantData.state,
          country: tenantData.country,
          postal_code: tenantData.postal_code,
        })
      } else if (section === 'branding') {
        if (logoFile) {
          await uploadTenantLogoApi(tenantSubdomain, logoFile)
          setLogoFile(null)
        }
        response = await updateTenantBrandingApi(tenantSubdomain, {
          logo_shape: tenantData.logo_shape,
        })
      } else if (section === 'theme') {
        response = await updateTenantThemeApi(tenantSubdomain, {
          theme_config: themePreview,
        })
      }

      if (response) {
        // Handle both response.data and direct response
        const data = (response.data || response) as TenantData
        if (data) {
          // For theme section, ensure theme_config is included in tenantData
          if (section === 'theme' && themePreview) {
            data.theme_config = themePreview
          }
          setTenantData(data)
          
          // Update Zustand tenant store with new tenant data
          useTenantStore.getState().setTenant({
            ...data,
            subdomain: tenantSubdomain,
          } as any)
          
          // Update auth store with updated tenant in user's tenants list
          const user = useAuthStore.getState().user
          if (user && user.tenants) {
            const updatedTenants = user.tenants.map((t) =>
              t.id === data.id || t.schema_name === tenantSubdomain
                ? { ...t, ...data }
                : t
            )
            useAuthStore.getState().updateUser({ tenants: updatedTenants })
          }
        }
        setSectionChanges({
          ...sectionChanges,
          [section]: false,
        })
        
        // Invalidate React Query cache - both specific tenant and tenant list
        queryClient.invalidateQueries({ queryKey: ['tenants', tenantSubdomain] })
        queryClient.invalidateQueries({ queryKey: ['tenants'] })
        
        // Invalidate backend cache
        try {
          await invalidateCacheApi('all')
        } catch (cacheError) {
          // Cache invalidation failure shouldn't block the success message
          console.warn('Cache invalidation warning:', cacheError)
        }
        
        // Apply theme if theme section was saved
        if (section === 'theme') {
          try {
            const themeConfig = (data.theme_config || themePreview) ?? {}
            applyThemeConfig(themeConfig)
          } catch (themeError) {
            console.warn('Theme application warning:', themeError)
          }
        }
        
        showToast.success('Success!', `${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully`)
      }
    } catch (error) {
      console.error(`Error saving ${section}:`, error)
      showToast.error('Error Occured!', getErrorMessage(error))
    } finally {
      setIsSaving(null)
    }
  }


  return (
    <PageLayout
      title="Settings"
      description="Manage your school settings and preferences"
      loading={isTenantLoading}
      error={error}
      skeleton={
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      }
      actions={
        <div className='flex items-center gap-2'>
              {tenantData?.status && (
                <Badge
                      className={cn(
                        "capitalize",
                        getStatusBadgeClass(tenantData?.status || 'active')
                      )}
                    >
                      {tenantData?.status}
                    </Badge>
              )}
            <RefreshButton
          onClick={() => refetch()}
          loading={isFetching || isTenantLoading}
        />
        </div>
      }
    >
      <div className="w-full max-w-4xl">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 " variant={"line"}>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <HugeiconsIcon icon={Building02Icon} className="h-4 w-4" />
              <span className="hidden sm:inline">Tenant Info</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <HugeiconsIcon icon={CloudUploadIcon} className="h-4 w-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
          </TabsList>

          {/* Tenant Info Tab */}
          <TabsContent value="info" className="space-y-6 pt-3">
            <IdentitySection tenantData={tenantData} />
            <GeneralInfoSection
              tenantData={tenantData}
              handleFieldChange={handleFieldChange}
              saveSection={saveSection}
              sectionChanges={sectionChanges}
              isSaving={isSaving}
            />
            <ContactSection
              tenantData={tenantData}
              handleFieldChange={handleFieldChange}
              saveSection={saveSection}
              sectionChanges={sectionChanges}
              isSaving={isSaving}
            />
            <AddressSection
              tenantData={tenantData}
              handleFieldChange={handleFieldChange}
              saveSection={saveSection}
              sectionChanges={sectionChanges}
              isSaving={isSaving}
            />
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6 pt-3">
            <BrandingSection
              tenantData={tenantData}
              logoFile={logoFile}
              logoPreview={logoPreview}
              handleLogoSelect={handleLogoSelect}
              handleFieldChange={handleFieldChange}
              saveSection={saveSection}
              sectionChanges={sectionChanges}
              isSaving={isSaving}
            />
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6 pt-3">
            <ThemeSection
              themePreview={themePreview}
              handleThemeChange={handleThemeChange}
              handleBulkThemeChange={handleBulkThemeChange}
              saveSection={saveSection}
              sectionChanges={sectionChanges}
              isSaving={isSaving}
              revertTheme={revertTheme}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}

