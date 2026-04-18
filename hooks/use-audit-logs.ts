"use client";

import { useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { listAuditLogs, getAuditLog } from "@/lib/api2/audit-service";
import type {
  ListAuditLogsParams,
  PaginatedAuditLogs,
  AuditLogDto,
} from "@/lib/api2/audit-types";

export const auditKeys = {
  all: (sub: string) => ["audit-logs", sub] as const,
  detail: (sub: string, id: number) => ["audit-logs", sub, id] as const,
};

/** Paginated list of audit log entries with optional filters. */
export function useAuditLogs(params?: ListAuditLogsParams) {
  const subdomain = useTenantSubdomain();

  return useQuery<PaginatedAuditLogs>({
    queryKey: [...auditKeys.all(subdomain), params],
    queryFn: () => listAuditLogs(subdomain, params),
    enabled: Boolean(subdomain),
  });
}

/** Fetch audit logs for a specific entity (content_type_name + object_id). */
export function useEntityAuditLogs(
  contentTypeName: string | undefined,
  objectId: string | undefined,
  params?: Omit<ListAuditLogsParams, "content_type_name" | "object_id">
) {
  const subdomain = useTenantSubdomain();

  return useQuery<PaginatedAuditLogs>({
    queryKey: [
      ...auditKeys.all(subdomain),
      "entity",
      contentTypeName,
      objectId,
      params,
    ],
    queryFn: () =>
      listAuditLogs(subdomain, {
        ...params,
        content_type_name: contentTypeName,
        object_id: objectId,
      }),
    enabled:
      Boolean(subdomain) && Boolean(contentTypeName) && Boolean(objectId),
  });
}

/** Single audit log entry detail. */
export function useAuditLogDetail(id: number | undefined) {
  const subdomain = useTenantSubdomain();

  return useQuery<AuditLogDto>({
    queryKey: auditKeys.detail(subdomain, id ?? 0),
    queryFn: () => getAuditLog(subdomain, id!),
    enabled: Boolean(subdomain) && Boolean(id),
  });
}
