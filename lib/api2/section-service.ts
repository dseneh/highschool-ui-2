import apiClient from "@/lib/api2/client";
import type {
  SectionDto,
  CreateSectionCommand,
  UpdateSectionCommand,
} from "./section-types";

/* ------------------------------------------------------------------ */
/*  Section API                                                        */
/* ------------------------------------------------------------------ */

/** GET /grade-levels/{gradeLevelId}/sections/ */
export async function listSections(
  _subdomain: string,
  gradeLevelId: string
) {
  const { data } = await apiClient.get<SectionDto[]>(
    `grade-levels/${gradeLevelId}/sections`
  );
  return data;
}

/** POST /grade-levels/{gradeLevelId}/sections/ */
export async function createSection(
  _subdomain: string,
  gradeLevelId: string,
  payload: CreateSectionCommand
) {
  const { data } = await apiClient.post<SectionDto>(
    `grade-levels/${gradeLevelId}/sections`,
    payload
  );
  return data;
}

/** PUT /sections/{id}/ */
export async function updateSection(
  _subdomain: string,
  id: string,
  payload: UpdateSectionCommand
) {
  const { data } = await apiClient.put<SectionDto>(`sections/${id}`, payload);
  return data;
}

/** DELETE /sections/{id}/ */
export async function deleteSection(_subdomain: string, id: string) {
  await apiClient.delete(`sections/${id}`);
}
