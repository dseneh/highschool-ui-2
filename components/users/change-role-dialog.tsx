"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { UserDto } from "@/lib/api2/users";
import { useUsers } from "@/lib/api2/users";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { useHasRole } from "@/hooks/use-authorization";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const changeRoleSchema = z.object({
  role: z.string().min(1, "Role is required"),
});

type ChangeRoleFormData = z.infer<typeof changeRoleSchema>;

interface ChangeRoleDialogProps {
  user: UserDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ROLE_OPTIONS = [
  { value: "superadmin", label: "Super Admin", description: "Full system access" },
  { value: "admin", label: "Admin", description: "Administrative access" },
  { value: "teacher", label: "Teacher", description: "Teaching staff" },
  { value: "student", label: "Student", description: "Student account" },
  { value: "parent", label: "Parent", description: "Parent/Guardian" },
  { value: "viewer", label: "Viewer", description: "Read-only access" },
];

export function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ChangeRoleDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const usersApi = useUsers();
  const updateMutation = usersApi.updateUser();
  const canAssignSuperadmin = useHasRole("superadmin");
  const isCurrentUserTarget = !!user && user.is_current_user;
  const isSuperadminTarget = String(user?.role || "").toLowerCase() === "superadmin";

  const roleOptions = ROLE_OPTIONS.filter((option) => {
    if (option.value === "superadmin" && !canAssignSuperadmin) {
      return false;
    }
    return true;
  });

  const form = useForm<ChangeRoleFormData>({
    resolver: zodResolver(changeRoleSchema),
    defaultValues: {
      role: user?.role?.toLowerCase() || "",
    },
  });

  // Update form when user changes
  if (user && form.getValues().role !== user.role?.toLowerCase()) {
    form.reset({ role: user.role?.toLowerCase() || "" });
  }

  const handleSubmit = async (data: ChangeRoleFormData) => {
    if (!user) return;

    if (isCurrentUserTarget) {
      showToast.error("Action not allowed", "You cannot change your own role");
      return;
    }

    if (isSuperadminTarget && data.role !== "superadmin") {
      showToast.error("Action not allowed", "Super admin role cannot be changed");
      return;
    }

    if (data.role === "superadmin" && !canAssignSuperadmin) {
      showToast.error("Action not allowed", "Only superadmin can assign superadmin role");
      return;
    }

    setSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        idNumber: user.id_number,
        data: {
          role: data.role,
        },
      });
      showToast.success(
        "Role updated",
        `${user.first_name} ${user.last_name}'s role has been changed to ${data.role}`,
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user.first_name} {user.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border p-3 mb-4">
          <div className="flex-1">
            <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="outline" className="text-xs">
              {user.account_type}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Current: {user.role}
            </Badge>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={submitting || isCurrentUserTarget || isSuperadminTarget}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {isCurrentUserTarget
                      ? "You cannot change your own role from this screen."
                      : isSuperadminTarget
                        ? "Super admin role is locked and cannot be changed."
                        : "Select the new role for this user. This will affect their permissions."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <AuthButton
                roles="admin"
                disable
                type="submit"
                disabled={
                  submitting ||
                  !form.formState.isDirty ||
                  isCurrentUserTarget ||
                  isSuperadminTarget
                }
              >
                {submitting ? "Updating..." : "Update Role"}
              </AuthButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
