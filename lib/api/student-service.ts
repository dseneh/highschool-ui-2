import apiClient from "@/lib/api-client";
import type {
  StudentDto,
  CreateStudentCommand,
  UpdateStudentCommand,
  WithdrawStudentCommand,
  AddContactCommand,
  AddGuardianCommand,
  ListStudentsParams,
  PaginatedResponse,
} from "./student-types";

export type { StudentDto, ListStudentsParams, PaginatedResponse };

/* ------------------------------------------------------------------ */
/*  Student CRUD                                                       */
/* ------------------------------------------------------------------ */

/** GET /students */
export async function listStudents(
  _subdomain: string,
  params?: ListStudentsParams
) {
  const { data } = await apiClient.get<PaginatedResponse<StudentDto>>("students", { params });
  return data;
}

/** GET /students/{id} */
export async function getStudent(_subdomain: string, id: string) {
  const { data } = await apiClient.get<StudentDto>(`students/${id}`);
  return data;
}

/** GET /students/number/{studentNumber} */
export async function getStudentByNumber(
  _subdomain: string,
  studentNumber: string
) {
  const { data } = await apiClient.get<StudentDto>(
    `students/${studentNumber}`
  );
  return data;
}

/** POST /students */
export async function createStudent(
  _subdomain: string,
  payload: CreateStudentCommand
) {
  const { data } = await apiClient.post<string>("students", payload);
  return data;
}

/** PUT /students/{id} */
export async function updateStudent(
  _subdomain: string,
  id: string,
  payload: UpdateStudentCommand
) {
  await apiClient.put(`students/${id}`, payload);
}

/** DELETE /students/{id} */
export async function deleteStudent(
  _subdomain: string,
  id: string,
  force: boolean = false
) {
  await apiClient.delete(`students/${id}`, {
    params: force ? { force_delete: true } : undefined,
  });
}

/** POST /students/{id}/withdraw */
export async function withdrawStudent(
  _subdomain: string,
  id: string,
  payload: WithdrawStudentCommand
) {
  await apiClient.post(`students/${id}/withdraw`, payload);
}

/** POST /students/{id}/reinstate — reinstate a withdrawn/transferred student */
export async function reinstateStudent(
  _subdomain: string,
  id: string,
) {
  const { data } = await apiClient.post<StudentDto>(`students/${id}/reinstate`);
  return data;
}

/* ------------------------------------------------------------------ */
/*  Contacts                                                           */
/* ------------------------------------------------------------------ */

/** POST /students/{id}/contacts */
export async function addContact(
  _subdomain: string,
  studentId: string,
  payload: AddContactCommand
) {
  const { data } = await apiClient.post<string>(
    `students/${studentId}/contacts`,
    payload
  );
  return data;
}

/** PUT /students/{studentId}/contacts/{contactId} */
export async function updateContact(
  _subdomain: string,
  studentId: string,
  contactId: string,
  payload: Partial<AddContactCommand>
) {
  await apiClient.put(
    `students/${studentId}/contacts/${contactId}`,
    payload
  );
}

/** DELETE /students/{studentId}/contacts/{contactId} */
export async function deleteContact(
  _subdomain: string,
  studentId: string,
  contactId: string
) {
  await apiClient.delete(`Students/${studentId}/contacts/${contactId}`);
}

/* ------------------------------------------------------------------ */
/*  Guardians                                                          */
/* ------------------------------------------------------------------ */

/** POST /students/{id}/guardians */
export async function addGuardian(
  _subdomain: string,
  studentId: string,
  payload: AddGuardianCommand
) {
  const { data } = await apiClient.post<string>(
    `Students/${studentId}/guardians`,
    payload
  );
  return data;
}

/** PUT /students/{studentId}/guardians/{guardianId} */
export async function updateGuardian(
  _subdomain: string,
  studentId: string,
  guardianId: string,
  payload: Partial<AddGuardianCommand>
) {
  await apiClient.put(
    `Students/${studentId}/guardians/${guardianId}`,
    payload
  );
}

/** DELETE /students/{studentId}/guardians/{guardianId} */
export async function deleteGuardian(
  _subdomain: string,
  studentId: string,
  guardianId: string
) {
  await apiClient.delete(`Students/${studentId}/guardians/${guardianId}`);
}

/* ------------------------------------------------------------------ */
/*  Photo                                                              */
/* ------------------------------------------------------------------ */

/** POST /students/{id}/photo */
export async function uploadStudentPhoto(
  _subdomain: string,
  studentId: string,
  file: File
) {
  const form = new FormData();
  form.append("file", file);
  await apiClient.post(`Students/${studentId}/photo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** GET /students/{id}/photo  -> blob URL */
export async function getStudentPhoto(
  _subdomain: string,
  studentId: string
): Promise<string | null> {
  try {
    const { data } = await apiClient.get(`Students/${studentId}/photo`, {
      responseType: "blob",
    });
    return URL.createObjectURL(data);
  } catch {
    return null;
  }
}

/** DELETE /students/{id}/photo */
export async function deleteStudentPhoto(
  _subdomain: string,
  studentId: string
) {
  await apiClient.delete(`Students/${studentId}/photo`);
}
