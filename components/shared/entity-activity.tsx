"use client";

import { format } from "date-fns";
import { FileTextIcon, PlusCircle, Pencil, Trash2, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Timeline, TimelineItem } from "@/components/shared/timeline";
import { useEntityAuditLogs } from "@/hooks/use-audit-logs";
import { AUDIT_ACTION_LABELS, AUTH_EVENT_LABELS } from "@/lib/api2/audit-types";
import type { AuditLogDto } from "@/lib/api2/audit-types";
import EmptyStateComponent from "@/components/shared/empty-state";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const actionIcons: Record<number, React.ReactNode> = {
  0: <PlusCircle className="h-4 w-4 text-green-600" />,
  1: <Pencil className="h-4 w-4 text-blue-600" />,
  2: <Trash2 className="h-4 w-4 text-red-600" />,
  3: <Shield className="h-4 w-4 text-amber-600" />,
};

function getActionLabel(entry: AuditLogDto): string {
  const eventType = entry.additional_data?.event_type as string | undefined;
  if (eventType && AUTH_EVENT_LABELS[eventType]) {
    return AUTH_EVENT_LABELS[eventType];
  }
  return AUDIT_ACTION_LABELS[entry.action] ?? "Unknown";
}

function ChangeSummary({ changes }: { changes: AuditLogDto["changes"] }) {
  if (!changes || Object.keys(changes).length === 0) return null;

  return (
    <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
      {Object.entries(changes).map(([field, [oldVal, newVal]]) => (
        <li key={field}>
          <span className="font-medium capitalize">
            {field.replace(/_/g, " ")}
          </span>
          :{" "}
          <span className="line-through">
            {oldVal != null ? String(oldVal) : "—"}
          </span>{" "}
          → <span>{newVal != null ? String(newVal) : "—"}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

interface EntityActivityProps {
  /** e.g. "students.student" or "hr.employee" */
  contentTypeName: string | undefined;
  objectId: string | undefined;
  title?: string;
}

export function EntityActivity({
  contentTypeName,
  objectId,
  title = "Activity",
}: EntityActivityProps) {
  const { data, isLoading } = useEntityAuditLogs(contentTypeName, objectId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const entries = data?.results ?? [];

  if (entries.length === 0) {
    return (
      <EmptyStateComponent
        icon={<FileTextIcon className="h-10 w-10 text-muted-foreground" />}
        title="No activity yet"
        description="Changes to this record will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <Timeline>
        {entries.map((entry) => (
          <TimelineItem
            key={entry.id}
            marker={actionIcons[entry.action] ?? <FileTextIcon className="h-4 w-4" />}
          >
            <div className="space-y-0.5">
              <p className="text-sm">
                <Badge
                  variant="outline"
                  className="mr-1.5 text-[10px] px-1.5 py-0"
                >
                  {getActionLabel(entry)}
                </Badge>
                <span className="font-medium">
                  {entry.actor_email ?? "System"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(entry.timestamp), "MMM d, yyyy 'at' HH:mm")}
              </p>
              <ChangeSummary changes={entry.changes} />
            </div>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}
