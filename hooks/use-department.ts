"use client";

import { useStaff } from "@/lib/api2/staff";
import type { Department } from "@/lib/api2/staff/types";

/**
 * Hook to fetch departments
 * Wraps the staff API's getDepartments for use in select components
 */
export function useDepartments(params?: { status?: string }) {
  const staffApi = useStaff();
  return staffApi.getDepartments(params || {});
}

/**
 * Hook to fetch a single department
 */
export function useDepartment(departmentId: string) {
  const staffApi = useStaff();
  return staffApi.getDepartment(departmentId);
}
