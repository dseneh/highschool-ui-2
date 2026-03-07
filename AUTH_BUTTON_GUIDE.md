# AuthButton Component Guide

## Overview

The `AuthButton` component is a permission-aware button that automatically shows, hides, or disables itself based on the current user's role. It mirrors the v1 implementation from ui-2 but uses the portable-auth system and auth-store.

## Imports

```tsx
import { AuthButton } from "@/components/auth/auth-button";
import { useHasRole, useIsAdmin, useIsSuperAdmin, useIsCurrentUser } from "@/hooks/use-authorization";
```

## Basic Usage

### 1. Role-Based Access (Single Role)

```tsx
<AuthButton roles="admin" onClick={handleDelete}>
  Delete User
</AuthButton>
```

### 2. Multiple Roles (ANY - Default)

Show button if user has ANY of the provided roles:

```tsx
<AuthButton 
  roles={["admin", "teacher"]} 
  onClick={handleManage}
>
  Manage Users
</AuthButton>
```

### 3. Disable Instead of Hide

By default, buttons are hidden when user lacks permissions. Use `disable` to show a disabled button instead:

```tsx
<AuthButton 
  roles="superadmin" 
  disable
  onClick={handleSecureAction}
>
  Secure Action
</AuthButton>
```

### 4. Inverse Role Check

Show button if user does NOT have a specific role:

```tsx
<AuthButton 
  notRoles="student" 
  onClick={handleAction}
>
  Staff Only Action
</AuthButton>
```

### 5. Current User Check

Show button only when viewing the logged-in user's profile:

```tsx
<AuthButton 
  targetUser={selectedUser} 
  onClick={handleEditProfile}
>
  Edit Your Profile
</AuthButton>
```

### 6. Custom Fallback Content

Show custom content when user lacks permission:

```tsx
<AuthButton 
  roles="admin"
  fallback={
    <div className="text-gray-500">
      This action requires admin privileges
    </div>
  }
  onClick={handleAction}
>
  Admin Action
</AuthButton>
```

## Props

### Base Props (Common to all variants)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hide` | boolean | `true` | Hide button when no permission (vs. disable) |
| `disable` | boolean | `false` | Disable button when no permission (instead of hide) |
| `fallback` | ReactNode | `null` | Content to show when hidden |
| `children` | ReactNode | - | Button label |
| `disabled` | boolean | `false` | Disable for other reasons (independent of permissions) |
| `className` | string | `""` | Additional CSS classes |
| All Button props | - | - | icon, variant, size, loading, etc. |

### Role-Based Props

```tsx
interface RolesButtonProps {
  roles: string | string[];      // Single role or array
  requireAll?: boolean;           // ALL roles required (default: ANY)
  disable?: boolean;
  hide?: boolean;
  fallback?: ReactNode;
}
```

### Inverse Role Props

```tsx
interface NotRolesButtonProps {
  notRoles: string | string[];   // Hide if user has these roles
  requireAll?: boolean;
  disable?: boolean;
  hide?: boolean;
  fallback?: ReactNode;
}
```

### Current User Props

```tsx
interface CurrentUserButtonProps {
  targetUser: any;               // The user being viewed
  disable?: boolean;
  hide?: boolean;
  fallback?: ReactNode;
}
```

## Authorization Hooks

Use these hooks directly when you need permission checks outside buttons:

### `useHasRole()`

```tsx
const isAdmin = useHasRole("admin");
const canManage = useHasRole(["admin", "teacher"]);
const isSuperAdmin = useHasRole(["superadmin", "admin"], true); // requireAll

if (isAdmin) {
  // Show admin UI
}
```

### `useIsAdmin()`

```tsx
const isAdmin = useIsAdmin(); // superadmin or admin role

if (isAdmin) {
  // Show admin features
}
```

### `useIsSuperAdmin()`

```tsx
const isSuperAdmin = useIsSuperAdmin(); // superadmin role only

if (isSuperAdmin) {
  // Show superadmin features
}
```

### `useIsCurrentUser()`

```tsx
const isCurrentUser = useIsCurrentUser(targetUser);

if (isCurrentUser) {
  // Show "Edit Your Profile" button
}
```

### `useCurrentUser()`

```tsx
const user = useCurrentUser(); // Returns UserDto or null

if (user?.is_superuser) {
  // Show superuser features
}
```

### `useIsAuthenticated()`

```tsx
const isAuth = useIsAuthenticated();

if (!isAuth) {
  // Redirect to login
}
```

## Examples

### Permission-Protected Delete Button

```tsx
<AuthButton
  roles="admin"
  disable
  icon={Trash2}
  variant="destructive"
  onClick={() => deleteUser(user.id)}
>
  Delete User
</AuthButton>
```

When user is not admin, the button appears disabled with reduced opacity.

### Staff-Only Edit Section

```tsx
<AuthButton
  roles={["admin", "teacher"]}
  icon={Edit}
  onClick={handleEdit}
>
  Edit User Details
</AuthButton>
```

Hidden completely if user is not admin or teacher.

### Self-Edit Button

```tsx
<AuthButton
  targetUser={selectedUser}
  variant="outline"
  icon={Edit}
  onClick={handleEditProfile}
>
  Edit Your Profile
</AuthButton>
```

Only shows when viewing your own user profile.

### Non-Admin Message

```tsx
<AuthButton
  roles="admin"
  fallback={
    <Alert>
      <AlertDescription>
        Only admins can perform this action
      </AlertDescription>
    </Alert>
  }
  onClick={handleSecureAction}
>
  Secure System Action
</AuthButton>
```

## Replacing Existing Permission Checks

### Before (Manual checking)

```tsx
const canDelete = currentUser?.role === "admin";

return (
  <>
    {canDelete && (
      <Button onClick={handleDelete} variant="destructive">
        Delete
      </Button>
    )}
  </>
);
```

### After (Using AuthButton)

```tsx
return (
  <AuthButton 
    roles="admin" 
    icon={Trash2}
    variant="destructive"
    onClick={handleDelete}
  >
    Delete
  </AuthButton>
);
```

## Behavior Matrix

### Hide Mode (default: `hide=true, disable=false`)

| User Has Permission | Result |
|-------------------|--------|
| Yes | ✅ Show enabled button |
| No | ❌ Hidden completely |

### Disable Mode (`hide=false, disable=true`)

| User Has Permission | Result |
|-------------------|--------|
| Yes | ✅ Show enabled button |
| No | 🚫 Show disabled button (opacity-50) |

### With Fallback (`hide=true, fallback=<Content>`)

| User Has Permission | Result |
|-------------------|--------|
| Yes | ✅ Show enabled button |
| No | 📝 Show fallback content |

## Role Values

Available roles in the system:
- `"superadmin"` - Full system access
- `"admin"` - Administrative access
- `"teacher"` - Teaching staff
- `"student"` - Student account
- `"parent"` - Parent/Guardian
- `"viewer"` - Read-only access

## TypeScript Support

Full type safety with discriminated unions:

```tsx
// ✅ Valid - roles prop required for RolesButtonProps
<AuthButton roles="admin" onClick={handleAction}>

// ✅ Valid - notRoles prop required for NotRolesButtonProps
<AuthButton notRoles="admin" onClick={handleAction}>

// ✅ Valid - targetUser prop required for CurrentUserButtonProps
<AuthButton targetUser={user} onClick={handleAction}>

// ❌ Invalid - cannot mix roles and notRoles
<AuthButton roles="admin" notRoles="student" />
```

## Next Steps

1. **Identify permission-checked buttons** in your components
2. **Replace manual checks** with `<AuthButton>`
3. **Test each variant** (hide, disable, fallback modes)
4. **Use hooks** for conditional UI logic outside buttons

See [auth-button-examples.tsx](./auth-button-examples.tsx) for interactive examples.
