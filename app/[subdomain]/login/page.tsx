"use client";

import { Suspense, useMemo, forwardRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useAuth } from "@/components/portable-auth/src/client";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { useSubdomainValidation } from "@/hooks/use-subdomain-validation";
import { useTenantLoginForm } from "@/hooks/use-tenant-login-form";
import { buildDomainUrlFromWindow } from "@/lib/tenant/index";
import { ArrowLeft, EyeIcon, EyeOffIcon, TriangleAlert } from "lucide-react";
import { LoadingSkeleton } from "./_components/loading-skeleton";
import { djangoPublicApiClient } from "@/lib/api2/http-clients";

export default function TenantLoginPage() {
  return (
    <Suspense fallback={null}>
      <TenantLoginContent />
    </Suspense>
  );
}

function TenantLoginContent() {
  const searchParams = useSearchParams();
  const subdomain = useTenantSubdomain();
  const { loading } = useAuth();

  const [showForgotForm, setShowForgotForm] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Get redirect URL and prefill username from query params
  const redirectUrl = useMemo(
    () => searchParams?.get("redirectUrl") ?? "/",
    [searchParams]
  );
  const prefillUsername = useMemo(
    () => searchParams?.get("prefill")?.trim() ?? "",
    [searchParams]
  );

  // Validate subdomain and handle redirects
  const { resolvedSubdomain, isValidating, validationError } = useSubdomainValidation({
    subdomain,
  });

  // Manage form state and submission
  const {
    username,
    setUsername,
    password,
    setPassword,
    remember,
    setRemember,
    showPassword,
    toggleShowPassword,
    error,
    isSubmitting,
    handleSubmit,
  } = useTenantLoginForm({
    workspace: resolvedSubdomain,
    redirectUrl,
    initialUsername: prefillUsername,
  });

  // Manage focus based on username availability
  // useEffect(() => {
  //   // Only manage focus after validation is complete
  //   if (isValidating) return;

  //   if (username && passwordRef.current) {
  //     passwordRef.current.focus();
  //   } else if (!username && usernameRef.current) {
  //     usernameRef.current.focus();
  //   }
  // }, [username]);

  const handleChangeWorkspace = () => {
    const mainDomainUrl = buildDomainUrlFromWindow("/login");
    window.location.href = mainDomainUrl;
  };

  const openForgotForm = useCallback(() => {
    setShowForgotForm(true);
    setForgotError(null);
    setForgotSuccess(null);
    setForgotIdentifier(username.trim() || prefillUsername);
  }, [username, prefillUsername]);

  const handleBackToLogin = useCallback(() => {
    setShowForgotForm(false);
    setForgotError(null);
    setForgotSuccess(null);
  }, []);

  const handleForgotSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const identifier = forgotIdentifier.trim();
      if (!identifier) {
        setForgotError("Please enter your email, school ID, or username.");
        return;
      }

      setIsSendingReset(true);
      setForgotError(null);
      setForgotSuccess(null);

      try {
        const response = await djangoPublicApiClient.post(
          "/auth/password/forgot",
          { user_identifier: identifier },
          {
            headers: resolvedSubdomain ? { "x-tenant": resolvedSubdomain } : undefined,
          }
        );

        const data = response.data;
        setForgotSuccess(
          data?.detail ||
            "If a matching account exists, we sent password reset instructions to its email address."
        );
      } catch (err: any) {
        const detail = err?.response?.data?.detail;
        if (detail) {
          const message = Array.isArray(detail)
            ? detail.join(" ")
            : typeof detail === "string"
              ? detail
              : "Unable to process your request. Please try again.";
          setForgotError(message);
        } else {
          setForgotError("Network error. Please check your connection and try again.");
        }
      } finally {
        setIsSendingReset(false);
      }
    },
    [forgotIdentifier, resolvedSubdomain]
  );

  return (
    <AuthLayout
      title={showForgotForm ? "Forgot your password?" : "Welcome back!"}
      subtitle={
        validationError ? (
          "Unable to access workspace"
        ) : showForgotForm ? (
          <small>Enter your email, school ID, or username and we will send reset instructions.</small>
        ) : resolvedSubdomain ? (
          <span>
            Sign in to your{" "}
            <span className="text-primary font-semibold">{resolvedSubdomain}</span> account
          </span>
        ) : (
          "Loading workspace..."
        )
      }
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Not your workspace?{" "}
          <button
            type="button"
            onClick={handleChangeWorkspace}
            className="font-medium hover:cursor-pointer text-primary hover:underline inline-flex items-center gap-1"
          >
            Switch workspace
          </button>
        </p>
      }
    >
      {validationError ? (
        <WorkspaceErrorState 
          error={validationError}
          subdomain={resolvedSubdomain}
          onSwitchWorkspace={handleChangeWorkspace}
        />
      ) : isValidating ? (
        <LoadingSkeleton />
      ) : (
        <div className="overflow-hidden">
          <div
            className="flex w-[200%] p-1 transition-transform duration-500 ease-out"
            style={{ transform: showForgotForm ? "translateX(-50%)" : "translateX(0%)" }}
          >
            <div className="w-1/2 pr-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email, School ID or Username
                  </Label>
                  <Input
                    // ref={usernameRef}
                    autoFocus
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="you@school.com, ID123, or your username"
                    required
                    autoComplete="username"
                    className="h-11"
                    disabled={isValidating}
                  />
                </div>

                <PasswordInput
                  // ref={passwordRef}
                  // autoFocus={!isValidating && !!username}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPassword={showPassword}
                  onToggleVisibility={toggleShowPassword}
                  disabled={isValidating}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none group">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(v) => setRemember(v === true)}
                      disabled={isValidating}
                    />
                    <span className="group-hover:text-foreground transition-colors">
                      Remember for 30 days
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={openForgotForm}
                    disabled={isValidating}
                  >
                    Forgot password?
                  </button>
                </div>

                {error && <ErrorAlert message={error} />}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isSubmitting || loading}
                  loadingText={"Signing in..."}
                  disabled={isValidating}
                >
                  Sign in
                </Button>
              </form>
            </div>

            <div className="w-1/2 pl-1">
              <form onSubmit={handleForgotSubmit} className="space-y-5">

                <div className="space-y-1.5">
                  <Label htmlFor="forgotIdentifier" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email, School ID or Username
                  </Label>
                  <Input
                    id="forgotIdentifier"
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="you@school.com, ID123, or your username"
                    required
                    autoComplete="username"
                    className="h-11"
                    disabled={isValidating || isSendingReset}
                  />
                </div>

                {forgotError && <ErrorAlert message={forgotError} />}

                {forgotSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2.5">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">{forgotSuccess}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isSendingReset}
                  loadingText={"Sending..."}
                  disabled={isValidating || isSendingReset}
                >
                  Send reset instructions
                </Button>
                <Button
                  type="button"
                  className="w-full -mt-2"
                  variant="outline"
                  size="lg"
                  disabled={isValidating || isSendingReset}
                  onClick={handleBackToLogin}
                  icon={<ArrowLeft className="size-4" />}
                >
                  Back to login
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

// Loading Skeleton Component


// Workspace Error State Component
interface WorkspaceErrorStateProps {
  error: string;
  subdomain: string;
  onSwitchWorkspace: () => void;
}

function WorkspaceErrorState({ error, subdomain, onSwitchWorkspace }: WorkspaceErrorStateProps) {
  return (
    <div className="space-y-3">
      {/* Error Icon and Message */}
      <div className="flex flex-col items-center text-center space-y-4 py-2">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <TriangleAlert className="size-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Workspace Not Available
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error}
          </p>
        </div>
      </div>

      {/* Subdomain Info Card */}
      {subdomain && (
        <div className="rounded-lg border bg-muted/30 px-4 py-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Attempted Workspace
          </p>
          <p className="text-sm font-mono text-foreground">
            {subdomain}
          </p>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={onSwitchWorkspace}
        className="w-full"
        size="lg"
        variant="default"
      >
        Switch to Available Workspace
      </Button>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Need help?{" "}
          <a 
            href="#" 
            className="text-primary hover:underline font-medium"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

// Reusable Password Input Component
interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  disabled?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ value, onChange, showPassword, onToggleVisibility, disabled = false }, ref) => {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Password
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            id="password"
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            className="h-11 pr-10"
            disabled={disabled}
            // autoFocus={autoFocus}
          />
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </button>
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

// Reusable Error Alert Component
interface ErrorAlertProps {
  message: string;
}

function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-destructive shrink-0">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v5M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}


