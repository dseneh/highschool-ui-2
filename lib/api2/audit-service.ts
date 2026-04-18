import apiClient from "@/lib/api2/client";
import type {
  AuditLogDto,
  ListAuditLogsParams,
  PaginatedAuditLogs,
} from "./audit-types";

export type { AuditLogDto, ListAuditLogsParams, PaginatedAuditLogs };

/** GET /audit-logs/ */
export async function listAuditLogs(
  _subdomain: string,
  params?: ListAuditLogsParams
) {
  const { data } = await apiClient.get<PaginatedAuditLogs>("audit-logs", {
    params,
  });
  return data;
}

/** GET /audit-logs/{id}/ */
export async function getAuditLog(_subdomain: string, id: number) {
  const { data } = await apiClient.get<AuditLogDto>(`audit-logs/${id}`);
  return data;
}
