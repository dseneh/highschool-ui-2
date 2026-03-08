"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  Globe,
  Mail,
  Pencil,
  Phone,
  Power,
  Trash2,
  Users,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import PageLayout from "@/components/dashboard/page-layout";
import StatCard from "@/components/admin/stat-card";
import TenantStatusBadge from "@/components/admin/tenant-status-badge";
import TenantFormDialog from "@/components/admin/tenant-form-dialog";
import TenantStatusDialog from "@/components/admin/tenant-status-dialog";
import DeleteTenantDialog from "@/components/admin/delete-tenant-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { useDeleteTenant, useTenant } from "@/hooks/use-admin-tenants";
import * as tenantService from "@/lib/api2/admin-tenant-service";
import type { UpdateTenantDto } from "@/lib/api2/admin-tenant-types";

export default function TenantDetailsPage() {
  const router = useRouter();
  const params = useParams<{ schema_name: string }>();
  const schemaName = params.schema_name;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPatching, setIsPatching] = useState(false);

  const { data: tenant, isLoading, error, refetch, isFetching } = useTenant(schemaName);
  const deleteTenant = useDeleteTenant(schemaName);

  const tenantUrl = useMemo(() => {
    if (typeof window === "undefined") return "#";
    const protocol = window.location.protocol;
    const workspace = tenant?.workspace || tenant?.schema_name || schemaName;

    const hostname = window.location.hostname;
    let baseHost = hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      baseHost = hostname;
    } else if (hostname.endsWith(".localhost")) {
      baseHost = "localhost";
    } else {
      const parts = hostname.split(".");
      baseHost = parts.length > 2 ? parts.slice(1).join(".") : hostname;
    }

    const port = window.location.port ? `:${window.location.port}` : "";
    return `${protocol}//${workspace}.${baseHost}${port}`;
  }, [schemaName, tenant?.schema_name, tenant?.workspace]);

  const infoSections = [
    {
      title: "Identity",
      items: [
        { label: "Name", value: tenant?.name },
        { label: "Short Name", value: tenant?.short_name },
        { label: "Schema", value: tenant?.schema_name, mono: true },
        { label: "EMIS Number", value: tenant?.emis_number },
      ],
    },
    {
      title: "Contact",
      items: [
        { label: "Email", value: tenant?.email },
        { label: "Phone", value: tenant?.phone },
        { label: "Website", value: tenant?.website },
        { label: "Domain", value: tenant?.domain },
      ],
    },
    {
      title: "School Profile",
      items: [
        { label: "Funding Type", value: tenant?.funding_type },
        { label: "School Type", value: tenant?.school_type },
        { label: "Slogan", value: tenant?.slogan },
        { label: "Description", value: tenant?.description },
      ],
    },
    {
      title: "Address",
      items: [
        { label: "Address", value: tenant?.address },
        { label: "City", value: tenant?.city },
        { label: "State", value: tenant?.state },
        { label: "Country", value: tenant?.country },
      ],
    },
  ];

  const handleEditSubmit = async (payload: UpdateTenantDto) => {
    try {
      setIsUpdating(true);
      await tenantService.updateTenant(schemaName, payload);
      toast.success("Tenant details updated successfully");
      setIsEditOpen(false);
      refetch(); // Refetch tenant data
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusSubmit = async (payload: { status: string; is_active: boolean }) => {
    try {
      setIsPatching(true);
      await tenantService.patchTenant(schemaName, payload);
      toast.success("Tenant status updated successfully");
      setIsStatusOpen(false);
      refetch(); // Refetch tenant data
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsPatching(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTenant.mutateAsync();
      toast.success("Tenant deleted successfully");
      setIsDeleteOpen(false);
      router.push("/admin/tenants");
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  return (
    <PageLayout
      title={
        <div className="flex items-center gap-2">
          <div>{tenant?.name || "Tenant Details"}</div>
          <TenantStatusBadge
            status={tenant?.status}
            active={tenant?.is_active ?? tenant?.active}
            className="tracking-wide"
          />
        </div>
      }
      description={
        <span>
          Manage tenant profile and lifecycle for <span className="font-mono">{schemaName}</span>
        </span>
      }
      loading={isLoading}
      fetching={isFetching}
      error={error}
      refreshAction={refetch}
      actions={
        <div className="flex flex-wrap gap-2">
          {/* <Button variant="outline" iconLeft={<ArrowLeft className="size-4" />} onClick={() => router.push("/admin/tenants")}>
            Back to Tenants
          </Button> */}
          <Button variant="outline" iconLeft={<Pencil className="size-4" />} onClick={() => setIsEditOpen(true)}>
            Edit
          </Button>
          <Button variant="outline" iconLeft={<Power className="size-4" />} onClick={() => setIsStatusOpen(true)}>
            Change Status
          </Button>
          <Button
            iconRight={<ExternalLink className="size-4" />}
            onClick={() => window.open(tenantUrl, "_blank", "noopener,noreferrer")}
          >
            Visit Tenant
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Workspace"
          value={tenant?.workspace || tenant?.schema_name || "-"}
          icon={Building2}
          description="Tenant workspace"
        />
        <StatCard
          title="Primary Domain"
          value={tenant?.domain ? "Configured" : "Not set"}
          icon={Globe}
          description={tenant?.domain || "No domain configured"}
        />
        <StatCard
          title="Account Status"
          value={tenant?.status || "inactive"}
          icon={Users}
          description={(tenant?.is_active ?? tenant?.active) ? "Workspace enabled" : "Workspace disabled"}
        />
        <StatCard
          title="Created"
          value={tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString() : "-"}
          icon={CalendarClock}
          description="Tenant onboarding date"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>Status & Access</span>
            <TenantStatusBadge
              status={tenant?.status}
              active={tenant?.is_active ?? tenant?.active}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" />
              {tenant?.email || "No contact email"}
            </p>
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" />
              {tenant?.phone || "No phone number"}
            </p>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Theme: {tenant?.theme_color || "Default"}</Badge>
            <Badge variant="outline">Workspace: {tenant?.workspace || tenant?.schema_name || "-"}</Badge>
            <Badge variant="outline">Updated: {tenant?.updated_at ? new Date(tenant.updated_at).toLocaleString() : "-"}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {infoSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="rounded-md bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className={item.mono ? "font-mono text-sm" : "text-sm"}>{item.value || "-"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Permanently remove this tenant from active use. This action performs a soft delete and cannot be easily reversed.
          </p>
          <Button
            variant="destructive"
            iconLeft={<Trash2 className="size-4" />}
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete Tenant
          </Button>
        </CardContent>
      </Card>

      <TenantFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        tenant={tenant || null}
        onSubmit={handleEditSubmit}
        isLoading={isUpdating}
      />

      <TenantStatusDialog
        open={isStatusOpen}
        onOpenChange={setIsStatusOpen}
        tenant={tenant || null}
        loading={isPatching}
        onSubmit={handleStatusSubmit}
      />

      <DeleteTenantDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        tenant={tenant || null}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteTenant.isPending}
      />
    </PageLayout>
  );
}
