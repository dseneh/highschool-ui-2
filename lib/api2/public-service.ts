import type { UserSearchParams, UserSearchResponse } from "./public-types";
import { publicApiClient } from "./http-clients";

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
