import apiClient from "@/lib/api-client";
import type {
  MarkingPeriodDto,
  CreateMarkingPeriodCommand,
  UpdateMarkingPeriodCommand,
} from "./marking-period-types";

/* ------------------------------------------------------------------ */
/*  Marking Period API                                                 */
/* ------------------------------------------------------------------ */

/** GET /marking-periods/ — all marking periods */
export async function listAllMarkingPeriods(_subdomain: string) {
  const { data } = await apiClient.get<MarkingPeriodDto[]>("marking-periods");
  return data;
}

/** GET /semesters/{semesterId}/marking-periods/ */
export async function listMarkingPeriods(
  _subdomain: string,
  semesterId: string
) {
  const { data } = await apiClient.get<MarkingPeriodDto[]>(
    `semesters/${semesterId}/marking-periods`
  );
  return data;
}

/** GET /marking-periods/{id}/ */
export async function getMarkingPeriod(_subdomain: string, id: string) {
  const { data } = await apiClient.get<MarkingPeriodDto>(
    `marking-periods/${id}`
  );
  return data;
}

/** POST /semesters/{semesterId}/marking-periods/ */
export async function createMarkingPeriod(
  _subdomain: string,
  semesterId: string,
  payload: CreateMarkingPeriodCommand
) {
  const { data } = await apiClient.post<MarkingPeriodDto>(
    `semesters/${semesterId}/marking-periods`,
    payload
  );
  return data;
}

/** PUT /marking-periods/{id}/ */
export async function updateMarkingPeriod(
  _subdomain: string,
  id: string,
  payload: UpdateMarkingPeriodCommand
) {
  const { data } = await apiClient.put<MarkingPeriodDto>(
    `marking-periods/${id}`,
    payload
  );
  return data;
}

/** DELETE /marking-periods/{id}/ */
export async function deleteMarkingPeriod(_subdomain: string, id: string) {
  await apiClient.delete(`marking-periods/${id}/`);
}
