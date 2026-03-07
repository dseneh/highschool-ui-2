"use client";

import BaseDataSelect from "./base-data-select";
import { useGradeLevels } from "@/hooks/use-grade-level";
import type { DataSelectWithFirstProps } from "./types";

type GradeLevelSelectProps = DataSelectWithFirstProps;

export default function GradeLevelSelect(props: GradeLevelSelectProps) {
  return (
    <BaseDataSelect
      {...props}
      urlParamName="gradeLevel"
      useDataHook={useGradeLevels}
      title={props.title ?? "Grade Level"}
      autoSelectFirst={props.autoSelectFirst ?? false}
      showActiveOnly
    />
  );
}
