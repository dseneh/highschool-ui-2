"use client";

import React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { 
  useHasRole, 
  useIsCurrentUser,
  type AuthorizationTargetUser,
} from "@/hooks/use-authorization";

interface BaseAuthButtonProps extends Omit<ButtonProps, "children"> {
  hide?: boolean; // Hide when no access (default: true)
  disable?: boolean; // Disable when no access (default: false)
  fallback?: React.ReactNode; // What to show when hidden
  children?: React.ReactNode;
  notCurrentUserTarget?: AuthorizationTargetUser; // Require target to NOT be current user
}

/**
 * Role-based button checks
 * Pass single role as string or array of roles
 * 
 * @example Single role
 * <AuthButton roles="admin" ...>
 * 
 * @example Multiple roles (ANY)
 * <AuthButton roles={["admin", "teacher"]} ...>
 */
interface RolesButtonProps extends BaseAuthButtonProps {
  roles: string | string[];
  notRoles?: never;
  targetUser?: never;
  requireAll?: boolean;
}

/**
 * Inverse role-based button checks
 * Show/disable if user does NOT have these roles
 */
interface NotRolesButtonProps extends BaseAuthButtonProps {
  roles?: never;
  notRoles: string | string[];
  targetUser?: never;
  requireAll?: boolean;
}

/**
 * Current user check
 * Show/disable only if viewing the logged-in user
 */
interface CurrentUserButtonProps extends BaseAuthButtonProps {
  roles?: never;
  notRoles?: never;
  targetUser: AuthorizationTargetUser;
  requireAll?: never;
}

type AuthButtonProps = 
  | RolesButtonProps 
  | NotRolesButtonProps 
  | CurrentUserButtonProps;

type AuthButtonInternalProps = Omit<BaseAuthButtonProps, "children"> & {
  children?: React.ReactNode;
  roles?: string | string[];
  notRoles?: string | string[];
  targetUser?: AuthorizationTargetUser;
  requireAll?: boolean;
};

/**
 * Unified Auth Button Component for ezyschool-ui
 * 
 * Mirrors the v1 AuthButton from ui-2 but uses portable-auth and auth-store
 * 
 * @example Role-based (single role)
 * <AuthButton roles="admin" onClick={handleDelete}>
 *   Delete User
 * </AuthButton>
 * 
 * @example Role-based (multiple roles - ANY)
 * <AuthButton roles={["admin", "teacher"]} onClick={handleManage}>
 *   Management
 * </AuthButton>
 * 
 * @example Disable instead of hide
 * <AuthButton 
 *   roles="admin" 
 *   disable 
 *   onClick={handleAction}
 * >
 *   Admin Action
 * </AuthButton>
 * 
 * @example Inverse (show if NOT admin)
 * <AuthButton 
 *   notRoles="admin" 
 *   onClick={handleAction}
 * >
 *   Non-Admin Action
 * </AuthButton>
 * 
 * @example Current user check
 * <AuthButton 
 *   targetUser={selectedUser} 
 *   onClick={handleAction}
 * >
 *   Edit Own Profile
 * </AuthButton>
 */
export const AuthButton = React.forwardRef<
  HTMLButtonElement,
  AuthButtonProps
>(
  (props, ref) => {
    const {
      hide = true,
      disable = false,
      fallback = null,
      children,
      disabled = false,
      className = "",
      roles,
      notRoles,
      targetUser,
      notCurrentUserTarget,
      requireAll,
      ...buttonProps
    } = props as AuthButtonInternalProps;

    // Determine which type of check we need
    const hasRoles = roles !== undefined;
    const hasNotRoles = notRoles !== undefined;
    const hasTargetUser = targetUser !== undefined;
    const hasNotCurrentUserTarget = notCurrentUserTarget !== undefined;

    // Role checks
    const rolesResult = useHasRole(
      hasRoles ? roles : [],
      requireAll
    );
    
    const notRolesResult = useHasRole(
      hasNotRoles ? notRoles : [],
      requireAll
    );

    // Current user check
    const isCurrentUserResult = useIsCurrentUser(hasTargetUser ? targetUser : undefined);
    const isNotCurrentUserResult = useIsCurrentUser(
      hasNotCurrentUserTarget ? notCurrentUserTarget : undefined
    );

    // Determine access based on which prop was provided
    let hasAccess = false;

    if (hasRoles) {
      // Role check (supports single or multiple roles via array)
      hasAccess = rolesResult;
    } else if (hasNotRoles) {
      // Inverse role check
      hasAccess = !notRolesResult;
    } else if (hasTargetUser) {
      // Current user check
      hasAccess = isCurrentUserResult;
    } else {
      hasAccess = true;
    }

    if (hasNotCurrentUserTarget) {
      // Additional inverse current-user filter (can be combined with roles/notRoles)
      hasAccess = hasAccess && !isNotCurrentUserResult;
    }

    // Check access and render accordingly
    if (!hasAccess) {
      if (hide && !disable) {
        return <>{fallback || null}</>;
      }

      if (disable) {
        return (
          <Button
            ref={ref}
            {...buttonProps}
            disabled={true}
            className={`${className} opacity-50 cursor-not-allowed`}
          >
            {children}
          </Button>
        );
      }

      return <>{fallback || null}</>;
    }

    // User has access - render enabled button
    return (
      <Button
        ref={ref}
        {...buttonProps}
        disabled={disabled}
        className={className}
      >
        {children}
      </Button>
    );
  }
);

AuthButton.displayName = "AuthButton";
