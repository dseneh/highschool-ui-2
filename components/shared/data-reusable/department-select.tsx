"use client";

import BaseDataSelect from "./base-data-select";
import { useDepartments } from "@/hooks/use-department";
import type { DataSelectWithFirstProps } from "./types";
import type { Department } from "@/lib/api2/staff/types";

type DepartmentSelectProps = DataSelectWithFirstProps;

export default function DepartmentSelect(props: DepartmentSelectProps) {
  return (
    <BaseDataSelect
      {...props}
      urlParamName="department"
      useDataHook={useDepartments}
      title={props.title ?? "Department"}
      autoSelectFirst={props.autoSelectFirst ?? false}
      mapOptions={(data: Department | Department[]) =>
        (Array.isArray(data) ? data : [data]).map((department) => ({
          value: department.id,
          label: department.name || "Untitled",
        }))
      }
      showActiveOnly
    />
  );
}
