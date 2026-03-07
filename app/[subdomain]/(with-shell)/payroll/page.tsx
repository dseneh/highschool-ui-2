"use client";

import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { PayrollsContent } from "@/components/payrolls/content";

export default function PayrollPage() {
  // Keep subdomain context available for future API wiring
  useTenantSubdomain();

  return (
    <>
      <PayrollsContent />
    </>
  );
}
