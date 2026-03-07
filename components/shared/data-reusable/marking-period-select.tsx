"use client";

import BaseDataSelect from "./base-data-select";
import {
  useAllMarkingPeriods,
  useMarkingPeriods,
} from "@/hooks/use-marking-period";
import type { DataSelectWithCurrentProps } from "./types";

type MarkingPeriodSelectProps = DataSelectWithCurrentProps & {
  semesterId?: string;
};

export default function MarkingPeriodSelect({
  semesterId,
  ...props
}: MarkingPeriodSelectProps) {
  const hook = semesterId ? useMarkingPeriods : useAllMarkingPeriods;

  return (
    <BaseDataSelect
      {...props}
      urlParamName="markingPeriod"
      useDataHook={hook}
      hookArgs={[semesterId ?? ""]}
      enabled={semesterId ? !!semesterId : true}
      title={props.title ?? "Marking Period"}
      autoSelectCurrent={props.autoSelectCurrent ?? true}
      autoSelectFirst
    />
  );
}
