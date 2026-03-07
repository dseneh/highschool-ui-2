"use client";

import BaseDataSelect from "./base-data-select";
import { useSections } from "@/hooks/use-section";
import type { DataSelectWithFirstProps } from "./types";

type SectionSelectProps = DataSelectWithFirstProps & {
  gradeLevelId: string;
};

export default function SectionSelect({
  gradeLevelId,
  ...props
}: SectionSelectProps) {
  return (
    <BaseDataSelect
      {...props}
      urlParamName="section"
      useDataHook={useSections}
      hookArgs={[gradeLevelId ?? ""]}
      enabled={!!gradeLevelId}
      title={props.title ?? "Section"}
      autoSelectFirst={props.autoSelectFirst ?? false}
    />
  );
}
