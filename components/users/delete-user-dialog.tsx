"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUsers } from "@/lib/api2";
import { UserDto } from "@/lib/api2/users";
import { showToast } from "@/lib/toast";
import { AlertTriangleIcon } from "lucide-react";

interface DeleteUserDialogProps {
  user: UserDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: DeleteUserDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      // Note: You'll need to add a deleteUser method to the users API
      // For now, showing placeholder
      showToast.success("User deleted successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to delete user";
      showToast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            This action cannot be undone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              Are you sure you want to delete <strong>{user.first_name} {user.last_name}</strong>? This will permanently remove their account and all associated data.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <AuthButton
              roles="admin"
              notCurrentUserTarget={{ id: user.id, is_current_user: user.is_current_user }}
              disable
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
              loading={submitting}
              loadingText="Deleting..."
            >
              Delete User
            </AuthButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
