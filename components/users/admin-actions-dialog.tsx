"use client";

import { useState, useEffect, useMemo } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsers } from "@/lib/api2";
import { UserDto } from "@/lib/api2/users";
import { showToast } from "@/lib/toast";
import { DialogBox } from "../ui/dialog-box";
import { SelectField } from "../ui/select-field";
import { useAuth } from "@/components/portable-auth/src/client";
import { useHasRole } from "@/hooks/use-authorization";

const adminActionsSchema = z.object({
  status: z.enum(["active", "inactive", "suspended", "deleted"]),
  role: z.string().min(1, "Role is required"),
  account_type: z.string().min(1, "Account type is required"),
  is_active: z.boolean(),
  is_staff: z.boolean(),
  is_superuser: z.boolean(),
  username: z.string().optional().nullable(),
  email: z.union([z.string().email("Invalid email"), z.literal(""), z.null()]).optional(),
});

type AdminActionsFormValues = z.infer<typeof adminActionsSchema>;

interface AdminActionsDialogProps {
  user: UserDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ROLE_RANK: Record<string, number> = {
  superadmin: 100,
  admin: 90,
  registrar: 70,
  accountant: 70,
  teacher: 60,
  data_entry: 50,
  viewer: 40,
  parent: 20,
  student: 10,
};

const ROLE_OPTIONS = [
  { value: "superadmin", label: "Superadmin" },
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "registrar", label: "Registrar" },
  { value: "accountant", label: "Accountant" },
  { value: "data_entry", label: "Data Entry" },
  { value: "viewer", label: "Viewer" },
];

export function AdminActionsDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: AdminActionsDialogProps) {
  const { updateUser } = useUsers();
  const { user: currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formId, setFormId] = useState<string | undefined>('status');

  const {mutateAsync: updateUserAsync, isPending: updatingUser} = updateUser()

  const form = useForm<AdminActionsFormValues>({
    resolver: zodResolver(adminActionsSchema),
    defaultValues: {
      status: user?.status as any,
      role: user?.role || "viewer",
      account_type: user?.account_type || "other",
      is_active: user?.is_active ?? false,
      is_staff: user?.is_staff ?? false,
      is_superuser: user?.is_superuser ?? false,
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  const selectedAccountType = form.watch("account_type");
  const originalAccountType = String(user?.account_type || "").toLowerCase();
  const roleLockedByAccountType =
    (originalAccountType === "student" || originalAccountType === "parent") &&
    selectedAccountType === originalAccountType;

  const currentRole = String(currentUser?.role || "viewer").toLowerCase();
  const currentUserRank = currentUser?.is_superuser ? 999 : (ROLE_RANK[currentRole] ?? 0);
  const canAssignSuperuser = useHasRole("superadmin");

  const allowedRoleItems = useMemo(() => {
    let options = ROLE_OPTIONS.filter((option) => (ROLE_RANK[option.value] ?? 0) <= currentUserRank);

    if (selectedAccountType === "student") {
      options = options.filter((option) => option.value === "student");
    }

    if (selectedAccountType === "parent") {
      options = options.filter((option) => option.value === "parent");
    }

    if (options.length === 0) {
      options = [{ value: "viewer", label: "Viewer" }];
    }

    return options;
  }, [currentUserRank, selectedAccountType]);

  // Update form when user data changes
  useEffect(() => {
    if (user && open) {
      form.reset({
        status: user.status as any,
        role: user.role || "viewer",
        account_type: user.account_type || "other",
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user, open, form]);

  useEffect(() => {
    if (!open) return;

    if (roleLockedByAccountType) {
      const lockedRole = selectedAccountType === "student" ? "student" : "parent";
      if (form.getValues("role") !== lockedRole) {
        form.setValue("role", lockedRole, { shouldDirty: true });
      }
      return;
    }

    const currentFormRole = form.getValues("role");
    const roleAllowed = allowedRoleItems.some((item) => item.value === currentFormRole);
    if (!roleAllowed) {
      form.setValue("role", allowedRoleItems[0]?.value ?? "viewer", { shouldDirty: true });
    }
  }, [allowedRoleItems, form, open, roleLockedByAccountType, selectedAccountType]);

  const onSubmit = async (data: AdminActionsFormValues) => {
    if (!user?.id_number) {
      showToast.error("Unable to update user: user data is missing");
      return;
    }

    setSubmitting(true);
    try {
      await updateUserAsync({
        id: user.id_number,
        data: {
          status: data.status,
          role: roleLockedByAccountType
            ? (selectedAccountType === "student" ? "student" : "parent")
            : data.role,
          account_type: data.account_type,
          is_active: data.is_active,
          is_staff: data.is_staff,
          is_superuser: data.is_superuser,
          username: data.username || undefined,
          email: data.email || undefined,
        },
      });

      showToast.success("User settings updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to update user settings";
      showToast.error(message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <DialogBox
    open={open && !!user} 
    onOpenChange={onOpenChange}
    title="Admin Actions"
    description={`Manage user ${user?.first_name} ${user?.last_name}'s account settings`}
    formId={formId}
    actionLabel="Submit Changes"
    actionLoading={updatingUser}
    actionDisabled={!form.formState.isDirty || submitting || updatingUser}
    >
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status" onClick={() => setFormId('status')}>Status</TabsTrigger>
            <TabsTrigger value="permissions" onClick={() => setFormId('permissions')}>Permissions & Identity</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4 mt-4">
            <Form {...form}>
              <form
                id="status"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Status</FormLabel>
                      <SelectField
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={submitting}
                        items={[
                          { value: "active", label: "Active" },
                          { value: "inactive", label: "Inactive" },
                          { value: "suspended", label: "Suspended" },
                          { value: "deleted", label: "Deleted" },
                        ]}
                      />
                      <FormDescription>
                        Set the user&apos;s account status
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <SelectField
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={submitting}
                        items={[
                          { value: "global", label: "Global" },
                          { value: "staff", label: "Staff" },
                          { value: "student", label: "Student" },
                          { value: "parent", label: "Parent/Guardian" },
                          { value: "other", label: "Other" },
                        ]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <SelectField
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={submitting || roleLockedByAccountType}
                        items={allowedRoleItems}
                      />
                      {roleLockedByAccountType && (
                        <FormDescription>
                          Role is locked for {selectedAccountType} accounts unless account type changes.
                        </FormDescription>
                      )}
                      {!roleLockedByAccountType && (
                        <FormDescription>
                          Available roles are limited by your current access level.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={submitting}
                        />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="text-base font-normal cursor-pointer">
                          Active Login
                        </FormLabel>
                        <FormDescription>
                          Allow user to log in to the system
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    loading={submitting}
                  >
                    Save
                  </Button>
                </div> */}
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4 mt-4">
            <Form {...form}>
              <form
                id="permissions"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value || ""}
                          onChange={(event) => field.onChange(event.target.value)}
                          disabled={submitting}
                          placeholder="Optional username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          value={field.value || ""}
                          onChange={(event) => field.onChange(event.target.value)}
                          disabled={submitting}
                          placeholder="user@email.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_staff"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={submitting}
                        />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="text-base font-normal cursor-pointer">
                          Staff Access
                        </FormLabel>
                        <FormDescription>
                          Grant staff/admin privileges to this user
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_superuser"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={submitting || !canAssignSuperuser}
                        />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="text-base font-normal cursor-pointer">
                          Superuser Access
                        </FormLabel>
                        <FormDescription>
                          {canAssignSuperuser
                            ? "Grant full platform-level privileges"
                            : "Only superadmin can modify this setting"}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    loading={submitting}
                  >
                    Save
                  </Button>
                </div> */}
              </form>
            </Form>
          </TabsContent>
        </Tabs>
    </DialogBox>
  );
}
