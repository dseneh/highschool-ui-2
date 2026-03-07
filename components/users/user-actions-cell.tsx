"use client";

import type { UserDto } from "@/lib/api2/users";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Ban,
  CheckCircle2,
  UserCog,
  KeyRound,
  Shield,
  ShieldOff,
  Copy,
} from "lucide-react";
import { useHasRole, useIsCurrentUser } from "@/hooks/use-authorization";

interface UserActionsCellProps {
  user: UserDto;
  onEdit?: (user: UserDto) => void;
  onDelete?: (user: UserDto) => void;
  onView?: (user: UserDto) => void;
  onBlock?: (user: UserDto) => void;
  onReinstate?: (user: UserDto) => void;
  onChangeRole?: (user: UserDto) => void;
  onResetPassword?: (user: UserDto) => void;
  onToggleAdmin?: (user: UserDto) => void;
  onCopyId?: (user: UserDto) => void;
}

type ActionItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: boolean;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
  onClick: () => void;
};

export function UserActionsCell({
  user,
  onEdit,
  onDelete,
  onView,
  onBlock,
  onReinstate,
  onChangeRole,
  onResetPassword,
  onToggleAdmin,
  onCopyId,
}: UserActionsCellProps) {
  const canAdmin = useHasRole("admin");
  const isCurrentUser = useIsCurrentUser(user);
  const isTargetSuperadmin = String(user.role || "").toLowerCase() === "superadmin";

  const actionItems: ActionItem[] = [
    {
      key: "view",
      label: "View Details",
      icon: Eye,
      visible: !!onView,
      onClick: () => onView?.(user),
    },
    {
      key: "edit",
      label: "Edit User",
      icon: Edit,
      visible: !!onEdit,
      onClick: () => onEdit?.(user),
    },
    {
      key: "copy-id",
      label: "Copy ID Number",
      icon: Copy,
      visible: !!onCopyId,
      onClick: () => onCopyId?.(user),
    },
  ];

  const permissionItems: ActionItem[] = [
    {
      key: "change-role",
      label: "Change Role",
      icon: UserCog,
      visible: !!onChangeRole && canAdmin,
      disabled: isCurrentUser || isTargetSuperadmin,
      onClick: () => onChangeRole?.(user),
    },
    {
      key: "toggle-admin",
      label: user.is_staff ? "Remove Admin" : "Make Admin",
      icon: user.is_staff ? ShieldOff : Shield,
      visible: !!onToggleAdmin && canAdmin,
      disabled: isCurrentUser,
      onClick: () => onToggleAdmin?.(user),
    },
    {
      key: "reset-password",
      label: "Reset Password",
      icon: KeyRound,
      visible: !!onResetPassword && canAdmin,
      onClick: () => onResetPassword?.(user),
    },
  ];

  const accountItems: ActionItem[] = [
    {
      key: "block",
      label: "Block User",
      icon: Ban,
      visible: !!onBlock && !!user.is_active && canAdmin,
      disabled: isCurrentUser,
      className: "text-orange-600 dark:text-orange-400",
      onClick: () => onBlock?.(user),
    },
    {
      key: "reinstate",
      label: "Reinstate User",
      icon: CheckCircle2,
      visible: !!onReinstate && !user.is_active && canAdmin,
      disabled: isCurrentUser,
      className: "text-green-600 dark:text-green-400",
      onClick: () => onReinstate?.(user),
    },
    {
      key: "delete",
      label: "Delete User",
      icon: Trash2,
      visible: !!onDelete && canAdmin,
      disabled: isCurrentUser,
      destructive: true,
      onClick: () => onDelete?.(user),
    },
  ];

  const renderActionGroup = (items: ActionItem[]) =>
    items
      .filter((item) => item.visible)
      .map((item) => {
        const Icon = item.icon;
        return (
          <DropdownMenuItem
            key={item.key}
            onClick={(event) => {
              event.stopPropagation();
              item.onClick();
            }}
            disabled={item.disabled}
            className={item.destructive ? "text-destructive" : item.className}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        );
      });

  const hasAnyVisibleAction =
    actionItems.some((item) => item.visible) ||
    permissionItems.some((item) => item.visible) ||
    accountItems.some((item) => item.visible);

  if (!hasAnyVisibleAction) {
    return null;
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {actionItems.some((item) => item.visible) && (
            <DropdownMenuGroup>{renderActionGroup(actionItems)}</DropdownMenuGroup>
          )}

          {permissionItems.some((item) => item.visible) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Permissions</DropdownMenuLabel>
                {renderActionGroup(permissionItems)}
              </DropdownMenuGroup>
            </>
          )}

          {accountItems.some((item) => item.visible) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Account Status</DropdownMenuLabel>
                {renderActionGroup(accountItems)}
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
