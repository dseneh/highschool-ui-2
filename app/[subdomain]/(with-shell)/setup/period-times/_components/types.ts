export type PeriodType = "class" | "recess";
export type SlotViewMode = "compact" | "board";

export type PeriodDto = {
  id: string;
  name: string;
  description?: string | null;
  period_type?: PeriodType;
};

export type SectionTimeSlotDto = {
  id: string;
  section: { id: string; name: string };
  period: { id: string; name: string; period_type?: PeriodType };
  day_of_week: number;
  start_time: string;
  end_time: string;
  sort_order: number;
  is_recess?: boolean;
};

export type CreatePeriodPayload = {
  name: string;
  description?: string;
  period_type: PeriodType;
};

export type CreateSectionTimeSlotPayload = {
  period: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  sort_order?: number;
};

export const DAY_OPTIONS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
];

export const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};
