"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  listAcademicYears,
  getCurrentAcademicYear,
  getAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  changeAcademicYearStatus,
  closeAcademicYear,
  deleteAcademicYear,
} from "@/lib/api2/academic-year-service";
import { getQueryClient } from "@/lib/query-client";
import type { AcademicYearDto } from "@/lib/api2/academic-year-types";

/* ------------------------------------------------------------------ */
/*  Query key factory                                                  */
/* ------------------------------------------------------------------ */

const academicYearKeys = {
  all: (sub: string) => ["academic-years", sub] as const,
  current: (sub: string, includeStats: boolean = false) => 
    ["academic-year", "current", sub, includeStats ? "with-stats" : "no-stats"] as const,
  detail: (sub: string, id: string, includeStats: boolean = false) =>
    ["academic-year", sub, id, includeStats ? "with-stats" : "no-stats"] as const,
};

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

export function useAcademicYears() {
  const subdomain = useTenantSubdomain();

  return useQuery<AcademicYearDto[]>({
    queryKey: academicYearKeys.all(subdomain),
    queryFn: () => listAcademicYears(subdomain),
    enabled: Boolean(subdomain),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrentAcademicYear(includeStats: boolean = false) {
  const subdomain = useTenantSubdomain();

  return useQuery<AcademicYearDto>({
    queryKey: academicYearKeys.current(subdomain, includeStats),
    queryFn: () => getCurrentAcademicYear(subdomain, includeStats),
    enabled: Boolean(subdomain),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAcademicYear(
  id: string | undefined,
  includeStats: boolean = false
) {
  const subdomain = useTenantSubdomain();

  return useQuery<AcademicYearDto>({
    queryKey: academicYearKeys.detail(subdomain, id || "", includeStats),
    queryFn: () => getAcademicYear(subdomain, id!, includeStats),
    enabled: Boolean(subdomain) && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAcademicYearMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: academicYearKeys.all(subdomain),
    });
    // Invalidate both with and without stats
    queryClient.invalidateQueries({
      queryKey: academicYearKeys.current(subdomain, false),
    });
    queryClient.invalidateQueries({
      queryKey: academicYearKeys.current(subdomain, true),
    });
  };

  const create = useMutation({
    mutationFn: (payload: { name: string; start_date: string; end_date: string }) =>
      createAcademicYear(subdomain, payload),
    onSuccess: () => {
      invalidateAll();
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; start_date?: string; end_date?: string };
    }) => updateAcademicYear(subdomain, id, payload),
    onSuccess: (data) => {
      invalidateAll();
      queryClient.setQueryData(
        academicYearKeys.detail(subdomain, data.id),
        data
      );
    },
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" | "onhold" }) =>
      changeAcademicYearStatus(subdomain, id, status),
    onSuccess: (data) => {
      invalidateAll();
      queryClient.setQueryData(
        academicYearKeys.detail(subdomain, data.id),
        data
      );
    },
  });

  const close = useMutation({
    mutationFn: (id: string) => closeAcademicYear(subdomain, id),
    onSuccess: (data) => {
      invalidateAll();
      queryClient.setQueryData(
        academicYearKeys.detail(subdomain, data.id),
        data
      );
    },
  });

  const deleteYear = useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      deleteAcademicYear(subdomain, id, force),
    onSuccess: () => {
      invalidateAll();
    },
  });

  return {
    create,
    update,
    changeStatus,
    close,
    deleteYear,
  };
}
