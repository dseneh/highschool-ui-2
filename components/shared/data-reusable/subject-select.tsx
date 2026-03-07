"use client";

import BaseDataSelect from "./base-data-select";
import { useSubjects } from "@/hooks/use-subject";
import type { DataSelectWithFirstProps } from "./types";

type SubjectSelectProps = DataSelectWithFirstProps;

export default function SubjectSelect(props: SubjectSelectProps) {
  return (
    <BaseDataSelect
      {...props}
      urlParamName="subject"
      useDataHook={useSubjects}
      title={props.title ?? "Subject"}
      autoSelectFirst={props.autoSelectFirst ?? false}
    />
  );
}
