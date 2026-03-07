import axios from "axios";
import { ThemeConfig } from "@/contexts/theme-context";

const PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const publicApiClient = axios.create({
  baseURL: PUBLIC_API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add tenant header interceptor
publicApiClient.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (tenantId) {
    config.headers["X-Tenant"] = tenantId;
  }
  return config;
});

export interface TenantDomain {
  id: number;
  domain: string;
  is_primary: boolean;
}

export interface TenantThemeConfigData {
  dark_mode?: boolean;
  color_theme?: string;
  font_family?: string;
  border_radius?: string;
  primary_color?: string;
  [key: string]: any;
}

export interface TenantInfo {
  id: string;
  id_number?: string;
  name: string;
  short_name?: string;
  schema_name: string; // subdomain
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
  theme_config?: TenantThemeConfigData;
  created_at?: string;
  updated_at?: string;
  workspace?: string;
  full_address?: string;
}

export interface TenantThemeConfig {
  id: string;
  name: string;
  logo?: string;
  logo_shape?: "square" | "landscape";
  theme_color?: string;
  theme_config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface TenantSettings {
  branding: {
    name: string;
    logo?: string;
    logo_shape?: "square" | "landscape";
    customLogo?: string;
  };
  theme: ThemeConfig;
}

export async function getTenantInfo(schemaName: string): Promise<TenantInfo> {
  const { data } = await publicApiClient.get<TenantInfo>(`/tenants/${schemaName}/`);
  return data;
}

/**
 * Fetch tenant theme configuration from backend
 */
export async function getTenantThemeConfig(
  tenantId: string
): Promise<TenantThemeConfig> {
  try {
    const { data } = await publicApiClient.get<TenantThemeConfig>(
      `/tenants/${tenantId}/theme/`
    );
    return data;
  } catch (error) {
    console.error("Error fetching tenant theme config:", error);
    throw error;
  }
}

/**
 * Update tenant theme configuration
 */
export async function updateTenantThemeConfig(
  tenantId: string,
  config: Partial<TenantThemeConfig>
): Promise<TenantThemeConfig> {
  try {
    const { data } = await publicApiClient.patch<TenantThemeConfig>(
      `/tenants/${tenantId}/theme/`,
      config
    );
    return data;
  } catch (error) {
    console.error("Error updating tenant theme config:", error);
    throw error;
  }
}

/**
 * Upload tenant logo
 */
export async function uploadTenantLogo(
  tenantId: string,
  file: File,
  logoShape?: "square" | "landscape"
): Promise<TenantThemeConfig> {
  try {
    const formData = new FormData();
    formData.append("logo", file);
    if (logoShape) {
      formData.append("logo_shape", logoShape);
    }

    const { data } = await publicApiClient.post<TenantThemeConfig>(
      `/tenants/${tenantId}/logo/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error uploading tenant logo:", error);
    throw error;
  }
}

/**
 * Get current tenant settings (combines branding and theme)
 */
export async function getTenantSettings(
  tenantId: string
): Promise<TenantSettings> {
  try {
    const themeConfig = await getTenantThemeConfig(tenantId);

    const settings: TenantSettings = {
      branding: {
        name: themeConfig.name,
        logo: themeConfig.logo,
        logo_shape: themeConfig.logo_shape,
        customLogo: themeConfig.theme_config?.customLogo,
      },
      theme: {
        color: (themeConfig.theme_config?.color || "ocean") as any,
        darkMode: themeConfig.theme_config?.darkMode || false,
        shape: (themeConfig.theme_config?.shape || "rounded") as any,
        fontFamily: (themeConfig.theme_config?.fontFamily || "sans") as any,
        fontSize: (themeConfig.theme_config?.fontSize || "normal") as any,
        shadowIntensity: (themeConfig.theme_config?.shadowIntensity ||
          "medium") as any,
        spacingScale: (themeConfig.theme_config?.spacingScale ||
          "comfortable") as any,
        accentColor: themeConfig.theme_config?.accentColor,
        customLogo: themeConfig.theme_config?.customLogo,
      },
    };

    return settings;
  } catch (error) {
    console.error("Error fetching tenant settings:", error);
    throw error;
  }
}

/**
 * Update tenant settings (combines branding and theme)
 */
export async function updateTenantSettings(
  tenantId: string,
  settings: Partial<TenantSettings>
): Promise<TenantThemeConfig> {
  try {
    const payload: Partial<TenantThemeConfig> = {};

    if (settings.branding) {
      payload.name = settings.branding.name;
      if (settings.branding.logo) {
        payload.logo = settings.branding.logo;
      }
      if (settings.branding.logo_shape) {
        payload.logo_shape = settings.branding.logo_shape;
      }
    }

    if (settings.theme) {
      payload.theme_config = settings.theme;
    }

    return await updateTenantThemeConfig(tenantId, payload);
  } catch (error) {
    console.error("Error updating tenant settings:", error);
    throw error;
  }
}
