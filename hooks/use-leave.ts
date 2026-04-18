"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  createLeaveType,
  deleteLeaveType,
  listLeaveRequests,
  listLeaveTypes,
  rejectLeaveRequest,
  updateLeaveType,
} from "@/lib/api2/leave-service";
import type {
  CreateLeaveRequestCommand,
  CreateLeaveTypeCommand,
  LeaveDecisionCommand,
  LeaveRequestDto,
  LeaveTypeDto,
  ListLeaveRequestParams,
} from "@/lib/api2/leave-types";

const leaveKeys = {
  types: (sub: string) => ["leave-types", sub] as const,
  requests: (sub: string, params?: ListLeaveRequestParams) => ["leave-requests", sub, params] as const,
};

export function useLeaveTypes() {
  const subdomain = useTenantSubdomain();

  return useQuery<LeaveTypeDto[]>({
    queryKey: leaveKeys.types(subdomain),
    queryFn: () => listLeaveTypes(),
    enabled: Boolean(subdomain),
  });
}

export function useLeaveRequests(params?: ListLeaveRequestParams) {
  const subdomain = useTenantSubdomain();

  return useQuery<LeaveRequestDto[]>({
    queryKey: leaveKeys.requests(subdomain, params),
    queryFn: () => listLeaveRequests(params),
    enabled: Boolean(subdomain),
  });
}

export function useLeaveMutations() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  const invalidateTypes = () =>
    queryClient.invalidateQueries({ queryKey: leaveKeys.types(subdomain) });

  const invalidateRequests = () =>
    queryClient.invalidateQueries({ queryKey: ["leave-requests", subdomain] });

  const createType = useMutation({
    mutationFn: (payload: CreateLeaveTypeCommand) => createLeaveType(payload),
    onSuccess: () => {
      void invalidateTypes();
    },
  });

  const updateType = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateLeaveTypeCommand }) =>
      updateLeaveType(id, payload),
    onSuccess: () => {
      void invalidateTypes();
    },
  });

  const removeType = useMutation({
    mutationFn: (id: string) => deleteLeaveType(id),
    onSuccess: () => {
      void invalidateTypes();
    },
  });

  const createRequest = useMutation({
    mutationFn: (payload: CreateLeaveRequestCommand) => createLeaveRequest(payload),
    onSuccess: () => {
      void invalidateRequests();
    },
  });

  const approveRequest = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: LeaveDecisionCommand }) =>
      approveLeaveRequest(id, payload),
    onSuccess: () => {
      void invalidateRequests();
    },
  });

  const rejectRequest = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: LeaveDecisionCommand }) =>
      rejectLeaveRequest(id, payload),
    onSuccess: () => {
      void invalidateRequests();
    },
  });

  const cancelRequest = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: LeaveDecisionCommand }) =>
      cancelLeaveRequest(id, payload),
    onSuccess: () => {
      void invalidateRequests();
    },
  });

  return {
    createType,
    updateType,
    removeType,
    createRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
  };
}
