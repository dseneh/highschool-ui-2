"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  getStudentBills,
  getStudentAttendance,
  createStudentAttendanceRecord,
  updateStudentAttendanceRecord,
  deleteStudentAttendanceRecord,
  getStudentTransactions,
  getStudentConcessions,
  createStudentConcession,
  updateStudentConcession,
} from "@/lib/api2/billing-service";
import type {
  StudentBillsResponse,
  StudentAttendanceDto,
  StudentAttendanceResponse,
  TransactionDto,
  StudentConcessionListResponse,
  CreateStudentConcessionCommand,
  UpdateStudentConcessionCommand,
} from "@/lib/api2/billing-types";
import { getQueryClient } from "@/lib/query-client";

const billingKeys = {
  studentBills: (sub: string, studentId: string) =>
    ["billing", "student-bills", sub, studentId] as const,
  studentAttendance: (sub: string, studentLookup: string) =>
    ["attendance", "student", sub, studentLookup] as const,
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
 * Fetches attendance records + backend-calculated summary for a student.
 */
export function useStudentAttendance(studentLookup: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<StudentAttendanceResponse>({
    queryKey: billingKeys.studentAttendance(subdomain, studentLookup ?? ""),
    queryFn: () => getStudentAttendance(subdomain, studentLookup!),
    enabled: Boolean(subdomain) && Boolean(studentLookup),
  });
}

export function useStudentAttendanceMutations(studentLookup: string | undefined) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidate = () => {
    if (!studentLookup) return;
    void queryClient.invalidateQueries({
      queryKey: billingKeys.studentAttendance(subdomain, studentLookup),
    });
  };

  const create = useMutation({
    mutationFn: (payload: Pick<StudentAttendanceDto, "date" | "status"> & { notes?: string | null }) =>
      createStudentAttendanceRecord(subdomain, studentLookup!, payload),
    onSuccess: () => {
      invalidate();
    },
  });

  const update = useMutation({
    mutationFn: ({
      attendanceId,
      payload,
    }: {
      attendanceId: string;
      payload: Pick<StudentAttendanceDto, "date" | "status"> & { notes?: string | null };
    }) => updateStudentAttendanceRecord(subdomain, attendanceId, payload),
    onSuccess: () => {
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (attendanceId: string) => deleteStudentAttendanceRecord(subdomain, attendanceId),
    onSuccess: () => {
      invalidate();
    },
  });

  return { create, update, remove };
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
  const queryClient = getQueryClient();

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
