import apiClient from "@/lib/api2/client";
import type {
  StudentContactDto,
  CreateStudentContactCommand,
  UpdateStudentContactCommand,
  StudentGuardianDto,
  CreateStudentGuardianCommand,
  UpdateStudentGuardianCommand,
  SectionScheduleDto,
} from "./contacts-types";

/* ------------------------------------------------------------------ */
/*  Student Contacts                                                   */
/* ------------------------------------------------------------------ */

export async function getStudentContacts(
  _subdomain: string,
  studentId: string
) {
  const { data } = await apiClient.get<StudentContactDto[]>(
    `students/${studentId}/contacts`
  );
  return data;
}

export async function createStudentContact(
  _subdomain: string,
  studentId: string,
  command: CreateStudentContactCommand
) {
  const { data } = await apiClient.post<StudentContactDto>(
    `students/${studentId}/contacts/`,
    command
  );
  return data;
}

export async function updateStudentContact(
  _subdomain: string,
  contactId: string,
  command: UpdateStudentContactCommand
) {
  const { data } = await apiClient.put<StudentContactDto>(
    `contacts/${contactId}/`,
    command
  );
  return data;
}

export async function deleteStudentContact(
  _subdomain: string,
  contactId: string
) {
  await apiClient.delete(`contacts/${contactId}/`);
}

/* ------------------------------------------------------------------ */
/*  Student Guardians                                                  */
/* ------------------------------------------------------------------ */

export async function getStudentGuardians(
  _subdomain: string,
  studentId: string
) {
  const { data } = await apiClient.get<StudentGuardianDto[]>(
    `students/${studentId}/guardians`
  );
  return data;
}

export async function createStudentGuardian(
  _subdomain: string,
  studentId: string,
  command: CreateStudentGuardianCommand
) {
  const { data } = await apiClient.post<StudentGuardianDto>(
    `students/${studentId}/guardians/`,
    command
  );
  return data;
}

export async function updateStudentGuardian(
  _subdomain: string,
  guardianId: string,
  command: UpdateStudentGuardianCommand
) {
  const { data } = await apiClient.put<StudentGuardianDto>(
    `guardians/${guardianId}/`,
    command
  );
  return data;
}

export async function deleteStudentGuardian(
  _subdomain: string,
  guardianId: string
) {
  await apiClient.delete(`guardians/${guardianId}/`);
}

/* ------------------------------------------------------------------ */
/*  Section Schedule                                                   */
/* ------------------------------------------------------------------ */

export async function getSectionSchedule(
  _subdomain: string,
  sectionId: string
) {
  const { data } = await apiClient.get<SectionScheduleDto[]>(
    `sections/${sectionId}/class-schedules`
  );
  return data;
}
