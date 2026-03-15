export interface TeacherScheduleProjectionDto {
  id: string;
  teacher: {
    id: string;
    id_number: string;
    full_name: string;
  };
  section: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  } | null;
  period: {
    id: string;
    name: string;
    period_type?: "class" | "recess";
  };
  time_window: {
    day_of_week: number | null;
    start_time: string | null;
    end_time: string | null;
  };
}

export interface GradebookScheduleProjectionDto {
  id: string;
  class_schedule: string;
  gradebook: {
    id: string;
    name: string;
    academic_year: {
      id: string;
      name: string;
    };
  };
  section: {
    id: string;
    name: string;
  };
  section_subject: {
    id: string;
    subject: {
      id: string;
      name: string;
    };
  };
  subject: {
    id: string;
    name: string;
  };
  period: {
    id: string;
    name: string;
    period_type?: "class" | "recess";
  };
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface StudentScheduleProjectionDto {
  id: string;
  class_schedule: string;
  student: {
    id: string;
    id_number: string;
    full_name: string;
  };
  enrollment: {
    id: string;
    status: string;
    academic_year: {
      id: string;
      name: string;
    };
  };
  section: {
    id: string;
    name: string;
  };
  section_subject: {
    id: string;
    subject: {
      id: string;
      name: string;
    };
  };
  subject: {
    id: string;
    name: string;
  };
  period: {
    id: string;
    name: string;
    period_type?: "class" | "recess";
  };
  day_of_week: number;
  start_time: string;
  end_time: string;
}
