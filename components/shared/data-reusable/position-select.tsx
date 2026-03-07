"use client";

import BaseDataSelect from "./base-data-select";
import { usePositions } from "@/hooks/use-position";
import type { DataSelectWithFirstProps } from "./types";
import type { Position } from "@/lib/api2/staff/types";

type PositionSelectProps = DataSelectWithFirstProps;

export default function PositionSelect(props: PositionSelectProps) {
  return (
    <BaseDataSelect
      {...props}
      urlParamName="position"
      useDataHook={usePositions}
      title={props.title ?? "Position"}
      autoSelectFirst={props.autoSelectFirst ?? false}
      mapOptions={(data: Position[]) =>
        data.map((position) => ({
          value: position.id,
          label: position.title || "Untitled",
        }))
      }
      showActiveOnly
    />
  );
}
