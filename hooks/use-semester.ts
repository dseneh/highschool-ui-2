"use client";

import { useQuery } from "@tanstack/react-query";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { listSemesters } from "@/lib/api2/semester-service";
import type { SemesterDto } from "@/lib/api2/semester-types";

/* ------------------------------------------------------------------ */
/*  Query key factory                                                  */
/* ------------------------------------------------------------------ */

const semesterKeys = {
  all: (sub: string) => ["semesters", sub] as const,
};

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

export function useSemesters() {
  const subdomain = useTenantSubdomain();

  return useQuery<SemesterDto[]>({
    queryKey: semesterKeys.all(subdomain),
    queryFn: () => listSemesters(subdomain),
    enabled: Boolean(subdomain),
    staleTime: 5 * 60 * 1000,
  });
}
