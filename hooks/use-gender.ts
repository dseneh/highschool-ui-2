"use client";

/**
 * Hook to provide gender options
 * Returns a static list of gender options
 */
export function useGenders() {
  return {
    data: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ],
    isLoading: false,
  };
}
