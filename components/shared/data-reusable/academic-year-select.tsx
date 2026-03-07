"use client";

import BaseDataSelect from "./base-data-select";
import { useAcademicYears } from "@/hooks/use-academic-year";
import type { DataSelectBaseProps } from "./types";

type AcademicYearSelectProps = DataSelectBaseProps & {
  autoSelectCurrent?: boolean;
  autoSelectFirst?: boolean;
};

export default function AcademicYearSelect(props: AcademicYearSelectProps) {
  return (
    <BaseDataSelect
      {...props}
      urlParamName="year"
      useDataHook={useAcademicYears}
      title={props.title ?? "Academic Year"}
      autoSelectCurrent={props.autoSelectCurrent ?? true}
      autoSelectFirst={props.autoSelectFirst ?? false}
      currentKey="current"
    />
  );
}
