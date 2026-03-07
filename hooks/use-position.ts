"use client";

import { useStaff } from "@/lib/api2/staff";
import type { Position } from "@/lib/api2/staff/types";

/**
 * Hook to fetch positions
 * Wraps the staff API's getPositions for use in select components
 */
export function usePositions(params?: { status?: string }) {
  const staffApi = useStaff();
  return staffApi.getPositions(params || {});
}

/**
 * Hook to fetch a single position
 */
export function usePosition(positionId: string) {
  const staffApi = useStaff();
  return staffApi.getPosition(positionId);
}
