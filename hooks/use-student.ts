"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  listStudents,
  getStudent,
  getStudentByNumber,
  createStudent,
  updateStudent,
  deleteStudent,
  withdrawStudent,
  reinstateStudent,
  addContact,
  addGuardian,
  startStudentBulkUpload,
  getStudentBulkUploadStatus,
  cancelStudentBulkUpload,
} from "@/lib/api2/student-service";
import type {
  StudentDto,
  CreateStudentCommand,
  UpdateStudentCommand,
  WithdrawStudentCommand,
  AddContactCommand,
  AddGuardianCommand,
  ListStudentsParams,
  PaginatedResponse,
  StudentImportTaskResponse,
} from "@/lib/api2/student-types";
import { getQueryClient } from "@/lib/query-client";
import { showToast } from "@/lib/toast";


const studentKeys = {
  all: (sub: string) => ["students", sub] as const,
  detail: (sub: string, id: string) => ["students", sub, id] as const,
  byNumber: (sub: string, idNumber: string) =>
    ["students", idNumber] as const,
  importTask: (sub: string, taskId: string) =>
    ["students", sub, "bulk-import", "task", taskId] as const,
};


export function useStudents(params?: ListStudentsParams, options = {}) {
  const subdomain = useTenantSubdomain();

  const query = useQuery<PaginatedResponse<StudentDto>>({
    queryKey: [...studentKeys.all(subdomain), params],
    queryFn: () => listStudents(subdomain, params),
    enabled: Boolean(subdomain),
    ...options,
  });

  return query;
}

/* ------------------------------------------------------------------ */
/*  Hook: useStudentDetail (single)                                    */
/* ------------------------------------------------------------------ */
/*  Hook: useStudentDetail (single)                                    */
/* ------------------------------------------------------------------ */

export function useStudentDetail(id: string | undefined, options = {}) {
  const subdomain = useTenantSubdomain();

  const query = useQuery<StudentDto>({
    queryKey: studentKeys.detail(subdomain, id ?? ""),
    queryFn: () => getStudent(subdomain, id!),
    enabled: Boolean(subdomain) && Boolean(id),
    ...options,
  });

  return query;
}

export function useStudentByNumber(idNumber: string | undefined, options = {}) {
  const subdomain = useTenantSubdomain();

  const query = useQuery<StudentDto>({
    queryKey: studentKeys.byNumber(subdomain, idNumber ?? ""),
    queryFn: () => getStudentByNumber(subdomain, idNumber!),
    enabled: Boolean(subdomain) && Boolean(idNumber),
    ...options,
  });

  return query;
}

export function useStudentMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: studentKeys.all(subdomain) });

  const invalidateDetail = (id: string) =>
    queryClient.invalidateQueries({
      queryKey: studentKeys.detail(subdomain, id),
    });

  const create = useMutation({
    mutationFn: (payload: CreateStudentCommand) =>
      createStudent(subdomain, payload),
    onSuccess: () => invalidateList(),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStudentCommand;
    }) => updateStudent(subdomain, id, payload),
    onSuccess: (_data, variables) => {
      void invalidateList();
      void invalidateDetail(variables.id);
    },
  });

  const remove = useMutation({
    mutationFn: ({ id, force = false }: { id: string; force?: boolean }) =>
      deleteStudent(subdomain, id, force),
    onSuccess: () => invalidateList(),
  });

  const withdraw = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: WithdrawStudentCommand;
    }) => withdrawStudent(subdomain, id, payload),
    onSuccess: (_data, variables) => {
      void invalidateList();
      void invalidateDetail(variables.id);
    },
  });

  const reinstate = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      reinstateStudent(subdomain, id),
    onSuccess: (_data, variables) => {
      void invalidateList();
      void invalidateDetail(variables.id);
    },
  });

  const createContact = useMutation({
    mutationFn: ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: AddContactCommand;
    }) => addContact(subdomain, studentId, payload),
    onSuccess: (_data, variables) => {
      void invalidateDetail(variables.studentId);
    },
  });

  const createGuardian = useMutation({
    mutationFn: ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: AddGuardianCommand;
    }) => addGuardian(subdomain, studentId, payload),
    onSuccess: (_data, variables) => {
      void invalidateDetail(variables.studentId);
    },
  });

  return {
    create,
    update,
    remove,
    withdraw,
    reinstate,
    createContact,
    createGuardian,
  };
}

export function useStartStudentBulkUpload() {
  const subdomain = useTenantSubdomain();

  return useMutation({
    mutationFn: ({
      gradeLevelId,
      file,
    }: {
      gradeLevelId: string;
      file: File;
    }) => startStudentBulkUpload(subdomain, gradeLevelId, file),
    onError: (error: Error) => {
      showToast.error("Bulk upload failed", error.message);
    },
  });
}

export function useStudentBulkUploadTask(
  taskId: string | undefined,
  options?: { enabled?: boolean }
) {
  const subdomain = useTenantSubdomain();

  return useQuery<StudentImportTaskResponse>({
    queryKey: studentKeys.importTask(subdomain, taskId ?? ""),
    queryFn: () => getStudentBulkUploadStatus(subdomain, taskId ?? ""),
    enabled: Boolean(subdomain) && Boolean(taskId) && (options?.enabled ?? true),
    refetchInterval: (query) => {
      const task = query.state.data;
      if (!task) {
        return 2000;
      }

      if (task.status === "pending" || task.status === "processing") {
        return 2000;
      }

      return false;
    },
  });
}

export function useCancelStudentBulkUpload() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      cancelStudentBulkUpload(subdomain, taskId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: studentKeys.importTask(subdomain, variables.taskId),
      });
      showToast.info("Bulk upload cancelled");
    },
    onError: (error: Error) => {
      showToast.error("Cancel failed", error.message);
    },
  });
}
