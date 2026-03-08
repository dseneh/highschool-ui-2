"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import PageLayout from "@/components/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import EmptyStateComponent from "@/components/shared/empty-state";
import TenantListCard from "@/components/admin/tenant-list-card";
import TenantFormDialog from "@/components/admin/tenant-form-dialog";
import TenantStatusDialog from "@/components/admin/tenant-status-dialog";
import {
  useTenants,
  useCreateTenant,
} from "@/hooks/use-admin-tenants";
import * as tenantService from "@/lib/api2/admin-tenant-service";
import {
  TenantListItem,
  TenantDetail,
  CreateTenantDto,
  UpdateTenantDto,
  TenantListParams,
} from "@/lib/api2/admin-tenant-types";
import { getErrorMessage } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { SelectField } from "@/components/ui/select-field";

export default function TenantListPage() {
  const router = useRouter();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantListItem | TenantDetail | null>(null);

  // Build query params (no filters - we'll filter client-side)
  const params: TenantListParams = {
    page: 1,
    page_size: 1000, // Fetch all tenants for client-side filtering
  };

  // Queries
  const { data, isLoading, error, refetch, isFetching } = useTenants(params);

  // Client-side filtering
  const filteredTenants = (data?.results || []).filter((tenant) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        tenant.name?.toLowerCase().includes(search) ||
        tenant.schema_name?.toLowerCase().includes(search) ||
        tenant.workspace?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "all" && tenant.status !== statusFilter) {
      return false;
    }

    // Active filter
    if (activeFilter !== "all") {
      const isActive = tenant.is_active ?? tenant.active;
      if (activeFilter === "true" && !isActive) return false;
      if (activeFilter === "false" && isActive) return false;
    }

    return true;
  });

  // Client-side pagination
  const pageSize = 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTenants = filteredTenants.slice(startIndex, endIndex);
  const totalCount = filteredTenants.length;
  const createMutation = useCreateTenant();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPatching, setIsPatching] = useState(false);

  // Handlers
  const handleCreate = () => {
    setSelectedTenant(null);
    setFormDialogOpen(true);
  };

  const handleView = (tenant: TenantListItem) => {
    router.push(`/admin/tenants/${tenant.schema_name}`);
  };

  const handleEdit = (tenant: TenantListItem) => {
    setSelectedTenant(tenant);
    setFormDialogOpen(true);
  };

  const handleOpenStatus = (tenant: TenantListItem) => {
    setSelectedTenant(tenant);
    setStatusDialogOpen(true);
  };

  const handleSubmitStatus = async ({ status, is_active }: { status: string; is_active: boolean }) => {
    if (!selectedTenant) return;
    
    try {
      setIsPatching(true);
      await tenantService.patchTenant(selectedTenant.schema_name, { status, is_active });
      showToast.success("Tenant status updated successfully");
      setStatusDialogOpen(false);
      refetch(); // Refetch the list
    } catch (error) {
      showToast.error(getErrorMessage(error));
    } finally {
      setIsPatching(false);
    }
  };

  const handleFormSubmit = async (data: CreateTenantDto | UpdateTenantDto) => {
    try {
      if (selectedTenant) {
        // Update - use the service directly with the correct schema_name
        setIsUpdating(true);
        await tenantService.updateTenant(selectedTenant.schema_name, data as UpdateTenantDto);
        showToast.success("Tenant updated successfully");
        refetch(); // Refetch the list
      } else {
        // Create
        await createMutation.mutateAsync(data as CreateTenantDto);
        showToast.success("Tenant created successfully");
      }
    } catch (error) {
      showToast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search
  };

  const getTenantUrl = (tenant: TenantListItem) => {
    if (typeof window === "undefined") return "#";
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    let rootDomain = hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      rootDomain = hostname;
    } else if (hostname.endsWith(".localhost")) {
      rootDomain = "localhost";
    } else {
      const parts = hostname.split(".");
      rootDomain = parts.length > 2 ? parts.slice(1).join(".") : hostname;
    }

    const port = window.location.port ? `:${window.location.port}` : "";
    const workspace = tenant.workspace || tenant.schema_name;
    return `${protocol}//${workspace}.${rootDomain}${port}`;
  };


  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const statusOptions= [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
    { value: "trial", label: "Trial" },
  ]

  const activeOptions = [
    { value: "all", label: "All Access States" },
    { value: "true", label: "Enabled" },
    { value: "false", label: "Disabled" },
  ]
  return (
    <PageLayout
      title="Tenants"
      description="Manage tenant organizations and quickly jump into each workspace"
      loading={isLoading}
      noData={!filteredTenants?.length}
      actions={
        <Button onClick={handleCreate} iconLeft={<Plus className="size-4" />}>
          Create Tenant
        </Button>
      }
      emptyState={
        <EmptyStateComponent
          title="No tenants found"
          description="Create your first tenant to get started"
          actionTitle="Create Tenant"
          handleAction={handleCreate}
        />
      }
      fetching={isFetching}
      error={error}
      refreshAction={refetch}

    >
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, schema, or domain..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">

          <SelectField
           value={statusFilter}
           onValueChange={(value: any) => setStatusFilter(value ?? "all")}
           items={statusOptions}
           placeholder="Status"
           />

          <SelectField
           value={activeFilter}
           onValueChange={(value: any) => setActiveFilter(value ?? "all")}
           items={activeOptions}
           placeholder="Access"
           />
           </div>
        </div>
      </Card>

      <div className="space-y-4">
        {paginatedTenants.map((tenant) => (
          <TenantListCard
            key={tenant.id}
            tenant={tenant}
            tenantUrl={getTenantUrl(tenant)}
            onView={handleView}
            onEdit={handleEdit}
            onOpenStatus={handleOpenStatus}
          />
        ))}
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({totalCount} {searchTerm || statusFilter !== "all" || activeFilter !== "all" ? "filtered" : "total"} tenants)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              iconLeft={<ChevronLeft className="size-4" />}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              iconRight={<ChevronRight className="size-4" />}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Dialogs */}
      <TenantFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        tenant={selectedTenant as TenantDetail | null}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || isUpdating}
      />

      <TenantStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        tenant={selectedTenant}
        loading={isPatching}
        onSubmit={handleSubmitStatus}
      />
    </PageLayout>
  );
}
