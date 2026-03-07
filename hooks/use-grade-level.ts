"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  listGradeLevels,
  getGradeLevel,
  createGradeLevel,
  updateGradeLevel,
  deleteGradeLevel,
  updateGradeLevelTuitions,
} from "@/lib/api/grade-level-service";
import {
  type GradeLevelDto,
  type CreateGradeLevelCommand,
  type UpdateGradeLevelCommand,
  type UpdateGradeLevelTuitionsCommand,
} from "@/lib/api/grade-level-types";
import { getQueryClient } from "@/lib/query-client";

/* ------------------------------------------------------------------ */
/*  Query key factory                                                  */
/* ------------------------------------------------------------------ */

const gradeLevelKeys = {
  all: (sub: string) => ["grade-levels", sub] as const,
  list: (sub: string, params?: { academic_year_id?: string }) =>
    ["grade-levels", sub, "list", params] as const,
  detail: (sub: string, id: string) =>
    ["grade-levels", sub, id] as const,
};

/* ------------------------------------------------------------------ */
/*  Hook: useGradeLevels (list)                                        */
/* ------------------------------------------------------------------ */

export function useGradeLevels(params?: { academic_year_id?: string }) {
  const subdomain = useTenantSubdomain();

  return useQuery<GradeLevelDto[]>({
    queryKey: gradeLevelKeys.list(subdomain, params),
    queryFn: () => listGradeLevels(subdomain, params),
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000,
  });
}

/* ------------------------------------------------------------------ */
/*  Hook: useGradeLevel (detail)                                       */
/* ------------------------------------------------------------------ */

export function useGradeLevel(id: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<GradeLevelDto>({
    queryKey: gradeLevelKeys.detail(subdomain, id ?? ""),
    queryFn: () => getGradeLevel(subdomain, id!),
    enabled: Boolean(subdomain) && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

/* ================================================================== */
/*  Mutations                                                          */
/* ================================================================== */

export function useGradeLevelMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const create = useMutation({
    mutationFn: (payload: CreateGradeLevelCommand) =>
      createGradeLevel(subdomain, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeLevelKeys.all(subdomain) });
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateGradeLevelCommand;
    }) => updateGradeLevel(subdomain, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeLevelKeys.all(subdomain) });
    },
  });

  const deleteById = useMutation({
    mutationFn: (id: string) => deleteGradeLevel(subdomain, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeLevelKeys.all(subdomain) });
    },
  });

  const updateTuitions = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateGradeLevelTuitionsCommand;
    }) => updateGradeLevelTuitions(subdomain, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeLevelKeys.all(subdomain) });
    },
  });

  return { create, update, deleteById, updateTuitions };
}
