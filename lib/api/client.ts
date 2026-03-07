import axios from "axios";
import { useTenantStore } from "@/store/tenant-store";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 12_000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const tenant = useTenantStore.getState().tenant;
    if (tenant?.schema_name) {
      config.headers = config.headers ?? {};
      config.headers["X-Tenant"] = tenant.schema_name;
    }
  }
  return config;
});
