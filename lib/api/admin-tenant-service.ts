import axios from "axios";
import type {
  TenantDetail,
  CreateTenantDto,
  UpdateTenantDto,
  TenantListParams,
  PaginatedTenants,
} from "./admin-tenant-types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

// Create axios instance for admin operations (public schema, no tenant header)
const adminApiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add auth token interceptor
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Explicitly ensure no tenant header for admin operations
  delete config.headers["X-Tenant"];
  return config;
});

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
