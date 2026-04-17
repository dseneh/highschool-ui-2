"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";
import {
  createEmployeeDocument,
  deleteEmployeeDocument,
  listEmployeeDocuments,
  updateEmployeeDocument,
} from "@/lib/api2/employee-document-service";
import type {
  CreateEmployeeDocumentCommand,
  EmployeeDocumentDto,
  ListEmployeeDocumentsParams,
} from "@/lib/api2/employee-document-types";

const employeeDocumentKeys = {
  all: (subdomain: string) => ["employee-documents", subdomain] as const,
};

export function useEmployeeDocuments(params?: ListEmployeeDocumentsParams) {
  const subdomain = useTenantSubdomain();

  return useQuery<EmployeeDocumentDto[]>({
    queryKey: [...employeeDocumentKeys.all(subdomain), params],
    queryFn: () => listEmployeeDocuments(params),
    enabled: Boolean(subdomain),
  });
}

export function useEmployeeDocumentMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidateDocuments = () =>
    queryClient.invalidateQueries({ queryKey: employeeDocumentKeys.all(subdomain) });

  const create = useMutation({
    mutationFn: (payload: CreateEmployeeDocumentCommand) => createEmployeeDocument(payload),
    onSuccess: () => {
      void invalidateDocuments();
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateEmployeeDocumentCommand }) =>
      updateEmployeeDocument(id, payload),
    onSuccess: () => {
      void invalidateDocuments();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployeeDocument(id),
    onSuccess: () => {
      void invalidateDocuments();
    },
  });

  return {
    create,
    update,
    remove,
  };
}
