import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { getTenantInfo } from "@/lib/api2/tenant-service";
import { buildDomainUrlFromWindow } from "@/lib/tenant/index";
import { getErrorMessage } from "@/lib/utils";

interface UseSubdomainValidationOptions {
  subdomain: string | undefined;
  onInvalidSubdomain?: () => void;
}

interface UseSubdomainValidationReturn {
  resolvedSubdomain: string;
  isValidating: boolean;
  tenantName: string | null;
  validationError: string | null;
  redirectToRoot: () => void;
}

/**
 * Hook to validate subdomain and handle invalid/inactive tenants
 * Returns validation error instead of redirecting - lets UI disable the login button
 * Only redirects if no subdomain is detected (missing subdomain).
 */
export function useSubdomainValidation({
  subdomain,
  onInvalidSubdomain,
}: UseSubdomainValidationOptions): UseSubdomainValidationReturn {
  const [isValidating, setIsValidating] = useState(true);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const isRedirectingRef = useRef(false);

  // Resolve subdomain from param or window.location
  const resolvedSubdomain = useMemo(() => {
    if (subdomain) return subdomain;
    if (typeof window === "undefined") return "";

    const hostSubdomain = window.location.hostname.split(".")[0];
    if (hostSubdomain && hostSubdomain !== "localhost" && hostSubdomain !== "www") {
      return hostSubdomain;
    }
    return "";
  }, [subdomain]);

  // Redirect to root login page (only for missing subdomain)
  const redirectToRoot = useCallback(() => {
    if (typeof window === "undefined" || isRedirectingRef.current) return;
    
    isRedirectingRef.current = true;
    const mainDomainUrl = buildDomainUrlFromWindow("/login");
    window.location.replace(mainDomainUrl);
  }, []);

  // Validate subdomain on mount
  useEffect(() => {
    if (!resolvedSubdomain) {
      // No subdomain at all - redirect to root
      redirectToRoot();
      return;
    }

    let active = true;

    const validateSubdomain = async () => {
      setIsValidating(true);
      setValidationError(null);
      
      try {
        const tenantInfo = await getTenantInfo(resolvedSubdomain);

        if (!active) return;

        // Check if tenant is inactive or deleted
        if (tenantInfo?.active === false || tenantInfo?.status === "deleted") {
          const errorMsg = "This workspace is no longer active. Please switch to your active workspace.";
          setValidationError(errorMsg);
          onInvalidSubdomain?.();
          return;
        }

        setTenantName(tenantInfo?.name || null);
      } catch (error) {
        if (!active) return;
        // Tenant not found or API error
        const errorMsg = `Workspace "${resolvedSubdomain}" not found. Please check and try again.`;
        setValidationError(getErrorMessage(error));
        onInvalidSubdomain?.();
      } finally {
        if (active) {
          setIsValidating(false);
        }
      }
    };

    validateSubdomain();

    return () => {
      active = false;
    };
  }, [resolvedSubdomain, redirectToRoot, onInvalidSubdomain]);

  return {
    resolvedSubdomain,
    isValidating,
    tenantName,
    validationError,
    redirectToRoot,
  };
}
