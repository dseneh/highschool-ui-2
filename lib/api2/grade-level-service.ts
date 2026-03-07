import apiClient from "@/lib/api2/client";
import type {
  GradeLevelDto,
  CreateGradeLevelCommand,
  UpdateGradeLevelCommand,
  UpdateGradeLevelTuitionsCommand,
} from "./grade-level-types";

/* ------------------------------------------------------------------ */
/*  Grade Level API                                                    */
/* ------------------------------------------------------------------ */

/** GET /grade-levels/ */
export async function listGradeLevels(
  _subdomain: string,
  params?: { academic_year_id?: string }
) {
  const { data } = await apiClient.get<GradeLevelDto[]>("grade-levels", {
    params,
  });
  return data;
}

/** GET /grade-levels/{id}/ */
export async function getGradeLevel(_subdomain: string, id: string) {
  const { data } = await apiClient.get<GradeLevelDto>(`grade-levels/${id}`);
  return data;
}

/** POST /grade-levels/ */
export async function createGradeLevel(
  _subdomain: string,
  payload: CreateGradeLevelCommand
) {
  const { data } = await apiClient.post<GradeLevelDto>(
    "grade-levels",
    payload
  );
  return data;
}

/** PUT /grade-levels/{id}/ */
export async function updateGradeLevel(
  _subdomain: string,
  id: string,
  payload: UpdateGradeLevelCommand
) {
  const { data } = await apiClient.put<GradeLevelDto>(
    `grade-levels/${id}`,
    payload
  );
  return data;
}

/** DELETE /grade-levels/{id}/ */
export async function deleteGradeLevel(_subdomain: string, id: string) {
  await apiClient.delete(`grade-levels/${id}`);
}

/** PUT /grade-levels/{id}/tuition/ */
export async function updateGradeLevelTuitions(
  _subdomain: string,
  id: string,
  payload: UpdateGradeLevelTuitionsCommand
) {
  const { data } = await apiClient.put<{
    updated: Array<{ id: string; fee_type: string; amount: number }>;
    updated_count: number;
    message: string;
  }>(`grade-levels/${id}/tuition/`, payload);
  return data;
}
