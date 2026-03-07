"use client";

import { useQueryState } from "nuqs";
import { SelectField } from "@/components/ui/select-field";
import { Label } from "@/components/ui/label";

interface UserFiltersProps {
  currentSubdomain?: string;
}

const scopeItems = [
  { value: "current", label: "Current Tenant" },
  { value: "global", label: "Global Users" },
];

export function UserFilters({ currentSubdomain }: UserFiltersProps) {
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [role, setRole] = useQueryState("role", { defaultValue: "" });
  const [isActive, setIsActive] = useQueryState("is_active", { defaultValue: "" });
  const [scope, setScope] = useQueryState("scope", {
    defaultValue: currentSubdomain && currentSubdomain !== "admin" ? "current" : "global",
  });

  const handleSelectChange = (setter: any) => (value: unknown) => {
    void setter(String(value));
  };

  const hasActiveFilters = search || role || isActive || (scope !== (currentSubdomain && currentSubdomain !== "admin" ? "current" : "global"));

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scope Selector */}
        <div className="space-y-2">
          <Label>User Scope</Label>
          <SelectField
            value={scope}
            onValueChange={handleSelectChange(setScope)}
            items={scopeItems}
            placeholder="Select scope"
          />
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label>Search</Label>
          <input
            type="text"
            placeholder="Name, email, ID..."
            value={search}
            onChange={(e) => void setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
          />
        </div>

        {/* Role Filter */}
        <div className="space-y-2">
          <Label>Role</Label>
          <SelectField
            value={role}
            onValueChange={handleSelectChange(setRole)}
            items={[
              { value: "", label: "All Roles" },
              { value: "STUDENT", label: "Student" },
              { value: "TEACHER", label: "Teacher" },
              { value: "PARENT", label: "Parent" },
              { value: "ADMIN", label: "Admin" },
              { value: "VIEWER", label: "Viewer" },
            ]}
            placeholder="All Roles"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <SelectField
            value={isActive}
            onValueChange={handleSelectChange(setIsActive)}
            items={[
              { value: "", label: "All Status" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            placeholder="All Status"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              void setSearch("");
              void setRole("");
              void setIsActive("");
              void setScope(currentSubdomain && currentSubdomain !== "admin" ? "current" : "global");
            }}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
