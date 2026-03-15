export type SchoolCalendarSettingsDto = {
  id: string;
  operating_days: number[];
  operating_day_labels: string[];
  timezone: string;
  active: boolean;
};

export type SchoolCalendarEventType =
  | "holiday"
  | "non_school_day"
  | "special_day"
  | "schedule_override";

export type SchoolCalendarRecurrenceType = "none" | "yearly";

export type SchoolCalendarEventDto = {
  id: string;
  name: string;
  description?: string | null;
  event_type: SchoolCalendarEventType;
  recurrence_type: SchoolCalendarRecurrenceType;
  start_date: string;
  end_date: string;
  all_day: boolean;
  applies_to_all_sections: boolean;
  sections: string[];
  section_details: Array<{ id: string; name: string }>;
  active: boolean;
};

export type SectionCalendarProjectionDayDto = {
  date: string;
  day_of_week: number;
  is_operating_day: boolean;
  is_blocked_by_event: boolean;
  events: SchoolCalendarEventDto[];
  schedules: import("@/lib/api2/contacts-types").SectionScheduleDto[];
};

export type SectionCalendarProjectionDto = {
  section: {
    id: string;
    name: string;
  };
  range: {
    start: string;
    end: string;
  };
  operating_days: number[];
  days: SectionCalendarProjectionDayDto[];
};