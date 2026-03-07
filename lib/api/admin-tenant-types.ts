// Types for Admin Tenant Management

export interface TenantDomain {
  id: number;
  domain: string;
  is_primary: boolean;
}

export interface TenantListItem {
  id: string;
  id_number?: string;
  name: string;
  short_name?: string;
  schema_name: string;
  workspace?: string;
  logo?: string;
  logo_shape?: "square" | "landscape";
  status?: string;
  active?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TenantDetail {
  id: string;
  id_number?: string;
  name: string;
  short_name?: string;
  schema_name: string;
  domain?: string;
  domains?: TenantDomain[];
  funding_type?: string;
  school_type?: string;
  slogan?: string | null;
  emis_number?: string | null;
  description?: string | null;
  date_est?: string | null;
  address?: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  phone?: string;
  email?: string;
  website?: string;
  status?: string;
  active?: boolean;
  is_active?: boolean;
  logo?: string;
  logo_shape?: "square" | "landscape";
  theme_color?: string | null;
  theme_config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  workspace?: string;
  full_address?: string;
}

export interface CreateTenantDto {
  name: string;
  short_name?: string;
  schema_name?: string; // Optional, auto-generated if not provided
  domain?: string; // Optional, auto-generated if not provided
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  status?: string;
  is_active?: boolean;
  funding_type?: string;
  school_type?: string;
  slogan?: string;
  description?: string;
}

export interface UpdateTenantDto {
  name?: string;
  short_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  status?: string;
  is_active?: boolean;
  funding_type?: string;
  school_type?: string;
  slogan?: string;
  description?: string;
  theme_color?: string;
}

export interface TenantListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  is_active?: boolean;
  ordering?: string;
}

export interface PaginatedTenants {
  count: number;
  next: string | null;
  previous: string | null;
  results: TenantListItem[];
}

export enum TenantStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  TRIAL = "trial",
}
