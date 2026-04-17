"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";
import {
  createEmployeeAttendance,
  deleteEmployeeAttendance,
  listEmployeeAttendance,
  updateEmployeeAttendance,
} from "@/lib/api2/employee-attendance-service";
import type {
  CreateEmployeeAttendanceCommand,
  EmployeeAttendanceDto,
  ListEmployeeAttendanceParams,
} from "@/lib/api2/employee-attendance-types";

const attendanceKeys = {
  all: (subdomain: string) => ["employee-attendance", subdomain] as const,
};

export function useEmployeeAttendance(params?: ListEmployeeAttendanceParams) {
  const subdomain = useTenantSubdomain();

  return useQuery<EmployeeAttendanceDto[]>({
    queryKey: [...attendanceKeys.all(subdomain), params],
    queryFn: () => listEmployeeAttendance(params),
    enabled: Boolean(subdomain),
  });
}

export function useEmployeeAttendanceMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidateAttendance = () =>
    queryClient.invalidateQueries({ queryKey: attendanceKeys.all(subdomain) });

  const create = useMutation({
    mutationFn: (payload: CreateEmployeeAttendanceCommand) => createEmployeeAttendance(payload),
    onSuccess: () => {
      void invalidateAttendance();
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateEmployeeAttendanceCommand }) =>
      updateEmployeeAttendance(id, payload),
    onSuccess: () => {
      void invalidateAttendance();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployeeAttendance(id),
    onSuccess: () => {
      void invalidateAttendance();
    },
  });

  return {
    create,
    update,
    remove,
  };
}
