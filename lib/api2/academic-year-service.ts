import apiClient from "@/lib/api2/client";
import type { AcademicYearDto } from "./academic-year-types";

/* ------------------------------------------------------------------ */
/*  Academic Year API                                                  */
/* ------------------------------------------------------------------ */

/** GET /academic-years/ */
export async function listAcademicYears(_subdomain: string) {
  const { data } = await apiClient.get<AcademicYearDto[]>("academic-years");
  return data;
}

/** GET /academic-years/current/ */
export async function getCurrentAcademicYear(
  _subdomain: string,
  includeStats: boolean = false
) {
  const params = includeStats ? { include_stats: "true" } : {};
  const { data } = await apiClient.get<AcademicYearDto>(
    "academic-years/current",
    { params }
  );
  return data;
}

/** GET /academic-years/{id}/ */
export async function getAcademicYear(
  _subdomain: string,
  id: string,
  includeStats: boolean = false
) {
  const params = includeStats ? { include_stats: "true" } : {};
  const { data } = await apiClient.get<AcademicYearDto>(
    `academic-years/${id}`,
    { params }
  );
  return data;
}

/** POST /academic-years/ */
export async function createAcademicYear(
  _subdomain: string,
  payload: {
    name: string;
    start_date: string;
    end_date: string;
  }
) {
  const { data } = await apiClient.post<AcademicYearDto>(
    "academic-years",
    payload
  );
  return data;
}

/** PUT /academic-years/{id}/ */
export async function updateAcademicYear(
  _subdomain: string,
  id: string,
  payload: {
    name?: string;
    start_date?: string;
    end_date?: string;
  }
) {
  const { data } = await apiClient.put<AcademicYearDto>(
    `academic-years/${id}`,
    payload
  );
  return data;
}

/** PATCH /academic-years/{id}/status/ */
export async function changeAcademicYearStatus(
  _subdomain: string,
  id: string,
  status: "active" | "inactive" | "onhold"
) {
  const { data } = await apiClient.patch<AcademicYearDto>(
    `academic-years/${id}/status`,
    { status }
  );
  return data;
}

/** POST /academic-years/{id}/close/ */
export async function closeAcademicYear(_subdomain: string, id: string) {
  const { data } = await apiClient.post<AcademicYearDto>(
    `academic-years/${id}/close`,
    {}
  );
  return data;
}

/** DELETE /academic-years/{id}/ */
export async function deleteAcademicYear(
  _subdomain: string,
  id: string,
  force: boolean = false
) {
  const params = force ? { force: "true" } : {};
  await apiClient.delete(`academic-years/${id}`, { params });
}
