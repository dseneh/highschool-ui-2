"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUsers } from "@/lib/api2";
import { showToast } from "@/lib/toast";
import { Eye, EyeOff } from "lucide-react";

interface PasswordChangeFormProps {
  idNumber: string;
  isDefaultPassword?: boolean;
  onSuccess?: () => void;
}

export function PasswordChangeForm({ idNumber, onSuccess }: PasswordChangeFormProps) {
  const router = useRouter();
  const { updateUserPassword } = useUsers();

  const update = updateUserPassword();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setSubmitting(true);

    try {
      await update.mutateAsync({
        id: idNumber,
        data: {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
      });

      showToast.success("Password changed successfully");
      
      if (onSuccess) {
        onSuccess();
      } else {
        // If no custom success handler, redirect to dashboard
        router.push("/");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 
                          err?.response?.data?.current_password?.[0] ||
                          err?.response?.data?.new_password?.[0] ||
                          err?.message || 
                          "Failed to change password";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // <Card className="w-full max-w-md mx-auto">
    //   <CardHeader>
    //     <CardTitle>Change Password</CardTitle>
    //     <CardDescription>
    //       {isDefaultPassword 
    //         ? "You are using a default password. Please change it to secure your account."
    //         : "Update your password to keep your account secure"
    //       }
    //     </CardDescription>
    //   </CardHeader>
    //   <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* {isDefaultPassword && (
            <Alert>
              <AlertDescription>
                Your temporary password is your ID number. Please change it immediately.
              </AlertDescription>
            </Alert>
          )} */}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                disabled={submitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                disabled={submitting}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Must be at least 6 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={submitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            loading={submitting}
            loadingText="Changing password..."
          >
            Change Password
          </Button>
        </form>
    //   </CardContent>
    // </Card>
  );
}
