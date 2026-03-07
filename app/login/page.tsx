"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SSOButton } from "@/components/auth/sso-button";
import { TenantSelectionDialog } from "@/components/auth/tenant-selection-dialog";
import { TENANT_STORAGE_KEY } from "@/lib/api2/client";
import { getRootDomain } from "@/lib/tenant";
import { searchUser } from "@/lib/api2/public-service";
import type { UserSearchResult } from "@/lib/api2/public-types";
import { ChevronRight } from "lucide-react";

const SEARCH_KEY = "ezy:lastSearch";

/**
 * Main Login Page - Tenant Selection/Search
 * 
 * This page is for FINDING the user's tenant (subdomain).
 * It searches for users by email/phone/ID and redirects to their tenant's login page.
 * 
 * Flow:
 * 1. User enters email, phone, or ID number
 * 2. System searches across all tenants
 * 3. If found, redirect to: {subdomain}.domain.com/login
 * 4. User then logs in with username (email/ID/username) + password
 * 
 * The actual authentication happens on the subdomain login page.
 */

/**
 * Detect the type of input (email, phone, or ID number)
 */
function detectInputType(input: string): "email" | "phone" | "id_number" | null {
  const trimmed = input.trim();
  
  // Email: contains @
  if (trimmed.includes("@")) return "email";
  
  // Phone: contains only digits, spaces, dashes, parentheses, plus sign
  if (/^[\d\s\-\(\)\+]+$/.test(trimmed) && trimmed.replace(/\D/g, "").length >= 7) {
    return "phone";
  }
  
  // ID Number: alphanumeric
  if (/^[a-zA-Z0-9]+$/.test(trimmed)) return "id_number";
  
  return null;
}

export default function MainLoginPage() {
  return (
    <Suspense fallback={null}>
      <MainLoginContent />
    </Suspense>
  );
}

function MainLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [showTenantDialog, setShowTenantDialog] = useState(false);

  const host = typeof window !== "undefined" ? window.location.host : "";
  const baseDomain = useMemo(() => getRootDomain(host), [host]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(SEARCH_KEY) : "";
    if (stored && searchInput === "") {
      // setSearchInput(stored);
    }
  }, [searchInput]);

  useEffect(() => {
    if (!host) return;
    const parts = host.split(".");
    const isLocal = host === "localhost" || host.endsWith(".localhost");
    const sub = isLocal
      ? parts.length > 2
        ? parts[0]
        : null
      : parts.length > 2
        ? parts[0]
        : null;
    if (sub) return;
  }, [host, router, searchParams]);

  const redirectToTenant = (subdomain: string, searchValue?: string) => {
    if (typeof window === "undefined") return;
    const valueToStore = searchValue || searchInput.trim();
    localStorage.setItem(SEARCH_KEY, valueToStore);
    localStorage.setItem(TENANT_STORAGE_KEY, subdomain);
    const protocol = window.location.protocol;
    const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
    const target = new URL(`${protocol}//${subdomain}.${baseDomain}${port}/login`);
    if (valueToStore) {
      target.searchParams.set("prefill", valueToStore);
    }
    window.location.href = target.toString();
  };

  const handleTenantSelect = (result: UserSearchResult) => {
    redirectToTenant(result.tenant.schema_name);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searching) return;
    
    setError(null);
    const trimmed = searchInput.trim();
    
    if (!trimmed) {
      setError("Please enter your email, phone number, or ID number.");
      return;
    }

    const inputType = detectInputType(trimmed);
    if (!inputType) {
      setError("Invalid format. Please enter a valid email, phone number, or ID number.");
      return;
    }

    setSearching(true);

    try {
      const searchParams = {
        email: inputType === "email" ? trimmed : null,
        phone: inputType === "phone" ? trimmed.replace(/\D/g, "") : null,
        id_number: inputType === "id_number" ? trimmed : null,
      };

      const response = await searchUser(searchParams);

      if (response.count === 0) {
        setError("No account found. Please check your information and try again.");
        setSearching(false);
        return;
      }

      if (response.count === 1) {
        // Single result - redirect immediately
        const result = response.results[0];
        redirectToTenant(result.tenant.schema_name, trimmed);
        return;
      }

      // Multiple results - show selection dialog
      setSearchResults(response.results);
      setShowTenantDialog(true);
      setSearching(false);
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching. Please try again.");
      setSearching(false);
    }
  };

  return (
    <>
      <AuthLayout
        title="Welcome back!"
        subtitle="Enter your email, phone number, or ID number to get started."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="searchInput" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Email, Phone, or ID Number
            </Label>
            <Input
              id="searchInput"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="you@school.com, +1234567890, or ID123"
              required
              autoComplete="username"
              autoFocus
              className="h-11"
              disabled={searching}
            />
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-destructive shrink-0">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v5M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : null}

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            loading={searching}
            loadingText="Searching..."
            iconRight={<ChevronRight />}
          >
            Continue
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <SSOButton disabled={searching} className="w-full" />
        </form>
      </AuthLayout>

      <TenantSelectionDialog
        open={showTenantDialog}
        onOpenChange={setShowTenantDialog}
        results={searchResults}
        onSelectTenant={handleTenantSelect}
      />
    </>
  );
}
