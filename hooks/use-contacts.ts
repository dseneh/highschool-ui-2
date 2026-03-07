"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import {
  getStudentContacts,
  createStudentContact,
  updateStudentContact,
  deleteStudentContact,
  getStudentGuardians,
  createStudentGuardian,
  updateStudentGuardian,
  deleteStudentGuardian,
  getSectionSchedule,
} from "@/lib/api/contacts-service";
import type {
  StudentContactDto,
  CreateStudentContactCommand,
  UpdateStudentContactCommand,
  StudentGuardianDto,
  CreateStudentGuardianCommand,
  UpdateStudentGuardianCommand,
  SectionScheduleDto,
} from "@/lib/api/contacts-types";
import { getQueryClient } from "@/lib/query-client";

/* ------------------------------------------------------------------ */
/*  Query Keys                                                         */
/* ------------------------------------------------------------------ */

const contactKeys = {
  contacts: (sub: string, studentId: string) =>
    ["contacts", sub, studentId] as const,
  guardians: (sub: string, studentId: string) =>
    ["guardians", sub, studentId] as const,
  schedule: (sub: string, sectionId: string) =>
    ["schedule", sub, sectionId] as const,
};

/* ------------------------------------------------------------------ */
/*  Contacts                                                           */
/* ------------------------------------------------------------------ */

export function useStudentContacts(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<StudentContactDto[]>({
    queryKey: contactKeys.contacts(subdomain, studentId ?? ""),
    queryFn: () => getStudentContacts(subdomain, studentId!),
    enabled: Boolean(subdomain) && Boolean(studentId),
  });
}

export function useCreateContact(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (command: CreateStudentContactCommand) =>
      createStudentContact(subdomain, studentId!, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.contacts(subdomain, studentId ?? ""),
      });
    },
  });
}

export function useUpdateContact(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      command,
    }: {
      contactId: string;
      command: UpdateStudentContactCommand;
    }) => updateStudentContact(subdomain, contactId, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.contacts(subdomain, studentId ?? ""),
      });
    },
  });
}

export function useDeleteContact(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (contactId: string) =>
      deleteStudentContact(subdomain, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.contacts(subdomain, studentId ?? ""),
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Guardians                                                          */
/* ------------------------------------------------------------------ */

export function useStudentGuardians(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<StudentGuardianDto[]>({
    queryKey: contactKeys.guardians(subdomain, studentId ?? ""),
    queryFn: () => getStudentGuardians(subdomain, studentId!),
    enabled: Boolean(subdomain) && Boolean(studentId),
  });
}

export function useCreateGuardian(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (command: CreateStudentGuardianCommand) =>
      createStudentGuardian(subdomain, studentId!, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.guardians(subdomain, studentId ?? ""),
      });
    },
  });
}

export function useUpdateGuardian(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({
      guardianId,
      command,
    }: {
      guardianId: string;
      command: UpdateStudentGuardianCommand;
    }) => updateStudentGuardian(subdomain, guardianId, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.guardians(subdomain, studentId ?? ""),
      });
    },
  });
}

export function useDeleteGuardian(studentId: string | undefined) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (guardianId: string) =>
      deleteStudentGuardian(subdomain, guardianId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.guardians(subdomain, studentId ?? ""),
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Schedule                                                           */
/* ------------------------------------------------------------------ */

export function useSectionSchedule(sectionId: string | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<SectionScheduleDto[]>({
    queryKey: contactKeys.schedule(subdomain, sectionId ?? ""),
    queryFn: () => getSectionSchedule(subdomain, sectionId!),
    enabled: Boolean(subdomain) && Boolean(sectionId),
  });
}
