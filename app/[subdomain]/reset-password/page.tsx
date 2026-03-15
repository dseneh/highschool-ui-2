"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  CheckCircle2,
  TriangleAlert,
  ArrowLeft,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { djangoPublicApiClient } from "@/lib/api2/http-clients";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

export default function TenantResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <TenantResetPasswordContent />
    </Suspense>
  );
}

function TenantResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantSubdomain = useTenantSubdomain();

  const uid = useMemo(() => searchParams?.get("uid") ?? "", [searchParams]);
  const token = useMemo(() => searchParams?.get("token") ?? "", [searchParams]);
  const workspaceFromQuery = useMemo(
    () => searchParams?.get("workspace")?.trim() ?? "",
    [searchParams],
  );

  const resolvedWorkspace = useMemo(() => {
    return tenantSubdomain?.trim() || workspaceFromQuery || "";
  }, [tenantSubdomain, workspaceFromQuery]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const missingLinkParams = !uid || !token;

  const passwordValidationError = useMemo(() => {
    if (!newPassword) return null;
    if (newPassword.length < 8)
      return "Password must be at least 8 characters long.";
    if (!/[A-Za-z]/.test(newPassword))
      return "Password must contain at least one letter.";
    if (!/[0-9]/.test(newPassword))
      return "Password must contain at least one number.";
    return null;
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (missingLinkParams) {
      setErrorMessage(
        "This reset link is incomplete. Please request a new one.",
      );
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    if (passwordValidationError) {
      setErrorMessage(passwordValidationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await djangoPublicApiClient.post(
        "/auth/password/reset",
        {
          uid,
          token,
          new_password: newPassword,
        },
        {
          headers: resolvedWorkspace
            ? { "x-tenant": resolvedWorkspace }
            : undefined,
        },
      );

      const detail = response?.data?.detail;
      setSuccessMessage(
        typeof detail === "string"
          ? detail
          : "Your password has been reset successfully. You can now sign in.",
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErrorMessage(detail.join(" "));
      } else if (typeof detail === "string") {
        setErrorMessage(detail);
      } else {
        setErrorMessage(
          "Unable to reset password right now. Please request a new reset link.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        missingLinkParams
          ? "This reset link appears invalid or incomplete."
          : "Enter a new password for your account."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label
            htmlFor="newPassword"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            New password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="h-11 pr-10"
              placeholder="Enter a new password"
              disabled={isSubmitting || !!successMessage || missingLinkParams}
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? (
                <EyeOffIcon className="size-5" />
              ) : (
                <EyeIcon className="size-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="confirmPassword"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            Confirm new password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="h-11 pr-10"
              placeholder="Confirm your new password"
              disabled={isSubmitting || !!successMessage || missingLinkParams}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="size-5" />
              ) : (
                <EyeIcon className="size-5" />
              )}
            </button>
          </div>
        </div>

        {passwordValidationError && !errorMessage && !successMessage && (
          <InlineMessage variant="warning" message={passwordValidationError} />
        )}

        {errorMessage && (
          <InlineMessage variant="error" message={errorMessage} />
        )}

        {successMessage && (
          <InlineMessage variant="success" message={successMessage} />
        )}

        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isSubmitting}
            loadingText="Resetting..."
            disabled={isSubmitting || !!successMessage || missingLinkParams}
          >
            Reset password
          </Button>

          <Button
            type="button"
            className="w-full "
            variant="outline"
            size="lg"
            disabled={isSubmitting}
            onClick={goToLogin}
            icon={<ArrowLeft className="size-4" />}
          >
            Back to login
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

function InlineMessage({
  variant,
  message,
}: {
  variant: "success" | "error" | "warning";
  message: string;
}) {
  if (variant === "success") {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2.5">
        <CheckCircle2 className="size-4 mt-0.5 text-emerald-600" />
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </p>
      </div>
    );
  }

  if (variant === "warning") {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2.5">
        <TriangleAlert className="size-4 mt-0.5 text-amber-600" />
        <p className="text-sm text-amber-700 dark:text-amber-300">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
      <TriangleAlert className="size-4 mt-0.5 text-destructive" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
