import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/portable-auth/src/client";
import { TENANT_STORAGE_KEY } from "@/lib/api2/client";
import { getErrorMessage } from "@/lib/utils/error-handler";

const EMAIL_KEY = "ezyschool:lastEmail";

interface UseTenantLoginFormOptions {
  workspace: string;
  redirectUrl: string;
  initialUsername?: string;
}

interface UseTenantLoginFormReturn {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  remember: boolean;
  setRemember: (value: boolean) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  error: string | null;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * Hook to manage tenant login form state and submission
 * Handles authentication, local storage, and redirects
 */
export function useTenantLoginForm({
  workspace,
  redirectUrl,
  initialUsername = "",
}: UseTenantLoginFormOptions): UseTenantLoginFormReturn {
  const router = useRouter();
  const { login, authenticated, tenant } = useAuth();

  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (authenticated && tenant?.workspace === workspace) {
      router.replace(redirectUrl);
    }
  }, [authenticated, redirectUrl, workspace, router, tenant?.workspace]);

  // Load stored username on mount
  useEffect(() => {
    if (initialUsername || typeof window === "undefined") return;
    
    const stored = localStorage.getItem(EMAIL_KEY);
    if (stored) setUsername(stored);
  }, [initialUsername]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      setError(null);

      try {
        const trimmedUsername = username.trim();
        const res: any = await login({
          workspace,
          credentials: { username: trimmedUsername, password },
        });

        if (!res.ok) {
          setError(getErrorMessage(res.error));
          return;
        }

        // Handle remember me
        if (typeof window !== "undefined") {
          if (remember) {
            localStorage.setItem(EMAIL_KEY, trimmedUsername);
          } else {
            localStorage.removeItem(EMAIL_KEY);
          }
          
          // Store tenant workspace
          if (workspace) {
            localStorage.setItem(TENANT_STORAGE_KEY, workspace);
          }
        }

        router.replace(redirectUrl);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, username, password, remember, workspace, login, router, redirectUrl]
  );

  return {
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
  };
}
