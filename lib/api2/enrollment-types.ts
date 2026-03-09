/* ------------------------------------------------------------------ */
/*  Enrollment Types                                                    */
/*  API: /api/v1/students/{id}/enrollments/                             */
/* ------------------------------------------------------------------ */

/** POST /students/{id}/enrollments/ - body */
export interface CreateEnrollmentCommand {
  academic_year: string; // UUID
  grade_level: string; // UUID
  section?: string | null; // UUID – optional if grade has single section
  enrolled_as?: "new" | "returning" | "transferred";
  re_enroll?: boolean;
  force?: boolean;
}

/** PUT /enrollments/{id}/ - body */
export interface UpdateEnrollmentCommand {
  section?: string;
  status?: string;
  date_enrolled?: string;
  notes?: string;
  active?: boolean;
}

/** Enrollment DTO returned by the API */
export interface EnrollmentDto {
  id: string;
  student: string;
  academic_year: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    current: boolean;
  };
  section: {
    id: string;
    name: string;
  };
  grade_level: {
    id: string;
    name: string;
  };
  status: string;
  date_enrolled: string;
  enrolled_as: string;
  billing_summary: {
    total_fees: number;
    tuition: number;
    gross_total_bill?: number;
    net_total_bill?: number;
    total_concession?: number;
    total_bill: number;
    paid: number;
    balance: number;
    currency: string | null;
    payment_plan: unknown[];
    payment_status: {
      is_on_time: boolean;
      overdue_count: number;
      overdue_amount: number;
      is_paid_in_full: boolean;
      paid_percentage: number;
      overdue_percentage: number;
      expected_payment_percentage: number;
      next_due_date: string | null;
    };
  };
}
