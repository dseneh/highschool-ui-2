"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  getStudentBills,
  getStudentAttendance,
  getStudentTransactions,
  getStudentConcessions,
  createStudentConcession,
  updateStudentConcession,
} from "@/lib/api2/billing-service";
import type {
  StudentBillsResponse,
  StudentAttendanceDto,
  TransactionDto,
  StudentConcessionListResponse,
  CreateStudentConcessionCommand,
  UpdateStudentConcessionCommand,
} from "@/lib/api2/billing-types";

const billingKeys = {
  studentBills: (sub: string, studentId: string) =>
    ["billing", "student-bills", sub, studentId] as const,
  studentAttendance: (sub: string, enrollmentId: string) =>
    ["attendance", sub, enrollmentId] as const,
  studentTransactions: (sub: string, studentId: string) =>
    ["transactions", "student", sub, studentId] as const,
  studentConcessions: (sub: string, studentId: string) =>
    ["students", "concessions", sub, studentId] as const,
};

/**
 * Fetches billing data for a student (bills + summary).
 * Accepts student UUID or id_number.
 */
export function useStudentBills(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<StudentBillsResponse>({
    queryKey: billingKeys.studentBills(subdomain, studentId ?? ""),
    queryFn: () => getStudentBills(subdomain, studentId!),
    enabled: Boolean(subdomain) && Boolean(studentId),
  });
}

/**
 * Fetches attendance records for a student's current enrollment.
 * Must pass the enrollment ID (not student ID), because the backend
 * looks up Enrollment.objects.get(id=...).
 */
export function useStudentAttendance(enrollmentId: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<StudentAttendanceDto[]>({
    queryKey: billingKeys.studentAttendance(subdomain, enrollmentId ?? ""),
    queryFn: () => getStudentAttendance(subdomain, enrollmentId!),
    enabled: Boolean(subdomain) && Boolean(enrollmentId),
  });
}

/**
 * Fetches transactions for a student (payments, etc.).
 */
export function useStudentTransactions(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<TransactionDto[]>({
    queryKey: billingKeys.studentTransactions(subdomain, studentId ?? ""),
    queryFn: () => getStudentTransactions(subdomain, studentId!),
    enabled: Boolean(subdomain) && Boolean(studentId),
  });
}

export function useStudentConcessions(
  studentId: string | undefined,
  academicYearId?: string
) {
  const subdomain = useTenantSubdomain();

  return useQuery<StudentConcessionListResponse>({
    queryKey: [...billingKeys.studentConcessions(subdomain, studentId ?? ""), academicYearId ?? "current"],
    queryFn: () => getStudentConcessions(subdomain, studentId!, academicYearId),
    enabled: Boolean(subdomain) && Boolean(studentId),
  });
}

export function useStudentConcessionMutations(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();
  const queryClient = useQueryClient();

  const invalidateAfterConcessionChange = () => {
    if (!studentId) return;
    void queryClient.invalidateQueries({
      queryKey: billingKeys.studentConcessions(subdomain, studentId),
    });
    void queryClient.invalidateQueries({
      queryKey: billingKeys.studentBills(subdomain, studentId),
    });
    void queryClient.invalidateQueries({
      queryKey: billingKeys.studentTransactions(subdomain, studentId),
    });
    void queryClient.invalidateQueries({
      queryKey: ["installments", subdomain],
    });
    void queryClient.invalidateQueries({
      queryKey: ["billingSummary", subdomain],
    });
    void queryClient.invalidateQueries({
      queryKey: ["paymentStatus", subdomain],
    });
    void queryClient.invalidateQueries({
      queryKey: ["students", studentId],
    });
  };

  const create = useMutation({
    mutationFn: (payload: CreateStudentConcessionCommand) =>
      createStudentConcession(subdomain, studentId!, payload),
    onSuccess: () => {
      invalidateAfterConcessionChange();
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStudentConcessionCommand;
    }) => updateStudentConcession(subdomain, id, payload),
    onSuccess: () => {
      invalidateAfterConcessionChange();
    },
  });

  return { create, update };
}
