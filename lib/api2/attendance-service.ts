import apiClient from "@/lib/api2/client";
import type {
  AttendanceBulkUpsertCommand,
  AttendanceRosterEntryDto,
  AttendanceSectionRosterDto,
  AttendanceStatusValue,
} from "./attendance-types";

const STATUS_FALLBACK: AttendanceStatusValue = "present";

function normalizeAttendanceStatus(value: string | null | undefined): AttendanceStatusValue {
  const normalized = value?.toLowerCase();

  switch (normalized) {
    case "present":
    case "absent":
    case "late":
    case "excused":
    case "holiday":
    case "sick":
    case "on_leave":
      return normalized;
    default:
      return STATUS_FALLBACK;
  }
}

function normalizeRosterEntry(entry: AttendanceRosterEntryDto): AttendanceRosterEntryDto {
  return {
    ...entry,
    status: normalizeAttendanceStatus(entry.status),
  };
}

function normalizeSectionAttendanceRoster(
  roster: AttendanceSectionRosterDto
): AttendanceSectionRosterDto {
  return {
    ...roster,
    summary: {
      ...roster.summary,
      holiday: roster.summary.holiday ?? 0,
      sick: roster.summary.sick ?? 0,
      on_leave: roster.summary.on_leave ?? 0,
    },
    entries: roster.entries.map(normalizeRosterEntry),
  };
}

export async function getSectionAttendanceRoster(
  _subdomain: string,
  sectionId: string,
  params: { date: string }
) {
  const { data } = await apiClient.get<AttendanceSectionRosterDto>(
    `sections/${sectionId}/attendance`,
    { params }
  );
  return normalizeSectionAttendanceRoster(data);
}

export async function saveSectionAttendanceRoster(
  _subdomain: string,
  sectionId: string,
  payload: AttendanceBulkUpsertCommand
) {
  const { data } = await apiClient.post<AttendanceSectionRosterDto>(
    `sections/${sectionId}/attendance`,
    payload
  );
  return normalizeSectionAttendanceRoster(data);
}