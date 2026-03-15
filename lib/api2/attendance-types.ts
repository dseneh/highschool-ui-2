export type AttendanceStatusValue =
  | "present"
  | "absent"
  | "late"
  | "excused"
  | "holiday"
  | "sick"
  | "on_leave";

export interface AttendanceRosterEntryDto {
  attendance_id: string | null;
  enrollment_id: string;
  student_id: string;
  student_name: string;
  section_name: string;
  status: AttendanceStatusValue;
  notes: string | null;
}

export interface AttendanceSectionRosterDto {
  section: {
    id: string;
    name: string;
  };
  marking_period: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  } | null;
  date: string;
  summary: {
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    holiday: number;
    sick: number;
    on_leave: number;
    attendance_rate: number;
  };
  entries: AttendanceRosterEntryDto[];
}

export interface AttendanceBulkEntryCommand {
  enrollment_id: string;
  status: AttendanceStatusValue;
  notes?: string | null;
}

export interface AttendanceBulkUpsertCommand {
  date: string;
  entries: AttendanceBulkEntryCommand[];
}