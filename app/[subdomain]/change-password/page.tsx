"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { useAuth } from "@/components/portable-auth/src/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import { Button } from "@/components/ui/button";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, authenticated, loading, refresh } = useAuth();
  const isDefaultPassword = user?.is_default_password === true;

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // If not authenticated, redirect to login
    if (!authenticated || !user) {
      router.replace("/login");
      return;
    }

    // Check if user has default password
    if (user.is_default_password !== true) {
      // If user doesn't have default password, they shouldn't be here
      // Redirect to home
      router.replace("/");
    }
  }, [authenticated, user, loading, router]);

  const handlePasswordChanged = async () => {
    // Refresh auth state to get updated user (with is_default_password=false)
    // This ensures the dashboard won't redirect back to change-password
    await refresh();
    router.replace("/");
  };

  const handleSkipForNow = () => {
    router.replace("/");
  };

//   if (loading) {
//     return (
//       <AuthLayout>
//         <div className="w-full max-w-md mx-auto space-y-4">
//           <Skeleton className="h-32 w-full" />
//           <Skeleton className="h-64 w-full" />
//         </div>
//       </AuthLayout>
//     );
//   }

  if (!authenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <AuthLayout
        title="Change Password"
    >
      <div className="w-full max-w-md mx-auto">
        {isDefaultPassword && (
          <Alert className="mb-4">
            <AlertDescription>
              <strong>Security Notice:</strong> You are using a default password. You can change it now or skip and do it later.
            </AlertDescription>
          </Alert>
        )}
           <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          {isDefaultPassword 
            ? "Please change it to secure your account."
            : "Update your password to keep your account secure"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordChangeForm
          idNumber={user.id_number}
          isDefaultPassword={isDefaultPassword}
          onSuccess={handlePasswordChanged}
        />
        {isDefaultPassword && (
          <div className="mt-3">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleSkipForNow}
            >
              Skip for now
            </Button>
          </div>
        )}
        </CardContent>
    </Card>
      </div>
    </AuthLayout>
  );
}
