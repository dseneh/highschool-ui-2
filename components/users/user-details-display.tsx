"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";
import { UserDto } from "@/lib/api2/users";
import { getStatusBadgeClass } from "@/lib/status-colors";
import { Lock, Pencil, Settings, Trash } from "lucide-react";
import AvatarImg from "../shared/avatar-img";

interface UserDetailsDisplayProps {
  user: UserDto;
  isCurrentUser?: boolean;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onAdminActions?: () => void;
  onDelete?: () => void;
}

export function UserDetailsDisplay({
  user,
  isCurrentUser = false,
  onEditProfile,
  onChangePassword,
  onAdminActions,
  onDelete,
}: UserDetailsDisplayProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("basic");

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      superadmin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      admin: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      teacher: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      student: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      parent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      registrar: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      accountant: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      viewer: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };
    return colors[role] || colors.viewer;
  };

  return (
    <div className="space-y-6">
      {/* Header with user basic info */}
      <Card>

        {/* <Separator /> */}
        <CardContent className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground tracking-wide">
                Basic Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <label className="text-muted-foreground">ID Number</label>
                  <p className="font-medium">{user.id_number}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Username</label>
                  <p className="font-medium">{user.username || "—"}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Gender</label>
                  <p className="font-medium capitalize">{user.gender || "—"}</p>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Account Status
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <label className="text-muted-foreground">Active</label>
                  <p className="font-medium">
                    {user.is_active ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground">Default Password</label>
                  <p className="font-medium">
                    {user.is_default_password ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground">Staff Access</label>
                  <p className="font-medium">
                    {user.is_staff ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <label className="text-muted-foreground">Last Login</label>
              <p className="font-medium">
                {user.last_login
                  ? new Date(user.last_login).toLocaleString()
                  : "Never"}
              </p>
            </div>
            <div>
              <label className="text-muted-foreground">
                Last Password Updated
              </label>
              <p className="font-medium">
                {user.last_password_updated
                  ? new Date(user.last_password_updated).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="fpt-6">
          <div className="flex flex-col md:flex-row gap-3 w-full max-w-50">
            {onChangePassword && (
              <Button
                variant="outline"
                onClick={onChangePassword}
                icon={<Lock className="size-4" />}
                className="justify-start"
              >
                Change Password
              </Button>
            )}

            {onEditProfile && (
              <Button
                variant="outline"
                onClick={onEditProfile}
                icon={<Pencil className="size-4" />}
                className="justify-start"
              >
                Edit Profile
              </Button>
            )}

            {onAdminActions && (
              <AuthButton
                roles="admin"
                notCurrentUserTarget={{ id: user.id, is_current_user: isCurrentUser }}
                disable
                variant="outline"
                onClick={onAdminActions}
                icon={<Settings className="size-4" />}
                className="justify-start"
              >
                Admin Actions
              </AuthButton>
            )}

            {onDelete && (
              <AuthButton
                roles="admin"
                notCurrentUserTarget={{ id: user.id, is_current_user: isCurrentUser }}
                disable
                variant="outline"
                onClick={onDelete}
                icon={<Trash className="size-4" />}
                className="justify-start text-destructive hover:text-destructive"
              >
                Delete User
              </AuthButton>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
