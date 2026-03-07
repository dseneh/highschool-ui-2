/**
 * Section Subject Hooks
 * React Query hooks for section-subject management
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import type {
  SectionSubjectDto,
  CreateSectionSubjectPayload,
  SectionSubjectListParams,
} from "@/lib/api2/section-subject-types";
import {
  getSectionSubjects,
  assignSubjectsToSection,
  removeSectionSubject,
} from "@/lib/api2/section-subject-service";
import { getQueryClient } from "@/lib/query-client";

/**
 * Query Keys
 */
export const sectionSubjectKeys = {
  all: (subdomain: string) => ["section-subjects", subdomain] as const,
  lists: (subdomain: string) => [...sectionSubjectKeys.all(subdomain), "list"] as const,
  list: (subdomain: string, sectionId: string, params?: SectionSubjectListParams) =>
    [...sectionSubjectKeys.lists(subdomain), sectionId, params] as const,
  detail: (subdomain: string, id: string) =>
    [...sectionSubjectKeys.all(subdomain), "detail", id] as const,
};

/**
 * Hook: Get section subjects for a specific section
 */
export function useSectionSubjects(
  sectionId: string | undefined,
  params?: SectionSubjectListParams
) {
  const subdomain = useTenantSubdomain();

  return useQuery<SectionSubjectDto[]>({
    queryKey: sectionSubjectKeys.list(subdomain, sectionId ?? "", params),
    queryFn: () => getSectionSubjects(subdomain, sectionId!, params),
    enabled: Boolean(subdomain) && Boolean(sectionId),
  });
}

/**
 * Hook: Assign subjects to section
 */
export function useAssignSubjects() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (variables: {
      sectionId: string;
      payload: CreateSectionSubjectPayload;
    }) => assignSubjectsToSection(subdomain, variables.sectionId, variables.payload),
    onSuccess: (_, variables) => {
      // Invalidate section subjects queries for this section
      queryClient.invalidateQueries({
        queryKey: sectionSubjectKeys.list(subdomain, variables.sectionId),
      });
      // Also invalidate sections query to update student counts if needed
      queryClient.invalidateQueries({
        queryKey: ["sections", subdomain],
      });
    },
  });
}

/**
 * Hook: Remove subject from section
 */
export function useRemoveSectionSubject() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (variables: { sectionId: string; sectionSubjectId: string }) =>
      removeSectionSubject(subdomain, variables.sectionSubjectId),
    onSuccess: (_, variables) => {
      // Invalidate section subjects queries for this section
      queryClient.invalidateQueries({
        queryKey: sectionSubjectKeys.list(subdomain, variables.sectionId),
      });
      // Also invalidate sections query
      queryClient.invalidateQueries({
        queryKey: ["sections", subdomain],
      });
    },
  });
}
