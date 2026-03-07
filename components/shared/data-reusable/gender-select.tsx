"use client";

import BaseDataSelect from "./base-data-select";
import { useGenders } from "@/hooks/use-gender";
import type { DataSelectWithFirstProps } from "./types";

type GenderSelectProps = DataSelectWithFirstProps;

export default function GenderSelect(props: GenderSelectProps) {
  return (
    <BaseDataSelect
      {...props}
      urlParamName="gender"
      useDataHook={useGenders}
      title={props.title ?? "Gender"}
      autoSelectFirst={props.autoSelectFirst ?? false}
    />
  );
}
