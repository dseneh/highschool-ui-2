"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  getSectionAttendanceRoster,
  saveSectionAttendanceRoster,
} from "@/lib/api2/attendance-service";
import type {
  AttendanceBulkUpsertCommand,
  AttendanceSectionRosterDto,
} from "@/lib/api2/attendance-types";
import { getQueryClient } from "@/lib/query-client";

const attendanceKeys = {
  sectionRoster: (subdomain: string, sectionId: string, date: string) =>
    ["attendance", "section-roster", subdomain, sectionId, date] as const,
};

export function useSectionAttendanceRoster(
  sectionId: string | undefined,
  params: { date?: string }
) {
  const subdomain = useTenantSubdomain();

  return useQuery<AttendanceSectionRosterDto>({
    queryKey: attendanceKeys.sectionRoster(
      subdomain,
      sectionId ?? "",
      params.date ?? ""
    ),
    queryFn: () =>
      getSectionAttendanceRoster(subdomain, sectionId!, {
        date: params.date!,
      }),
    enabled: Boolean(subdomain) && Boolean(sectionId) && Boolean(params.date),
  });
}

export function useAttendanceMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const saveSectionRoster = useMutation({
    mutationFn: ({
      sectionId,
      payload,
    }: {
      sectionId: string;
      payload: AttendanceBulkUpsertCommand;
    }) => saveSectionAttendanceRoster(subdomain, sectionId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        attendanceKeys.sectionRoster(
          subdomain,
          variables.sectionId,
          payloadDate(variables.payload)
        ),
        data
      );
      void queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });

  return { saveSectionRoster };
}

function payloadDate(payload: AttendanceBulkUpsertCommand) {
  return payload.date;
}