"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";
import {
  createEmployeeWorkflowTask,
  deleteEmployeeWorkflowTask,
  listEmployeeWorkflowTasks,
  updateEmployeeWorkflowTask,
} from "@/lib/api2/employee-workflow-service";
import type {
  CreateEmployeeWorkflowTaskCommand,
  EmployeeWorkflowTaskDto,
  ListEmployeeWorkflowTaskParams,
} from "@/lib/api2/employee-workflow-types";

const workflowKeys = {
  all: (subdomain: string) => ["employee-workflow-tasks", subdomain] as const,
};

export function useEmployeeWorkflowTasks(params?: ListEmployeeWorkflowTaskParams) {
  const subdomain = useTenantSubdomain();

  return useQuery<EmployeeWorkflowTaskDto[]>({
    queryKey: [...workflowKeys.all(subdomain), params],
    queryFn: () => listEmployeeWorkflowTasks(params),
    enabled: Boolean(subdomain),
  });
}

export function useEmployeeWorkflowTaskMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidateWorkflowTasks = () =>
    queryClient.invalidateQueries({ queryKey: workflowKeys.all(subdomain) });

  const create = useMutation({
    mutationFn: (payload: CreateEmployeeWorkflowTaskCommand) => createEmployeeWorkflowTask(payload),
    onSuccess: () => {
      void invalidateWorkflowTasks();
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateEmployeeWorkflowTaskCommand }) =>
      updateEmployeeWorkflowTask(id, payload),
    onSuccess: () => {
      void invalidateWorkflowTasks();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployeeWorkflowTask(id),
    onSuccess: () => {
      void invalidateWorkflowTasks();
    },
  });

  return {
    create,
    update,
    remove,
  };
}
