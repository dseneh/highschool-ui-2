"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  listEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from "@/lib/api/enrollment-service";
import type {
  CreateEnrollmentCommand,
  UpdateEnrollmentCommand,
  EnrollmentDto,
} from "@/lib/api/enrollment-types";
import {getQueryClient} from '@/lib/query-client';

/* ------------------------------------------------------------------ */
/*  Query key factory                                                  */
/* ------------------------------------------------------------------ */

const enrollmentKeys = {
  forStudent: (sub: string, studentId: string) =>
    ["enrollments", sub, studentId] as const,
};

/* ------------------------------------------------------------------ */
/*  Hook: useEnrollments (list for a student)                          */
/* ------------------------------------------------------------------ */

export function useEnrollments(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<EnrollmentDto[]>({
    queryKey: enrollmentKeys.forStudent(subdomain, studentId ?? ""),
    queryFn: () => listEnrollments(subdomain, studentId!),
    enabled: Boolean(subdomain) && Boolean(studentId),
  });
}

/* ------------------------------------------------------------------ */
/*  Hook: useEnrollmentMutations                                       */
/* ------------------------------------------------------------------ */

export function useEnrollmentMutations(studentId: string) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: enrollmentKeys.forStudent(subdomain, studentId),
    });
    // Also invalidate the student detail so is_enrolled refreshes
    void queryClient.invalidateQueries({
      queryKey: ["student", subdomain, studentId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["students", subdomain],
    });
  };

  const create = useMutation({
    mutationFn: (payload: CreateEnrollmentCommand) =>
      createEnrollment(subdomain, studentId, payload),
    onSuccess: () => invalidate(),
  });

  const update = useMutation({
    mutationFn: ({
      enrollmentId,
      payload,
    }: {
      enrollmentId: string;
      payload: UpdateEnrollmentCommand;
    }) => updateEnrollment(subdomain, enrollmentId, payload),
    onSuccess: () => invalidate(),
  });

  const remove = useMutation({
    mutationFn: (enrollmentId: string) =>
      deleteEnrollment(subdomain, enrollmentId),
    onSuccess: () => invalidate(),
  });

  return { create, update, remove };
}
