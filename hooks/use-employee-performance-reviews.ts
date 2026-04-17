"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";
import {
  createEmployeePerformanceReview,
  deleteEmployeePerformanceReview,
  listEmployeePerformanceReviews,
  updateEmployeePerformanceReview,
} from "@/lib/api2/employee-performance-review-service";
import type {
  CreateEmployeePerformanceReviewCommand,
  EmployeePerformanceReviewDto,
  ListEmployeePerformanceReviewParams,
} from "@/lib/api2/employee-performance-review-types";

const performanceReviewKeys = {
  all: (subdomain: string) => ["employee-performance-reviews", subdomain] as const,
};

export function useEmployeePerformanceReviews(params?: ListEmployeePerformanceReviewParams) {
  const subdomain = useTenantSubdomain();

  return useQuery<EmployeePerformanceReviewDto[]>({
    queryKey: [...performanceReviewKeys.all(subdomain), params],
    queryFn: () => listEmployeePerformanceReviews(params),
    enabled: Boolean(subdomain),
  });
}

export function useEmployeePerformanceReviewMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidateReviews = () =>
    queryClient.invalidateQueries({ queryKey: performanceReviewKeys.all(subdomain) });

  const create = useMutation({
    mutationFn: (payload: CreateEmployeePerformanceReviewCommand) => createEmployeePerformanceReview(payload),
    onSuccess: () => {
      void invalidateReviews();
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateEmployeePerformanceReviewCommand }) =>
      updateEmployeePerformanceReview(id, payload),
    onSuccess: () => {
      void invalidateReviews();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployeePerformanceReview(id),
    onSuccess: () => {
      void invalidateReviews();
    },
  });

  return {
    create,
    update,
    remove,
  };
}
