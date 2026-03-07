# Example: Refactoring User Actions with AuthButton

This guide shows a real-world example of refactoring the user-columns action buttons to use the new AuthButton component.

## Current Implementation (Before)

In `components/users/user-columns.tsx`, the action buttons are disabled based on role checks inline:

```tsx
const actionItems: ActionItem[] = [
  {
    key: "change-role",
    label: "Change Role",
    icon: UserCog,
    visible: !!onChangeRole,
    disabled: isCurrentUser || isTargetSuperadmin,  // ← Manual check
    onClick: () => onChangeRole?.(user),
  },
  {
    key: "toggle-admin",
    label: user.is_staff ? "Remove Admin" : "Make Admin",
    icon: user.is_staff ? ShieldOff : Shield,
    visible: !!onToggleAdmin,
    disabled: isCurrentUser,  // ← Manual check
    onClick: () => onToggleAdmin?.(user),
  },
  {
    key: "block",
    label: "Block User",
    icon: Ban,
    visible: !!onBlock && !!user.is_active,
    disabled: isCurrentUser,  // ← Manual check
    className: "text-orange-600 dark:text-orange-400",
    onClick: () => onBlock?.(user),
  },
  {
    key: "delete",
    label: "Delete User",
    icon: Trash2,
    visible: !!onDelete,
    disabled: isCurrentUser,  // ← Manual check
    destructive: true,
    onClick: () => onDelete?.(user),
  },
];
```

## Refactored Version (After)

Using the new AuthButton component:

```tsx
const actionItems: ActionItem[] = [
  {
    key: "change-role",
    label: "Change Role",
    renderButton: () => (
      <AuthButton
        targetUser={user}
        disable
        onClick={() => onChangeRole?.(user)}
      >
        Change Role
      </AuthButton>
    ),
  },
  {
    key: "toggle-admin",
    label: user.is_staff ? "Remove Admin" : "Make Admin",
    renderButton: () => (
      <AuthButton
        targetUser={user}
        disable
        onClick={() => onToggleAdmin?.(user)}
      >
        {user.is_staff ? "Remove Admin" : "Make Admin"}
      </AuthButton>
    ),
  },
  {
    key: "block",
    label: "Block User",
    renderButton: () => (
      <AuthButton
        targetUser={user}
        disable
        className="text-orange-600 dark:text-orange-400"
        onClick={() => onBlock?.(user)}
      >
        Block User
      </AuthButton>
    ),
  },
  {
    key: "delete",
    label: "Delete User",
    renderButton: () => (
      <AuthButton
        targetUser={user}
        disable
        variant="destructive"
        onClick={() => onDelete?.(user)}
      >
        Delete User
      </AuthButton>
    ),
  },
];
```

## Alternative: Granular Role Checks

If different actions require different roles:

```tsx
const actionItems: ActionItem[] = [
  {
    key: "change-role",
    label: "Change Role",
    renderButton: () => (
      <AuthButton
        roles={["superadmin", "admin"]}  // Only superadmin/admin can change roles
        disable
        onClick={() => onChangeRole?.(user)}
      >
        Change Role
      </AuthButton>
    ),
  },
  {
    key: "toggle-admin",
    label: user.is_staff ? "Remove Admin" : "Make Admin",
    renderButton: () => (
      <AuthButton
        roles="superadmin"  // Only superadmin can toggle admin
        disable
        onClick={() => onToggleAdmin?.(user)}
      >
        {user.is_staff ? "Remove Admin" : "Make Admin"}
      </AuthButton>
    ),
  },
  {
    key: "block",
    label: "Block User",
    renderButton: () => (
      <AuthButton
        roles={["admin", "superadmin"]}  // Admin or superadmin
        disable
        className="text-orange-600 dark:text-orange-400"
        onClick={() => onBlock?.(user)}
      >
        Block User
      </AuthButton>
    ),
  },
  {
    key: "delete",
    label: "Delete User",
    renderButton: () => (
      <AuthButton
        roles="superadmin"  // Only superadmin can delete
        disable
        variant="destructive"
        onClick={() => onDelete?.(user)}
      >
        Delete User
      </AuthButton>
    ),
  },
];
```

## With Icons

```tsx
import { Trash2, Edit, UserCog, Shield, ShieldOff, Ban } from "lucide-react";

const actionItems: ActionItem[] = [
  {
    key: "change-role",
    label: "Change Role",
    renderButton: () => (
      <AuthButton
        roles={["superadmin", "admin"]}
        disable
        icon={<UserCog className="size-4" />}
        onClick={() => onChangeRole?.(user)}
      >
        Change Role
      </AuthButton>
    ),
  },
  {
    key: "toggle-admin",
    label: user.is_staff ? "Remove Admin" : "Make Admin",
    renderButton: () => (
      <AuthButton
        roles="superadmin"
        disable
        icon={user.is_staff ? 
          <ShieldOff className="size-4" /> : 
          <Shield className="size-4" />
        }
        onClick={() => onToggleAdmin?.(user)}
      >
        {user.is_staff ? "Remove Admin" : "Make Admin"}
      </AuthButton>
    ),
  },
  {
    key: "block",
    label: "Block User",
    renderButton: () => (
      <AuthButton
        roles={["admin", "superadmin"]}
        disable
        icon={<Ban className="size-4" />}
        className="text-orange-600 dark:text-orange-400"
        onClick={() => onBlock?.(user)}
      >
        Block User
      </AuthButton>
    ),
  },
  {
    key: "delete",
    label: "Delete User",
    renderButton: () => (
      <AuthButton
        roles="superadmin"
        disable
        icon={<Trash2 className="size-4" />}
        variant="destructive"
        onClick={() => onDelete?.(user)}
      >
        Delete User
      </AuthButton>
    ),
  },
];
```

## Benefits of Refactoring

✅ **Cleaner Code:** Permission logic is moved into the component, not the data structure

✅ **Reusable:** AuthButton can be used anywhere, not just in dropdowns

✅ **Type Safe:** Props are type-checked at compile time

✅ **Consistent:** Uses the same authorization system across the app

✅ **Flexible:** Can switch between hide/disable modes easily

✅ **Maintainable:** Easy to add new permission checks or modify existing ones

## Migration Steps

1. **Identify the component** - Find components with permission-based buttons
2. **Add AuthButton import** - `import { AuthButton } from "@/components/auth/auth-button"`
3. **Replace disable logic** - Move from manual checks to AuthButton
4. **Choose behavior** - Use `disable` for important actions, `hide` for supplementary
5. **Add icons** - Use lucide-react icons for better UX
6. **Test thoroughly** - Test with different roles to ensure correct behavior

## Testing Checklist

- [ ] Superadmin can see all actions enabled
- [ ] Admin can see appropriate actions enabled
- [ ] Teacher sees degraded permissions
- [ ] Student sees minimal actions
- [ ] Current user cannot perform self-modifying actions (block, delete self)
- [ ] Non-current user can perform admin actions
- [ ] Styling matches design system
- [ ] Icons display correctly
- [ ] Tooltip/help text works (if applicable)

## Next: Apply to Other Components

Once you've refactored user-columns, apply the same pattern to:
- `change-role-dialog.tsx` - Disable submit button based on role
- `user-detail-header.tsx` - Action buttons in user detail page
- Staff/Student management pages
- Settings and configuration pages

See [AUTHBUTTON_REFACTORING_CHECKLIST.md](./AUTHBUTTON_REFACTORING_CHECKLIST.md) for the full list of components to refactor.
