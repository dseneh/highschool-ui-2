"use client";

import { ALL_ROLES, STAFF_ROLES } from "@/lib/constants/roles";
import type { RoleOption } from "@/lib/constants/roles";

/**
 * Static hook that provides role options for BaseDataSelect.
 * @param scope - "staff" returns only staff-applicable roles, "all" returns all roles.
 */
export function useRoles(scope: "staff" | "all" = "staff") {
  const data: RoleOption[] = scope === "staff" ? STAFF_ROLES : ALL_ROLES;
  return {
    data,
    isLoading: false,
  };
}
