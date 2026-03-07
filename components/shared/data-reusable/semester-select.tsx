"use client";

import BaseDataSelect from "./base-data-select";
import { useCurrentAcademicYear } from "@/hooks/use-academic-year";
import type { DataSelectWithCurrentProps } from "./types";
import type { AcademicYearDto } from "@/lib/api2/academic-year-types";

type SemesterSelectProps = DataSelectWithCurrentProps;

export default function SemesterSelect(props: SemesterSelectProps) {
  return (
    <BaseDataSelect<AcademicYearDto>
      {...props}
      urlParamName="semester"
      useDataHook={useCurrentAcademicYear}
      title={props.title ?? "Semester"}
      autoSelectCurrent={props.autoSelectCurrent ?? true}
      mapOptions={(currentYear) => {
        const year = currentYear as AcademicYearDto;
        return (
          year?.semesters?.map((semester) => ({
            value: semester.id,
            label: semester.name,
            is_current: semester.is_current,
          })) ?? []
        );
      }}
    />
  );
}
