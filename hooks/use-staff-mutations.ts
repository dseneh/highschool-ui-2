"use client";

import { useMutation } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { useStaffApi } from "@/lib/api2/staff/api";

export function useStaffMutations() {
  const queryClient = getQueryClient();
  const staffApi = useStaffApi();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: ["staff"] });

  const invalidateDetail = (id: string) =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["staff", id],
      }),
    ]);

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
      effectiveDate,
    }: {
      id: string;
      status: string;
      reason?: string;
      effectiveDate?: string;
    }) => {
      const payload: Record<string, string> = { status };

      if (status === "suspended") {
        if (reason) payload.suspension_reason = reason;
        if (effectiveDate) payload.suspension_date = effectiveDate;
      }

      if (status === "terminated") {
        if (reason) payload.termination_reason = reason;
        if (effectiveDate) payload.termination_date = effectiveDate;
      }

      return staffApi.patchStaffApi(id, payload).then((res: any) => res.data);
    },
    onSuccess: (_data, variables) => {
      void invalidateList();
      void invalidateDetail(variables.id);
    },
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string; force?: boolean }) =>
      staffApi.deleteStaffApi(id).then((res: any) => res.data),
    onSuccess: () => invalidateList(),
  });

  const suspend = useMutation({
    mutationFn: ({
      id,
      reason,
      effectiveDate,
    }: {
      id: string;
      reason?: string;
      effectiveDate?: string;
    }) =>
      staffApi
        .patchStaffApi(id, {
          status: "suspended",
          ...(reason ? { suspension_reason: reason } : {}),
          ...(effectiveDate ? { suspension_date: effectiveDate } : {}),
        })
        .then((res: any) => res.data),
    onSuccess: (_data, variables) => {
      void invalidateList();
      void invalidateDetail(variables.id);
    },
  });

  const terminate = useMutation({
    mutationFn: ({
      id,
      reason,
      effectiveDate,
    }: {
      id: string;
      reason?: string;
      effectiveDate?: string;
    }) =>
      staffApi
        .patchStaffApi(id, {
          status: "terminated",
          ...(reason ? { termination_reason: reason } : {}),
          ...(effectiveDate ? { termination_date: effectiveDate } : {}),
        })
        .then((res: any) => res.data),
    onSuccess: (_data, variables) => {
      void invalidateList();
      void invalidateDetail(variables.id);
    },
  });

  const reinstate = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      staffApi.patchStaffApi(id, { status: "active" }).then((res: any) => res.data),
    onSuccess: (_data, variables) => {
      void invalidateList();
      void invalidateDetail(variables.id);
    },
  });

  return {
    updateStatus,
    remove,
    suspend,
    terminate,
    reinstate,
  };
}
