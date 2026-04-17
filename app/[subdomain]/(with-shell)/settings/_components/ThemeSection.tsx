'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  CheckmarkCircle01Icon,
  Sun03Icon,
  Moon02Icon,
} from '@hugeicons/core-free-icons'
import { WandSparkles, Palette, ChevronDown, Settings2 } from 'lucide-react'
import { SelectField } from '@/components/ui/select-field'

interface SectionChanges {
  [key: string]: boolean
}

interface ThemeSectionProps {
  themePreview: ThemeConfigPreview | null
  handleThemeChange: (
    key: keyof ThemeConfigPreview,
    value: ThemeConfigPreview[keyof ThemeConfigPreview]
  ) => void
  handleBulkThemeChange: (updates: Partial<ThemeConfigPreview>) => void
  saveSection: (section: string) => Promise<void>
  sectionChanges: SectionChanges
  isSaving: string | null
  revertTheme: () => void
}

type ThemeConfigPreview = {
  dark_mode?: boolean
  border_radius?: 'small' | 'medium' | 'large'
  color_theme?: 'ocean' | 'sky' | 'navy' | 'indigo' | 'royal' | 'rose' | 'ruby' | 'sunset' | 'amber' | 'emerald' | 'forest' | 'slate'
  background_style?: 'clean' | 'paper' | 'mist' | 'graphite'
  font_family?: 'sans' | 'serif' | 'mono'
  font_size?: 'small' | 'normal' | 'large'
  shadow_intensity?: 'subtle' | 'medium' | 'bold'
  spacing_scale?: 'compact' | 'comfortable' | 'spacious'
  animation_speed?: 'slow' | 'normal' | 'fast' | 'none'
}

const BACKGROUND_STYLES = [
  {
    value: 'clean',
    label: 'Clean',
    description: 'Bright neutral canvas',
    swatch: '#ffffff',
  },
  {
    value: 'paper',
    label: 'Paper',
    description: 'Warm and editorial',
    swatch: '#f8f4ee',
  },
  {
    value: 'mist',
    label: 'Mist',
    description: 'Cool airy surface',
    swatch: '#f4f7fb',
  },
  {
    value: 'graphite',
    label: 'Graphite',
    description: 'Subtle modern contrast',
    swatch: '#f5f6f7',
  },
]

const COLOR_THEME_SWATCHES: Record<string, string> = {
  ocean: '#0891b2',
  sky: '#3b82f6',
  navy: '#1e3a5f',
  indigo: '#4f46e5',
  royal: '#7c3aed',
  rose: '#e11d74',
  ruby: '#dc2626',
  sunset: '#f97316',
  amber: '#d97706',
  emerald: '#059669',
  forest: '#16a34a',
  slate: '#475569',
}

const BORDER_RADIUS_OPTIONS = [
  { value: 'small', label: 'Sharp', radius: '4px' },
  { value: 'medium', label: 'Smooth', radius: '8px' },
  { value: 'large', label: 'Rounded', radius: '12px' },
]

const COLOR_THEMES = [
  {
    value: 'ocean',
    label: 'Ocean',
    description: 'Modern teal with cool accents',
    swatch: COLOR_THEME_SWATCHES.ocean,
  },
  {
    value: 'sky',
    label: 'Sky Blue',
    description: 'Fresh and professional blue',
    swatch: COLOR_THEME_SWATCHES.sky,
  },
  {
    value: 'navy',
    label: 'Navy',
    description: 'Deep and authoritative blue',
    swatch: COLOR_THEME_SWATCHES.navy,
  },
  {
    value: 'indigo',
    label: 'Indigo',
    description: 'Rich and creative violet-blue',
    swatch: COLOR_THEME_SWATCHES.indigo,
  },
  {
    value: 'royal',
    label: 'Royal',
    description: 'Premium purple with elegance',
    swatch: COLOR_THEME_SWATCHES.royal,
  },
  {
    value: 'rose',
    label: 'Rose',
    description: 'Soft and warm pink tones',
    swatch: COLOR_THEME_SWATCHES.rose,
  },
  {
    value: 'ruby',
    label: 'Ruby',
    description: 'Bold crimson with impact',
    swatch: COLOR_THEME_SWATCHES.ruby,
  },
  {
    value: 'sunset',
    label: 'Sunset',
    description: 'Warm amber with confident contrast',
    swatch: COLOR_THEME_SWATCHES.sunset,
  },
  {
    value: 'amber',
    label: 'Amber',
    description: 'Golden warmth and energy',
    swatch: COLOR_THEME_SWATCHES.amber,
  },
  {
    value: 'emerald',
    label: 'Emerald',
    description: 'Vibrant green with clarity',
    swatch: COLOR_THEME_SWATCHES.emerald,
  },
  {
    value: 'forest',
    label: 'Forest',
    description: 'Balanced green with calm focus',
    swatch: COLOR_THEME_SWATCHES.forest,
  },
  {
    value: 'slate',
    label: 'Slate',
    description: 'Neutral steel for understated UI',
    swatch: COLOR_THEME_SWATCHES.slate,
  },
]

const FONT_FAMILIES = [
  { value: 'sans', label: 'Sans', description: 'Clean and modern' },
  { value: 'serif', label: 'Serif', description: 'Classic and formal' },
  { value: 'mono', label: 'Mono', description: 'Technical and precise' },
]

const FONT_SIZES = [
  { value: 'small', label: 'Small', scale: '0.95' },
  { value: 'normal', label: 'Normal', scale: '1' },
  { value: 'large', label: 'Large', scale: '1.05' },
]

const SHADOW_INTENSITY = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'medium', label: 'Medium' },
  { value: 'bold', label: 'Bold' },
]

const SPACING_SCALE = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
]

const ANIMATION_SPEED = [
  { value: 'none', label: 'None', description: 'No animations' },
  { value: 'slow', label: 'Slow', description: 'Gentle transitions' },
  { value: 'normal', label: 'Normal', description: 'Balanced speed' },
  { value: 'fast', label: 'Fast', description: 'Quick & snappy' },
]

// Theme Presets
const THEME_PRESETS = [
  {
    name: 'Professional Blue',
    description: 'Clean and corporate — ideal for formal institutions',
    config: {
      dark_mode: false,
      border_radius: 'medium' as const,
      color_theme: 'sky' as const,
      background_style: 'clean' as const,
      font_family: 'sans' as const,
      font_size: 'normal' as const,
      shadow_intensity: 'medium' as const,
      spacing_scale: 'comfortable' as const,
      animation_speed: 'normal' as const,
    },
  },
  {
    name: 'Ocean Breeze',
    description: 'Fresh teal with airy surfaces',
    config: {
      dark_mode: false,
      border_radius: 'medium' as const,
      color_theme: 'ocean' as const,
      background_style: 'mist' as const,
      font_family: 'sans' as const,
      font_size: 'normal' as const,
      shadow_intensity: 'subtle' as const,
      spacing_scale: 'comfortable' as const,
      animation_speed: 'normal' as const,
    },
  },
  {
    name: 'Deep Navy',
    description: 'Sophisticated dark theme for focused use',
    config: {
      dark_mode: true,
      border_radius: 'small' as const,
      color_theme: 'navy' as const,
      background_style: 'graphite' as const,
      font_family: 'sans' as const,
      font_size: 'normal' as const,
      shadow_intensity: 'subtle' as const,
      spacing_scale: 'comfortable' as const,
      animation_speed: 'fast' as const,
    },
  },
  {
    name: 'Royal Elegance',
    description: 'Premium purple with classic typography',
    config: {
      dark_mode: false,
      border_radius: 'medium' as const,
      color_theme: 'royal' as const,
      background_style: 'paper' as const,
      font_family: 'serif' as const,
      font_size: 'normal' as const,
      shadow_intensity: 'subtle' as const,
      spacing_scale: 'spacious' as const,
      animation_speed: 'slow' as const,
    },
  },
  {
    name: 'Rose Garden',
    description: 'Warm and approachable with soft edges',
    config: {
      dark_mode: false,
      border_radius: 'large' as const,
      color_theme: 'rose' as const,
      background_style: 'clean' as const,
      font_family: 'sans' as const,
      font_size: 'normal' as const,
      shadow_intensity: 'medium' as const,
      spacing_scale: 'comfortable' as const,
      animation_speed: 'normal' as const,
    },
  },
  {
    name: 'Emerald Focus',
    description: 'Balanced green for productivity and calm',
    config: {
      dark_mode: false,
      border_radius: 'medium' as const,
      color_theme: 'emerald' as const,
      background_style: 'clean' as const,
      font_family: 'sans' as const,
      font_size: 'normal' as const,
      shadow_intensity: 'medium' as const,
      spacing_scale: 'comfortable' as const,
      animation_speed: 'normal' as const,
    },
  },
  {
    name: 'Sunset Warmth',
    description: 'Warm orange tones with inviting feel',
    config: {
      dark_mode: false,
      border_radius: 'large' as const,
      color_theme: 'sunset' as const,
      background_style: 'mist' as const,
      font_family: 'sans' as const,
      font_size: 'normal' as const,
      shadow_intensity: 'medium' as const,
      spacing_scale: 'spacious' as const,
      animation_speed: 'normal' as const,
    },
  },
  {
    name: 'Minimal Slate',
    description: 'Understated neutral for distraction-free UI',
    config: {
      dark_mode: false,
      border_radius: 'small' as const,
      color_theme: 'slate' as const,
      background_style: 'graphite' as const,
      font_family: 'sans' as const,
      font_size: 'normal' as const,
      shadow_intensity: 'subtle' as const,
      spacing_scale: 'compact' as const,
      animation_speed: 'fast' as const,
    },
  },
]

export function ThemeSection({
  themePreview,
  handleThemeChange,
  handleBulkThemeChange,
  saveSection,
  sectionChanges,
  isSaving,
  revertTheme,
}: ThemeSectionProps) {
  const [customizeOpen, setCustomizeOpen] = useState(false)
  
  const isDarkMode = themePreview?.dark_mode || false
  const borderRadius = themePreview?.border_radius || 'medium'
  const colorTheme = themePreview?.color_theme || 'ocean'
  const backgroundStyle = themePreview?.background_style || 'clean'
  const fontFamily = themePreview?.font_family || 'sans'
  const fontSize = themePreview?.font_size || 'normal'
  const shadowIntensity = themePreview?.shadow_intensity || 'medium'
  const spacingScale = themePreview?.spacing_scale || 'comfortable'
  const themeSwatch = COLOR_THEME_SWATCHES[colorTheme] ?? '#2563eb'

  const getBackgroundPreview = (style: string, darkModeEnabled: boolean) => {
    if (darkModeEnabled) {
      return {
        background: '#0f172a',
        border: '#334155',
        muted: '#1f2937',
      }
    }

    switch (style) {
      case 'paper':
        return {
          background: '#f8f4ee',
          border: '#e6ded2',
          muted: '#efe8dd',
        }
      case 'mist':
        return {
          background: '#f4f7fb',
          border: '#e1e8f2',
          muted: '#e9eef6',
        }
      case 'graphite':
        return {
          background: '#f5f6f7',
          border: '#e2e5e9',
          muted: '#e9edf1',
        }
      default:
        return {
          background: '#ffffff',
          border: '#e5e7eb',
          muted: '#f1f5f9',
        }
    }
  }

  const getBorderRadiusPx = (value: string) => {
    switch (value) {
      case 'small':
        return '4px'
      case 'large':
        return '12px'
      default:
        return '8px'
    }
  }

  const getFontFamilyStyle = (value: string) => {
    switch (value) {
      case 'serif':
        return 'ui-serif, Georgia, serif'
      case 'mono':
        return 'ui-monospace, Menlo, Monaco, monospace'
      default:
        return 'ui-sans-serif, system-ui, sans-serif'
    }
  }

  const getShadowStyle = (value: string) => {
    switch (value) {
      case 'subtle':
        return '0 1px 2px 0 rgb(0 0 0 / 0.06)'
      case 'bold':
        return '0 10px 15px -3px rgb(0 0 0 / 0.18)'
      default:
        return '0 4px 6px -1px rgb(0 0 0 / 0.12)'
    }
  }

  const getSpacingStyle = (value: string) => {
    switch (value) {
      case 'compact':
        return '16px'
      case 'spacious':
        return '28px'
      default:
        return '22px'
    }
  }

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    // Apply all preset config values at once using bulk update
    handleBulkThemeChange(preset.config)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WandSparkles className="h-5 w-5" />
          Theme Configuration
        </CardTitle>
        <CardDescription>
          Choose a theme preset or customize individual settings to match your brand
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">{/* Theme Presets with Rich UI Previews */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme Presets
            </Label>
            <p className="text-sm text-muted-foreground">
              Start with a complete look and feel designed by our team
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {THEME_PRESETS.map((preset) => {
              const presetBg = getBackgroundPreview(preset.config.background_style, preset.config.dark_mode)
              const presetSwatch = COLOR_THEME_SWATCHES[preset.config.color_theme]
              const presetRadius = getBorderRadiusPx(preset.config.border_radius)
              const presetShadow = getShadowStyle(preset.config.shadow_intensity)
              
              // Check if current config matches this preset
              const isActive = Object.entries(preset.config).every(
                ([key, value]) => themePreview?.[key as keyof ThemeConfigPreview] === value
              )

              return (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`relative p-5 border-2 rounded-lg text-left transition-all ${
                    isActive 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-lg' 
                      : 'border-border hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  {isActive && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="bg-primary shadow-md">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="font-semibold text-base flex items-center gap-2">
                      {preset.name}
                      {preset.config.dark_mode && (
                        <HugeiconsIcon icon={Moon02Icon} className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </div>

                  {/* Mini UI Preview */}
                  <div
                    className="p-4 rounded-lg space-y-3 transition-all"
                    style={{
                      backgroundColor: presetBg.background,
                      borderRadius: presetRadius,
                      border: `1px solid ${presetBg.border}`,
                      boxShadow: presetShadow,
                      color: preset.config.dark_mode ? '#f1f5f9' : '#1e293b',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium">Preview</div>
                      <div
                        className="px-2 py-0.5 rounded text-[10px] font-medium text-white"
                        style={{ backgroundColor: presetSwatch, borderRadius: presetRadius }}
                      >
                        Badge
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="px-3 py-1.5 text-xs font-medium text-white rounded transition-opacity hover:opacity-90"
                        style={{ backgroundColor: presetSwatch, borderRadius: presetRadius }}
                      >
                        Primary
                      </div>
                      <div
                        className="px-3 py-1.5 text-xs font-medium rounded border"
                        style={{
                          borderRadius: presetRadius,
                          borderColor: presetBg.border,
                          color: preset.config.dark_mode ? '#f1f5f9' : '#1e293b',
                        }}
                      >
                        Outline
                      </div>
                    </div>
                    <div
                      className="h-16 rounded p-2"
                      style={{
                        backgroundColor: presetBg.muted,
                        borderRadius: presetRadius,
                      }}
                    >
                      <div
                        className="h-1.5 rounded-full w-3/4 mb-1.5"
                        style={{
                          backgroundColor: preset.config.dark_mode
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(0,0,0,0.08)',
                          borderRadius: presetRadius,
                        }}
                      />
                      <div
                        className="h-1.5 rounded-full w-1/2"
                        style={{
                          backgroundColor: preset.config.dark_mode
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(0,0,0,0.08)',
                          borderRadius: presetRadius,
                        }}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Collapsible Advanced Customization */}
        <Collapsible open={customizeOpen} onOpenChange={setCustomizeOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between h-10 px-2.5 border-2 border-border/70 bg-background/70 hover:bg-muted/70 hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md text-sm font-medium transition-all">
            <span className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Advanced Customization
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${customizeOpen ? 'rotate-180' : ''}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-8 pt-8">
            {/* Background Style */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Background Style</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose the base surface tone for pages and cards
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BACKGROUND_STYLES.map((style) => {
                  const isSelected = backgroundStyle === style.value
                  return (
                    <button
                      key={style.value}
                      onClick={() => handleThemeChange('background_style', style.value as ThemeConfigPreview['background_style'])}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected ? 'border-foreground bg-accent' : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-md border"
                          style={{ backgroundColor: style.swatch }}
                        />
                        <div>
                          <div className="font-semibold text-sm">{style.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {style.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Color Theme */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Color Theme</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Apply a curated palette across the portal
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = colorTheme === theme.value
                  return (
                    <button
                      key={theme.value}
                      onClick={() => handleThemeChange('color_theme', theme.value as ThemeConfigPreview['color_theme'])}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected ? 'border-foreground bg-accent' : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3.5 w-3.5 rounded-full border"
                          style={{ backgroundColor: theme.swatch }}
                        />
                        <div className="font-semibold text-sm">{theme.label}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {theme.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Dark Mode Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <HugeiconsIcon
                      icon={isDarkMode ? Moon02Icon : Sun03Icon}
                      className="h-4 w-4"
                    />
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark theme for better viewing in low-light environments
                  </p>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={(checked) => handleThemeChange('dark_mode', checked)}
                />
              </div>

              {/* Visual Preview of Dark Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    !isDarkMode ? 'border-foreground bg-background' : 'border-border bg-muted hover:border-muted-foreground'
                  }`}
                  onClick={() => handleThemeChange('dark_mode', false)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <HugeiconsIcon icon={Sun03Icon} className="h-4 w-4" />
                      <span className="text-sm font-medium">Light</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-foreground/10 rounded" />
                      <div className="h-2 bg-foreground/10 rounded w-3/4" />
                      <div className="h-2 bg-foreground/10 rounded w-1/2" />
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer bg-slate-900 text-white ${
                    isDarkMode ? 'border-white' : 'border-slate-700 hover:border-slate-500'
                  }`}
                  onClick={() => handleThemeChange('dark_mode', true)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <HugeiconsIcon icon={Moon02Icon} className="h-4 w-4" />
                      <span className="text-sm font-medium">Dark</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-white/20 rounded" />
                      <div className="h-2 bg-white/20 rounded w-3/4" />
                      <div className="h-2 bg-white/20 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Border Radius */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Border Radius</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Adjust the roundness of corners throughout your portal
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {BORDER_RADIUS_OPTIONS.map((option) => {
                  const isSelected = borderRadius === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange('border_radius', option.value as ThemeConfigPreview['border_radius'])}
                      className={`p-4 border-2 transition-all hover:border-foreground ${
                        isSelected ? 'border-foreground bg-accent' : 'border-border bg-background'
                      }`}
                      style={{
                        borderRadius: option.radius,
                        backgroundColor: isSelected ? themeSwatch : undefined,
                        color: isSelected ? '#ffffff' : undefined,
                      }}
                    >
                      <div className="space-y-2">
                        <div className="font-semibold text-sm">{option.label}</div>
                        <div className="flex gap-2">
                          <div
                            className="w-2 h-2 bg-foreground"
                            style={{ borderRadius: option.radius }}
                          />
                          <div
                            className="w-2 h-2 bg-foreground"
                            style={{ borderRadius: option.radius }}
                          />
                          <div
                            className="w-2 h-2 bg-foreground"
                            style={{ borderRadius: option.radius }}
                          />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Typography */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Typography</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Adjust font family and base size
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <SelectField
                    items={FONT_FAMILIES}
                    value={fontFamily}
                    onValueChange={(value) => value && handleThemeChange('font_family', value as ThemeConfigPreview['font_family'])}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <SelectField
                    items={FONT_SIZES}
                    value={fontSize}
                    onValueChange={(value) => value && handleThemeChange('font_size', value as ThemeConfigPreview['font_size'])}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Depth & Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="shadow-depth">Shadow Depth</Label>
                <SelectField
                  items={SHADOW_INTENSITY}
                  value={shadowIntensity}
                  onValueChange={(value) => value && handleThemeChange('shadow_intensity', value as ThemeConfigPreview['shadow_intensity'])}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spacing">Spacing Scale</Label>
                <SelectField
                  items={SPACING_SCALE}
                  value={spacingScale}
                  onValueChange={(value) => value && handleThemeChange('spacing_scale', value as ThemeConfigPreview['spacing_scale'])}
                />
              </div>
            </div>

            <Separator />

            {/* Animation & Interaction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="animation-speed">Animation Speed</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Controls transition speed throughout the interface
                </p>
                <SelectField
                  items={ANIMATION_SPEED}
                  value={themePreview?.animation_speed || 'normal'}
                  onValueChange={(value) => value && handleThemeChange('animation_speed', value as ThemeConfigPreview['animation_speed'])}
                />
              </div>
            </div>

            <Separator />

            {/* Live Preview Card */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Live Preview</Label>
              {(() => {
                const bgPreview = getBackgroundPreview(backgroundStyle, isDarkMode)
                return (
                  <div
                    className={`p-6 border-2 rounded-lg space-y-4 transition-colors`}
                    style={{
                      borderRadius: getBorderRadiusPx(borderRadius),
                      fontFamily: getFontFamilyStyle(fontFamily),
                      boxShadow: getShadowStyle(shadowIntensity),
                      padding: getSpacingStyle(spacingScale),
                      backgroundColor: bgPreview.background,
                      borderColor: bgPreview.border,
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className="font-semibold text-sm"
                          style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                        >
                          Sample Title
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}
                        >
                          Preview of your theme settings
                        </div>
                      </div>
                      <Badge style={{ backgroundColor: themeSwatch }} className="text-white">
                        New
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`h-2 rounded-full`}
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
                        }}
                      />
                      <div
                        className={`h-2 rounded-full w-5/6`}
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
                        }}
                      />
                      <div
                        className={`h-2 rounded-full w-4/6`}
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: themeSwatch,
                          borderRadius: getBorderRadiusPx(borderRadius),
                        }}
                        className="text-white hover:opacity-90"
                      >
                        Primary Button
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        style={{
                          borderRadius: getBorderRadiusPx(borderRadius),
                          borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                          color: isDarkMode ? '#f1f5f9' : '#1e293b',
                        }}
                      >
                        Secondary Button
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Save Section */}
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <HugeiconsIcon
                icon={SparklesIcon}
                className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
              />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold">Theme changes are applied instantly</p>
                <p>Save your configuration to persist these settings across your school portal.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => revertTheme()}
              disabled={!sectionChanges.theme}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Revert Changes
            </Button>
            <Button
              onClick={() => saveSection('theme')}
              disabled={!sectionChanges.theme || isSaving === 'theme'}
              iconLeft={<HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" />}
              className="flex-1"
              size="lg"
            >
              {isSaving === 'theme' ? 'Saving Theme...' : 'Save Theme Configuration'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
