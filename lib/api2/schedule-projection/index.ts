"use client";

import { useApiQuery } from "../utils";
import { useScheduleProjectionApi } from "./api";

export function useTeacherScheduleProjection(
  teacherId: string | undefined,
  dayOfWeek?: number,
  options = {}
) {
  const api = useScheduleProjectionApi();

  return useApiQuery(
    ["schedule-projections", "teacher", teacherId ?? "", dayOfWeek ?? ""],
    () => api.getTeacherScheduleProjectionApi(teacherId!, dayOfWeek).then((res) => res.data),
    {
      enabled: Boolean(teacherId),
      ...options,
    }
  );
}

export function useStudentScheduleProjection(
  studentId: string | undefined,
  params?: { academic_year_id?: string; day_of_week?: number },
  options = {}
) {
  const api = useScheduleProjectionApi();

  return useApiQuery(
    [
      "schedule-projections",
      "student",
      studentId ?? "",
      params?.academic_year_id ?? "",
      params?.day_of_week ?? "",
    ],
    () => api.getStudentScheduleProjectionApi(studentId!, params).then((res) => res.data),
    {
      enabled: Boolean(studentId),
      ...options,
    }
  );
}

export function useGradebookScheduleProjection(
  gradebookId: string | undefined,
  dayOfWeek?: number,
  options = {}
) {
  const api = useScheduleProjectionApi();

  return useApiQuery(
    ["schedule-projections", "gradebook", gradebookId ?? "", dayOfWeek ?? ""],
    () => api.getGradebookScheduleProjectionApi(gradebookId!, dayOfWeek).then((res) => res.data),
    {
      enabled: Boolean(gradebookId),
      ...options,
    }
  );
}

export type {
  TeacherScheduleProjectionDto,
  StudentScheduleProjectionDto,
  GradebookScheduleProjectionDto,
} from "./types";
