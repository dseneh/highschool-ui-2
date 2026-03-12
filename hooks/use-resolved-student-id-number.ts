"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/components/portable-auth/src/client";

/**
 * Resolve a student id_number from either the detail route param or
 * the currently logged-in student account.
 */
export function useResolvedStudentIdNumber() {
  const params = useParams();
  const { user } = useAuth();

  const routeIdNumber = params.id_number as string | undefined;
  const accountIdNumber = user?.account_type?.toLowerCase() === "student"
    ? user.id_number
    : undefined;

  return routeIdNumber || accountIdNumber || "";
}
