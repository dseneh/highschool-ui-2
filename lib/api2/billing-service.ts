import apiClient from "@/lib/api2/client";
import type {
  StudentBillsResponse,
  StudentAttendanceDto,
  StudentAttendanceResponse,
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
 * GET /students/{studentLookup}/attendance/
 * Accepts student UUID, id_number, and enrollment UUID for backward compatibility.
 */
export async function getStudentAttendance(
  _subdomain: string,
  studentLookup: string
) {
  const { data } = await apiClient.get<StudentAttendanceResponse>(
    `students/${studentLookup}/attendance`
  );
  return data;
}

/** PUT /attendance/{attendanceId}/ */
export async function updateStudentAttendanceRecord(
  _subdomain: string,
  attendanceId: string,
  payload: Pick<StudentAttendanceDto, "date" | "status"> & { notes?: string | null }
) {
  const { data } = await apiClient.put<StudentAttendanceDto>(
    `attendance/${attendanceId}`,
    payload
  );
  return data;
}

/** POST /students/{studentLookup}/attendance/ */
export async function createStudentAttendanceRecord(
  _subdomain: string,
  studentLookup: string,
  payload: Pick<StudentAttendanceDto, "date" | "status"> & { notes?: string | null }
) {
  const { data } = await apiClient.post<StudentAttendanceDto>(
    `students/${studentLookup}/attendance`,
    payload
  );
  return data;
}

/** DELETE /attendance/{attendanceId}/ */
export async function deleteStudentAttendanceRecord(
  _subdomain: string,
  attendanceId: string
) {
  await apiClient.delete(`attendance/${attendanceId}`);
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
