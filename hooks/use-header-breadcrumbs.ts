"use client";

import { useEffect } from "react";
import { useDashboardStore, type HeaderBreadcrumbItem } from "@/store/dashboard-store";

/**
 * Set page-level breadcrumbs for the global dashboard header.
 * Breadcrumbs are cleared automatically on unmount.
 */
export function useHeaderBreadcrumbs(items: HeaderBreadcrumbItem[] | null) {
  const setBreadcrumbs = useDashboardStore((state) => state.setBreadcrumbs);
  const clearBreadcrumbs = useDashboardStore((state) => state.clearBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs(items);
    return () => {
      clearBreadcrumbs();
    };
  }, [items, setBreadcrumbs, clearBreadcrumbs]);
}
