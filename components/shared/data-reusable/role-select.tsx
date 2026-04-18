"use client";

import BaseDataSelect from "./base-data-select";
import { useRoles } from "@/hooks/use-roles";
import type { DataSelectWithFirstProps } from "./types";
import type { RoleOption } from "@/lib/constants/roles";

type RoleSelectProps = DataSelectWithFirstProps & {
  /** "staff" excludes superadmin/student/parent; "all" includes every role. */
  scope?: "staff" | "all";
};

export default function RoleSelect({ scope = "staff", ...props }: RoleSelectProps) {
  return (
    <BaseDataSelect
      {...props}
      urlParamName="role"
      useDataHook={useRoles}
      hookArgs={[scope]}
      title={props.title ?? "Role"}
      autoSelectFirst={props.autoSelectFirst ?? false}
      mapOptions={(data: RoleOption | RoleOption[]) =>
        (Array.isArray(data) ? data : [data]).map((role) => ({
          value: role.value,
          label: role.label,
        }))
      }
    />
  );
}
