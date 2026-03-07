"use client";

import { useAuthStore } from "@/store/auth-store";

export type AuthorizationTargetUser = {
  id?: string | number;
  is_current_user?: boolean;
} | null | undefined;

const isSuperadminRole = (role: string) => role === "superadmin";
const isAdminRole = (role: string) => role === "admin";

const hasElevatedRoleAccess = (userRole: string, requiredRole: string): boolean => {
  const normalizedUserRole = userRole.toLowerCase();
  const normalizedRequiredRole = requiredRole.toLowerCase();

  if (isSuperadminRole(normalizedRequiredRole)) {
    return isSuperadminRole(normalizedUserRole);
  }

  if (isAdminRole(normalizedRequiredRole)) {
    return isAdminRole(normalizedUserRole) || isSuperadminRole(normalizedUserRole);
  }

  return (
    normalizedUserRole === normalizedRequiredRole ||
    isAdminRole(normalizedUserRole) ||
    isSuperadminRole(normalizedUserRole)
  );
};

export function hasRoleAccess(userRole: string | null | undefined, requiredRole: string): boolean {
  if (!userRole || !requiredRole) {
    return false;
  }

  return hasElevatedRoleAccess(userRole, requiredRole);
}

export function hasRequiredRoles(
  userRole: string | null | undefined,
  roles: string | string[],
  requireAll = false
): boolean {
  if (!userRole) {
    return false;
  }

  const rolesToCheck = Array.isArray(roles) ? roles : [roles];
  if (rolesToCheck.length === 0) {
    return false;
  }

  if (requireAll) {
    return rolesToCheck.every((role) => hasRoleAccess(userRole, role));
  }

  return rolesToCheck.some((role) => hasRoleAccess(userRole, role));
}

/**
 * Hook to check if the current user has a specific role
 * 
 * @param roles - Single role (string) or array of roles to check
 * @param requireAll - If multiple roles, require ALL (true) or ANY (false, default)
 * @returns boolean indicating if user has the required role(s)
 * 
 * @example
 * // Single role
 * const isAdmin = useHasRole('admin');
 * 
 * @example
 * // Multiple roles (ANY)
 * const canManage = useHasRole(['admin', 'teacher']);
 * 
 * @example
 * // Multiple roles (ALL)
 * const isSuperAdmin = useHasRole(['superadmin', 'admin'], true);
 */
export function useHasRole(roles: string | string[], requireAll = false): boolean {
  const user = useAuthStore((state) => state.user);

  return hasRequiredRoles(user?.role?.toLowerCase(), roles, requireAll);
}

/**
 * Hook to check if the current user is an admin (superadmin or admin)
 * 
 * @returns boolean indicating if user is admin
 */
export function useIsAdmin(): boolean {
  const user = useAuthStore((state) => state.user);

  if (!user || !user.role) {
    return false;
  }

  const userRole = user.role.toLowerCase();
  return userRole === "admin" || userRole === "superadmin";
}

/**
 * Hook to check if the current user is a superadmin
 * 
 * @returns boolean indicating if user is superadmin
 */
export function useIsSuperAdmin(): boolean {
  const user = useAuthStore((state) => state.user);

  if (!user || !user.role) {
    return false;
  }

  return user.role.toLowerCase() === "superadmin";
}

/**
 * Hook to check if the current user is staff (has is_staff flag)
 * 
 * @returns boolean indicating if user is staff
 */
export function useIsStaff(): boolean {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return false;
  }

  return user.is_staff === true;
}

/**
 * Hook to check if the current user is superuser (has is_superuser flag)
 * 
 * @returns boolean indicating if user is superuser
 */
export function useIsSuperUser(): boolean {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return false;
  }

  return user.is_superuser === true;
}

/**
 * Hook to check if the current user is the target user (is_current_user flag)
 * 
 * @returns boolean indicating if current user is the logged-in user
 */
export function useIsCurrentUser(targetUser: AuthorizationTargetUser): boolean {
  const user = useAuthStore((state) => state.user);

  if (!user || !targetUser) {
    return false;
  }

  return user.id === targetUser.id || targetUser.is_current_user === true;
}

/**
 * Hook to get the current authenticated user
 * 
 * @returns UserDto or null if not authenticated
 */
export function useCurrentUser() {
  const user = useAuthStore((state) => state.user);
  return user;
}

/**
 * Hook to check if user is authenticated
 * 
 * @returns boolean indicating if user is logged in
 */
export function useIsAuthenticated(): boolean {
  const user = useAuthStore((state) => state.user);
  return !!user;
}
