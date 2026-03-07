# Settings Page Internationalization Implementation

## Overview
The Settings page has been enhanced to support multiple languages using the `next-intl` library. All user-facing text in the settings page is now translatable in English, Spanish, and French.

## Changes Made

### 1. Updated Component: `app/[subdomain]/(with-shell)/settings/page.tsx`
- Added `useTranslations` hook from `next-intl` for accessing translations
- Replaced all hardcoded text strings with translation keys using the `t()` function
- Organized translations under the `settings` namespace
- Cleaned up unused imports (SelectField, Checkbox, FieldSet, FieldGroup, FieldLegend, XClose01Icon)
- Removed unused constants (COUNTRIES, BORDER_RADIUS_OPTIONS)

### 2. Translation Files Created
Three translation files have been created in the `messages/` directory:

#### `messages/en.json` - English translations
Complete English translations for all settings page content including:
- Page title and description
- Tab titles (Tenant Info, Branding, Theme)
- Basic Information section (organization name, short name, email, phone, website, slogan, description)
- Address Information section (street address, city, state, country, postal code)
- Branding section (logo upload, logo shape options)
- Theme section (primary color, dark mode, border radius options)
- Button labels
- Success and error messages

#### `messages/es.json` - Spanish translations
Complete Spanish translations for all content, with:
- Spanish field labels and placeholders
- Proper Spanish terminology for UI elements
- Spanish error and success messages

#### `messages/fr.json` - French translations
Complete French translations including:
- French field labels and placeholders
- Proper French terminology
- French error and success messages

## Translation Structure

The translations are organized hierarchically:

```
settings:
  page:
    title: "Settings"
    description: "Manage your tenant branding and theme"
  tabs:
    info: "Tenant Info"
    branding: "Branding"
    theme: "Theme"
  basic:
    title: "Basic Information"
    description: "..."
    fields: { ... }
    placeholders: { ... }
  address: { ... }
  branding: { ... }
  theme: { ... }
  buttons: { ... }
  success: { ... }
  errors: { ... }
```

## Installation & Setup

### Step 1: Install next-intl Package
```bash
npm install next-intl
# or
pnpm add next-intl
```

### Step 2: Configure next-intl (Required)
You'll need to set up `next-intl` in your Next.js application. Follow these steps:

1. Create a configuration file for i18n request handling:
   - Create `i18n/request.ts` with the following content:

```typescript
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`@/messages/${locale}.json`)).default,
}))
```

2. Update `next.config.ts` to use next-intl plugin:

```typescript
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

export default withNextIntl({
  // ... rest of your config
})
```

3. Create a middleware for locale detection (optional but recommended):
   - Create `middleware.ts` in the root:

```typescript
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en',
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

4. Wrap your root layout with NextIntlClientProvider (if using client-side translations):
   - Update your root layout to provide translations to client components

### Step 3: Update Layout (if using client-side localization)
Ensure your layout provides the translations context to all client components.

## Supported Languages
- English (en) - Default
- Spanish (es)
- French (fr)

To add more languages:
1. Create a new `messages/{locale}.json` file with the required translation structure
2. Update the locale configuration in your Next.js setup and middleware

## Using Translations in Components

In any client component, use the `useTranslations` hook:

```typescript
'use client'
import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('settings')
  
  return <div>{t('page.title')}</div>
}
```

To access nested translations:
```typescript
t('basic.fields.organizationName')  // "Organization Name *"
t('basic.placeholders.organizationName')  // "Enter organization name"
```

## Error Messages
The component handles errors with translated messages:
- `errors.tenantNotFound` - When tenant information is unavailable
- `errors.failedToLoadSettings` - When settings fail to load
- `errors.failedToSave` - When saving fails (parameterized with section name)

## Success Messages
- `success.settingsSaved` - When settings are successfully saved (parameterized with section name)

## Notes
- The `useTranslations` hook is imported from `next-intl` and must be called at the component level
- The translation namespace is `'settings'` - this must match the root key in the translation files
- All toast notifications are now translatable
- The component is marked as `'use client'` since it uses browser APIs and the client-side `useTranslations` hook

## Parameterized Translation Keys
Some translations use parameters:
- `success.settingsSaved` uses `{section}` - will be replaced with the section name (basic, address, branding, theme)
- `errors.failedToSave` uses `{section}` - will be replaced with the section name

Example usage:
```typescript
toast.success(t('success.settingsSaved', { section: 'basic' }))
// Output: "basic settings saved successfully"
```

## Future Enhancements
1. Add currency formatting for multilingual support
2. Add date/time formatting based on locale
3. Consider RTL (Right-to-Left) language support for Arabic, Hebrew, etc.
4. Add more languages as needed
5. Implement automatic language detection based on browser preferences
6. Add translation management system for easier updates

## Testing
To test the translations:
1. Change the locale in your application
2. Navigate to the Settings page
3. Verify that all text is properly translated
4. Test form submissions and error messages

## Troubleshooting

### Error: "Cannot find module 'next-intl'"
- Run `npm install next-intl` (or `pnpm add next-intl`)
- Clear Next.js cache: `rm -rf .next`
- Restart the development server

### Translations not appearing
- Ensure `next.config.ts` includes the next-intl plugin
- Verify message files are in `messages/` directory with correct locale names
- Check that `useTranslations` is called with the correct namespace (`'settings'`)

### Browser shows wrong language
- Verify middleware.ts is properly configured
- Check locale detection logic
- Ensure locale parameter is being passed to the request

## References
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization Guide](https://nextjs.org/docs/advanced-features/i18n-routing)
