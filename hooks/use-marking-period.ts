"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";
import {
  listAllMarkingPeriods,
  listMarkingPeriods,
  createMarkingPeriod,
  updateMarkingPeriod,
  deleteMarkingPeriod,
} from "@/lib/api/marking-period-service";
import type {
  MarkingPeriodDto,
  CreateMarkingPeriodCommand,
  UpdateMarkingPeriodCommand,
} from "@/lib/api/marking-period-types";

/* ------------------------------------------------------------------ */
/*  Query key factory                                                  */
/* ------------------------------------------------------------------ */

const markingPeriodKeys = {
  all: (sub: string) => ["marking-periods", sub] as const,
  bySemester: (sub: string, semesterId: string) =>
    ["marking-periods", sub, semesterId] as const,
};

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** All marking periods (regardless of semester). */
export function useAllMarkingPeriods() {
  const subdomain = useTenantSubdomain();

  return useQuery<MarkingPeriodDto[]>({
    queryKey: markingPeriodKeys.all(subdomain),
    queryFn: () => listAllMarkingPeriods(subdomain),
    enabled: Boolean(subdomain),
    staleTime: 5 * 60 * 1000,
  });
}

/** Marking periods for a specific semester. */
export function useMarkingPeriods(semesterId?: string) {
  const subdomain = useTenantSubdomain();

  return useQuery<MarkingPeriodDto[]>({
    queryKey: markingPeriodKeys.bySemester(subdomain, semesterId ?? ""),
    queryFn: () => listMarkingPeriods(subdomain, semesterId!),
    enabled: Boolean(subdomain) && Boolean(semesterId),
    staleTime: 5 * 60 * 1000,
  });
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

export function useMarkingPeriodMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const create = useMutation({
    mutationFn: ({
      semesterId,
      payload,
    }: {
      semesterId: string;
      payload: CreateMarkingPeriodCommand;
    }) => createMarkingPeriod(subdomain, semesterId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: markingPeriodKeys.all(subdomain),
      });
    },
  });

  const update = useMutation({
    mutationFn: ({
      markingPeriodId,
      payload,
    }: {
      markingPeriodId: string;
      payload: UpdateMarkingPeriodCommand;
    }) => updateMarkingPeriod(subdomain, markingPeriodId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: markingPeriodKeys.all(subdomain),
      });
    },
  });

  const deleteById = useMutation({
    mutationFn: (markingPeriodId: string) =>
      deleteMarkingPeriod(subdomain, markingPeriodId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: markingPeriodKeys.all(subdomain),
      });
    },
  });

  return { create, update, deleteById };
}
