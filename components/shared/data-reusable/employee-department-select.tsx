"use client";

import BaseDataSelect from "./base-data-select";
import { useEmployeeDepartments } from "@/hooks/use-employee";
import type { DataSelectWithFirstProps } from "./types";
import type { EmployeeDepartmentDto } from "@/lib/api2/employee-types";

type EmployeeDepartmentSelectProps = DataSelectWithFirstProps;

export default function EmployeeDepartmentSelect(props: EmployeeDepartmentSelectProps) {
  return (
    <BaseDataSelect
      {...props}
      urlParamName="department"
      useDataHook={useEmployeeDepartments}
      title={props.title ?? "Department"}
      autoSelectFirst={props.autoSelectFirst ?? false}
      mapOptions={(data: EmployeeDepartmentDto | EmployeeDepartmentDto[]) =>
        (Array.isArray(data) ? data : [data]).map((department) => ({
          value: department.id,
          label: department.name || "Untitled",
          active: department.active,
        }))
      }
      showActiveOnly
    />
  );
}
