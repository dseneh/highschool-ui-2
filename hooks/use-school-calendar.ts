import { useMutation, useQuery } from "@tanstack/react-query";

import { useSchoolCalendarApi } from "@/lib/api2/school-calendar/api";
import type {
  SchoolCalendarEventDto,
  SchoolCalendarSettingsDto,
  SectionCalendarProjectionDto,
} from "@/lib/api2/school-calendar/types";

export function useSchoolCalendarSettings() {
  const api = useSchoolCalendarApi();

  return useQuery<SchoolCalendarSettingsDto>({
    queryKey: ["school-calendar-settings"],
    queryFn: async () => {
      const response = await api.getSchoolCalendarSettingsApi();
      return response.data;
    },
  });
}

export function useSchoolCalendarEvents(range?: { start?: string; end?: string }) {
  const api = useSchoolCalendarApi();

  return useQuery<SchoolCalendarEventDto[]>({
    queryKey: ["school-calendar-events", range?.start ?? "", range?.end ?? ""],
    queryFn: async () => {
      const response = await api.getSchoolCalendarEventsApi(range);
      return response.data;
    },
  });
}

export function useSectionCalendarProjection(
  sectionId: string | undefined,
  range: { start: string; end: string }
) {
  const api = useSchoolCalendarApi();

  return useQuery<SectionCalendarProjectionDto>({
    queryKey: ["section-calendar-projection", sectionId ?? "", range.start, range.end],
    queryFn: async () => {
      const response = await api.getSectionCalendarProjectionApi(sectionId!, range);
      return response.data;
    },
    enabled: Boolean(sectionId),
  });
}

export function useUpdateSchoolCalendarSettings() {
  const api = useSchoolCalendarApi();

  return useMutation({
    mutationFn: async (payload: Partial<SchoolCalendarSettingsDto>) => {
      const response = await api.updateSchoolCalendarSettingsApi(payload);
      return response.data;
    },
  });
}

export function useCreateSchoolCalendarEvent() {
  const api = useSchoolCalendarApi();

  return useMutation({
    mutationFn: async (payload: Partial<SchoolCalendarEventDto>) => {
      const response = await api.createSchoolCalendarEventApi(payload);
      return response.data;
    },
  });
}

export function useUpdateSchoolCalendarEvent() {
  const api = useSchoolCalendarApi();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<SchoolCalendarEventDto> }) => {
      const response = await api.updateSchoolCalendarEventApi(id, payload);
      return response.data;
    },
  });
}

export function useDeleteSchoolCalendarEvent() {
  const api = useSchoolCalendarApi();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.deleteSchoolCalendarEventApi(id);
      return id;
    },
  });
}