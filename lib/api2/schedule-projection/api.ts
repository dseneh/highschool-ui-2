import { useAxiosAuth } from "@/hooks/use-axios-auth";

import type {
  GradebookScheduleProjectionDto,
  StudentScheduleProjectionDto,
  TeacherScheduleProjectionDto,
} from "./types";

export const useScheduleProjectionApi = () => {
  const { get } = useAxiosAuth();

  const getTeacherScheduleProjectionApi = async (teacherId: string, dayOfWeek?: number) => {
    return get<TeacherScheduleProjectionDto[]>(`/schedule-projections/teachers/${teacherId}/`, {
      params: dayOfWeek ? { day_of_week: dayOfWeek } : undefined,
    });
  };

  const getStudentScheduleProjectionApi = async (
    studentId: string,
    params?: { academic_year_id?: string; day_of_week?: number }
  ) => {
    return get<StudentScheduleProjectionDto[]>(`/schedule-projections/students/${studentId}/`, {
      params,
    });
  };

  const getGradebookScheduleProjectionApi = async (gradebookId: string, dayOfWeek?: number) => {
    return get<GradebookScheduleProjectionDto[]>(`/schedule-projections/gradebooks/${gradebookId}/`, {
      params: dayOfWeek ? { day_of_week: dayOfWeek } : undefined,
    });
  };

  return {
    getTeacherScheduleProjectionApi,
    getStudentScheduleProjectionApi,
    getGradebookScheduleProjectionApi,
  };
};
