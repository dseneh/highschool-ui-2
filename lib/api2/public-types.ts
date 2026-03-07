/* ------------------------------------------------------------------ */
/*  Public API types (no authentication required)                     */
/* ------------------------------------------------------------------ */

/** Search request parameters */
export interface UserSearchParams {
  email?: string | null;
  phone?: string | null;
  id_number?: string | null;
}

/** Tenant information in search results */
export interface TenantInfo {
  id: string;
  schema_name: string;
  name: string;
  short_name: string;
}

/** User data in search results (can be student, staff, etc.) */
export interface UserSearchData {
  id: string;
  id_number: string | null;
  email: string | null;
  phone_number: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  full_name: string | null;
  gender: string | null;
  status: string | null;
  grade_level?: string | null;
  [key: string]: unknown; // Allow additional fields
}

/** Individual search result */
export interface UserSearchResult {
  user_type: "student" | "staff" | "teacher" | string;
  tenant: TenantInfo;
  data: UserSearchData;
}

/** Complete search response */
export interface UserSearchResponse {
  count: number;
  search_params: UserSearchParams;
  results: UserSearchResult[];
}
