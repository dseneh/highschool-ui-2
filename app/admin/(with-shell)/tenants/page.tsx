"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { getTenantColumns } from "@/components/admin/tenant-columns";
import TenantFormDialog from "@/components/admin/tenant-form-dialog";
import DeleteTenantDialog from "@/components/admin/delete-tenant-dialog";
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  usePatchTenant,
} from "@/hooks/use-admin-tenants";
import {
  TenantListItem,
  TenantDetail,
  CreateTenantDto,
  UpdateTenantDto,
  TenantListParams,
} from "@/lib/api/admin-tenant-types";
import { toast } from "sonner";

export default function TenantListPage() {
  const router = useRouter();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantListItem | TenantDetail | null>(null);

  // Build query params
  const params: TenantListParams = {
    page,
    page_size: 10,
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(activeFilter !== "all" && { is_active: activeFilter === "true" }),
  };

  // Queries
  const { data, isLoading } = useTenants(params);
  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant(selectedTenant?.schema_name || "");
  const deleteMutation = useDeleteTenant(selectedTenant?.schema_name || "");
  const patchMutation = usePatchTenant(selectedTenant?.schema_name || "");

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

  const handleDelete = (tenant: TenantListItem) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (tenant: TenantListItem) => {
    try {
      await patchMutation.mutateAsync({
        is_active: !(tenant.active ?? tenant.is_active),
      });
      toast.success(`Tenant ${tenant.active ?? tenant.is_active ? "disabled" : "enabled"} successfully`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update tenant status");
    }
  };

  const handleFormSubmit = async (data: CreateTenantDto | UpdateTenantDto) => {
    try {
      if (selectedTenant) {
        // Update
        await updateMutation.mutateAsync(data as UpdateTenantDto);
        toast.success("Tenant updated successfully");
      } else {
        // Create
        await createMutation.mutateAsync(data as CreateTenantDto);
        toast.success("Tenant created successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save tenant");
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTenant) return;

    try {
      await deleteMutation.mutateAsync();
      toast.success("Tenant deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tenant");
      throw error;
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search
  };

  // Columns
  const columns = getTenantColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-muted-foreground">
            Manage tenant organizations and their configurations
          </p>
        </div>
        <Button onClick={handleCreate} iconLeft={<Plus className="size-4" />}>
          Create Tenant
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, schema, or domain..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
            </SelectContent>
          </Select>

          {/* Active Filter */}
          <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value ?? "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Enabled</SelectItem>
              <SelectItem value="false">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-2 text-sm text-muted-foreground">Loading tenants...</p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.results || []}
            noData={!data?.results?.length}
            emptyStateTitle="No tenants found"
            emptyStateDescription="Create your first tenant to get started"
            emptyStateAction={handleCreate}
          />
        )}
      </Card>

      {/* Dialogs */}
      <TenantFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        tenant={selectedTenant as TenantDetail | null}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteTenantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tenant={selectedTenant}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
