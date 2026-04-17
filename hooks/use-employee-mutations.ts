"use client";

import { useMutation } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { useEmployeeApi } from "@/lib/api2/employee/api";

export function useEmployeeMutations() {
  const queryClient = getQueryClient();
  const employeeApi = useEmployeeApi();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: ["employees"] });

  const invalidateDetail = (id: string) =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["employees", id],
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
      const payload: Record<string, string> = { employment_status: status };

      if (status === "suspended") {
        if (reason) payload.suspension_reason = reason;
        if (effectiveDate) payload.suspension_date = effectiveDate;
      }

      if (status === "terminated") {
        if (reason) payload.termination_reason = reason;
        if (effectiveDate) payload.termination_date = effectiveDate;
      }

      return employeeApi.patchEmployeeApi(id, payload).then((res: any) => res.data);
    },
    onSuccess: (_data, variables) => {
      void invalidateList();
      void invalidateDetail(variables.id);
    },
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string; force?: boolean }) =>
      employeeApi.deleteEmployeeApi(id).then((res: any) => res.data),
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
      employeeApi
        .patchEmployeeApi(id, {
          employment_status: "suspended",
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
      employeeApi
        .patchEmployeeApi(id, {
          employment_status: "terminated",
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
      employeeApi.patchEmployeeApi(id, { employment_status: "active" }).then((res: any) => res.data),
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
