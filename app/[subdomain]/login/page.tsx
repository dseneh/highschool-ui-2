"use client";

import { Suspense, useMemo, useRef, useEffect, forwardRef } from "react";
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
import { EyeIcon, EyeOffIcon } from "lucide-react";

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

  // Refs for form fields to manage focus programmatically
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

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
  const { resolvedSubdomain, isValidating } = useSubdomainValidation({
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

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle={
        resolvedSubdomain ? (
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
            />
            <span className="group-hover:text-foreground transition-colors">
              Remember for 30 days
            </span>
          </label>
          <button
            type="button"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {error && <ErrorAlert message={error} />}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isValidating || isSubmitting || loading}
          loadingText={isValidating ? "Validating workspace..." : "Signing in..."}
          disabled={isValidating}
        >
          Sign in
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}

// Reusable Password Input Component
interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ value, onChange, showPassword, onToggleVisibility, disabled = false, autoFocus = false }, ref) => {
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


