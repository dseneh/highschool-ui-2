import apiClient from "@/lib/api-client";
import type {
  CreateEnrollmentCommand,
  UpdateEnrollmentCommand,
  EnrollmentDto,
} from "./enrollment-types";

/* ------------------------------------------------------------------ */
/*  Enrollment CRUD                                                     */
/* ------------------------------------------------------------------ */

/** GET /students/{studentId}/enrollments/ */
export async function listEnrollments(
  _subdomain: string,
  studentId: string
) {
  const { data } = await apiClient.get<EnrollmentDto[]>(
    `students/${studentId}/enrollments`
  );
  return data;
}

/** POST /students/{studentId}/enrollments/ */
export async function createEnrollment(
  _subdomain: string,
  studentId: string,
  payload: CreateEnrollmentCommand
) {
  const { data } = await apiClient.post<EnrollmentDto>(
    `students/${studentId}/enrollments`,
    payload
  );
  return data;
}

/** GET /enrollments/{id}/ */
export async function getEnrollment(_subdomain: string, id: string) {
  const { data } = await apiClient.get<EnrollmentDto>(`enrollments/${id}`);
  return data;
}

/** PUT /enrollments/{id}/ */
export async function updateEnrollment(
  _subdomain: string,
  id: string,
  payload: UpdateEnrollmentCommand
) {
  await apiClient.put(`enrollments/${id}`, payload);
}

/** DELETE /enrollments/{id}/ */
export async function deleteEnrollment(_subdomain: string, id: string) {
  await apiClient.delete(`enrollments/${id}`);
}
