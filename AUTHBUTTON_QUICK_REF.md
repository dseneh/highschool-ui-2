# AuthButton Quick Reference

## Import

```tsx
import { AuthButton } from "@/components/auth/auth-button";
import { useHasRole, useIsAdmin, useIsSuperAdmin, useIsCurrentUser } from "@/hooks/use-authorization";
```

## Component Usage

### Single Role
```tsx
<AuthButton roles="admin" onClick={handleDelete}>
  Delete
</AuthButton>
```

### Multiple Roles (ANY)
```tsx
<AuthButton 
  roles={["admin", "teacher"]} 
  onClick={handleAction}
>
  Manage
</AuthButton>
```

### Multiple Roles (ALL)
```tsx
<AuthButton 
  roles={["admin", "superadmin"]} 
  requireAll
  onClick={handleAction}
>
  Super Secure
</AuthButton>
```

### Inverse (NOT roles)
```tsx
<AuthButton 
  notRoles="student" 
  onClick={handleAction}
>
  Staff Only
</AuthButton>
```

### Disable Instead of Hide
```tsx
<AuthButton 
  roles="superadmin" 
  disable
  onClick={handleAction}
>
  Admin Only
</AuthButton>
```

### With Icon
```tsx
<AuthButton 
  roles="admin"
  icon={<Trash2 className="size-4" />}
  variant="destructive"
  onClick={handleDelete}
>
  Delete
</AuthButton>
```

### Current User
```tsx
<AuthButton 
  targetUser={selectedUser}
  onClick={handleEditProfile}
>
  Edit Profile
</AuthButton>
```

### With Fallback
```tsx
<AuthButton 
  roles="admin"
  fallback={<span>Admin only</span>}
  onClick={handleAction}
>
  Admin Action
</AuthButton>
```

## Hook Usage

### Check Role
```tsx
const isAdmin = useHasRole("admin");
const canManage = useHasRole(["admin", "teacher"]);

if (isAdmin) {
  // Show admin UI
}
```

### Check Admin/SuperAdmin
```tsx
const isAdmin = useIsAdmin();
const isSuperAdmin = useIsSuperAdmin();
```

### Check Current User
```tsx
const isCurrentUser = useIsCurrentUser(targetUser);

if (isCurrentUser) {
  return <EditOwnProfile />;
}
```

### Get Current User
```tsx
const user = useCurrentUser();

if (user?.is_superuser) {
  // Show superuser features
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `roles` | string / string[] | - | Role(s) to check |
| `notRoles` | string / string[] | - | Role(s) to exclude |
| `targetUser` | any | - | User to check against current |
| `requireAll` | boolean | false | ALL roles required (vs ANY) |
| `hide` | boolean | true | Hide when no permission |
| `disable` | boolean | false | Disable when no permission |
| `fallback` | ReactNode | null | Content when hidden |
| `icon` | ReactNode | - | Icon to display |
| `variant` | string | - | Button variant (primary, destructive, etc.) |
| `size` | string | - | Button size (sm, md, lg, etc.) |
| `loading` | boolean | false | Show loading spinner |
| `disabled` | boolean | false | Always disabled (independent of permissions) |

## Behavior Modes

### Mode 1: Hide (Default)
```tsx
<AuthButton roles="admin" onClick={action}>
  Button
</AuthButton>
```
- ✅ Shows enabled button if authorized
- ❌ Hides entirely if not authorized

### Mode 2: Disable
```tsx
<AuthButton roles="admin" disable onClick={action}>
  Button
</AuthButton>
```
- ✅ Shows enabled button if authorized
- 🚫 Shows disabled button if not authorized

### Mode 3: Fallback
```tsx
<AuthButton 
  roles="admin"
  fallback={<Info>Requires admin</Info>}
  onClick={action}
>
  Button
</AuthButton>
```
- ✅ Shows enabled button if authorized
- 📝 Shows fallback content if not authorized

## Role Values

| Role | Description |
|------|-------------|
| `superadmin` | Full system access |
| `admin` | Administrative access |
| `teacher` | Teaching staff |
| `student` | Student account |
| `parent` | Parent/Guardian |
| `viewer` | Read-only access |

## Common Patterns

### Delete Button
```tsx
<AuthButton 
  roles="admin"
  disable
  icon={<Trash2 className="size-4" />}
  variant="destructive"
  onClick={handleDelete}
>
  Delete
</AuthButton>
```

### Edit Button
```tsx
<AuthButton 
  roles={["admin", "teacher"]}
  icon={<Edit className="size-4" />}
  onClick={handleEdit}
>
  Edit
</AuthButton>
```

### Self-Edit Button
```tsx
<AuthButton 
  targetUser={user}
  icon={<Edit className="size-4" />}
  variant="outline"
  onClick={handleEdit}
>
  Edit Your Profile
</AuthButton>
```

### Conditional Section
```tsx
<AuthButton 
  roles="superadmin"
  hide={true}
  fallback={null}
>
  <div className="admin-section">
    Admin Content
  </div>
</AuthButton>
```

## Type Safety

```tsx
// Each mode is a separate type
type AuthButtonProps = 
  | RolesButtonProps
  | NotRolesButtonProps  
  | CurrentUserButtonProps

// Cannot mix modes
<AuthButton roles="admin" notRoles="student" />  // ❌ Error
<AuthButton roles="admin" targetUser={user} />   // ❌ Error
<AuthButton notRoles="admin" targetUser={user} /> // ❌ Error

// Must provide required prop for mode
<AuthButton />                    // ❌ Error
<AuthButton roles="admin" />      // ✅ OK
<AuthButton notRoles="student" /> // ✅ OK
<AuthButton targetUser={user} />  // ✅ OK
```

## Migration Checklist

- [ ] Identify component with permission checks
- [ ] Replace conditional render with AuthButton
- [ ] Choose behavior mode (hide/disable/fallback)
- [ ] Add icon if applicable
- [ ] Test with different roles
- [ ] Test edge cases (current user, disabled users)
- [ ] Verify styling matches design

## Files

- `hooks/use-authorization.ts` - Hooks
- `components/auth/auth-button.tsx` - Component
- `components/auth/auth-button-examples.tsx` - Examples
- `AUTH_BUTTON_GUIDE.md` - Full docs
- `AUTHBUTTON_IMPLEMENTATION.md` - Implementation details
