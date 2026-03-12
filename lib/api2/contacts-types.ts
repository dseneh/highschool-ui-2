/* ------------------------------------------------------------------ */
/*  Types for Student Contacts & Guardians API endpoints               */
/*  Contacts:  /api/v1/students/{student_id}/contacts/                 */
/*  Guardians: /api/v1/students/{student_id}/guardians/                */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Contacts                                                           */
/* ------------------------------------------------------------------ */

export type ContactRelationship =
  | "parent"
  | "guardian"
  | "sibling"
  | "relative"
  | "family_friend"
  | "neighbor"
  | "teacher"
  | "counselor"
  | "other";

export interface StudentContactDto {
  id: string;
  student: string; // id_number
  first_name: string;
  last_name: string;
  full_name: string;
  relationship: ContactRelationship;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  is_emergency: boolean;
  is_primary: boolean;
  photo: string | null;
  notes: string | null;
  meta: Record<string, unknown>;
}

export interface CreateStudentContactCommand {
  first_name: string;
  last_name: string;
  relationship?: ContactRelationship;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  is_emergency?: boolean;
  is_primary?: boolean;
  photo?: string | null;
  notes?: string | null;
}

export type UpdateStudentContactCommand = Partial<CreateStudentContactCommand>;

/* ------------------------------------------------------------------ */
/*  Guardians                                                          */
/* ------------------------------------------------------------------ */

export type GuardianRelationship =
  | "father"
  | "mother"
  | "stepfather"
  | "stepmother"
  | "grandfather"
  | "grandmother"
  | "uncle"
  | "aunt"
  | "legal_guardian"
  | "foster_parent"
  | "other";

export interface StudentGuardianDto {
  id: string;
  student: string; // id_number
  first_name: string;
  last_name: string;
  full_name: string;
  relationship: GuardianRelationship;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  occupation: string | null;
  workplace: string | null;
  is_primary: boolean;
  photo: string | null;
  notes: string | null;
  meta: Record<string, unknown>;
}

export interface CreateStudentGuardianCommand {
  first_name: string;
  last_name: string;
  relationship?: GuardianRelationship;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  occupation?: string | null;
  workplace?: string | null;
  is_primary?: boolean;
  photo?: string | null;
  notes?: string | null;
}

export type UpdateStudentGuardianCommand = Partial<CreateStudentGuardianCommand>;

/* ------------------------------------------------------------------ */
/*  Schedule                                                           */
/* ------------------------------------------------------------------ */

export interface SectionScheduleDto {
  id: string;
  section: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  } | null;
  teacher?: {
    id: string;
    id_number: string;
    full_name: string;
  } | null;
  period: {
    id: string;
    name: string;
    period_type?: "class" | "recess";
  };
  period_time: {
    id: string;
    start_time: string;
    end_time: string;
    day_of_week: number;
  };
  is_recess?: boolean;
}
