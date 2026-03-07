"use client"

import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail02Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { getStatusBadgeClass, getStatusDotClass } from "@/lib/status-colors"
import type { UserDto } from "@/lib/api2/users"
import AvatarImg from "../shared/avatar-img"

interface UserDetailHeaderProps {
  user: UserDto
}

export function UserDetailHeader({ user }: UserDetailHeaderProps) {
  const status = user?.status
  const accountType = user?.account_type
  const role = user?.role

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
    }
    return colors[role] || colors.viewer
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Main Header Content */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
          <AvatarImg
            src={user.photo}
            alt={`${user.first_name} ${user.last_name}`}
            className="size-18 sm:size-24 ring-4 ring-background shadow-lg shrink-0"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col items-center sm:items-start gap-2 mb-3">
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center">
                  <span>{user.first_name} {user.last_name} </span>
                  {user.is_current_user && (
                    <Badge variant="outline" className="text-xs h-fit bg-primary/10 text-primary border-primary/30">
                  You
                </Badge>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  <span className="block sm:inline">ID: <b>{user.id_number}</b></span>
                  {user.username && <span className="block sm:inline sm:ml-2">• @<b>{user.username}</b></span>}
                </p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Account Type:</span>
                <Badge variant="outline" className="capitalize">
                  {accountType}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Role:</span>
                <Badge
                  className={cn(
                    "gap-1.5 border-0 capitalize",
                    getRoleColor(role)
                  )}
                >
                  {role}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  className={cn(
                    "gap-1.5 border-0 capitalize",
                    getStatusBadgeClass(status)
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", getStatusDotClass(status))} />
                  {status}
                </Badge>
              </div>
              {user.is_staff && (
                <Badge variant="secondary" className="font-medium">
                  Staff Access
                </Badge>
              )}
              {user.is_default_password && (
                <Badge variant="destructive" className="font-medium">
                  Default Password
                </Badge>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              {user.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={Mail02Icon} className="size-4 shrink-0" />
                  <a
                    href={`mailto:${user.email}`}
                    className="hover:text-foreground truncate"
                  >
                    {user.email}
                  </a>
                </div>
              )}
              {user.is_active ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="size-2 rounded-full bg-current" />
                  Active Login
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <div className="size-2 rounded-full bg-current" />
                  Login Disabled
                </div>
              )}
              {user.last_login && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={Calendar03Icon} className="size-4 shrink-0" />
                  <span>Last: {new Date(user.last_login).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
