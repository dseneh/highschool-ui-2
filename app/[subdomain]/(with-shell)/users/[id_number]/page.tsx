"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/dashboard/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserDetailHeader } from "@/components/users/user-detail-header";
import { UserDetailsDisplay } from "@/components/users/user-details-display";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { EditProfileDialog } from "@/components/users/edit-profile-dialog";
import { AdminActionsDialog } from "@/components/users/admin-actions-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { useAuth } from "@/components/portable-auth/src/client";
import { useUsers } from "@/lib/api2";
import { UserDto } from "@/lib/api2/users";
import { DialogBox } from "@/components/ui/dialog-box";

interface UserDetailPageProps {
  params: Promise<{ id_number: string; subdomain: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { getUser } = useUsers();

  const [id_number, setIdNumber] = useState<string>("");

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [adminActionsOpen, setAdminActionsOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);

  // Load params
  useEffect(() => {
    params.then((p) => setIdNumber(p.id_number));
  }, [params]);

  const { data: userData, isLoading, error, refetch, isFetching} = getUser(id_number, {
    enabled: !!id_number,
  });

  const isCurrentUser = useMemo(() => {
    if (!authUser || !userData) return false;
    return authUser.id_number === userData.id_number;
  }, [authUser, userData]);

  const handleRefresh = () => {
    refetch();
  };

  const handleDelete = async () => {
    // After delete, redirect to users list
    router.replace("/users");
  };

  if (authLoading || isLoading) {
    return (
      <PageLayout title="User Details" description="View and manage user account">
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    );
  }
  
  const isAdmin = authUser?.is_superuser || authUser?.role === "admin" || authUser?.role === "superadmin";

  return (
    <PageLayout
      title={`User Details`}
      description={`Manage user account details and settings`}
        loading={isLoading || authLoading}
        fetching={isFetching}
        refreshAction={refetch}
    >
        {userData && (
      <div className="space-y-6">

          <UserDetailHeader user={userData} />

        <UserDetailsDisplay
        user={userData}
        isCurrentUser={isCurrentUser}
        onEditProfile={() => setEditProfileOpen(true)}
        onChangePassword={() => setChangePasswordOpen(true)}
        onAdminActions={isAdmin ? () => setAdminActionsOpen(true) : undefined}
        onDelete={isAdmin && !isCurrentUser ? () => setDeleteUserOpen(true) : undefined}
        />
      <DialogBox 
      title="Change Password"
      description="Update your password to secure your account"
      open={changePasswordOpen} 
      onOpenChange={setChangePasswordOpen}
      cancelLabel={false}
      >
          <PasswordChangeForm
            idNumber={userData.id_number}
            isDefaultPassword={userData.is_default_password}
            onSuccess={() => {
              setChangePasswordOpen(false);
              handleRefresh();
            }}
          />
        </DialogBox>

      <EditProfileDialog
        user={userData}
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        onSuccess={handleRefresh}
      />

      {isAdmin && (
        <>
          <AdminActionsDialog
            user={userData}
            open={adminActionsOpen}
            onOpenChange={setAdminActionsOpen}
            onSuccess={handleRefresh}
          />

          {!isCurrentUser && (
            <DeleteUserDialog
              user={userData}
              open={deleteUserOpen}
              onOpenChange={setDeleteUserOpen}
              onSuccess={handleDelete}
            />
          )}
        </>
      )}
      </div>
      )}

    </PageLayout>
  );
}
