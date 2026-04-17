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
  listEmployeeDepartments,
  createEmployeeDepartment,
  updateEmployeeDepartment,
  deleteEmployeeDepartment,
  listEmployeePositions,
  createEmployeePosition,
  updateEmployeePosition,
  deleteEmployeePosition,
} from "@/lib/api2/employee-service";
import type {
  EmployeeDto,
  EmployeeDepartmentDto,
  EmployeePositionDto,
  CreateEmployeeCommand,
  CreateEmployeeDepartmentCommand,
  CreateEmployeePositionCommand,
  UpdateEmployeeCommand,
  TerminateEmployeeCommand,
  AddContactCommand,
  AddDependentCommand,
  ListEmployeesParams,
} from "@/lib/api2/employee-types";
import {getQueryClient} from '@/lib/query-client';

/* ------------------------------------------------------------------ */
/*  Query key factory                                                  */
/* ------------------------------------------------------------------ */

const employeeKeys = {
  all: (sub: string) => ["employees", sub] as const,
  detail: (sub: string, id: string) => ["employee", sub, id] as const,
  departments: (sub: string) => ["employee-departments", sub] as const,
  positions: (sub: string) => ["employee-positions", sub] as const,
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

export function useEmployeeDepartments() {
  const subdomain = useTenantSubdomain();

  return useQuery<EmployeeDepartmentDto[]>({
    queryKey: employeeKeys.departments(subdomain),
    queryFn: () => listEmployeeDepartments(),
    enabled: Boolean(subdomain),
  });
}

export function useEmployeePositions() {
  const subdomain = useTenantSubdomain();

  return useQuery<EmployeePositionDto[]>({
    queryKey: employeeKeys.positions(subdomain),
    queryFn: () => listEmployeePositions(),
    enabled: Boolean(subdomain),
  });
}

/* ------------------------------------------------------------------ */
/*  Hook: useEmployeeMutations (create, update, delete, terminate)     */
/* ------------------------------------------------------------------ */

export function useEmployeeMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: employeeKeys.all(subdomain) });

  const invalidateDepartments = () =>
    queryClient.invalidateQueries({ queryKey: employeeKeys.departments(subdomain) });

  const invalidatePositions = () =>
    queryClient.invalidateQueries({ queryKey: employeeKeys.positions(subdomain) });

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

  const createDepartment = useMutation({
    mutationFn: (payload: CreateEmployeeDepartmentCommand) =>
      createEmployeeDepartment(subdomain, payload),
    onSuccess: () => {
      void invalidateDepartments();
    },
  });

  const updateDepartment = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateEmployeeDepartmentCommand;
    }) => updateEmployeeDepartment(subdomain, id, payload),
    onSuccess: () => {
      void invalidateDepartments();
    },
  });

  const removeDepartment = useMutation({
    mutationFn: (id: string) => deleteEmployeeDepartment(subdomain, id),
    onSuccess: () => {
      void invalidateDepartments();
    },
  });

  const createPosition = useMutation({
    mutationFn: (payload: CreateEmployeePositionCommand) =>
      createEmployeePosition(subdomain, payload),
    onSuccess: () => {
      void invalidatePositions();
    },
  });

  const updatePosition = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateEmployeePositionCommand;
    }) => updateEmployeePosition(subdomain, id, payload),
    onSuccess: () => {
      void invalidatePositions();
    },
  });

  const removePosition = useMutation({
    mutationFn: (id: string) => deleteEmployeePosition(subdomain, id),
    onSuccess: () => {
      void invalidatePositions();
    },
  });

  return {
    create,
    update,
    remove,
    terminate,
    createContact,
    createDependent,
    createDepartment,
    updateDepartment,
    removeDepartment,
    createPosition,
    updatePosition,
    removePosition,
  };
}
