"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";
import {
  listEmployeeDocuments,
  createEmployeeDocument,
  updateEmployeeDocument,
  deleteEmployeeDocument,
  listPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
} from "@/lib/api2/hr-service";
import type {
  CreateEmployeeDocumentCommand,
  CreatePerformanceReviewCommand,
  EmployeeDocumentDto,
  PerformanceReviewDto,
} from "@/lib/api2/hr-types";

const hrKeys = {
  documents: (subdomain: string, employeeId?: string) =>
    ["employee-documents", subdomain, employeeId].filter(Boolean) as string[],
  reviews: (subdomain: string, employeeId?: string) =>
    ["performance-reviews", subdomain, employeeId].filter(Boolean) as string[],
};

/* ------------------------------------------------------------------ */
/*  Documents                                                          */
/* ------------------------------------------------------------------ */

export function useEmployeeDocuments(
  params?: { employeeId?: string },
  opts?: { enabled?: boolean },
) {
  const subdomain = useTenantSubdomain();

  return useQuery<EmployeeDocumentDto[]>({
    queryKey: hrKeys.documents(subdomain, params?.employeeId),
    queryFn: () => listEmployeeDocuments(params),
    enabled: (opts?.enabled ?? true) && Boolean(subdomain),
  });
}

export function useDocumentMutations(employeeId?: string) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: hrKeys.documents(subdomain, employeeId),
    });

  const create = useMutation({
    mutationFn: (cmd: CreateEmployeeDocumentCommand) => createEmployeeDocument(cmd),
    onSuccess: () => void invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, cmd }: { id: string; cmd: CreateEmployeeDocumentCommand }) =>
      updateEmployeeDocument(id, cmd),
    onSuccess: () => void invalidate(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployeeDocument(id),
    onSuccess: () => void invalidate(),
  });

  return { create, update, remove };
}

/* ------------------------------------------------------------------ */
/*  Performance Reviews                                                */
/* ------------------------------------------------------------------ */

export function usePerformanceReviews(
  params?: { employeeId?: string },
  opts?: { enabled?: boolean },
) {
  const subdomain = useTenantSubdomain();

  return useQuery<PerformanceReviewDto[]>({
    queryKey: hrKeys.reviews(subdomain, params?.employeeId),
    queryFn: () => listPerformanceReviews(params),
    enabled: (opts?.enabled ?? true) && Boolean(subdomain),
  });
}

export function usePerformanceReviewMutations(employeeId?: string) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: hrKeys.reviews(subdomain, employeeId),
    });

  const create = useMutation({
    mutationFn: (cmd: CreatePerformanceReviewCommand) => createPerformanceReview(cmd),
    onSuccess: () => void invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, cmd }: { id: string; cmd: CreatePerformanceReviewCommand }) =>
      updatePerformanceReview(id, cmd),
    onSuccess: () => void invalidate(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePerformanceReview(id),
    onSuccess: () => void invalidate(),
  });

  return { create, update, remove };
}
