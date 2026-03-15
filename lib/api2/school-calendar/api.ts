import { useAxiosAuth } from "@/hooks/use-axios-auth";

import type {
  SchoolCalendarEventDto,
  SchoolCalendarSettingsDto,
  SectionCalendarProjectionDto,
} from "./types";

export const useSchoolCalendarApi = () => {
  const { get, post, put, delete: del } = useAxiosAuth();

  const getSchoolCalendarSettingsApi = async () => {
    return get<SchoolCalendarSettingsDto>("/school-calendar/settings/");
  };

  const updateSchoolCalendarSettingsApi = async (data: Partial<SchoolCalendarSettingsDto>) => {
    return put<SchoolCalendarSettingsDto>("/school-calendar/settings/", data);
  };

  const getSchoolCalendarEventsApi = async (params?: { start?: string; end?: string }) => {
    const query = new URLSearchParams();
    if (params?.start) query.set("start", params.start);
    if (params?.end) query.set("end", params.end);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return get<SchoolCalendarEventDto[]>(`/school-calendar/events/${suffix}`);
  };

  const createSchoolCalendarEventApi = async (data: Partial<SchoolCalendarEventDto>) => {
    return post<SchoolCalendarEventDto>("/school-calendar/events/", data);
  };

  const updateSchoolCalendarEventApi = async (id: string, data: Partial<SchoolCalendarEventDto>) => {
    return put<SchoolCalendarEventDto>(`/school-calendar/events/${id}/`, data);
  };

  const deleteSchoolCalendarEventApi = async (id: string) => {
    return del(`/school-calendar/events/${id}/`);
  };

  const getSectionCalendarProjectionApi = async (
    sectionId: string,
    params: { start: string; end: string }
  ) => {
    const query = new URLSearchParams();
    query.set("start", params.start);
    query.set("end", params.end);
    return get<SectionCalendarProjectionDto>(`/sections/${sectionId}/calendar/?${query.toString()}`);
  };

  return {
    getSchoolCalendarSettingsApi,
    updateSchoolCalendarSettingsApi,
    getSchoolCalendarEventsApi,
    createSchoolCalendarEventApi,
    updateSchoolCalendarEventApi,
    deleteSchoolCalendarEventApi,
    getSectionCalendarProjectionApi,
  };
};