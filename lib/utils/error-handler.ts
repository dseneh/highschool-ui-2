import type { AxiosError } from "axios";

/**
 * Extract error message from API error response.
 * Handles various error formats from Django backend.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred";

  // Axios error
  if (typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError<Record<string, unknown>>;
    
    // Django validation errors
    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      
      // Field-specific errors: { field: ["error1", "error2"] }
      if (typeof data === "object" && !Array.isArray(data)) {
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          return String(firstError[0]);
        }
        if (typeof firstError === "string") {
          return firstError;
        }
      }
      
      // Generic error messages
      if (data.detail) return String(data.detail);
      if (data.message) return String(data.message);
      if (data.error) return String(data.error);
      
      // Array of errors
      if (Array.isArray(data) && data.length > 0) {
        return String(data[0]);
      }
    }
    
    // HTTP status messages
    if (axiosError.response?.status === 401) {
      return "Unauthorized. Please log in again.";
    }
    if (axiosError.response?.status === 403) {
      return "You don't have permission to perform this action.";
    }
    if (axiosError.response?.status === 404) {
      return "The requested resource was not found.";
    }
    if (axiosError.response?.status === 500) {
      return "Server error. Please try again later.";
    }
    
    // Network errors
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  // Generic error with message
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * Extract validation errors from API error response.
 * Returns field-specific errors for form handling.
 */
export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (typeof error !== "object" || !error) return {};
  
  const axiosError = error as AxiosError<Record<string, unknown>>;
  const data = axiosError.response?.data;
  
  if (!data || typeof data !== "object") return {};
  
  // Django validation format: { field: ["error1", "error2"] }
  const errors: Record<string, string[]> = {};
  
  for (const [field, messages] of Object.entries(data)) {
    if (Array.isArray(messages)) {
      errors[field] = messages.map(String);
    } else if (typeof messages === "string") {
      errors[field] = [messages];
    }
  }
  
  return errors;
}
