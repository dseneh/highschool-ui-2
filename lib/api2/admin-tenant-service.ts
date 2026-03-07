import type {
  TenantDetail,
  CreateTenantDto,
  UpdateTenantDto,
  TenantListParams,
  PaginatedTenants,
} from "./admin-tenant-types";
import { adminApiClient } from "./http-clients";

/**
 * List all tenants with pagination and filtering
 */
export async function listTenants(params?: TenantListParams): Promise<PaginatedTenants> {
  const { data } = await adminApiClient.get<PaginatedTenants>("/tenants/", {
    params,
  });
  return data;
}

/**
 * Get tenant details by schema name
 */
export async function getTenant(schemaName: string): Promise<TenantDetail> {
  const { data } = await adminApiClient.get<TenantDetail>(`/tenants/${schemaName}/`);
  return data;
}

/**
 * Create a new tenant
 */
export async function createTenant(tenantData: CreateTenantDto): Promise<TenantDetail> {
  const { data } = await adminApiClient.post<TenantDetail>("/tenants/", tenantData);
  return data;
}

/**
 * Update tenant (full update)
 */
export async function updateTenant(
  schemaName: string,
  tenantData: UpdateTenantDto
): Promise<TenantDetail> {
  const { data } = await adminApiClient.put<TenantDetail>(
    `/tenants/${schemaName}/`,
    tenantData
  );
  return data;
}

/**
 * Partially update tenant
 */
export async function patchTenant(
  schemaName: string,
  tenantData: Partial<UpdateTenantDto>
): Promise<TenantDetail> {
  const { data } = await adminApiClient.patch<TenantDetail>(
    `/tenants/${schemaName}/`,
    tenantData
  );
  return data;
}

/**
 * Delete tenant (soft delete)
 */
export async function deleteTenant(schemaName: string): Promise<void> {
  await adminApiClient.delete(`/tenants/${schemaName}/`);
}

/**
 * Update tenant status (convenience method)
 */
export async function updateTenantStatus(
  schemaName: string,
  status: string
): Promise<TenantDetail> {
  return patchTenant(schemaName, { status });
}

/**
 * Toggle tenant active status
 */
export async function toggleTenantActive(
  schemaName: string,
  isActive: boolean
): Promise<TenantDetail> {
  return patchTenant(schemaName, { is_active: isActive });
}

/**
 * Upload tenant logo
 */
export async function uploadTenantLogo(
  schemaName: string,
  file: File,
  logoShape?: "square" | "landscape"
): Promise<TenantDetail> {
  const formData = new FormData();
  formData.append("logo", file);
  if (logoShape) {
    formData.append("logo_shape", logoShape);
  }

  const { data } = await adminApiClient.put<TenantDetail>(
    `/tenants/${schemaName}/logo/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}
