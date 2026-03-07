import axios from "axios";
import type { UserSearchParams, UserSearchResponse } from "./public-types";

/**
 * Base URL for public API endpoints (no authentication required)
 */
const PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

/**
 * Public API client - no authentication, no tenant headers
 */
const publicApiClient = axios.create({
  baseURL: PUBLIC_API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Search for user across all tenants by email, phone, or ID number
 * GET /search
 */
export async function searchUser(
  params: UserSearchParams
): Promise<UserSearchResponse> {
  const { data } = await publicApiClient.get<UserSearchResponse>("/search/", {
    params: {
      email: params.email || undefined,
      phone: params.phone || undefined,
      id_number: params.id_number || undefined,
    },
  });
  return data;
}
