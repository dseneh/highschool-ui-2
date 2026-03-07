import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { getTenantInfo } from "@/lib/api2/tenant-service";
import { buildDomainUrlFromWindow } from "@/lib/tenant/index";

interface UseSubdomainValidationOptions {
  subdomain: string | undefined;
  onInvalidSubdomain?: () => void;
}

interface UseSubdomainValidationReturn {
  resolvedSubdomain: string;
  isValidating: boolean;
  tenantName: string | null;
  redirectToRoot: () => void;
}

/**
 * Hook to validate subdomain and handle invalid/inactive tenants
 * Ensures subdomain is valid before allowing login
 */
export function useSubdomainValidation({
  subdomain,
  onInvalidSubdomain,
}: UseSubdomainValidationOptions): UseSubdomainValidationReturn {
  const [isValidating, setIsValidating] = useState(true);
  const [tenantName, setTenantName] = useState<string | null>(null);
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

  // Redirect to root login page
  const redirectToRoot = useCallback(() => {
    if (typeof window === "undefined" || isRedirectingRef.current) return;
    
    isRedirectingRef.current = true;
    const mainDomainUrl = buildDomainUrlFromWindow("/login");
    window.location.replace(mainDomainUrl);
  }, []);

  // Validate subdomain on mount
  useEffect(() => {
    if (!resolvedSubdomain) {
      redirectToRoot();
      return;
    }

    let active = true;

    const validateSubdomain = async () => {
      setIsValidating(true);
      
      try {
        const tenantInfo = await getTenantInfo(resolvedSubdomain);

        if (!active) return;

        // Check if tenant is inactive or deleted
        if (tenantInfo?.active === false || tenantInfo?.status === "deleted") {
          onInvalidSubdomain?.();
          redirectToRoot();
          return;
        }

        setTenantName(tenantInfo?.name || null);
      } catch {
        if (!active) return;
        onInvalidSubdomain?.();
        redirectToRoot();
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
    redirectToRoot,
  };
}
