"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUsers } from "@/lib/api2";
import { UserDto } from "@/lib/api2/users";
import { showToast } from "@/lib/toast";
import { DialogBox } from "../ui/dialog-box";
import { SelectField } from "../ui/select-field";

const editProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().optional().nullable(),
  gender: z.enum(["male", "female"]).optional(),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

interface EditProfileDialogProps {
  user: UserDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditProfileDialogProps) {
  const { updateUser } = useUsers();
  const [submitting, setSubmitting] = useState(false);
  const isGlobalUser = useMemo(
    () => user?.is_bio_editable ?? String(user?.account_type || "").toLowerCase() === "global",
    [user?.account_type, user?.is_bio_editable]
  );

  const update = updateUser()

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      gender: (user.gender as "male" | "female") || undefined,
    },
  });

  useEffect(() => {
    form.reset({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      gender: (user.gender as "male" | "female") || undefined,
    });
  }, [form, user]);

  const onSubmit = async (data: EditProfileFormValues) => {
    setSubmitting(true);
    try {
      const payload = isGlobalUser
        ? {
            first_name: data.first_name,
            last_name: data.last_name,
            username: data.username,
            gender: data.gender,
          }
        : {
            username: data.username,
          };

      await update.mutateAsync({
        id: user.id_number,
        data: payload,
      });

      showToast.success("Profile updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.first_name?.[0] ||
        error?.message ||
        "Failed to update profile";
      showToast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!submitting) {
      form.reset();
      onOpenChange(newOpen);
    }
  };

  return (
    <DialogBox 
    open={open} 
    onOpenChange={handleOpenChange}
    title="Edit Profile"
    description="Update your profile information"
    formId="edit-profile-form"
    actionLabel="Save Changes"
    actionLoading={update.isPending}
    actionDisabled={!form.formState.isDirty || submitting || update.isPending}
    >
        <Form {...form}>
          <form id="edit-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={submitting || !isGlobalUser} />
                  </FormControl>
                  {!isGlobalUser && (
                    <p className="text-xs text-muted-foreground">
                      Managed from linked profile record
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={submitting || !isGlobalUser} />
                  </FormControl>
                  {!isGlobalUser && (
                    <p className="text-xs text-muted-foreground">
                      Managed from linked profile record
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      placeholder="Optional"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <SelectField
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={submitting || !isGlobalUser}
                    items={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                    ]}
                  />
                  {!isGlobalUser && (
                    <p className="text-xs text-muted-foreground">
                      Managed from linked profile record
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} loading={submitting}>
                Save Changes
              </Button>
            </div> */}
          </form>
        </Form>
    </DialogBox>
  );
}
