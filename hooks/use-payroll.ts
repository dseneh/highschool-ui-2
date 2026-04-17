"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";
import {
  createEmployeeCompensation,
  createPayrollComponent,
  deleteEmployeeCompensation,
  deletePayrollComponent,
  deletePayrollRun,
  listEmployeeCompensations,
  listPayrollComponents,
  listPayrollRuns,
  markPayrollRunPaid,
  processPayrollRun,
  updateEmployeeCompensation,
  updatePayrollComponent,
  updatePayrollRun,
  createPayrollRun,
} from "@/lib/api2/payroll-service";
import type {
  CreateEmployeeCompensationCommand,
  CreatePayrollComponentCommand,
  CreatePayrollRunCommand,
  EmployeeCompensationDto,
  PayrollComponentDto,
  PayrollRunDto,
} from "@/lib/api2/payroll-types";

const payrollKeys = {
  components: (subdomain: string) => ["payroll-components", subdomain] as const,
  compensations: (subdomain: string) => ["employee-compensations", subdomain] as const,
  runs: (subdomain: string) => ["payroll-runs", subdomain] as const,
};

export function usePayrollComponents() {
  const subdomain = useTenantSubdomain();

  return useQuery<PayrollComponentDto[]>({
    queryKey: payrollKeys.components(subdomain),
    queryFn: () => listPayrollComponents(),
    enabled: Boolean(subdomain),
  });
}

export function useEmployeeCompensations() {
  const subdomain = useTenantSubdomain();

  return useQuery<EmployeeCompensationDto[]>({
    queryKey: payrollKeys.compensations(subdomain),
    queryFn: () => listEmployeeCompensations(),
    enabled: Boolean(subdomain),
  });
}

export function usePayrollRuns() {
  const subdomain = useTenantSubdomain();

  return useQuery<PayrollRunDto[]>({
    queryKey: payrollKeys.runs(subdomain),
    queryFn: () => listPayrollRuns(),
    enabled: Boolean(subdomain),
  });
}

export function usePayrollMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidateComponents = () =>
    queryClient.invalidateQueries({ queryKey: payrollKeys.components(subdomain) });
  const invalidateCompensations = () =>
    queryClient.invalidateQueries({ queryKey: payrollKeys.compensations(subdomain) });
  const invalidateRuns = () =>
    queryClient.invalidateQueries({ queryKey: payrollKeys.runs(subdomain) });

  const createComponent = useMutation({
    mutationFn: (payload: CreatePayrollComponentCommand) => createPayrollComponent(payload),
    onSuccess: () => {
      void invalidateComponents();
    },
  });

  const updateComponent = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreatePayrollComponentCommand }) =>
      updatePayrollComponent(id, payload),
    onSuccess: () => {
      void invalidateComponents();
    },
  });

  const removeComponent = useMutation({
    mutationFn: (id: string) => deletePayrollComponent(id),
    onSuccess: () => {
      void invalidateComponents();
    },
  });

  const createCompensation = useMutation({
    mutationFn: (payload: CreateEmployeeCompensationCommand) => createEmployeeCompensation(payload),
    onSuccess: () => {
      void invalidateCompensations();
    },
  });

  const updateCompensation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateEmployeeCompensationCommand }) =>
      updateEmployeeCompensation(id, payload),
    onSuccess: () => {
      void invalidateCompensations();
    },
  });

  const removeCompensation = useMutation({
    mutationFn: (id: string) => deleteEmployeeCompensation(id),
    onSuccess: () => {
      void invalidateCompensations();
    },
  });

  const createRun = useMutation({
    mutationFn: (payload: CreatePayrollRunCommand) => createPayrollRun(payload),
    onSuccess: () => {
      void invalidateRuns();
    },
  });

  const updateRun = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreatePayrollRunCommand }) => updatePayrollRun(id, payload),
    onSuccess: () => {
      void invalidateRuns();
    },
  });

  const removeRun = useMutation({
    mutationFn: (id: string) => deletePayrollRun(id),
    onSuccess: () => {
      void invalidateRuns();
    },
  });

  const processRun = useMutation({
    mutationFn: (id: string) => processPayrollRun(id),
    onSuccess: () => {
      void invalidateRuns();
    },
  });

  const markRunPaid = useMutation({
    mutationFn: (id: string) => markPayrollRunPaid(id),
    onSuccess: () => {
      void invalidateRuns();
    },
  });

  return {
    createComponent,
    updateComponent,
    removeComponent,
    createCompensation,
    updateCompensation,
    removeCompensation,
    createRun,
    updateRun,
    removeRun,
    processRun,
    markRunPaid,
  };
}
