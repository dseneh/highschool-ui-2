/**
 * Centralized role definitions for the application.
 * Matches backend roles defined in common/status.py.
 */

export type RoleValue =
  | "superadmin"
  | "admin"
  | "teacher"
  | "registrar"
  | "data_entry"
  | "accountant"
  | "student"
  | "parent"
  | "viewer";

export interface RoleOption {
  value: RoleValue;
  label: string;
  description?: string;
}

/**
 * All roles in the system, ordered by privilege level (highest first).
 */
export const ALL_ROLES: RoleOption[] = [
  { value: "superadmin", label: "Super Admin", description: "Full system access" },
  { value: "admin", label: "Admin", description: "Administrative access" },
  { value: "registrar", label: "Registrar", description: "Academic configuration" },
  { value: "accountant", label: "Accountant", description: "Financial access" },
  { value: "teacher", label: "Teacher", description: "Teaching staff" },
  { value: "data_entry", label: "Data Entry", description: "Data entry access" },
  { value: "student", label: "Student", description: "Student account" },
  { value: "parent", label: "Parent", description: "Parent/Guardian" },
  { value: "viewer", label: "Viewer", description: "Read-only access" },
];

/**
 * Roles applicable to staff/employee accounts (excludes student, parent, superadmin).
 */
export const STAFF_ROLES: RoleOption[] = ALL_ROLES.filter(
  (r) => !["superadmin", "student", "parent"].includes(r.value)
);

/**
 * Rank map for role-based permission checks (higher = more privileged).
 */
export const ROLE_RANK: Record<string, number> = {
  superadmin: 100,
  admin: 90,
  registrar: 70,
  accountant: 60,
  teacher: 50,
  data_entry: 40,
  parent: 20,
  student: 10,
  viewer: 30,
};

/**
 * Get a display label for a role value.
 */
export function getRoleLabel(role: string): string {
  return ALL_ROLES.find((r) => r.value === role)?.label ?? role;
}
