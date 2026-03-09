export const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
export const BACKEND_API_URL = API_URL?.replace("/api/v1/", "") || "http://localhost:8000";
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost";
export const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret-must-be-at-least-32-chars-long!!";