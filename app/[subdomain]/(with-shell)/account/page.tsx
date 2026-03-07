"use client";

import { useAuth } from "@/components/portable-auth/src/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/dashboard/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserDetailHeader } from "@/components/users/user-detail-header";
import { UserDetailsDisplay } from "@/components/users/user-details-display";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { EditProfileDialog } from "@/components/users/edit-profile-dialog";
import { UserDto } from "@/lib/api2/users";

export default function AccountPage() {
  const router = useRouter();
  const { user: authUser, loading, authenticated } = useAuth();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/login");
    }
  }, [authenticated, loading, router]);

  if (loading) {
    return (
      <PageLayout title="My Account" description="View and manage your account">
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (!authUser) {
    return null;
  }

  const displayUser = authUser as unknown as UserDto;

  const handleRefresh = async () => {
    // The header and display will auto-update from the auth context
    // No manual refresh needed
  };

  return (
    <PageLayout title="My Account" description="View and manage your account">
      <div className="space-y-6">
        <UserDetailHeader user={displayUser} />

        <UserDetailsDisplay
          user={displayUser}
          isCurrentUser={true}
          onEditProfile={() => setEditProfileOpen(true)}
          onChangePassword={() => setChangePasswordOpen(true)}
        />
      </div>

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your password to secure your account
            </DialogDescription>
          </DialogHeader>
          <PasswordChangeForm
            idNumber={displayUser.id_number}
            isDefaultPassword={false}
            onSuccess={() => {
              setChangePasswordOpen(false);
              handleRefresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <EditProfileDialog
        user={displayUser}
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        onSuccess={handleRefresh}
      />
    </PageLayout>
  );
}
