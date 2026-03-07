/* ------------------------------------------------------------------ */
/*  Types for Student Billing/Bills API endpoints                      */
/*  Base URL: /api/v1/students/{student_id}/bills                      */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Billing / Bills                                                    */
/* ------------------------------------------------------------------ */

/** Individual bill line item from StudentBillSerializer */
export interface BillItemDto {
  id: string;
  enrollment: {
    id: string;
    student: {
      id_number: string;
      full_name: string;
    };
    academic_year: string; // name, not nested object
    grade_level: string;   // name, not nested object
    section: string;       // name, not nested object
  };
  name: string;
  amount: number;
  type: string; // "tuition" | "fee" | "other" | "general"
  notes: string | null;
}

/** Summary returned alongside bill items */
export interface BillSummaryDto {
  total_fees: number;
  tuition: number;
  gross_total_bill?: number;
  net_total_bill?: number;
  total_concession?: number;
  concessions?: StudentConcessionDto[];
  total_bill: number;
  paid: number;
  balance: number;
  payment_plan: unknown[];
  payment_status: Record<string, unknown>;
}

export interface StudentConcessionDto {
  id: string;
  student: {
    id: string;
    id_number: string;
    full_name: string;
  };
  academic_year: {
    id: string;
    name: string;
    current: boolean;
  };
  concession_type: "percentage" | "flat";
  target: "entire_bill" | "tuition" | "other_fees";
  value: number;
  amount: number;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentConcessionListResponse {
  results: StudentConcessionDto[];
}

export interface CreateStudentConcessionCommand {
  academic_year?: string;
  concession_type: "percentage" | "flat";
  target: "entire_bill" | "tuition" | "other_fees";
  value: number;
  notes?: string;
  active?: boolean;
}

export interface UpdateStudentConcessionCommand {
  academic_year?: string;
  concession_type?: "percentage" | "flat";
  target?: "entire_bill" | "tuition" | "other_fees";
  value?: number;
  notes?: string;
  active?: boolean;
}

/** Top-level response from GET /students/{id}/bills/ */
export interface StudentBillsResponse {
  bill: BillItemDto[];
  summary: BillSummaryDto;
}

/* ------------------------------------------------------------------ */
/*  Attendance                                                         */
/* ------------------------------------------------------------------ */

/** Record returned by AttendanceSerializer */
export interface StudentAttendanceDto {
  id: string;
  enrollment: string; // enrollment UUID
  marking_period: string; // resolved name (string)
  date: string; // ISO date
  status: "present" | "absent" | "late" | "excused" | "holiday";
  notes: string | null;
  meta: Record<string, unknown>;
  student: string; // id_number (added in to_representation)
  student_name: string; // full name (added in to_representation)
}

/* ------------------------------------------------------------------ */
/*  Transactions (from finance app)                                    */
/* ------------------------------------------------------------------ */

export interface TransactionDto {
  id: string;
  transaction_id: string;
  reference: string | null;
  amount: number;
  date: string;
  description: string | null;
  status: "pending" | "approved" | "rejected" | "canceled";
  student: {
    id: string;
    id_number: string;
    full_name: string;
  };
  transaction_type: {
    id: string;
    name: string;
    type_code: string;
    type: string;
  };
  payment_method: {
    id: string;
    name: string;
  } | null;
  account: {
    id: string;
    number: string;
    name: string;
  } | null;
  academic_year: {
    id: string;
    name: string;
  } | null;
  currency: {
    id: string;
    name: string;
    symbol: string;
    code: string;
  } | null;
}
