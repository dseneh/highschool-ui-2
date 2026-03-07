# AuthButton Implementation Summary

## Overview

A new authorization system has been implemented for ezyschool-ui, mirroring the v1 pattern from ui-2. This provides a clean, type-safe way to handle permission-based button visibility and behavior across the application.

## What Was Created

### 1. Authorization Hooks (`hooks/use-authorization.ts`)

Provides React hooks for permission checking:

- `useHasRole(roles, requireAll?)` - Check if user has role(s)
- `useIsAdmin()` - Check if user is admin/superadmin
- `useIsSuperAdmin()` - Check if user is superadmin
- `useIsStaff()` - Check if user has staff flag
- `useIsSuperUser()` - Check if user has superuser flag
- `useIsCurrentUser(targetUser)` - Check if viewing own profile
- `useCurrentUser()` - Get current logged-in user
- `useIsAuthenticated()` - Check if user is logged in

**Location:** `/hooks/use-authorization.ts`

### 2. AuthButton Component (`components/auth/auth-button.tsx`)

A permission-aware button component with three modes:

**Role-Based:**
```tsx
<AuthButton roles="admin" onClick={handleDelete}>
  Delete User
</AuthButton>
```

**Inverse (NOT roles):**
```tsx
<AuthButton notRoles="student" onClick={handleAction}>
  Staff Only
</AuthButton>
```

**Current User:**
```tsx
<AuthButton targetUser={selectedUser} onClick={handleEdit}>
  Edit Your Profile
</AuthButton>
```

**Features:**
- Hide button when no permission (default)
- Disable button when no permission (alternative)
- Custom fallback content
- Full Button prop support (icon, variant, size, etc.)
- Type-safe discriminated unions

**Location:** `/components/auth/auth-button.tsx`

### 3. Examples & Documentation

- **auth-button-examples.tsx** - Interactive examples of all usage patterns
- **AUTH_BUTTON_GUIDE.md** - Complete usage documentation with examples
- **AUTHBUTTON_REFACTORING_CHECKLIST.md** - Tracking document for refactoring

## Quick Start

### Basic Usage

```tsx
import { AuthButton } from "@/components/auth/auth-button";

// Admin-only button (hidden if not admin)
<AuthButton roles="admin" onClick={handleDelete}>
  Delete User
</AuthButton>

// Multiple roles (ANY)
<AuthButton roles={["admin", "teacher"]} onClick={handleManage}>
  Manage Users
</AuthButton>

// Disable instead of hide
<AuthButton 
  roles="superadmin" 
  disable 
  onClick={handleSecure}
>
  Secure Action
</AuthButton>

// Current user check
<AuthButton targetUser={user} onClick={handleEdit}>
  Edit Your Profile
</AuthButton>
```

### Using Hooks Directly

```tsx
import { useHasRole, useIsCurrentUser } from "@/hooks/use-authorization";

function MyComponent({ user }) {
  const isAdmin = useHasRole("admin");
  const isCurrentUser = useIsCurrentUser(user);
  
  if (isAdmin) {
    // Show admin UI
  }
  
  return isCurrentUser ? <EditProfile /> : <ViewProfile />;
}
```

## Migration Path

### Step 1: Identify Permission Checks
Find all buttons with manual permission checks in render logic.

### Step 2: Replace with AuthButton
Convert manual checks to AuthButton with appropriate role(s).

### Step 3: Choose Behavior
- **Hide (default):** For supplementary/admin features
- **Disable:** For critical actions that should be visible but disabled

### Step 4: Test
Test with different roles to ensure correct behavior.

## Before & After Examples

### User Deletion Button

**Before:**
```tsx
return (
  <>
    {currentUser?.role === 'admin' && (
      <Button 
        onClick={handleDelete}
        variant="destructive"
      >
        Delete User
      </Button>
    )}
  </>
);
```

**After:**
```tsx
return (
  <AuthButton 
    roles="admin"
    icon={<Trash2 className="size-4" />}
    variant="destructive"
    onClick={handleDelete}
  >
    Delete User
  </AuthButton>
);
```

### Change Role Dialog

**Before:**
```tsx
const isCurrentUser = currentUserIdNumber === user.id_number;

return (
  <Button disabled={isCurrentUser || isSuperadmin}>
    Change Role
  </Button>
);
```

**After (simple case):**
```tsx
return (
  <AuthButton 
    targetUser={user}
    disable
    onClick={handleChangeRole}
  >
    Change Role
  </AuthButton>
);
```

### Admin-Only Section

**Before:**
```tsx
{currentUser?.is_superuser && (
  <section>
    <AdminContent />
  </section>
)}
```

**After:**
```tsx
<AuthButton 
  roles="superadmin"
  hide={true}
  fallback={null}
>
  <section>
    <AdminContent />
  </section>
</AuthButton>
```

## Role System

Available roles in the application:
- `"superadmin"` - Full system access
- `"admin"` - Administrative access
- `"teacher"` - Teaching staff
- `"student"` - Student account
- `"parent"` - Parent/Guardian
- `"viewer"` - Read-only access

User permissions from backend:
- `is_superuser` - Flag for superuser status
- `is_staff` - Flag for staff status
- `is_current_user` - Identifies logged-in user (set by portable-auth during normalization)

## Behavior Modes Comparison

| Mode | Hide | Disabled | Fallback | Use Case |
|------|------|----------|----------|----------|
| **Hide** | ✅ No | N/A | Show fallback | Supplementary admin features |
| **Disable** | ❌ Yes | ✅ Yes | N/A | Critical actions that must be visible |
| **Hide + Fallback** | ✅ Yes | N/A | Show message | User feedback on restrictions |

## Type Safety

Full TypeScript support with discriminated unions:

```tsx
// ✅ Valid - roles prop required
<AuthButton roles="admin" />

// ✅ Valid - notRoles prop required  
<AuthButton notRoles="admin" />

// ✅ Valid - targetUser prop required
<AuthButton targetUser={user} />

// ❌ Invalid - cannot mix modes
<AuthButton roles="admin" notRoles="student" />

// ❌ Invalid - missing required prop
<AuthButton />
```

## Integration with Existing Code

The AuthButton system:
- ✅ Uses existing `useAuthStore` for user data
- ✅ Compatible with portable-auth
- ✅ Works with current user normalization
- ✅ Uses existing Button component styling
- ✅ Supports all Button props (icon, variant, size, loading, etc.)

## Best Practices

1. **Choose the right mode:**
   - Use `hide` for non-critical admin features
   - Use `disable` for important user-facing actions

2. **Provide feedback:**
   - Use `fallback` with user-friendly messages
   - Explain why an action is unavailable

3. **Keep roles simple:**
   - Use single role for most checks
   - Use array for related roles (e.g., ["admin", "teacher"])

4. **Test thoroughly:**
   - Test with different roles
   - Test edge cases (current user, disabled users)

5. **Maintain consistency:**
   - Use consistent patterns across similar buttons
   - Group related actions in same component

## Next Steps

1. Review [AUTH_BUTTON_GUIDE.md](./AUTH_BUTTON_GUIDE.md) for complete documentation
2. Check [auth-button-examples.tsx](./components/auth/auth-button-examples.tsx) for usage patterns
3. Start refactoring using [AUTHBUTTON_REFACTORING_CHECKLIST.md](./AUTHBUTTON_REFACTORING_CHECKLIST.md)
4. Begin with user management components
5. Test each refactored component thoroughly

## Files Reference

### Implementation
- `hooks/use-authorization.ts` - Authorization hooks
- `components/auth/auth-button.tsx` - AuthButton component

### Documentation
- `AUTH_BUTTON_GUIDE.md` - Complete usage guide
- `AUTHBUTTON_REFACTORING_CHECKLIST.md` - Refactoring tracking
- `components/auth/auth-button-examples.tsx` - Code examples

## Questions & Support

For questions about:
- **Usage:** See AUTH_BUTTON_GUIDE.md
- **Examples:** See auth-button-examples.tsx
- **Implementation:** See hook/component source code
- **Refactoring:** See AUTHBUTTON_REFACTORING_CHECKLIST.md
