"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/lib/api/subject-service";
import type {
  SubjectDto,
  CreateSubjectCommand,
  UpdateSubjectCommand,
} from "@/lib/api/subject-types";
import { getQueryClient } from "@/lib/query-client";

/* ------------------------------------------------------------------ */
/*  Query key factory                                                  */
/* ------------------------------------------------------------------ */

const subjectKeys = {
  all: (sub: string) => ["subjects", sub] as const,
};

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

export function useSubjects() {
  const subdomain = useTenantSubdomain();

  return useQuery<SubjectDto[]>({
    queryKey: subjectKeys.all(subdomain),
    queryFn: () => listSubjects(subdomain),
    enabled: Boolean(subdomain),
    staleTime: 5 * 60 * 1000,
  });
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                         */
/* ------------------------------------------------------------------ */

export function useSubjectMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const create = useMutation({
    mutationFn: (payload: CreateSubjectCommand) =>
      createSubject(subdomain, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all(subdomain) });
    },
  });

  const update = useMutation({
    mutationFn: ({
      subjectId,
      payload,
    }: {
      subjectId: string;
      payload: UpdateSubjectCommand;
    }) => updateSubject(subdomain, subjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all(subdomain) });
    },
  });

  const deleteById = useMutation({
    mutationFn: ({ subjectId, force }: { subjectId: string; force?: boolean }) =>
      deleteSubject(subdomain, subjectId, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all(subdomain) });
    },
  });

  return { create, update, deleteById };
}
