"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LockPasswordIcon,
  Settings01Icon,
  UserCircleIcon,
  Upload04Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import PageLayout from "@/components/dashboard/page-layout";
import { PageContent } from "@/components/dashboard/page-content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { useUsers } from "@/lib/api2/users";
import type { UpdateUserDto } from "@/lib/api2/users";
import { useAuthStore } from "@/store/auth-store";
import AvatarImg from "@/components/shared/avatar-img";

const profileSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  first_name: z.string().trim().optional(),
  last_name: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

const statusSchema = z.object({
  is_active: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type StatusFormValues = z.infer<typeof statusSchema>;

function AccountSettingsSkeleton() {
  return (
    <PageContent>
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </PageContent>
  );
}

export default function AccountSettingsPage() {
  const usersApi = useUsers();
  const authUser = useAuthStore((state) => state.user);
  const updateAuthUser = useAuthStore((state) => state.updateUser);

  const currentUserIdNumber =
    typeof authUser?.id_number === "string" && authUser.id_number.trim().length > 0
      ? authUser.id_number
      : "";

  const {
    data: currentUser,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usersApi.getUser(currentUserIdNumber, {
    enabled: !!currentUserIdNumber,
    staleTime: 30_000,
  });

  const updateUserMutation = usersApi.updateUser();
  const changePasswordMutation = usersApi.changePassword();

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const isAdmin = useMemo(() => {
    const role = String(currentUser?.role || "").toLowerCase();
    return role === "admin" || role === "superadmin" || currentUser?.is_superuser === true;
  }, [currentUser]);

  const isBioEditable = currentUser?.is_bio_editable === true;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const statusForm = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      is_active: true,
    },
  });

  useEffect(() => {
    if (!currentUser) return;

    profileForm.reset({
      username: currentUser.username || "",
      first_name: currentUser.first_name || "",
      last_name: currentUser.last_name || "",
      email: currentUser.email || "",
    });

    statusForm.reset({
      is_active: Boolean(currentUser.is_active),
    });

  }, [currentUser, profileForm, statusForm]);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    if (!currentUser?.id_number) {
      showToast.error("Unable to update profile", "Current user ID could not be resolved.");
      return;
    }

    try {
      const payload: UpdateUserDto = {
        username: values.username,
      };

      if (isBioEditable) {
        payload.first_name = values.first_name || "";
        payload.last_name = values.last_name || "";
        payload.email = values.email || "";
      }

      if (selectedPhoto && isBioEditable) {
        const formData = new FormData();
        formData.append("username", payload.username || "");
        if (payload.first_name !== undefined) formData.append("first_name", payload.first_name);
        if (payload.last_name !== undefined) formData.append("last_name", payload.last_name);
        if (payload.email !== undefined) formData.append("email", payload.email);
        formData.append("photo", selectedPhoto);

        await updateUserMutation.mutateAsync({ idNumber: currentUser.id_number, data: formData });
      } else {
        await updateUserMutation.mutateAsync({ idNumber: currentUser.id_number, data: payload });
      }

      await refetch();
      setSelectedPhoto(null);
      setPhotoPreview(null);
      updateAuthUser({
        username: values.username,
        firstName: values.first_name || undefined,
        lastName: values.last_name || undefined,
        first_name: values.first_name || undefined,
        last_name: values.last_name || undefined,
      });

      showToast.success("Account updated", "Your profile settings were saved.");
    } catch (err) {
      showToast.error("Update failed", getErrorMessage(err));
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    if (!currentUser?.id_number) {
      showToast.error("Unable to change password", "Current user ID could not be resolved.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        idNumber: currentUser.id_number,
        data: values,
      });

      passwordForm.reset();
      showToast.success("Password changed", "Your password has been updated successfully.");
    } catch (err) {
      showToast.error("Password update failed", getErrorMessage(err));
    }
  };

  const handleStatusSubmit = async (values: StatusFormValues) => {
    if (!currentUser?.id_number) {
      showToast.error("Unable to update status", "Current user ID could not be resolved.");
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        idNumber: currentUser.id_number,
        data: { is_active: values.is_active },
      });

      await refetch();
      showToast.success("Status updated", "Account status has been updated.");
    } catch (err) {
      showToast.error("Status update failed", getErrorMessage(err));
    }
  };

  if (isLoading) return <AccountSettingsSkeleton />;

  if (!currentUser) {
    return (
      <PageContent>
        <Card className="p-6 border-destructive/50 bg-destructive/10 max-w-3xl">
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Unable to Load Account</h3>
              <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
            </div>
          </div>
        </Card>
      </PageContent>
    );
  }

  const displayName = `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() || currentUser.username;
  const effectivePhoto = photoPreview || currentUser.photo || null;

  return (
    <PageLayout
      title="Account Settings"
      description="Manage your profile, password, and account preferences"
      error={error}
      loading={isLoading}
      refreshAction={refetch}
      fetching={isFetching}
    >
      <div className="space-y-4 w-full max-w-3xl">
        <Card>
          <CardContent className="fpt-6">
            <div className="flex items-center gap-4">
              <AvatarImg
                src={effectivePhoto}
                alt={displayName || "User Avatar"}
                name={displayName || "User Avatar"}
                className="size-16"
              />
              <div>
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email || currentUser.username}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: <span className="font-mono">{currentUser.id_number}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={UserCircleIcon} className="size-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Update your account identity details. Name, email, and photo are editable only when applicable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isBioEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isBioEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled={!isBioEditable} />
                      </FormControl>
                      {!isBioEditable && (
                        <FormDescription>
                          Email and name are managed from the linked source record for this account type.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Profile Photo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={!isBioEditable}
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setSelectedPhoto(file);
                        if (!file) {
                          setPhotoPreview(null);
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = (e) => setPhotoPreview((e.target?.result as string) || null);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {isBioEditable
                      ? "Upload a new photo to personalize your account profile."
                      : "Profile photo is managed from the linked source record for this account type."}
                  </FormDescription>
                </FormItem>

                <Button
                  type="submit"
                  loading={updateUserMutation.isPending}
                  loadingText="Saving..."
                  icon={<HugeiconsIcon icon={Settings01Icon} />}
                >
                  Save Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={LockPasswordIcon} className="size-5" />
              Password
            </CardTitle>
            <CardDescription>
              Change your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="current_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={passwordForm.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  loading={changePasswordMutation.isPending}
                  loadingText="Updating..."
                  icon={<HugeiconsIcon icon={LockPasswordIcon} />}
                >
                  Change Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Admin Controls</CardTitle>
              <CardDescription>
                Admin accounts can update the active status of this user account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...statusForm}>
                <form onSubmit={statusForm.handleSubmit(handleStatusSubmit)} className="space-y-4">
                  <FormField
                    control={statusForm.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>Account Active</FormLabel>
                          <FormDescription>
                            Disable this to block login for this account.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="outline"
                    loading={updateUserMutation.isPending}
                    loadingText="Saving..."
                    icon={<HugeiconsIcon icon={Upload04Icon} />}
                  >
                    Save Status
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
