/**
 * Types for the audit log API (django-auditlog LogEntry).
 */

export interface AuditLogDto {
  id: number;
  content_type: number;
  content_type_name: string;
  object_id: string;
  object_repr: string;
  /** 0 = Create, 1 = Update, 2 = Delete, 3 = Access */
  action: 0 | 1 | 2 | 3;
  changes: Record<string, [unknown, unknown]> | null;
  actor: string | null;
  actor_email: string | null;
  remote_addr: string | null;
  timestamp: string;
  additional_data: Record<string, unknown> | null;
}

export interface ListAuditLogsParams {
  content_type?: number;
  /** Filter by `app_label.model`, e.g. `students.student` */
  content_type_name?: string;
  object_id?: string;
  actor?: string;
  action?: number;
  timestamp_after?: string;
  timestamp_before?: string;
  /** Full-text search across record name and actor email */
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedAuditLogs {
  results: AuditLogDto[];
  count: number;
  next: string | null;
  previous: string | null;
}

/** Human-readable action labels keyed by the numeric action code. */
export const AUDIT_ACTION_LABELS: Record<number, string> = {
  0: "Created",
  1: "Updated",
  2: "Deleted",
  3: "Accessed",
};

/** Human-readable labels for auth event types stored in additional_data. */
export const AUTH_EVENT_LABELS: Record<string, string> = {
  login_success: "Logged in",
  login_failed: "Login failed",
  password_changed: "Password changed",
  password_reset_requested: "Password reset requested",
  password_reset: "Password reset",
};
