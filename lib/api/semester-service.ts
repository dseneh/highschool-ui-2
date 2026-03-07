import apiClient from "@/lib/api-client";
import type { SemesterDto } from "./semester-types";

/* ------------------------------------------------------------------ */
/*  Semester API                                                       */
/* ------------------------------------------------------------------ */

/** GET /semesters/ */
export async function listSemesters(_subdomain: string) {
  const { data } = await apiClient.get<SemesterDto[]>("semesters");
  return data;
}

/** GET /semesters/{id}/ */
export async function getSemester(_subdomain: string, id: string) {
  const { data } = await apiClient.get<SemesterDto>(`semesters/${id}`);
  return data;
}
