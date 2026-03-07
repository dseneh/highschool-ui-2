import apiClient from "@/lib/api2/client";
import type {
  SubjectDto,
  CreateSubjectCommand,
  UpdateSubjectCommand,
} from "./subject-types";

/* ------------------------------------------------------------------ */
/*  Subject API                                                        */
/* ------------------------------------------------------------------ */

/** GET /subjects/ */
export async function listSubjects(_subdomain: string) {
  const { data } = await apiClient.get<SubjectDto[]>("subjects");
  return data;
}

/** GET /subjects/{id}/ */
export async function getSubject(_subdomain: string, id: string) {
  const { data } = await apiClient.get<SubjectDto>(`subjects/${id}`);
  return data;
}

/** POST /subjects/ */
export async function createSubject(
  _subdomain: string,
  payload: CreateSubjectCommand
) {
  const { data } = await apiClient.post<SubjectDto>("subjects", payload);
  return data;
}

/** PUT /subjects/{id}/ */
export async function updateSubject(
  _subdomain: string,
  id: string,
  payload: UpdateSubjectCommand
) {
  const { data } = await apiClient.put<SubjectDto>(`subjects/${id}`, payload);
  return data;
}

/** DELETE /subjects/{id}/ */
export async function deleteSubject(
  _subdomain: string,
  id: string,
  force?: boolean
) {
  const url = force ? `subjects/${id}/?force=true` : `subjects/${id}/`;
  await apiClient.delete(url);
}

