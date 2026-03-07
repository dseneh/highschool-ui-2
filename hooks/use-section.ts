"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  listSections,
  createSection,
  updateSection,
  deleteSection,
} from "@/lib/api/section-service";
import type {
  SectionDto,
  CreateSectionCommand,
  UpdateSectionCommand,
} from "@/lib/api/section-types";
import { getQueryClient } from "@/lib/query-client";

/* ------------------------------------------------------------------ */
/*  Query key factory                                                  */
/* ------------------------------------------------------------------ */

const sectionKeys = {
  byGradeLevel: (sub: string, gradeLevelId: string) =>
    ["sections", sub, "list", gradeLevelId] as const,
};

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useSections(gradeLevelId: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<SectionDto[]>({
    queryKey: sectionKeys.byGradeLevel(subdomain, gradeLevelId ?? ""),
    queryFn: () => listSections(subdomain, gradeLevelId!),
    enabled: Boolean(subdomain) && Boolean(gradeLevelId),
    staleTime: 5 * 60 * 1000,
  });
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                         */
/* ------------------------------------------------------------------ */

export function useSectionMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const create = useMutation({
    mutationFn: ({
      gradeLevelId,
      payload,
    }: {
      gradeLevelId: string;
      payload: CreateSectionCommand;
    }) => createSection(subdomain, gradeLevelId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: sectionKeys.byGradeLevel(subdomain, variables.gradeLevelId),
      });
    },
  });

  const update = useMutation({
    mutationFn: ({
      sectionId,
      gradeLevelId,
      payload,
    }: {
      sectionId: string;
      gradeLevelId?: string;
      payload: UpdateSectionCommand;
    }) => updateSection(subdomain, sectionId, payload),
    onSuccess: (_data, variables) => {
      if (variables.gradeLevelId) {
        queryClient.invalidateQueries({
          queryKey: sectionKeys.byGradeLevel(subdomain, variables.gradeLevelId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["sections", subdomain] });
      }
    },
  });

  const deleteById = useMutation({
    mutationFn: ({
      sectionId,
    }: {
      sectionId: string;
      gradeLevelId?: string;
    }) => deleteSection(subdomain, sectionId),
    onSuccess: (_data, variables) => {
      if (variables.gradeLevelId) {
        queryClient.invalidateQueries({
          queryKey: sectionKeys.byGradeLevel(subdomain, variables.gradeLevelId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["sections", subdomain] });
      }
    },
  });

  return { create, update, deleteById };
}
