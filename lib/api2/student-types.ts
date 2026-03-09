/* ------------------------------------------------------------------ */
/*  Types generated from the Student API Swagger spec                  */
/*  Base URL: /api/v1/students                                         */
/* ------------------------------------------------------------------ */

/** Shared address sub-object */
export interface Address {
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

/** Emergency / guardian contact */
export interface ContactDto {
  id: string;
  contactType: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  relationship: string | null;
  isPrimary: boolean;
}

/** Guardian / dependent information */
export interface GuardianDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  relationship: string | null;
  phoneNumber: string | null;
  email: string | null;
  occupation: string | null;
  address: Address | null;
  isPrimary: boolean;
}

/** Full student representation returned by the API */
export interface StudentDto {
  id: string;
  prev_id_number: string | null;
  id_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  date_of_birth: string; // ISO 8601
  gender: string | null;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  status: string;
  entry_date: string | null;
  grade_level: {
    id: string;
    name: string;
    level?: number;
  } | null;
  date_of_graduation: string | null;
  place_of_birth: string | null;
  photo: string | null;
  entry_as: string | null;
  withdrawal_date: string | null;
  withdrawal_reason: string | null;
  current_grade_level: {
    id: string;
    name: string;
    level: number;
  } | null;
  current_enrollment: {
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
    status: string;
    date_enrolled: string;
    enrolled_as: string;
    grade_level: {
      id: string;
      name: string;
    };
    billing_summary: {
      total_fees: number;
      tuition: number;
      gross_total_bill?: number;
      net_total_bill?: number;
      total_concession?: number;
      concessions?: Array<{
        id: string;
        concession_type: "percentage" | "flat";
        target: "entire_bill" | "tuition" | "other_fees";
        value: number;
        amount: number;
        notes: string | null;
        active: boolean;
      }>;
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
  } | null;
  is_enrolled: boolean;
  number_of_enrollments: number;
  can_delete: boolean;
  enrollments: Array<{
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
    status: string;
    date_enrolled: string;
    enrolled_as: string;
    grade_level: {
      id: string;
      name: string;
    };
    billing_summary: {
      total_fees: number;
      tuition: number;
      gross_total_bill?: number;
      net_total_bill?: number;
      total_concession?: number;
      concessions?: Array<{
        id: string;
        concession_type: "percentage" | "flat";
        target: "entire_bill" | "tuition" | "other_fees";
        value: number;
        amount: number;
        notes: string | null;
        active: boolean;
      }>;
      total_bill: number;
      paid: number;
      balance: number;
      currency?: string | null;
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
  }>;
  user_account: {
    id: string;
    username: string;
    email: string;
  } | null;
  total_average: number;
  total_subjects: number;
}

/** POST /students/ - body (matches Django backend) */
export interface CreateStudentCommand {
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  date_of_birth: string; // YYYY-MM-DD
  gender: "male" | "female";
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  place_of_birth?: string | null;
  entry_date?: string | null; // YYYY-MM-DD
  grade_level: string; // UUID
  entry_as: "new" | "returning" | "transferred";
  prev_id_number?: string | null;
  section?: string | null; // UUID – used only when enroll_student is true
  enroll_student?: boolean;
}

/** PUT /students/{id} - body */
export interface UpdateStudentCommand {
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  date_of_birth: string; // YYYY-MM-DD
  gender: "male" | "female";
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  place_of_birth?: string | null;
  entry_date?: string | null;
  grade_level?: string | null;
  entry_as?: "new" | "returning" | "transferred";
  prev_id_number?: string | null;
}

/** POST /students/{id}/withdraw - body */
export interface WithdrawStudentCommand {
  withdrawal_date: string;
  withdrawal_reason?: string | null;
}

/** POST /students/{id}/contacts - body */
export interface AddContactCommand {
  studentId: string;
  contactType: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  relationship: string | null;
  address: Address | null;
  isPrimary: boolean;
  createdBy: string | null;
}

/** POST /students/{id}/guardians - body */
export interface AddGuardianCommand {
  studentId: string;
  firstName: string | null;
  lastName: string | null;
  relationship: string | null;
  phoneNumber: string | null;
  email: string | null;
  occupation: string | null;
  address: Address | null;
  isPrimary: boolean;
  createdBy: string | null;
}

/** Standard error response from the API */
export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Query parameter types                                              */
/* ------------------------------------------------------------------ */

export interface ListStudentsParams {
  gradeLevel?: string;
  section?: string;
  enrollmentStatus?: string;
  academicYearId?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
