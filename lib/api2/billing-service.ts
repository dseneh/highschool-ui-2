import apiClient from "@/lib/api2/client";
import type {
  StudentBillsResponse,
  StudentAttendanceDto,
  TransactionDto,
  StudentConcessionListResponse,
  StudentConcessionDto,
  CreateStudentConcessionCommand,
  UpdateStudentConcessionCommand,
} from "./billing-types";

/* ------------------------------------------------------------------ */
/*  Student Bills                                                      */
/* ------------------------------------------------------------------ */

/**
 * GET /students/{studentId}/bills/
 * Accepts either UUID or id_number as studentId.
 * Returns { bill: [...], summary: {...} }
 */
export async function getStudentBills(
  _subdomain: string,
  studentId: string,
  academicYearId?: string
) {
  const params: Record<string, string> = {};
  if (academicYearId) params.academic_year_id = academicYearId;

  const { data } = await apiClient.get<StudentBillsResponse>(
    `students/${studentId}/bills`,
    { params }
  );
  return data;
}

/** GET /students/{studentId}/bills/download-pdf/ */
export async function downloadStudentBillingPdf(
  _subdomain: string,
  studentId: string
): Promise<Blob> {
  const { data } = await apiClient.get(
    `students/${studentId}/bills/download-pdf`,
    { responseType: "blob" }
  );
  return data;
}

/* ------------------------------------------------------------------ */
/*  Student Attendance                                                 */
/* ------------------------------------------------------------------ */

/**
 * GET /students/{enrollmentId}/attendance/
 * NOTE: Despite the URL saying "students", the backend actually expects
 * an enrollment_id and looks up Enrollment.objects.get(id=...).
 */
export async function getStudentAttendance(
  _subdomain: string,
  enrollmentId: string
) {
  const { data } = await apiClient.get<StudentAttendanceDto[]>(
    `students/${enrollmentId}/attendance`
  );
  return data;
}

/* ------------------------------------------------------------------ */
/*  Transactions                                                       */
/* ------------------------------------------------------------------ */

/**
 * GET /transactions/students/{studentId}/
 * Returns student's transactions for a given academic year.
 */
export async function getStudentTransactions(
  _subdomain: string,
  studentId: string,
  academicYearId?: string
) {
  const params: Record<string, string> = {};
  if (academicYearId) params.academic_year = academicYearId;

  const { data } = await apiClient.get<TransactionDto[]>(
    `transactions/students/${studentId}`,
    { params }
  );
  return data;
}

/** GET /students/{studentId}/concessions/ */
export async function getStudentConcessions(
  _subdomain: string,
  studentId: string,
  academicYearId?: string
) {
  const params: Record<string, string> = {};
  if (academicYearId) params.academic_year_id = academicYearId;

  const { data } = await apiClient.get<StudentConcessionListResponse>(
    `students/${studentId}/concessions`,
    { params }
  );
  return data;
}

/** POST /students/{studentId}/concessions/ */
export async function createStudentConcession(
  _subdomain: string,
  studentId: string,
  payload: CreateStudentConcessionCommand
) {
  const { data } = await apiClient.post<StudentConcessionDto>(
    `students/${studentId}/concessions`,
    payload
  );
  return data;
}

/** PUT /concessions/{id}/ */
export async function updateStudentConcession(
  _subdomain: string,
  concessionId: string,
  payload: UpdateStudentConcessionCommand
) {
  const { data } = await apiClient.put<StudentConcessionDto>(
    `concessions/${concessionId}`,
    payload
  );
  return data;
}
