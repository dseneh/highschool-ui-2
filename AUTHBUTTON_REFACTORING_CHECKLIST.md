# AuthButton Refactoring Checklist

## Overview

This document tracks the refactoring progress for replacing manual permission checks with the new `AuthButton` component throughout the ezyschool-ui codebase.

## Components to Refactor

### 1. User Management (`/components/users/*.tsx`)

- [ ] **user-columns.tsx**
  - [ ] Edit action button
  - [ ] Delete action button
  - [ ] Change role action
  - [ ] Toggle admin action
  - [ ] Block/Reinstate action
  - [ ] Reset password action

- [ ] **user-table.tsx**
  - [ ] Check for any inline permission checks

- [ ] **change-role-dialog.tsx**
  - [ ] Change role submit button
  - [ ] Disable logic based on permissions

- [ ] **user-detail-header.tsx**
  - [ ] Action buttons in header

### 2. Staff/Students Management

- [ ] **staff-management pages**
  - [ ] Edit/Delete buttons
  - [ ] Permission-based actions

- [ ] **student-management pages**
  - [ ] Edit/Delete buttons
  - [ ] Permission-based actions

### 3. Dashboard & Navigation

- [ ] **sidebar.tsx**
  - [ ] Menu items based on role

- [ ] **Navigation components**
  - [ ] Admin-only menu items
  - [ ] Role-based navigation

### 4. Settings & Administration

- [ ] **Settings pages**
  - [ ] Admin-only settings
  - [ ] Permission-based form fields

- [ ] **Grade Management**
  - [ ] Permission-based grading actions
  - [ ] Grade approval buttons

### 5. Other Modules

- [ ] **Finance/Accounting**
  - [ ] Permission-based financial actions

- [ ] **Reports**
  - [ ] Permission-based report generation

## Refactoring Pattern

For each component with permission checks:

### Before (Conditional Render)
```tsx
{currentUser?.role === 'admin' && (
  <Button onClick={handleDelete}>Delete</Button>
)}
```

### After (Using AuthButton)
```tsx
<AuthButton 
  roles="admin" 
  icon={<Trash2 className="size-4" />}
  onClick={handleDelete}
>
  Delete
</AuthButton>
```

### Alternative: Hide vs Disable
```tsx
{/* Hide when no permission (default) */}
<AuthButton roles="admin" onClick={handleAction}>
  Admin Action
</AuthButton>

{/* Disable when no permission */}
<AuthButton roles="admin" disable onClick={handleAction}>
  Admin Action
</AuthButton>
```

## Testing Checklist for Each Button

- [ ] Button appears for authorized users
- [ ] Button is hidden (or disabled) for unauthorized users
- [ ] Button action works correctly when clicked
- [ ] Styling is consistent with existing design
- [ ] Icon displays correctly
- [ ] Tooltip/help text works (if applicable)

## Files Created

### Core Components
- ✅ `/hooks/use-authorization.ts` - Authorization hooks
- ✅ `/components/auth/auth-button.tsx` - AuthButton component
- ✅ `/components/auth/auth-button-examples.tsx` - Usage examples

### Documentation
- ✅ `/AUTH_BUTTON_GUIDE.md` - Complete usage guide
- ✅ `/AUTHBUTTON_REFACTORING_CHECKLIST.md` - This file

## Progress Summary

### Completed
- ✅ Hook system created (useHasRole, useIsAdmin, useIsSuperAdmin, useIsCurrentUser, etc.)
- ✅ AuthButton component created
- ✅ TypeScript type safety with discriminated unions
- ✅ Multiple behavior modes (hide, disable, fallback)
- ✅ Documentation and examples

### Next Steps (In Order)
1. Replace action buttons in user-columns.tsx
2. Update change-role-dialog.tsx permission logic
3. Refactor sidebar.tsx navigation
4. Update student/staff management pages
5. Refactor settings/admin pages
6. Test all changes
7. Deploy and monitor

## Notes

- Always pass `icon` as JSX: `icon={<Edit className="size-4" />}`
- Use `disable` mode for critical actions to ensure visibility
- Use `hide` mode (default) for less critical supplementary actions
- Test in different role contexts (superadmin, admin, teacher, student)
- Check for edge cases (current user, disabled users, etc.)

## Related Documentation

- [AUTH_BUTTON_GUIDE.md](./AUTH_BUTTON_GUIDE.md) - Usage guide with examples
- [use-authorization.ts](./hooks/use-authorization.ts) - Hook implementation
- [auth-button.tsx](./components/auth/auth-button.tsx) - Component implementation
