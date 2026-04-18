"use client";

import { format } from "date-fns";
import {
  ArrowRight,
  Clock,
  Globe,
  Hash,
  Layers,
  Monitor,
  Network,
  Smartphone,
  User,
} from "lucide-react";
import { ActionSheet } from "@/components/shared/action-sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AuditLogDto } from "@/lib/api2/audit-types";
import { AUDIT_ACTION_LABELS, AUTH_EVENT_LABELS } from "@/lib/api2/audit-types";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const actionVariant: Record<number, "default" | "secondary" | "destructive" | "outline"> = {
  0: "default",
  1: "secondary",
  2: "destructive",
  3: "outline",
};

function humanizeField(field: string) {
  return field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function humanizeModel(contentTypeName: string) {
  const model = contentTypeName.split(".").pop() ?? contentTypeName;
  return model.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return String(val);
}

function parseUserAgent(ua: string): { browser: string; os: string; isMobile: boolean } {
  let browser = "Unknown browser";
  if (/Edg\//i.test(ua)) {
    browser = `Edge ${ua.match(/Edg\/([\d.]+)/)?.[1]?.split(".")[0] ?? ""}`.trim();
  } else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    browser = `Opera ${ua.match(/OPR\/([\d.]+)/)?.[1]?.split(".")[0] ?? ""}`.trim();
  } else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) {
    browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/)?.[1]?.split(".")[0] ?? ""}`.trim();
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    browser = `Safari ${ua.match(/Version\/([\d.]+)/)?.[1]?.split(".")[0] ?? ""}`.trim();
  } else if (/Firefox\//i.test(ua)) {
    browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/)?.[1]?.split(".")[0] ?? ""}`.trim();
  }

  let os = "Unknown OS";
  if (/Windows NT 10/i.test(ua)) os = "Windows 10+";
  else if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X ([\d_]+)/i.test(ua)) {
    const ver = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, ".");
    os = `macOS ${ver ?? ""}`.trim();
  } else if (/Android ([\d.]+)/i.test(ua)) {
    os = `Android ${ua.match(/Android ([\d.]+)/)?.[1] ?? ""}`.trim();
  } else if (/iPhone OS ([\d_]+)/i.test(ua)) {
    const ver = ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, ".");
    os = `iOS ${ver ?? ""}`.trim();
  } else if (/Linux/i.test(ua)) os = "Linux";

  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  return { browser, os, isMobile };
}

function formatLocation(loc: Record<string, unknown> | undefined): string | null {
  if (!loc) return null;
  const parts = [loc.city, loc.country].filter(Boolean).map(String);
  return parts.length > 0 ? parts.join(", ") : null;
}

/* ------------------------------------------------------------------ */
/* Detail row                                                          */
/* ------------------------------------------------------------------ */

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-sm font-medium truncate text-right">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface AuditLogDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: AuditLogDto | null;
}

export function AuditLogDetailSheet({
  open,
  onOpenChange,
  entry,
}: AuditLogDetailSheetProps) {
  if (!entry) return null;

  const changes = entry.changes ? Object.entries(entry.changes) : [];
  const eventType = entry.additional_data?.event_type as string | undefined;
  const actionLabel =
    eventType && AUTH_EVENT_LABELS[eventType]
      ? AUTH_EVENT_LABELS[eventType]
      : (AUDIT_ACTION_LABELS[entry.action] ?? "Unknown");

  const ua = entry.additional_data?.user_agent
    ? parseUserAgent(String(entry.additional_data.user_agent))
    : null;
  const DeviceIcon = ua?.isMobile ? Smartphone : Monitor;
  const locationStr = formatLocation(
    entry.additional_data?.location as Record<string, unknown> | undefined,
  );

  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2">
          <Badge variant={actionVariant[entry.action] ?? "outline"}>
            {actionLabel}
          </Badge>
          <span className="truncate">{entry.object_repr}</span>
        </div>
      }
      description={`${humanizeModel(entry.content_type_name)} · ${format(new Date(entry.timestamp), "MMM d, yyyy 'at' HH:mm:ss")}`}
    >
      {/* ---- Overview ---- */}
      <div className="rounded-lg border divide-y">
        <DetailRow icon={Clock} label="When">
          {format(new Date(entry.timestamp), "MMM d, yyyy · HH:mm:ss")}
        </DetailRow>
        <DetailRow icon={User} label="Who">
          {entry.actor_email ?? "System"}
        </DetailRow>
        <DetailRow icon={Layers} label="Entity">
          {humanizeModel(entry.content_type_name)}
        </DetailRow>
        <DetailRow icon={Hash} label="Record">
          <span className="font-mono text-xs">{entry.object_id}</span>
        </DetailRow>
        <DetailRow icon={Network} label="IP">
          <span className="font-mono text-xs">{entry.remote_addr ?? "—"}</span>
        </DetailRow>
        {ua && (
          <DetailRow icon={DeviceIcon} label="Device">
            {ua.browser} · {ua.os}
          </DetailRow>
        )}
        {locationStr && (
          <DetailRow icon={Globe} label="Location">
            {locationStr}
          </DetailRow>
        )}
      </div>

      {/* ---- Field changes ---- */}
      {(changes.length > 0 || eventType) && (
        <>
          <Separator />
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {entry.action === 0
                ? "Initial Values"
                : entry.action === 2
                  ? "Deleted Values"
                  : "Changes"}
            </p>

            {changes.length > 0 ? (
              <div className="rounded-lg border divide-y text-sm">
                {changes.map(([field, [oldVal, newVal]]) => (
                  <div
                    key={field}
                    className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 py-2 hover:bg-muted/40 transition-colors"
                  >
                    <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground">
                      {humanizeField(field)}
                    </span>
                    {entry.action === 0 ? (
                      <span>{formatValue(newVal)}</span>
                    ) : entry.action === 2 ? (
                      <span className="text-red-600 line-through">
                        {formatValue(oldVal)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span className="text-muted-foreground line-through">
                          {formatValue(oldVal)}
                        </span>
                        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="font-medium">{formatValue(newVal)}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : eventType ? (
              <p className="rounded-lg border bg-muted/10 px-3 py-2 text-sm text-muted-foreground">
                {AUTH_EVENT_LABELS[eventType] ?? eventType}
              </p>
            ) : null}
          </div>
        </>
      )}
    </ActionSheet>
  );
}
