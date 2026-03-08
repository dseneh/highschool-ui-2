"use client";

import { ExternalLink, Eye, Pencil, Power, Building2, Mail, Phone, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import TenantStatusBadge from "@/components/admin/tenant-status-badge";
import type { TenantListItem } from "@/lib/api2/admin-tenant-types";
import { Badge } from "../ui/badge";

interface TenantListCardProps {
  tenant: TenantListItem;
  tenantUrl: string;
  onView: (tenant: TenantListItem) => void;
  onEdit: (tenant: TenantListItem) => void;
  onOpenStatus: (tenant: TenantListItem) => void;
}

export default function TenantListCard({
  tenant,
  tenantUrl,
  onView,
  onEdit,
  onOpenStatus,
}: TenantListCardProps) {
  const isActive = tenant.active ?? tenant.is_active ?? false;

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="size-4 text-primary" />
              {tenant.name} <Badge variant="default">{tenant.schema_name}</Badge>
            </CardTitle>
            {/* <p className="text-xs text-muted-foreground">
              Workspace: <span className="font-mono">{tenant.schema_name}</span>
            </p> */}
          </div>
          <TenantStatusBadge status={tenant.status} active={isActive} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Short Name</p>
            <p className="text-sm font-medium">{tenant.short_name || "-"}</p>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Created</p>
            <p className="text-sm font-medium">
              {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : "-"}
            </p>
          </div>
          <div className="rounded-md bg-muted/40 p-3 sm:col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tenant URL</p>
            <a
              href={tenantUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <Globe className="size-3.5" />
              {tenantUrl}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p className="inline-flex items-center gap-2">
            <Mail className="size-4" />
            {tenant.id_number || "No ID"}
          </p>
          <p className="inline-flex items-center gap-2">
            <Phone className="size-4" />
            {isActive ? "Enabled" : "Disabled"}
          </p>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-2 md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" iconLeft={<Eye className="size-4" />} onClick={() => onView(tenant)}>
            View Details
          </Button>
          <Button variant="outline" size="sm" iconLeft={<Pencil className="size-4" />} onClick={() => onEdit(tenant)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" iconLeft={<Power className="size-4" />} onClick={() => onOpenStatus(tenant)}>
            Change Status
          </Button>
            </div>
          <Button
            variant="default"
            size="sm"
            iconLeft={<Globe className="size-4" />}
            iconRight={<ExternalLink className="size-4" />}
            onClick={() => window.open(tenantUrl, "_blank", "noopener,noreferrer")}
          >
            Tenant Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
