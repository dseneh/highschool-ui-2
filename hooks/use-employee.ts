"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  terminateEmployee,
  addContact,
  addDependent,
} from "@/lib/api/employee-service";
import type {
  EmployeeDto,
  CreateEmployeeCommand,
  UpdateEmployeeCommand,
  TerminateEmployeeCommand,
  AddContactCommand,
  AddDependentCommand,
  ListEmployeesParams,
} from "@/lib/api/employee-types";
import {getQueryClient} from '@/lib/query-client';

/* ------------------------------------------------------------------ */
/*  Query key factory                                                  */
/* ------------------------------------------------------------------ */

const employeeKeys = {
  all: (sub: string) => ["employees", sub] as const,
  detail: (sub: string, id: string) => ["employee", sub, id] as const,
};

/* ------------------------------------------------------------------ */
/*  Hook: useEmployees (list)                                          */
/* ------------------------------------------------------------------ */

export function useEmployees(params?: ListEmployeesParams) {
  const subdomain = useTenantSubdomain();

  const query = useQuery<EmployeeDto[]>({
    queryKey: [...employeeKeys.all(subdomain), params],
    queryFn: () => listEmployees(subdomain, params),
    enabled: Boolean(subdomain),
  });

  return query;
}

/* ------------------------------------------------------------------ */
/*  Hook: useEmployeeDetail (single)                                   */
/* ------------------------------------------------------------------ */

export function useEmployeeDetail(id: string | undefined) {
  const subdomain = useTenantSubdomain();

  const query = useQuery<EmployeeDto>({
    queryKey: employeeKeys.detail(subdomain, id ?? ""),
    queryFn: () => getEmployee(subdomain, id!),
    enabled: Boolean(subdomain) && Boolean(id),
  });

  return query;
}

/* ------------------------------------------------------------------ */
/*  Hook: useEmployeeMutations (create, update, delete, terminate)     */
/* ------------------------------------------------------------------ */

export function useEmployeeMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: employeeKeys.all(subdomain) });

  const invalidateDetail = (id: string) =>
    queryClient.invalidateQueries({
      queryKey: employeeKeys.detail(subdomain, id),
    });

  const create = useMutation({
    mutationFn: (payload: CreateEmployeeCommand) =>
      createEmployee(subdomain, payload),
    onSuccess: () => invalidateList(),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEmployeeCommand;
    }) => updateEmployee(subdomain, id, payload),
    onSuccess: (_data, variables) => {
      void invalidateList();
      void invalidateDetail(variables.id);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployee(subdomain, id),
    onSuccess: () => invalidateList(),
  });

  const terminate = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TerminateEmployeeCommand;
    }) => terminateEmployee(subdomain, id, payload),
    onSuccess: (_data, variables) => {
      void invalidateList();
      void invalidateDetail(variables.id);
    },
  });

  const createContact = useMutation({
    mutationFn: ({
      employeeId,
      payload,
    }: {
      employeeId: string;
      payload: AddContactCommand;
    }) => addContact(subdomain, employeeId, payload),
    onSuccess: (_data, variables) => {
      void invalidateDetail(variables.employeeId);
    },
  });

  const createDependent = useMutation({
    mutationFn: ({
      employeeId,
      payload,
    }: {
      employeeId: string;
      payload: AddDependentCommand;
    }) => addDependent(subdomain, employeeId, payload),
    onSuccess: (_data, variables) => {
      void invalidateDetail(variables.employeeId);
    },
  });

  return {
    create,
    update,
    remove,
    terminate,
    createContact,
    createDependent,
  };
}
