import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import * as tenantService from "@/lib/api2/admin-tenant-service";
import { useAdminWorkspace } from "@/hooks/use-admin-workspace";
import type {
  TenantDetail,
  CreateTenantDto,
  UpdateTenantDto,
  TenantListParams,
  PaginatedTenants,
} from "@/lib/api2/admin-tenant-types";
import { getQueryClient } from "@/lib/query-client";

// Query keys
export const tenantKeys = {
  all: ["admin-tenants"] as const,
  lists: () => [...tenantKeys.all, "list"] as const,
  list: (params?: TenantListParams) => [...tenantKeys.lists(), params] as const,
  details: () => [...tenantKeys.all, "detail"] as const,
  detail: (schemaName: string) => [...tenantKeys.details(), schemaName] as const,
};

/**
 * Hook to list all tenants with pagination and filtering
 */
export function useTenants(
  params?: TenantListParams,
  options?: Omit<UseQueryOptions<PaginatedTenants>, "queryKey" | "queryFn">
) {
  const { isAdminWorkspace } = useAdminWorkspace();

  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => tenantService.listTenants(params),
    enabled: isAdminWorkspace && (options?.enabled ?? true),
    ...options,
  });
}

/**
 * Hook to get tenant details
 */
export function useTenant(
  schemaName: string,
  options?: Omit<UseQueryOptions<TenantDetail>, "queryKey" | "queryFn">
) {
  const { isAdminWorkspace } = useAdminWorkspace();

  return useQuery({
    queryKey: tenantKeys.detail(schemaName),
    queryFn: () => tenantService.getTenant(schemaName),
    enabled: isAdminWorkspace && !!schemaName && (options?.enabled ?? true),
    ...options,
  });
}

/**
 * Hook to create a new tenant
 */
export function useCreateTenant(
  options?: UseMutationOptions<TenantDetail, Error, CreateTenantDto>
) {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (data: CreateTenantDto) => tenantService.createTenant(data),
    onSuccess: () => {
      // Invalidate tenant lists to refetch
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update a tenant
 */
export function useUpdateTenant(
  schemaName: string,
  options?: UseMutationOptions<TenantDetail, Error, UpdateTenantDto>
) {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTenantDto) => tenantService.updateTenant(schemaName, data),
    onSuccess: (updatedTenant) => {
      // Invalidate lists and specific tenant detail
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(schemaName) });
      
      // Optionally update cache directly for immediate UI update
      queryClient.setQueryData(tenantKeys.detail(schemaName), updatedTenant);
    },
    ...options,
  });
}

/**
 * Hook to partially update a tenant
 */
export function usePatchTenant(
  schemaName: string,
  options?: UseMutationOptions<TenantDetail, Error, Partial<UpdateTenantDto>>
) {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UpdateTenantDto>) =>
      tenantService.patchTenant(schemaName, data),
    onSuccess: (updatedTenant) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(schemaName) });
      queryClient.setQueryData(tenantKeys.detail(schemaName), updatedTenant);
    },
    ...options,
  });
}

/**
 * Hook to delete a tenant
 */
export function useDeleteTenant(
  schemaName: string,
  options?: UseMutationOptions<void, Error, void>
) {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: () => tenantService.deleteTenant(schemaName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.removeQueries({ queryKey: tenantKeys.detail(schemaName) });
    },
    ...options,
  });
}

/**
 * Hook to toggle tenant active status
 */
export function useToggleTenantActive(
  schemaName: string,
  options?: UseMutationOptions<TenantDetail, Error, boolean>
) {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (isActive: boolean) =>
      tenantService.toggleTenantActive(schemaName, isActive),
    onSuccess: (updatedTenant) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.setQueryData(tenantKeys.detail(schemaName), updatedTenant);
    },
    ...options,
  });
}

/**
 * Hook to upload tenant logo
 */
export function useUploadTenantLogo(
  schemaName: string,
  options?: UseMutationOptions<
    TenantDetail,
    Error,
    { file: File; logoShape?: "square" | "landscape" }
  >
) {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ file, logoShape }) =>
      tenantService.uploadTenantLogo(schemaName, file, logoShape),
    onSuccess: (updatedTenant) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.setQueryData(tenantKeys.detail(schemaName), updatedTenant);
    },
    ...options,
  });
}
