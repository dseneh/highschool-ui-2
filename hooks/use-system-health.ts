"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HealthResponse {
  status: "healthy" | "degraded"
  database: "connected" | "unreachable"
}

export type SystemStatus = "online" | "offline" | "checking"

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const HEALTH_URL = "/api/health/"  // Use Next.js proxy to avoid CORS

/** How often to re-check (30 minutes) */
const REFETCH_INTERVAL = 1_800_000

/* ------------------------------------------------------------------ */
/*  Fetcher                                                            */
/* ------------------------------------------------------------------ */

async function fetchHealth(): Promise<HealthResponse> {
  try {
    const { data } = await axios.get<HealthResponse>(HEALTH_URL, {
      timeout: 5_000,
    })
    return data
  } catch {
    throw new Error("Unreachable")
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

/**
 * Polls the backend health endpoint using React Query.
 *
 * - staleTime equals the refetch interval so no extra requests fire.
 * - retry is disabled so failures surface immediately.
 * - refetchOnWindowFocus re-checks when the user returns to the tab.
 */
export function useSystemHealth() {
  const query = useQuery<HealthResponse>({
    queryKey: ["system-health"],
    queryFn: fetchHealth,
    staleTime: REFETCH_INTERVAL,
    gcTime: REFETCH_INTERVAL * 2,
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
    retry: false,
  })

  const status: SystemStatus = query.isLoading
    ? "checking"
    : query.isSuccess
      ? "online"
      : "offline"

  return {
    status,
    data: query.data,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}
