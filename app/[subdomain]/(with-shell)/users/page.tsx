"use client";

import * as React from "react";
import { useUsers } from "@/lib/api2/users";
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs";
import {
  UserGroupIcon,
  UserCircleIcon,
  User02Icon,
  ShieldIcon,
} from "@hugeicons/core-free-icons";
import { UserTableSkeleton } from "@/components/users/user-table-skeleton";
import { EmptyUsers } from "@/components/users/empty-users";
import { UserStatsCards, type UserStatsItem } from "@/components/users/user-stats-cards";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { ChangeRoleDialog } from "@/components/users/change-role-dialog";
import { UserTable } from "@/components/users/user-table";
import { AuthButton } from "@/components/auth/auth-button";
import { useMemo, useCallback } from "react";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import type { UserDto, RecreateUserDto, CreateUserDto } from "@/lib/api2/users";
import PageLayout from "@/components/dashboard/page-layout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/portable-auth/src/client";
import { DialogBox } from "@/components/ui/dialog-box";

type PendingActionType =
  | "delete-single"
  | "delete-bulk"
  | "toggle-admin"
  | "reset-password"
  | "block-bulk"
  | "reinstate-bulk";

interface PendingAction {
  type: PendingActionType;
  users: UserDto[];
}

export default function UsersPage() {
  const router = useRouter();
  const usersApi = useUsers();
  const { user: currentUser } = useAuth();
  
  // Check if current user is admin
  const isAdmin = String(currentUser?.role || "").toLowerCase() === "admin" || 
                   String(currentUser?.role || "").toLowerCase() === "superadmin" ||
                   currentUser?.is_superuser === true;
  
  // URL state for filters and pagination
  const [urlParams, setUrlParams] = useQueryStates({
    account_type: parseAsArrayOf(parseAsString).withDefault([]),
    role: parseAsArrayOf(parseAsString).withDefault([]),
    is_active: parseAsString.withDefault(""),
    is_staff: parseAsString.withDefault(""),
    is_superuser: parseAsString.withDefault(""),
    is_default_password: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    page_size: parseAsInteger.withDefault(20),
  }, {
    history: "push",
    shallow: true,
  });
  
  // Build filter params for API
  const filterParams = useMemo(() => ({
    account_type: urlParams.account_type.length > 0 ? urlParams.account_type : undefined,
    role: urlParams.role.length > 0 ? urlParams.role : undefined,
    is_active: urlParams.is_active ? (urlParams.is_active === "true") : undefined,
    is_staff: urlParams.is_staff ? (urlParams.is_staff === "true") : undefined,
    is_superuser: urlParams.is_superuser ? (urlParams.is_superuser === "true") : undefined,
    is_default_password: urlParams.is_default_password ? (urlParams.is_default_password === "true") : undefined,
    page: urlParams.page,
    page_size: urlParams.page_size,
  }), [urlParams]);
  
  // Fetch users with filters and pagination
  const { data, isLoading, error, isFetching, refetch } = usersApi.getUsers(filterParams);
  const createMutation = usersApi.createUser();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [changeRoleUser, setChangeRoleUser] = useState<UserDto | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  
  const updateMutation = usersApi.updateUser();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const filterOutCurrentUser = useCallback(
    (users: UserDto[]) => users.filter((user) => user.id_number !== currentUser?.id_number),
    [currentUser],
  );

  const handleDelete = useCallback((user: UserDto) => {
    if (currentUser?.id_number === user.id_number) {
      showToast.error("Action not allowed", "You cannot delete your own account");
      return;
    }

    setPendingAction({ type: "delete-single", users: [user] });
  }, [currentUser]);

  const handleView = useCallback((user: UserDto) => {
    router.push(`/users/${user.id_number}`);
  }, [router]);

  const handleBlock = useCallback(async (user: UserDto) => {
    if (currentUser?.id_number === user.id_number) {
      showToast.error("Action not allowed", "You cannot block or disable your own account");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        idNumber: user.id_number,
        data: {
          is_active: false,
          status: 'suspended'
        }
      });
      showToast.success(
        "User blocked",
        `${user.first_name} ${user.last_name} has been blocked`,
      );
      refetch();
    } catch (err) {
      showToast.error("Block failed", getErrorMessage(err));
    }
  }, [currentUser, updateMutation, refetch]);

  const handleReinstate = useCallback(async (user: UserDto) => {
    if (currentUser?.id_number === user.id_number) {
      showToast.error("Action not allowed", "You cannot modify your own account status");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        idNumber: user.id_number,
        data: {
          is_active: true,
          status: 'active'
        }
      });
      showToast.success(
        "User reinstated",
        `${user.first_name} ${user.last_name} has been reinstated`,
      );
      refetch();
    } catch (err) {
      showToast.error("Reinstate failed", getErrorMessage(err));
    }
  }, [currentUser, updateMutation, refetch]);

  const handleChangeRole = useCallback((user: UserDto) => {
    if (currentUser?.id_number === user.id_number) {
      showToast.error("Action not allowed", "You cannot change your own role");
      return;
    }

    if (String(user.role || "").toLowerCase() === "superadmin") {
      showToast.error("Action not allowed", "Super admin role cannot be changed");
      return;
    }

    setChangeRoleUser(user);
  }, [currentUser]);

  const handleResetPassword = useCallback(async (user: UserDto) => {
    setPendingAction({ type: "reset-password", users: [user] });
  }, []);

  const handleToggleAdmin = useCallback(async (user: UserDto) => {
    if (currentUser?.id_number === user.id_number) {
      showToast.error("Action not allowed", "You cannot disable your own access");
      return;
    }

    setPendingAction({ type: "toggle-admin", users: [user] });
  }, [currentUser]);

  const handleCopyId = useCallback((user: UserDto) => {
    navigator.clipboard.writeText(user.id_number);
    showToast.success("Copied", `ID number ${user.id_number} copied to clipboard`);
  }, []);

  const handleBulkDelete = useCallback(async (users: UserDto[]) => {
    if (users.length === 0) return;

    const deletableUsers = filterOutCurrentUser(users);

    if (deletableUsers.length === 0) {
      showToast.error("Action not allowed", "You cannot delete your own account");
      return;
    }

    setPendingAction({ type: "delete-bulk", users: deletableUsers });
  }, [filterOutCurrentUser]);

  const handleBulkBlock = useCallback((users: UserDto[]) => {
    const blockableUsers = filterOutCurrentUser(users).filter((user) => user.is_active);

    if (blockableUsers.length === 0) {
      showToast.error("Nothing to block", "No eligible active users were selected");
      return;
    }

    setPendingAction({ type: "block-bulk", users: blockableUsers });
  }, [filterOutCurrentUser]);

  const handleBulkReinstate = useCallback((users: UserDto[]) => {
    const reinstateUsers = filterOutCurrentUser(users).filter((user) => !user.is_active);

    if (reinstateUsers.length === 0) {
      showToast.error("Nothing to reinstate", "No eligible inactive users were selected");
      return;
    }

    setPendingAction({ type: "reinstate-bulk", users: reinstateUsers });
  }, [filterOutCurrentUser]);

  const handleExport = useCallback((users: UserDto[]) => {
    // Convert users to CSV
    const headers = ["ID Number", "Name", "Email", "Type", "Status", "Password"];
    const rows = users.map(user => [
      user.id_number,
      `${user.first_name} ${user.last_name}`,
      user.email,
      user.account_type,
      user.is_active ? "Active" : "Inactive",
      user.is_default_password ? "Default" : "Changed",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast.success("Export complete", `Exported ${users.length} user(s)`);
  }, []);

  const usersList = useMemo(() => {
    if (Array.isArray(data)) return data;
    return data?.results || [];
  }, [data]);

  const totalCount = useMemo(() => {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    return data.count || 0;
  }, [data]);

  const isEmpty = !isLoading && usersList.length === 0;

  // Calculate stats from user data
  const stats = useMemo(() => {
    const staffCount = usersList.filter((u: UserDto) => u.is_staff).length;
    const studentCount = usersList.filter((u: UserDto) => u.account_type === "STUDENT").length;
    const adminCount = usersList.filter((u: UserDto) => u.is_superuser).length;

    return [
      {
        title: "Total Users",
        value: totalCount.toString(),
        subtitle: "Across the system",
        icon: UserGroupIcon,
        subtitleIcon: UserCircleIcon,
      },
      {
        title: "Staff",
        value: staffCount.toString(),
        subtitle: `${studentCount} students`,
        icon: User02Icon,
        subtitleIcon: UserCircleIcon,
      },
      {
        title: "Students",
        value: studentCount.toString(),
        subtitle: "Active learners",
        icon: UserCircleIcon,
        subtitleIcon: User02Icon,
      },
      {
        title: "Admins",
        value: adminCount.toString(),
        subtitle: "Super admins",
        icon: ShieldIcon,
        subtitleIcon: ShieldIcon,
      },
    ] as UserStatsItem[];
  }, [usersList, totalCount]);

  const handleCreateUser = useCallback(
    async (formData: RecreateUserDto | CreateUserDto) => {
      try {
        await createMutation.mutateAsync(formData);
        showToast.success(
          "User created",
          "The user has been added to the system",
        );
        setShowCreateModal(false);
        refetch();
      } catch (error) {
        showToast.error("Create failed", getErrorMessage(error));
      }
    },
    [createMutation, refetch],
  );

  const pendingActionConfig = useMemo(() => {
    if (!pendingAction) return null;

    const count = pendingAction.users.length;
    const firstUser = pendingAction.users[0];
    const fullName = firstUser ? `${firstUser.first_name} ${firstUser.last_name}` : "selected users";

    switch (pendingAction.type) {
      case "delete-single":
        return {
          title: "Delete User",
          description: `Are you sure you want to delete ${fullName}? This action cannot be undone.`,
          actionLabel: "Delete",
          actionVariant: "destructive" as const,
        };
      case "delete-bulk":
        return {
          title: "Delete Users",
          description: `Are you sure you want to delete ${count} users? This action cannot be undone.`,
          actionLabel: "Delete Users",
          actionVariant: "destructive" as const,
        };
      case "toggle-admin":
        return {
          title: firstUser?.is_staff ? "Remove Admin Access" : "Grant Admin Access",
          description: firstUser?.is_staff
            ? `Remove admin access from ${fullName}?`
            : `Grant admin access to ${fullName}?`,
          actionLabel: firstUser?.is_staff ? "Remove Admin" : "Make Admin",
          actionVariant: "default" as const,
        };
      case "reset-password":
        return {
          title: "Reset Password",
          description: `Reset password for ${fullName}? The password will be set to the user's ID number.`,
          actionLabel: "Reset Password",
          actionVariant: "default" as const,
        };
      case "block-bulk":
        return {
          title: "Block Users",
          description: `Block ${count} active users? They will be suspended immediately.`,
          actionLabel: "Block Users",
          actionVariant: "destructive" as const,
        };
      case "reinstate-bulk":
        return {
          title: "Reinstate Users",
          description: `Reinstate ${count} inactive users? They will be activated immediately.`,
          actionLabel: "Reinstate Users",
          actionVariant: "default" as const,
        };
      default:
        return null;
    }
  }, [pendingAction]);

  const handleConfirmPendingAction = useCallback(async () => {
    if (!pendingAction) return;

    setIsActionSubmitting(true);
    try {
      if (pendingAction.type === "delete-single" || pendingAction.type === "delete-bulk") {
        const deleteMutation = usersApi.deleteUser();
        await Promise.all(
          pendingAction.users.map((user) =>
            deleteMutation.mutateAsync({ idNumber: user.id_number, hard: false }),
          ),
        );
        showToast.success(
          pendingAction.type === "delete-single" ? "User deleted" : "Users deleted",
          `${pendingAction.users.length} user(s) removed successfully`,
        );
      }

      if (pendingAction.type === "toggle-admin") {
        const user = pendingAction.users[0];
        if (user) {
          await updateMutation.mutateAsync({
            idNumber: user.id_number,
            data: { is_staff: !user.is_staff },
          });
          showToast.success(
            user.is_staff ? "Admin removed" : "Admin granted",
            `${user.first_name} ${user.last_name} has been ${user.is_staff ? "removed as admin" : "made an admin"}`,
          );
        }
      }

      if (pendingAction.type === "reset-password") {
        const user = pendingAction.users[0];
        if (user) {
          showToast.success(
            "Password reset",
            `Password has been reset for ${user.first_name} ${user.last_name}`,
          );
        }
      }

      if (pendingAction.type === "block-bulk") {
        await Promise.all(
          pendingAction.users.map((user) =>
            updateMutation.mutateAsync({
              idNumber: user.id_number,
              data: { is_active: false, status: "suspended" },
            }),
          ),
        );
        showToast.success("Users blocked", `${pendingAction.users.length} user(s) blocked successfully`);
      }

      if (pendingAction.type === "reinstate-bulk") {
        await Promise.all(
          pendingAction.users.map((user) =>
            updateMutation.mutateAsync({
              idNumber: user.id_number,
              data: { is_active: true, status: "active" },
            }),
          ),
        );
        showToast.success("Users reinstated", `${pendingAction.users.length} user(s) reinstated successfully`);
      }

      setPendingAction(null);
      refetch();
    } catch (error) {
      showToast.error("Action failed", getErrorMessage(error));
    } finally {
      setIsActionSubmitting(false);
    }
  }, [pendingAction, refetch, updateMutation, usersApi]);

  return (
    <>
      <PageLayout
        title="Users"
        description="Manage and view user accounts"
        refreshAction={handleRefresh}
        // loading={isLoading}
        fetching={isFetching}
        actions={
          <AuthButton
            roles="admin"
            disable
            size="sm"
            className="h-8"
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading || isFetching}
          >
            <span>Create User</span>
          </AuthButton>
        }
        error={error}
        noData={isEmpty}
        skeleton={<UserTableSkeleton />}
        emptyState={<EmptyUsers />}
      >
        {/* Stats Cards - shown above the table */}
        <UserStatsCards items={stats} />

        {/* User Table with Advanced Features */}
        <UserTable
          data={usersList}
          onDelete={isAdmin ? handleDelete : undefined}
          onBulkDelete={isAdmin ? handleBulkDelete : undefined}
          onBulkBlock={isAdmin ? handleBulkBlock : undefined}
          onBulkReinstate={isAdmin ? handleBulkReinstate : undefined}
          onExport={handleExport}
          onView={handleView}
          onBlock={isAdmin ? handleBlock : undefined}
          onReinstate={isAdmin ? handleReinstate : undefined}
          onChangeRole={isAdmin ? handleChangeRole : undefined}
          onResetPassword={isAdmin ? handleResetPassword : undefined}
          onToggleAdmin={isAdmin ? handleToggleAdmin : undefined}
          onCopyId={handleCopyId}
          loading={isLoading}
          totalCount={totalCount}
          currentPage={urlParams.page}
          pageSize={urlParams.page_size}
          onPageChange={(page) => setUrlParams({ page })}
          onPageSizeChange={(size) => setUrlParams({ page_size: size, page: 1 })}
          urlParams={urlParams}
          setUrlParams={setUrlParams}
        />
      </PageLayout>

      {/* Create User Dialog */}
      <UserFormDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateUser}
        loading={createMutation.isPending}
      />

      <DialogBox
        open={!!pendingAction && !!pendingActionConfig}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={pendingActionConfig?.title || "Confirm action"}
        description={pendingActionConfig?.description || "Please confirm this action."}
        actionLabel={pendingActionConfig?.actionLabel}
        actionVariant={pendingActionConfig?.actionVariant}
        actionLoading={isActionSubmitting}
        actionLoadingText="Processing..."
        actionDisabled={isActionSubmitting}
        onAction={handleConfirmPendingAction}
      />

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        user={changeRoleUser}
        open={!!changeRoleUser}
        onOpenChange={(open) => !open && setChangeRoleUser(null)}
        onSuccess={refetch}
      />
    </>
  );
}
